export type EvidenceLevel =
  | 'HIGH'
  | 'MODERATE'
  | 'LIMITED'
  | 'UNCERTAIN'
  | 'TRADITIONAL_USE';

export type ContentStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export type OrganizationCategory =
  | 'WHO'
  | 'GOVERNMENT_HEALTH'
  | 'RECOGNIZED_MEDICAL_ORG'
  | 'PEER_REVIEWED_RESEARCH'
  | 'OFFICIAL_MEDICINE_INFO'
  | 'OFFICIAL_AYUSH'
  | 'CLINICALLY_REVIEWED';

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  embedding?: number[];
  metadata: {
    title: string;
    organization: string;
    organizationCategory: OrganizationCategory;
    topic: string;
    country: string;
    evidenceLevel: EvidenceLevel;
    contentStatus: ContentStatus;
    url?: string;
    version: string;
    publicationDate: string;
    reviewDate: string;
  };
}

export interface MedicalKnowledgeDocument {
  id: string;
  title: string;
  organization: string;
  organizationCategory: OrganizationCategory;
  url: string;
  publicationDate: string;
  reviewDate: string;
  topic: string;
  country: string;
  evidenceLevel: EvidenceLevel;
  contentStatus: ContentStatus;
  reviewer: string;
  version: string;
  rawContent: string;
  cleanContent: string;
  contentHash: string;
  chunks: DocumentChunk[];
  createdAt: string;
  updatedAt: string;
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  similarityScore: number;
  sourceDocument: {
    id: string;
    title: string;
    organization: string;
    organizationCategory: OrganizationCategory;
    url: string;
    evidenceLevel: EvidenceLevel;
    publicationDate: string;
    reviewDate: string;
    version: string;
  };
}

export interface RAGCitation {
  sourceId: string;
  title: string;
  organization: string;
  url: string;
  evidenceLevel: EvidenceLevel;
  quoteSnippet: string;
  similarityScore: number;
}

export interface RAGContext {
  query: string;
  retrievedChunks: RetrievalResult[];
  citations: RAGCitation[];
  totalMatchesFound: number;
  highestEvidenceLevel: EvidenceLevel;
  hasTraditionalAyushContent: boolean;
  contextPromptBlock: string;
  retrievalTimestamp: string;
}

export interface NewSourceInput {
  title: string;
  organization: string;
  organizationCategory: OrganizationCategory;
  url: string;
  publicationDate: string;
  reviewDate: string;
  topic: string;
  country: string;
  evidenceLevel: EvidenceLevel;
  contentStatus?: ContentStatus;
  reviewer: string;
  version: string;
  rawContent: string;
}
