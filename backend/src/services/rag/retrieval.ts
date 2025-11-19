/**
 * RAG retrieval service
 */

import { Pool } from 'pg';
import { RAG_CONFIG } from '../../config/rag';
import { generateEmbedding } from './embedding';

export interface RetrievalResult {
  id: number;
  text: string;
  metadata: Record<string, any>;
  similarity: number;
}

export interface RetrievalOptions {
  topK?: number;
  minSimilarity?: number;
  filter?: {
    source?: string;
    quarterlyId?: number;
    date?: string;
  };
}

/**
 * Retrieve relevant documents using vector similarity search
 */
export async function retrieveDocuments(
  pool: Pool,
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult[]> {
  const {
    topK = RAG_CONFIG.retrieval.topK,
    minSimilarity = RAG_CONFIG.retrieval.minSimilarity,
    filter = {},
  } = options;

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // Build filter conditions
  const filterConditions: string[] = [];
  const filterParams: any[] = [];
  let paramIndex = 2; // Start at 2 because $1 is used for embedding

  if (filter.source) {
    filterConditions.push(`metadata->>'source' = $${paramIndex}`);
    filterParams.push(filter.source);
    paramIndex++;
  }

  if (filter.quarterlyId) {
    filterConditions.push(`(metadata->>'quarterlyId')::int = $${paramIndex}`);
    filterParams.push(filter.quarterlyId);
    paramIndex++;
  }

  if (filter.date) {
    filterConditions.push(`metadata->>'date' = $${paramIndex}`);
    filterParams.push(filter.date);
    paramIndex++;
  }

  const whereClause = filterConditions.length > 0
    ? `WHERE ${filterConditions.join(' AND ')}`
    : '';

  // Query using pgvector cosine similarity
  const query_sql = `
    SELECT
      id,
      text_content,
      metadata,
      1 - (embedding <=> $1::vector) AS similarity
    FROM rag_document
    ${whereClause}
    ORDER BY embedding <=> $1::vector
    LIMIT $${paramIndex}
  `;

  const params = [
    `[${queryEmbedding.join(',')}]`, // Convert array to pgvector format
    ...filterParams,
    topK,
  ];

  const result = await pool.query(query_sql, params);

  // Filter by minimum similarity and map results
  return result.rows
    .filter(row => row.similarity >= minSimilarity)
    .map(row => ({
      id: row.id,
      text: row.text_content,
      metadata: row.metadata,
      similarity: row.similarity,
    }));
}

/**
 * Retrieve documents with reranking
 */
export async function retrieveAndRerank(
  pool: Pool,
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult[]> {
  // First, get more candidates than needed
  const candidates = await retrieveDocuments(pool, query, {
    ...options,
    topK: (options.topK || RAG_CONFIG.retrieval.topK) * 2,
  });

  if (!RAG_CONFIG.retrieval.rerank || candidates.length <= (options.topK || RAG_CONFIG.retrieval.topK)) {
    return candidates.slice(0, options.topK || RAG_CONFIG.retrieval.topK);
  }

  // Simple reranking based on query term overlap
  // In production, you'd use a cross-encoder model here
  const queryTerms = query.toLowerCase().split(/\s+/);

  const reranked = candidates.map(doc => {
    const docText = doc.text.toLowerCase();
    const termOverlap = queryTerms.filter(term => docText.includes(term)).length;
    const rerankScore = doc.similarity * 0.7 + (termOverlap / queryTerms.length) * 0.3;

    return {
      ...doc,
      rerankScore,
    };
  });

  reranked.sort((a, b) => b.rerankScore - a.rerankScore);

  return reranked.slice(0, options.topK || RAG_CONFIG.retrieval.topK);
}

/**
 * Format retrieved documents into context string
 */
export function formatContext(documents: RetrievalResult[]): string {
  if (documents.length === 0) {
    return 'No relevant context found.';
  }

  return documents
    .map((doc, index) => {
      const source = formatSource(doc.metadata);
      return `[${index + 1}] ${source}\n${doc.text}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Format source metadata for citation
 */
export function formatSource(metadata: Record<string, any>): string {
  if (metadata.source === 'devotional') {
    return `Devotional: ${metadata.title} (${metadata.date})`;
  }

  if (metadata.source === 'quarterly') {
    return `${metadata.quarterlyTitle}, Lesson ${metadata.lessonNumber}: ${metadata.lessonTitle}, Day ${metadata.dayIndex}`;
  }

  if (metadata.source === 'bible') {
    return `Bible: ${metadata.reference}`;
  }

  return 'Unknown source';
}

/**
 * Extract citations from retrieved documents
 */
export function extractCitations(documents: RetrievalResult[]): Array<{
  index: number;
  source: string;
  metadata: Record<string, any>;
}> {
  return documents.map((doc, index) => ({
    index: index + 1,
    source: formatSource(doc.metadata),
    metadata: doc.metadata,
  }));
}
