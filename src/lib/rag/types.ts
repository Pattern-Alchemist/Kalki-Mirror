export interface FolioChunkRow {
  id: string;
  slug: string;
  archetype: string | null;
  section: string;
  caution: string;
  text: string;
  embedding: string; // JSON array of floats
}

export interface RetrievedChunk {
  slug: string;
  section: string;
  caution: string;
  text: string;
  similarity: number;
}

export type RetrievalPool = 'prescription' | 'citation';
