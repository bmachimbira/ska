/**
 * Chat Routes (RAG-powered study chat)
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { Pool } from 'pg';
import { retrieveAndRerank } from '../services/rag/retrieval';
import { generateAnswer, generateStreamingAnswer } from '../services/rag/llm';
import { z } from 'zod';

// Request validation schema
const ChatQuerySchema = z.object({
  query: z.string().min(1).max(1000),
  mode: z.enum(['general', 'quarterly', 'devotional']).optional().default('general'),
  filter: z.object({
    quarterlyId: z.number().optional(),
    date: z.string().optional(),
  }).optional(),
  stream: z.boolean().optional().default(false),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
});

export function createChatRouter(pool: Pool): Router {
  const chatRouter = Router();

  chatRouter.post(
    '/query',
    asyncHandler(async (req: Request, res: Response) => {
      // Validate request
      const validated = ChatQuerySchema.parse(req.body);
      const { query, mode, filter, stream, conversationHistory } = validated;

      // Retrieve relevant documents
      const retrievedDocs = await retrieveAndRerank(pool, query, {
        topK: 5,
        filter,
      });

      if (retrievedDocs.length === 0) {
        return res.status(200).json({
          answer: "I couldn't find relevant information to answer your question. Please try rephrasing or ask about devotionals, quarterly lessons, or Bible topics.",
          sources: [],
        });
      }

      // Generate answer
      if (stream) {
        // Streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Send sources first
        const sources = retrievedDocs.map((doc, index) => ({
          index: index + 1,
          source: formatSource(doc.metadata),
          metadata: doc.metadata,
        }));

        res.write(`event: sources\ndata: ${JSON.stringify(sources)}\n\n`);

        // Stream answer
        const conversationHistoryFormatted = conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content,
        }));

        try {
          for await (const chunk of generateStreamingAnswer(
            query,
            retrievedDocs,
            mode,
            conversationHistoryFormatted
          )) {
            res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
          }

          res.write(`event: done\ndata: {}\n\n`);
          res.end();
        } catch (error) {
          console.error('Streaming error:', error);
          res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
          res.end();
        }
      } else {
        // Non-streaming response
        const conversationHistoryFormatted = conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content,
        }));

        const result = await generateAnswer(
          query,
          retrievedDocs,
          mode,
          conversationHistoryFormatted
        );

        res.status(200).json(result);
      }
    })
  );

  return chatRouter;
}

/**
 * Helper to format source metadata
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

// Export for backwards compatibility
export const chatRouter = createChatRouter;
