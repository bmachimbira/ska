/**
 * Embedding generation service
 */

import { RAG_CONFIG } from '../../config/rag';

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (RAG_CONFIG.embedding.provider === 'openai') {
    return generateOpenAIEmbedding(text);
  }

  throw new Error(`Unsupported embedding provider: ${RAG_CONFIG.embedding.provider}`);
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (RAG_CONFIG.embedding.provider === 'openai') {
    return generateOpenAIEmbeddings(texts);
  }

  throw new Error(`Unsupported embedding provider: ${RAG_CONFIG.embedding.provider}`);
}

/**
 * Generate embedding using OpenAI API
 */
async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: RAG_CONFIG.embedding.model,
      input: text,
      dimensions: RAG_CONFIG.embedding.dimensions,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Generate embeddings in batch using OpenAI API
 */
async function generateOpenAIEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const { batchSize } = RAG_CONFIG.embedding;
  const embeddings: number[][] = [];

  // Process in batches
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: RAG_CONFIG.embedding.model,
        input: batch,
        dimensions: RAG_CONFIG.embedding.dimensions,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const batchEmbeddings = data.data.map((item: any) => item.embedding);
    embeddings.push(...batchEmbeddings);
  }

  return embeddings;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
