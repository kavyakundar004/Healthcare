import { DocumentChunk, MedicalKnowledgeDocument } from '../types/ragTypes';

export interface ChunkOptions {
  maxChunkSizeChars?: number;
  overlapChars?: number;
}

export class SemanticMedicalChunker {
  private defaultMaxChars = 800; // ~150-200 words
  private defaultOverlapChars = 120; // ~20-30 words

  /**
   * Splits cleaned medical document into semantically bounded chunks with metadata
   */
  public chunkDocument(
    documentId: string,
    cleanText: string,
    metadata: Omit<DocumentChunk['metadata'], 'chunkIndex'>,
    options?: ChunkOptions
  ): DocumentChunk[] {
    const maxChars = options?.maxChunkSizeChars || this.defaultMaxChars;
    const overlap = options?.overlapChars || this.defaultOverlapChars;

    if (!cleanText || cleanText.trim().length === 0) {
      return [];
    }

    // Split text by structural sections / paragraphs first
    const paragraphs = cleanText.split(/\n\s*\n/);
    const chunks: DocumentChunk[] = [];
    let currentChunkText = '';
    let chunkIndex = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i].trim();
      if (!para) continue;

      // If single paragraph is longer than maxChars, split by sentences
      if (para.length > maxChars) {
        const sentences = para.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [para];
        for (const sentence of sentences) {
          if ((currentChunkText + ' ' + sentence).length > maxChars && currentChunkText.length > 0) {
            chunks.push(
              this.buildChunk(documentId, chunkIndex++, currentChunkText.trim(), metadata)
            );
            // Overlap: retain tail of current chunk
            const overlapText = currentChunkText.slice(-overlap);
            currentChunkText = overlapText + ' ' + sentence;
          } else {
            currentChunkText += (currentChunkText ? ' ' : '') + sentence;
          }
        }
      } else {
        // If adding this paragraph exceeds maxChars, flush current chunk
        if ((currentChunkText + '\n\n' + para).length > maxChars && currentChunkText.length > 0) {
          chunks.push(
            this.buildChunk(documentId, chunkIndex++, currentChunkText.trim(), metadata)
          );
          // Overlap: retain tail of current chunk
          const overlapText = currentChunkText.slice(-overlap);
          currentChunkText = overlapText + '\n\n' + para;
        } else {
          currentChunkText += (currentChunkText ? '\n\n' : '') + para;
        }
      }
    }

    // Flush remaining chunk
    if (currentChunkText.trim().length > 0) {
      chunks.push(
        this.buildChunk(documentId, chunkIndex++, currentChunkText.trim(), metadata)
      );
    }

    return chunks;
  }

  private buildChunk(
    documentId: string,
    chunkIndex: number,
    text: string,
    metadata: Omit<DocumentChunk['metadata'], 'chunkIndex'>
  ): DocumentChunk {
    const approxTokens = Math.ceil(text.split(/\s+/).length * 1.3);
    return {
      id: `${documentId}-chk-${chunkIndex.toString().padStart(3, '0')}`,
      documentId,
      chunkIndex,
      text,
      tokenCount: approxTokens,
      metadata: {
        ...metadata,
      },
    };
  }
}

export const semanticMedicalChunker = new SemanticMedicalChunker();
