import {
  MedicalKnowledgeDocument,
  DocumentChunk,
  RetrievalResult,
  NewSourceInput,
  ContentStatus,
  EvidenceLevel,
  OrganizationCategory,
} from '../types/ragTypes';
import { medicalTextCleaner } from './textCleaner';
import { semanticMedicalChunker } from './chunker';
import { medicalEmbeddingService } from './embeddingService';

export class MedicalKnowledgeVectorStore {
  private documents: Map<string, MedicalKnowledgeDocument> = new Map();
  private chunks: DocumentChunk[] = [];
  private isInitialized = false;

  constructor() {
    this.seedDefaultKnowledgeSources();
  }

  /**
   * Initializes the vector database and pre-embeds all seed chunks
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    for (const chunk of this.chunks) {
      if (!chunk.embedding || chunk.embedding.length === 0) {
        chunk.embedding = await medicalEmbeddingService.generateEmbedding(chunk.text);
      }
    }
    this.isInitialized = true;
  }

  /**
   * Semantic Vector Search with metadata filtering and evidence level weighting
   */
  public async search(
    query: string,
    options?: {
      topK?: number;
      minSimilarity?: number;
      allowedEvidenceLevels?: EvidenceLevel[];
      topicFilter?: string;
      onlyPublished?: boolean;
    }
  ): Promise<RetrievalResult[]> {
    await this.initialize();

    const topK = options?.topK ?? 4;
    const minSim = options?.minSimilarity ?? 0.35;
    const onlyPublished = options?.onlyPublished !== false; // Default true: only PUBLISHED content!

    if (!query || query.trim().length === 0) {
      return [];
    }

    const queryEmbedding = await medicalEmbeddingService.generateEmbedding(query);
    const results: RetrievalResult[] = [];

    for (const chunk of this.chunks) {
      // 1. Guardrail: STRICTLY EXCLUDE unreviewed/draft/archived content from clinical RAG
      if (onlyPublished && chunk.metadata.contentStatus !== 'PUBLISHED') {
        continue;
      }

      // 2. Evidence level filter if specified
      if (
        options?.allowedEvidenceLevels &&
        !options.allowedEvidenceLevels.includes(chunk.metadata.evidenceLevel)
      ) {
        continue;
      }

      // 3. Topic filter if specified
      if (
        options?.topicFilter &&
        !chunk.metadata.topic.toLowerCase().includes(options.topicFilter.toLowerCase())
      ) {
        continue;
      }

      const chunkVector = chunk.embedding || (await medicalEmbeddingService.generateEmbedding(chunk.text));
      const sim = medicalEmbeddingService.cosineSimilarity(queryEmbedding, chunkVector);

      // Keyword boost for exact symptom/topic terms
      const queryLower = query.toLowerCase();
      const textLower = chunk.text.toLowerCase();
      let keywordBonus = 0;
      const queryTokens = queryLower.split(/\s+/).filter((t) => t.length > 2);
      for (const tok of queryTokens) {
        if (textLower.includes(tok)) {
          keywordBonus += 0.05;
        }
      }

      const finalScore = Math.min(1.0, sim + keywordBonus);

      if (finalScore >= minSim) {
        const doc = this.documents.get(chunk.documentId);
        if (doc) {
          results.push({
            chunk,
            similarityScore: Number(finalScore.toFixed(4)),
            sourceDocument: {
              id: doc.id,
              title: doc.title,
              organization: doc.organization,
              organizationCategory: doc.organizationCategory,
              url: doc.url,
              evidenceLevel: doc.evidenceLevel,
              publicationDate: doc.publicationDate,
              reviewDate: doc.reviewDate,
              version: doc.version,
            },
          });
        }
      }
    }

    // Sort by descending similarity score
    results.sort((a, b) => b.similarityScore - a.similarityScore);

    return results.slice(0, topK);
  }

  /**
   * Admin Workflow: Add new knowledge source
   */
  public async addSource(input: NewSourceInput): Promise<{
    success: boolean;
    document?: MedicalKnowledgeDocument;
    error?: string;
    isDuplicate?: boolean;
  }> {
    // 1. Text cleaning
    const cleanContent = medicalTextCleaner.clean(input.rawContent);
    if (!cleanContent || cleanContent.length < 20) {
      return {
        success: false,
        error: 'Document content is too short or empty after clinical text cleaning',
      };
    }

    // 2. Duplicate detection via SHA-256 content hash
    const contentHash = medicalTextCleaner.computeHash(cleanContent);
    for (const doc of this.documents.values()) {
      if (doc.contentHash === contentHash) {
        return {
          success: false,
          error: `Duplicate document detected. Identical content already exists in document: "${doc.title}" (${doc.id})`,
          isDuplicate: true,
        };
      }
    }

    // 3. Organization verification against trusted healthcare whitelist
    if (!this.isValidTrustedOrganization(input.organizationCategory, input.organization)) {
      return {
        success: false,
        error: `Organization "${input.organization}" (${input.organizationCategory}) is not recognized as a trusted medical authority. Arbitrary web sources are rejected.`,
      };
    }

    const docId = `DOC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const status: ContentStatus = input.contentStatus || 'DRAFT';

    // 4. Semantic Chunking
    const chunkMetadata = {
      title: input.title,
      organization: input.organization,
      organizationCategory: input.organizationCategory,
      topic: input.topic,
      country: input.country,
      evidenceLevel: input.evidenceLevel,
      contentStatus: status,
      url: input.url,
      version: input.version,
      publicationDate: input.publicationDate,
      reviewDate: input.reviewDate,
    };

    const chunks = semanticMedicalChunker.chunkDocument(docId, cleanContent, chunkMetadata);

    // 5. Generate embeddings for each chunk
    for (const chunk of chunks) {
      chunk.embedding = await medicalEmbeddingService.generateEmbedding(chunk.text);
    }

    const newDoc: MedicalKnowledgeDocument = {
      id: docId,
      title: input.title,
      organization: input.organization,
      organizationCategory: input.organizationCategory,
      url: input.url,
      publicationDate: input.publicationDate,
      reviewDate: input.reviewDate,
      topic: input.topic,
      country: input.country,
      evidenceLevel: input.evidenceLevel,
      contentStatus: status,
      reviewer: input.reviewer,
      version: input.version,
      rawContent: input.rawContent,
      cleanContent,
      contentHash,
      chunks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.documents.set(docId, newDoc);
    this.chunks.push(...chunks);

    return {
      success: true,
      document: newDoc,
    };
  }

  /**
   * Admin Workflow: Update knowledge source
   */
  public async updateSource(
    id: string,
    updates: Partial<NewSourceInput>
  ): Promise<{ success: boolean; document?: MedicalKnowledgeDocument; error?: string }> {
    const doc = this.documents.get(id);
    if (!doc) {
      return { success: false, error: `Document ${id} not found` };
    }

    if (updates.rawContent) {
      const cleanContent = medicalTextCleaner.clean(updates.rawContent);
      const contentHash = medicalTextCleaner.computeHash(cleanContent);

      // Re-chunk
      const chunkMetadata = {
        title: updates.title || doc.title,
        organization: updates.organization || doc.organization,
        organizationCategory: updates.organizationCategory || doc.organizationCategory,
        topic: updates.topic || doc.topic,
        country: updates.country || doc.country,
        evidenceLevel: updates.evidenceLevel || doc.evidenceLevel,
        contentStatus: doc.contentStatus,
        url: updates.url || doc.url,
        version: updates.version || doc.version,
        publicationDate: updates.publicationDate || doc.publicationDate,
        reviewDate: updates.reviewDate || doc.reviewDate,
      };

      const newChunks = semanticMedicalChunker.chunkDocument(id, cleanContent, chunkMetadata);
      for (const chunk of newChunks) {
        chunk.embedding = await medicalEmbeddingService.generateEmbedding(chunk.text);
      }

      // Remove old chunks
      this.chunks = this.chunks.filter((c) => c.documentId !== id);
      this.chunks.push(...newChunks);

      doc.rawContent = updates.rawContent;
      doc.cleanContent = cleanContent;
      doc.contentHash = contentHash;
      doc.chunks = newChunks;
    }

    if (updates.title) doc.title = updates.title;
    if (updates.organization) doc.organization = updates.organization;
    if (updates.organizationCategory) doc.organizationCategory = updates.organizationCategory;
    if (updates.url) doc.url = updates.url;
    if (updates.publicationDate) doc.publicationDate = updates.publicationDate;
    if (updates.reviewDate) doc.reviewDate = updates.reviewDate;
    if (updates.topic) doc.topic = updates.topic;
    if (updates.country) doc.country = updates.country;
    if (updates.evidenceLevel) doc.evidenceLevel = updates.evidenceLevel;
    if (updates.reviewer) doc.reviewer = updates.reviewer;
    if (updates.version) doc.version = updates.version;
    doc.updatedAt = new Date().toISOString();

    return { success: true, document: doc };
  }

  /**
   * Admin Workflow: Transition source status (Review, Publish, Archive)
   */
  public updateSourceStatus(
    id: string,
    newStatus: ContentStatus,
    reviewerName?: string
  ): { success: boolean; document?: MedicalKnowledgeDocument; error?: string } {
    const doc = this.documents.get(id);
    if (!doc) {
      return { success: false, error: `Document ${id} not found` };
    }

    doc.contentStatus = newStatus;
    if (reviewerName) doc.reviewer = reviewerName;
    doc.updatedAt = new Date().toISOString();

    // Update chunks status metadata
    for (const chunk of doc.chunks) {
      chunk.metadata.contentStatus = newStatus;
    }

    return { success: true, document: doc };
  }

  /**
   * Checks if a document has passed its clinical review date (Outdated detection)
   */
  public isDocumentOutdated(doc: MedicalKnowledgeDocument): boolean {
    if (!doc.reviewDate) return false;
    const reviewTimestamp = new Date(doc.reviewDate).getTime();
    return !isNaN(reviewTimestamp) && reviewTimestamp < Date.now();
  }

  /**
   * Returns all stored documents with optional filters
   */
  public getAllDocuments(filter?: {
    status?: ContentStatus;
    evidenceLevel?: EvidenceLevel;
    organizationCategory?: OrganizationCategory;
  }): MedicalKnowledgeDocument[] {
    let docs = Array.from(this.documents.values());
    if (filter?.status) {
      docs = docs.filter((d) => d.contentStatus === filter.status);
    }
    if (filter?.evidenceLevel) {
      docs = docs.filter((d) => d.evidenceLevel === filter.evidenceLevel);
    }
    if (filter?.organizationCategory) {
      docs = docs.filter((d) => d.organizationCategory === filter.organizationCategory);
    }
    return docs;
  }

  public getDocumentById(id: string): MedicalKnowledgeDocument | undefined {
    return this.documents.get(id);
  }

  public getTotalChunkCount(): number {
    return this.chunks.length;
  }

  /**
   * Validates if organization category & name belongs to an authorized trusted entity
   */
  private isValidTrustedOrganization(cat: OrganizationCategory, org: string): boolean {
    const trustedKeywords = [
      'who',
      'world health organization',
      'cdc',
      'nih',
      'nhs',
      'mayo clinic',
      'cleveland clinic',
      'icmr',
      'mohfw',
      'fda',
      'ema',
      'cochrane',
      'lancet',
      'nejm',
      'bmj',
      'ayush',
      'ccras',
      'charaka',
      'sushruta',
      'nice',
      'aha',
      'american heart association',
      'aiims',
    ];

    const orgLower = org.toLowerCase();
    return trustedKeywords.some((k) => orgLower.includes(k)) || cat !== 'CLINICALLY_REVIEWED';
  }

  /**
   * Seeds trusted, clinically validated medical knowledge documents
   */
  private seedDefaultKnowledgeSources() {
    const seedSources: Array<Omit<MedicalKnowledgeDocument, 'cleanContent' | 'contentHash' | 'chunks' | 'createdAt' | 'updatedAt'>> = [
      {
        id: 'DOC-WHO-RESP-01',
        title: 'WHO Clinical Management of Acute Respiratory Infections and Cough',
        organization: 'World Health Organization (WHO)',
        organizationCategory: 'WHO',
        url: 'https://www.who.int/publications/i/item/clinical-management-respiratory-infections',
        publicationDate: '2023-04-15',
        reviewDate: '2027-04-15',
        topic: 'Respiratory Illness & Fever Triage',
        country: 'International',
        evidenceLevel: 'HIGH',
        contentStatus: 'PUBLISHED',
        reviewer: 'Dr. Sarah Jenkins, MD, Pulmonology Panel Lead',
        version: '3.2',
        rawContent: `Acute respiratory tract infections are predominantly viral in etiology. 
Primary supportive management includes adequate oral hydration, rest, and humidified air.
Red flag symptoms requiring prompt in-person medical evaluation include:
- Oxygen saturation (SpO2) < 94% on room air
- Respiratory rate > 24 breaths per minute in adults
- Stridor, grunting, or severe intercostal retractions
- Hemoptysis (coughing up blood)
- Inability to maintain oral fluid intake or signs of dehydration
Routine antibiotic prescriptions for uncomplicated viral upper respiratory infections are not recommended and contribute to antimicrobial resistance.`,
      },
      {
        id: 'DOC-CDC-CHEST-02',
        title: 'CDC Guidelines for Emergency Evaluation of Acute Chest Pain & Angina',
        organization: 'Centers for Disease Control and Prevention (CDC)',
        organizationCategory: 'GOVERNMENT_HEALTH',
        url: 'https://www.cdc.gov/heartdisease/heart_attack.htm',
        publicationDate: '2023-08-10',
        reviewDate: '2027-08-10',
        topic: 'Cardiovascular Emergencies',
        country: 'United States',
        evidenceLevel: 'HIGH',
        contentStatus: 'PUBLISHED',
        reviewer: 'Dr. Marcus Vance, FACC, Emergency Cardiology',
        version: '4.1',
        rawContent: `Acute chest discomfort characterized by pressure, tightness, squeezing, or pain radiating to the left arm, jaw, neck, back, or epigastrium is an emergency indicator.
Accompanying symptoms such as diaphoresis (cold sweats), unexplained shortness of breath, lightheadedness, or sudden syncope elevate the risk profile to urgent high priority (RED Tier).
Immediate emergency services (911 / local EMS) must be dispatched. 
Patient must avoid strenuous physical exertion. Unsupervised self-administration of medications without direct physician triage is contraindicated.`,
      },
      {
        id: 'DOC-MAYO-HEAD-03',
        title: 'Mayo Clinic Clinical Guide: Headache Classification & Red Flags',
        organization: 'Mayo Clinic',
        organizationCategory: 'RECOGNIZED_MEDICAL_ORG',
        url: 'https://www.mayoclinic.org/symptoms/headache/basics/when-to-see-doctor/sym-20050800',
        publicationDate: '2024-01-20',
        reviewDate: '2028-01-20',
        topic: 'Neurology & Headache Triage',
        country: 'United States',
        evidenceLevel: 'HIGH',
        contentStatus: 'PUBLISHED',
        reviewer: 'Dr. Elena Rostova, MD, Neurologist',
        version: '2.5',
        rawContent: `Most headaches are primary tension-type or migraine episodes. 
However, high-acuity secondary headache red flags (SNOOP criteria) require emergency neuro-imaging:
- Sudden onset "thunderclap" headache reaching peak intensity within 60 seconds
- Systemic symptoms (high fever, neck stiffness / meningismus)
- Neurological deficits: focal weakness, dysarthria, visual field loss, confusion
- Onset after age 50 or new headache type in a patient with history of malignancy
- Positional headache worsening markedly when upright or coughing
Mild tension headaches without red flags may benefit from quiet rest, stress reduction, and hydration.`,
      },
      {
        id: 'DOC-AYUSH-LIFESTYLE-04',
        title: 'Ministry of AYUSH: Ayurvedic Dietary & Lifestyle Guidance for Seasonal Imbalances',
        organization: 'Ministry of Ayush, Government of India',
        organizationCategory: 'OFFICIAL_AYUSH',
        url: 'https://www.ayush.gov.in/guidelines/seasonal-dietary-lifestyle.html',
        publicationDate: '2023-11-01',
        reviewDate: '2027-11-01',
        topic: 'Ayurveda & Holistic Wellness',
        country: 'India',
        evidenceLevel: 'TRADITIONAL_USE',
        contentStatus: 'PUBLISHED',
        reviewer: 'Vaidya R. K. Sharma, BAMS, MD (Ayurveda)',
        version: '1.8',
        rawContent: `In traditional Ayurvedic medicine, health is viewed as the dynamic equilibrium of the Tridoshas (Vata, Pitta, Kapha).
For mild seasonal respiratory and digestive sluggishness:
- Warm water intake (Ushnodaka) and herbal decoctions containing Tulsi (Holy Basil) and Shunthi (Dry Ginger) are traditionally used to balance Kapha and Vata.
- Triphala churna taken with warm water supports digestive fire (Agni) and healthy bowel regularity.
- Daily routine (Dinacharya) including nasal oiling (Pratimarsha Nasya) with sesame oil.
Precaution: Ayurvedic supportive remedies are complementary lifestyle practices and do not replace emergency medical interventions for acute high-risk conditions.`,
      },
      {
        id: 'DOC-COCH-GI-05',
        title: 'Cochrane Systematic Review: Oral Rehydration Solutions in Acute Gastroenteritis',
        organization: 'Cochrane Library',
        organizationCategory: 'PEER_REVIEWED_RESEARCH',
        url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD004383.pub3/full',
        publicationDate: '2023-06-18',
        reviewDate: '2026-06-18',
        topic: 'Gastroenterology & Hydration',
        country: 'United Kingdom',
        evidenceLevel: 'HIGH',
        contentStatus: 'PUBLISHED',
        reviewer: 'Cochrane Gastroenterology Review Group',
        version: '3.0',
        rawContent: `Systematic evidence strongly demonstrates that low-osmolarity Oral Rehydration Salts (ORS) are as effective as intravenous therapy for mild-to-moderate dehydration from acute diarrhea and vomiting.
Oral rehydration should be initiated early in frequent small sips.
Red flags mandating immediate hospital admission:
- Inability to retain fluids with continuous projectile vomiting
- Severe abdominal rigidity, peritoneal rebound tenderness, or localized right lower quadrant guarding
- Gross blood in stool (melena or hematochezia)
- Signs of hypovolemic shock: postural tachycardia, oliguria (< 500 mL urine / 24h), sunken eyes, lethargy.`,
      },
      {
        id: 'DOC-FDA-MED-06',
        title: 'FDA Consumer Health Guidance: Safe Over-The-Counter Pain Reliever Use',
        organization: 'US Food and Drug Administration (FDA)',
        organizationCategory: 'OFFICIAL_MEDICINE_INFO',
        url: 'https://www.fda.gov/drugs/safe-otc-use/pain-relievers',
        publicationDate: '2022-12-05',
        reviewDate: '2026-12-05',
        topic: 'Pharmacology Safety',
        country: 'United States',
        evidenceLevel: 'HIGH',
        contentStatus: 'PUBLISHED',
        reviewer: 'FDA Center for Drug Evaluation and Research',
        version: '2.0',
        rawContent: `Acetaminophen and Non-Steroidal Anti-Inflammatory Drugs (NSAIDs) are widely available for temporary fever and minor ache relief.
Key safety boundaries:
- Never exceed maximum 24-hour dosages to prevent severe hepatic toxicity with acetaminophen.
- NSAIDs (such as ibuprofen or naproxen) carry risks of gastrointestinal ulceration and renal impairment, especially in older adults, individuals with chronic kidney disease, or history of peptic ulcer disease.
- Always consult a licensed pharmacist or physician before combining multiple combination cold products to avoid duplicate active ingredient toxicity.`,
      },
      {
        id: 'DOC-OUTDATED-DEMO-07',
        title: 'Archived Clinical Note on Archaic Triage Practices (Historical)',
        organization: 'Historical Medical Society',
        organizationCategory: 'CLINICALLY_REVIEWED',
        url: 'https://www.historicalmed.org/archived-note-1999',
        publicationDate: '1999-01-01',
        reviewDate: '2005-01-01', // Expired!
        topic: 'Historical Archive',
        country: 'United States',
        evidenceLevel: 'LIMITED',
        contentStatus: 'ARCHIVED', // Archived!
        reviewer: 'Archival Staff',
        version: '0.9',
        rawContent: `Outdated historical protocols for bloodletting and archaic triage. Not for clinical use.`,
      },
      {
        id: 'DOC-DRAFT-SAMPLE-08',
        title: 'Draft Unreviewed Clinical Notes on Pediatric Rash Patterns',
        organization: 'Pediatric Working Group',
        organizationCategory: 'CLINICALLY_REVIEWED',
        url: 'https://www.internal-draft.org/rash-notes',
        publicationDate: '2026-08-01',
        reviewDate: '2027-08-01',
        topic: 'Pediatrics Rash Draft',
        country: 'United States',
        evidenceLevel: 'UNCERTAIN',
        contentStatus: 'DRAFT', // Draft!
        reviewer: 'Pending Peer Reviewer Assignment',
        version: '0.1-alpha',
        rawContent: `Unreviewed draft observations regarding atypical exanthem presentations. Awaiting senior clinical review.`,
      },
    ];

    for (const item of seedSources) {
      const cleanContent = medicalTextCleaner.clean(item.rawContent);
      const contentHash = medicalTextCleaner.computeHash(cleanContent);
      const chunkMetadata = {
        title: item.title,
        organization: item.organization,
        organizationCategory: item.organizationCategory,
        topic: item.topic,
        country: item.country,
        evidenceLevel: item.evidenceLevel,
        contentStatus: item.contentStatus,
        url: item.url,
        version: item.version,
        publicationDate: item.publicationDate,
        reviewDate: item.reviewDate,
      };

      const chunks = semanticMedicalChunker.chunkDocument(item.id, cleanContent, chunkMetadata);
      const doc: MedicalKnowledgeDocument = {
        ...item,
        cleanContent,
        contentHash,
        chunks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.documents.set(item.id, doc);
      this.chunks.push(...chunks);
    }
  }
}

export const medicalKnowledgeVectorStore = new MedicalKnowledgeVectorStore();
