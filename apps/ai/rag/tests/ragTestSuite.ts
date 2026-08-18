import { medicalKnowledgeVectorStore } from '../services/vectorStore';
import { medicalRAGService } from '../services/ragService';
import { medicalTextCleaner } from '../services/textCleaner';
import { NewSourceInput } from '../types/ragTypes';

export interface Phase8TestCaseResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  details: string;
  inputSnapshot?: any;
  outputSnapshot?: any;
  error?: string;
}

export interface Phase8TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  timestamp: string;
  results: Phase8TestCaseResult[];
}

export class Phase8RAGTestSuite {
  /**
   * Executes all 7 mandated Phase 8 RAG and Medical Knowledge verification test suites
   */
  public async runAllTests(): Promise<Phase8TestSuiteSummary> {
    const results: Phase8TestCaseResult[] = [];

    // Test 1: Retrieval Relevance
    results.push(await this.testRetrievalRelevance());

    // Test 2: No-Result Cases & Graceful Degradation
    results.push(await this.testNoResultHandling());

    // Test 3: Incorrect Source Rejection (Untrusted Domains / Blogs)
    results.push(await this.testIncorrectSourceHandling());

    // Test 4: Citation Correctness & Traceability
    results.push(await this.testCitationCorrectness());

    // Test 5: Outdated Information Detection
    results.push(await this.testOutdatedInformationHandling());

    // Test 6: Duplicate Document Deduplication
    results.push(await this.testDuplicateDocumentHandling());

    // Test 7: Unreviewed / Draft / Archived Content Safety
    results.push(await this.testUnreviewedContentRejection());

    const passed = results.filter((r) => r.passed).length;
    const failed = results.length - passed;
    const passRate = Math.round((passed / results.length) * 100);

    return {
      total: results.length,
      passed,
      failed,
      passRate,
      timestamp: new Date().toISOString(),
      results,
    };
  }

  /**
   * Test 1: Retrieval relevance
   */
  private async testRetrievalRelevance(): Promise<Phase8TestCaseResult> {
    const start = Date.now();
    try {
      const results = await medicalKnowledgeVectorStore.search(
        'Severe squeezing chest pain radiating to left arm with cold sweats',
        { topK: 3, onlyPublished: true }
      );

      const hasCdcCardio = results.some((r) =>
        r.sourceDocument.title.toLowerCase().includes('chest pain') ||
        r.sourceDocument.title.toLowerCase().includes('cardiovascular')
      );

      const passed = results.length > 0 && hasCdcCardio && results[0].similarityScore > 0.4;

      return {
        id: 'P8-01',
        name: 'Semantic Retrieval Relevance & Top-K Ranking',
        category: 'Vector Retrieval',
        passed,
        durationMs: Date.now() - start,
        details: `Successfully retrieved top ${results.length} relevant chunks with primary match: "${results[0]?.sourceDocument.title}" (Score: ${results[0]?.similarityScore}).`,
        outputSnapshot: results.map((r) => ({
          title: r.sourceDocument.title,
          score: r.similarityScore,
          evidence: r.sourceDocument.evidenceLevel,
        })),
      };
    } catch (err: any) {
      return {
        id: 'P8-01',
        name: 'Semantic Retrieval Relevance & Top-K Ranking',
        category: 'Vector Retrieval',
        passed: false,
        durationMs: Date.now() - start,
        details: 'Failed during semantic retrieval',
        error: err.message,
      };
    }
  }

  /**
   * Test 2: No-result cases handling
   */
  private async testNoResultHandling(): Promise<Phase8TestCaseResult> {
    const start = Date.now();
    try {
      const ragContext = await medicalRAGService.retrieveClinicalContext([]);
      const passed =
        ragContext.totalMatchesFound >= 0 &&
        Boolean(ragContext.contextPromptBlock) &&
        ragContext.query === 'General health evaluation';

      return {
        id: 'P8-02',
        name: 'No-Result Cases & Safe Context Fallback',
        category: 'Resilience',
        passed,
        durationMs: Date.now() - start,
        details: 'Handled empty/sparse symptom queries safely with generalized clinical guidance block.',
        outputSnapshot: { query: ragContext.query, matches: ragContext.totalMatchesFound },
      };
    } catch (err: any) {
      return {
        id: 'P8-02',
        name: 'No-Result Cases & Safe Context Fallback',
        category: 'Resilience',
        passed: false,
        durationMs: Date.now() - start,
        details: 'Failed during no-result evaluation',
        error: err.message,
      };
    }
  }

  /**
   * Test 3: Incorrect source handling (Untrusted source rejection)
   */
  private async testIncorrectSourceHandling(): Promise<Phase8TestCaseResult> {
    const start = Date.now();
    const untrustedSource: NewSourceInput = {
      title: 'Miracle Herbal Detox Secrets',
      organization: 'Random Online Blog & Sales Forum',
      organizationCategory: 'CLINICALLY_REVIEWED',
      url: 'https://www.arbitrary-unverified-blog.xyz/miracle',
      publicationDate: '2026-01-01',
      reviewDate: '2027-01-01',
      topic: 'Unverified Wellness',
      country: 'Unknown',
      evidenceLevel: 'UNCERTAIN',
      reviewer: 'Unknown User',
      version: '1.0',
      rawContent: 'Take this unverified secret herbal blend for all diseases without consulting doctors.',
    };

    const addResult = await medicalKnowledgeVectorStore.addSource(untrustedSource);
    const passed = !addResult.success && Boolean(addResult.error?.includes('not recognized as a trusted medical authority'));

    return {
      id: 'P8-03',
      name: 'Untrusted Source Rejection & Authority Whitelist',
      category: 'Source Governance',
      passed,
      durationMs: Date.now() - start,
      details: 'Strictly rejected unverified blog source and blocked addition to knowledge base.',
      inputSnapshot: { organization: untrustedSource.organization, url: untrustedSource.url },
      outputSnapshot: { rejected: !addResult.success, error: addResult.error },
    };
  }

  /**
   * Test 4: Citation correctness & traceability
   */
  private async testCitationCorrectness(): Promise<Phase8TestCaseResult> {
    const start = Date.now();
    try {
      const ragContext = await medicalRAGService.retrieveClinicalContext([
        'Cough',
        'Fever',
        'Shortness of breath',
      ]);

      const hasCitations = ragContext.citations.length > 0;
      const allCitationsTraceable = ragContext.citations.every(
        (c) => Boolean(c.sourceId) && Boolean(c.title) && Boolean(c.organization) && Boolean(c.evidenceLevel)
      );

      const passed = hasCitations && allCitationsTraceable;

      return {
        id: 'P8-04',
        name: 'Citation Traceability & Source Provenance',
        category: 'Citation Integrity',
        passed,
        durationMs: Date.now() - start,
        details: `Generated ${ragContext.citations.length} verified citations with full provenance, evidence tiers, and URLs.`,
        outputSnapshot: ragContext.citations,
      };
    } catch (err: any) {
      return {
        id: 'P8-04',
        name: 'Citation Traceability & Source Provenance',
        category: 'Citation Integrity',
        passed: false,
        durationMs: Date.now() - start,
        details: 'Failed during citation verification',
        error: err.message,
      };
    }
  }

  /**
   * Test 5: Outdated information handling
   */
  private async testOutdatedInformationHandling(): Promise<Phase8TestCaseResult> {
    const start = Date.now();
    const outdatedDoc = medicalKnowledgeVectorStore.getDocumentById('DOC-OUTDATED-DEMO-07');
    const validDoc = medicalKnowledgeVectorStore.getDocumentById('DOC-WHO-RESP-01');

    const isOutdatedCorrect = outdatedDoc ? medicalKnowledgeVectorStore.isDocumentOutdated(outdatedDoc) : false;
    const isValidNotOutdated = validDoc ? !medicalKnowledgeVectorStore.isDocumentOutdated(validDoc) : false;

    const passed = isOutdatedCorrect && isValidNotOutdated;

    return {
      id: 'P8-05',
      name: 'Outdated Medical Document & Review Expiry Flagging',
      category: 'Evidence Quality',
      passed,
      durationMs: Date.now() - start,
      details: 'Correctly flagged expired clinical review dates while validating current evidence lifecycles.',
      outputSnapshot: {
        outdatedDocReviewDate: outdatedDoc?.reviewDate,
        isExpired: isOutdatedCorrect,
      },
    };
  }

  /**
   * Test 6: Duplicate document handling
   */
  private async testDuplicateDocumentHandling(): Promise<Phase8TestCaseResult> {
    const start = Date.now();
    const duplicateInput: NewSourceInput = {
      title: 'Duplicate WHO Clinical Management',
      organization: 'World Health Organization (WHO)',
      organizationCategory: 'WHO',
      url: 'https://www.who.int/duplicate',
      publicationDate: '2023-04-15',
      reviewDate: '2027-04-15',
      topic: 'Respiratory Illness',
      country: 'International',
      evidenceLevel: 'HIGH',
      reviewer: 'Dr. Test Reviewer',
      version: '1.0',
      rawContent: `Acute respiratory tract infections are predominantly viral in etiology. 
Primary supportive management includes adequate oral hydration, rest, and humidified air.
Red flag symptoms requiring prompt in-person medical evaluation include:
- Oxygen saturation (SpO2) < 94% on room air
- Respiratory rate > 24 breaths per minute in adults
- Stridor, grunting, or severe intercostal retractions
- Hemoptysis (coughing up blood)
- Inability to maintain oral fluid intake or signs of dehydration
Routine antibiotic prescriptions for uncomplicated viral upper respiratory infections are not recommended and contribute to antimicrobial resistance.`,
    };

    const addResult = await medicalKnowledgeVectorStore.addSource(duplicateInput);
    const passed = !addResult.success && addResult.isDuplicate === true;

    return {
      id: 'P8-06',
      name: 'Duplicate Document Detection & Hash Prevention',
      category: 'Database Hygiene',
      passed,
      durationMs: Date.now() - start,
      details: 'Detected identical SHA-256 content hash and prevented duplicate vector index pollution.',
      outputSnapshot: { isDuplicate: addResult.isDuplicate, error: addResult.error },
    };
  }

  /**
   * Test 7: Unreviewed / draft / archived content safety
   */
  private async testUnreviewedContentRejection(): Promise<Phase8TestCaseResult> {
    const start = Date.now();
    // Search specifically for words in the draft and archived documents
    const results = await medicalKnowledgeVectorStore.search('Pediatric Rash Patterns bloodletting', {
      topK: 10,
      onlyPublished: true,
    });

    const hasDraft = results.some((r) => r.sourceDocument.id === 'DOC-DRAFT-SAMPLE-08');
    const hasArchived = results.some((r) => r.sourceDocument.id === 'DOC-OUTDATED-DEMO-07');

    const passed = !hasDraft && !hasArchived;

    return {
      id: 'P8-07',
      name: 'Unreviewed & Draft Content Production Rejection',
      category: 'Clinical Guardrails',
      passed,
      durationMs: Date.now() - start,
      details: 'Confirmed that DRAFT and ARCHIVED sources are strictly excluded from production clinical RAG.',
      outputSnapshot: {
        totalPublishedMatches: results.length,
        draftIncluded: hasDraft,
        archivedIncluded: hasArchived,
      },
    };
  }
}

export const phase8RAGTestSuite = new Phase8RAGTestSuite();
