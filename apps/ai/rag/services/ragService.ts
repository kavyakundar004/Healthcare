import {
  RAGContext,
  RAGCitation,
  RetrievalResult,
  EvidenceLevel,
} from '../types/ragTypes';
import { medicalKnowledgeVectorStore } from './vectorStore';

export class MedicalRAGService {
  /**
   * Retrieves verified clinical knowledge chunks and builds grounded RAG context
   */
  public async retrieveClinicalContext(
    symptoms: string[],
    additionalContext?: {
      duration?: string;
      riskLevel?: string;
      answersSummary?: string[];
    }
  ): Promise<RAGContext> {
    // 1. Build rich semantic query string
    const queryParts = [...symptoms];
    if (additionalContext?.duration) {
      queryParts.push(`duration ${additionalContext.duration}`);
    }
    if (additionalContext?.answersSummary && additionalContext.answersSummary.length > 0) {
      queryParts.push(additionalContext.answersSummary.slice(0, 3).join(' '));
    }
    const query = queryParts.join(' ').trim() || 'General health evaluation';

    // 2. Perform Semantic Vector Search on trusted knowledge store
    // Guardrail: only PUBLISHED documents are ever retrieved for production context
    const retrieved = await medicalKnowledgeVectorStore.search(query, {
      topK: 4,
      minSimilarity: 0.30,
      onlyPublished: true,
    });

    // 3. Extract verified traceable citations
    const citations: RAGCitation[] = retrieved.map((r) => ({
      sourceId: r.sourceDocument.id,
      title: r.sourceDocument.title,
      organization: r.sourceDocument.organization,
      url: r.sourceDocument.url,
      evidenceLevel: r.sourceDocument.evidenceLevel,
      quoteSnippet: r.chunk.text.slice(0, 240) + '...',
      similarityScore: r.similarityScore,
    }));

    // 4. Calculate highest evidence level
    const evidenceOrder: Record<EvidenceLevel, number> = {
      HIGH: 5,
      MODERATE: 4,
      LIMITED: 3,
      TRADITIONAL_USE: 2,
      UNCERTAIN: 1,
    };

    let highestLevel: EvidenceLevel = 'UNCERTAIN';
    let maxRank = 0;
    for (const r of retrieved) {
      const rank = evidenceOrder[r.sourceDocument.evidenceLevel] || 0;
      if (rank > maxRank) {
        maxRank = rank;
        highestLevel = r.sourceDocument.evidenceLevel;
      }
    }

    const hasAyush = retrieved.some(
      (r) => r.sourceDocument.evidenceLevel === 'TRADITIONAL_USE' || r.sourceDocument.organizationCategory === 'OFFICIAL_AYUSH'
    );

    // 5. Format Grounding Context Prompt Block
    const contextPromptBlock = this.formatContextPromptBlock(query, retrieved);

    return {
      query,
      retrievedChunks: retrieved,
      citations,
      totalMatchesFound: retrieved.length,
      highestEvidenceLevel: highestLevel,
      hasTraditionalAyushContent: hasAyush,
      contextPromptBlock,
      retrievalTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Formats retrieved knowledge into a strict grounding prompt block
   */
  public formatContextPromptBlock(query: string, retrieved: RetrievalResult[]): string {
    if (retrieved.length === 0) {
      return `[NO DIRECT VERIFIED MEDICAL KNOWLEDGE BASE MATCH FOUND FOR QUERY: "${query}". YOU MUST COMMUNICATE GENERAL HEALTH AWARENESS ONLY AND HIGHLIGHT THE NEED FOR PROFESSIONAL CLINICAL INTAKE.]`;
    }

    let block = `=== TRUSTED MEDICAL KNOWLEDGE BASE RETRIEVED CONTEXT ===\n`;
    block += `CRITICAL RAG INSTRUCTION: Base your health explanations strictly on the evidence below. Every medical point must be consistent with these sources. DO NOT invent facts, diagnoses, or prescriptions.\n\n`;

    retrieved.forEach((r, idx) => {
      block += `[SOURCE ${idx + 1}] ID: ${r.sourceDocument.id}\n`;
      block += `Title: ${r.sourceDocument.title}\n`;
      block += `Organization: ${r.sourceDocument.organization} (${r.sourceDocument.organizationCategory})\n`;
      block += `Evidence Level: ${r.sourceDocument.evidenceLevel} | Review Date: ${r.sourceDocument.reviewDate}\n`;
      block += `Excerpt:\n"${r.chunk.text}"\n`;
      block += `--------------------------------------------------\n`;
    });

    return block;
  }

  /**
   * Validates citations in generated AI response against retrieved source IDs and titles
   */
  public validateGeneratedCitations(
    claimedSources: string[],
    retrievedCitations: RAGCitation[]
  ): {
    isValid: boolean;
    validCitations: string[];
    unretrievedCitations: string[];
  } {
    const validCitations: string[] = [];
    const unretrievedCitations: string[] = [];

    const retrievedNames = retrievedCitations.flatMap((c) => [
      c.title.toLowerCase(),
      c.organization.toLowerCase(),
      c.sourceId.toLowerCase(),
    ]);

    for (const source of claimedSources) {
      const sLower = source.toLowerCase();
      const isRetrieved = retrievedNames.some((rn) => sLower.includes(rn) || rn.includes(sLower));

      if (isRetrieved || this.isStandardRecognizedAuthority(sLower)) {
        validCitations.push(source);
      } else {
        unretrievedCitations.push(source);
      }
    }

    return {
      isValid: unretrievedCitations.length === 0,
      validCitations,
      unretrievedCitations,
    };
  }

  private isStandardRecognizedAuthority(sourceLower: string): boolean {
    const whitelisted = ['who', 'cdc', 'nih', 'nhs', 'mayo clinic', 'ayush', 'fda', 'cochrane'];
    return whitelisted.some((w) => sourceLower.includes(w));
  }
}

export const medicalRAGService = new MedicalRAGService();
