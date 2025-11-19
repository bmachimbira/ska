/**
 * RAG Configuration
 */

export const RAG_CONFIG = {
  // Embedding model
  embedding: {
    provider: 'openai', // 'openai' | 'local'
    model: 'text-embedding-3-small',
    dimensions: 1536,
    batchSize: 100,
  },

  // Chunking strategy
  chunking: {
    chunkSize: 500, // characters
    chunkOverlap: 50, // characters
    separators: ['\n\n', '\n', '. ', ' '],
  },

  // Retrieval settings
  retrieval: {
    topK: 5, // number of documents to retrieve
    minSimilarity: 0.7, // minimum cosine similarity
    useHybrid: true, // combine vector + BM25
    rerank: true, // rerank results
  },

  // LLM settings
  llm: {
    provider: 'openai', // 'openai' | 'anthropic'
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1000,
    streaming: true,
  },

  // Context modes
  modes: {
    general: {
      description: 'General Bible and spiritual questions',
      systemPrompt: `You are a knowledgeable Bible study assistant. Answer questions based on the provided context from devotionals, quarterlies, and Bible passages. Always cite your sources. Be respectful and doctrinally sound.`,
    },
    quarterly: {
      description: 'Questions scoped to current quarterly',
      systemPrompt: `You are helping a student study their current Sabbath School quarterly. Answer questions based on the provided lesson content. Cite specific lessons and days. Help them understand the material deeply.`,
    },
    devotional: {
      description: 'Daily devotional study',
      systemPrompt: `You are a spiritual companion helping with daily devotional study. Answer questions based on the devotional content provided. Be encouraging and practical in your responses.`,
    },
  },
};
