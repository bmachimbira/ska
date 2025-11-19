/**
 * LLM integration service
 */

import { RAG_CONFIG } from '../../config/rag';
import { RetrievalResult, formatContext } from './retrieval';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  answer: string;
  sources: Array<{
    index: number;
    source: string;
    metadata: Record<string, any>;
  }>;
}

/**
 * Generate answer using LLM with retrieved context
 */
export async function generateAnswer(
  query: string,
  retrievedDocs: RetrievalResult[],
  mode: 'general' | 'quarterly' | 'devotional' = 'general',
  conversationHistory: ChatMessage[] = []
): Promise<LLMResponse> {
  const context = formatContext(retrievedDocs);
  const systemPrompt = RAG_CONFIG.modes[mode].systemPrompt;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${systemPrompt}\n\nContext:\n${context}\n\nImportant: When answering, cite your sources using the format [1], [2], etc. corresponding to the context numbers provided.`,
    },
    ...conversationHistory,
    {
      role: 'user',
      content: query,
    },
  ];

  if (RAG_CONFIG.llm.provider === 'openai') {
    const answer = await generateOpenAIAnswer(messages);
    return {
      answer,
      sources: extractCitations(retrievedDocs),
    };
  }

  throw new Error(`Unsupported LLM provider: ${RAG_CONFIG.llm.provider}`);
}

/**
 * Generate answer using OpenAI API
 */
async function generateOpenAIAnswer(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: RAG_CONFIG.llm.model,
      messages,
      temperature: RAG_CONFIG.llm.temperature,
      max_tokens: RAG_CONFIG.llm.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate streaming answer using OpenAI API
 */
export async function* generateStreamingAnswer(
  query: string,
  retrievedDocs: RetrievalResult[],
  mode: 'general' | 'quarterly' | 'devotional' = 'general',
  conversationHistory: ChatMessage[] = []
): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const context = formatContext(retrievedDocs);
  const systemPrompt = RAG_CONFIG.modes[mode].systemPrompt;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${systemPrompt}\n\nContext:\n${context}\n\nImportant: When answering, cite your sources using the format [1], [2], etc. corresponding to the context numbers provided.`,
    },
    ...conversationHistory,
    {
      role: 'user',
      content: query,
    },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: RAG_CONFIG.llm.model,
      messages,
      temperature: RAG_CONFIG.llm.temperature,
      max_tokens: RAG_CONFIG.llm.maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}

/**
 * Extract citation indices from answer text
 */
function extractCitationIndices(answer: string): number[] {
  const matches = answer.match(/\[(\d+)\]/g);
  if (!matches) return [];

  return [...new Set(matches.map(m => parseInt(m.slice(1, -1))))].sort((a, b) => a - b);
}

/**
 * Extract citations from retrieved documents
 */
function extractCitations(documents: RetrievalResult[]): Array<{
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

/**
 * Format source metadata
 */
function formatSource(metadata: Record<string, any>): string {
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
