/**
 * Document chunking utilities for RAG
 */

import { RAG_CONFIG } from '../../config/rag';

export interface Chunk {
  text: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Split text into overlapping chunks
 */
export function chunkText(text: string, metadata?: Record<string, any>): Chunk[] {
  const { chunkSize, chunkOverlap, separators } = RAG_CONFIG.chunking;
  const chunks: Chunk[] = [];

  if (!text || text.length === 0) {
    return chunks;
  }

  // If text is smaller than chunk size, return as single chunk
  if (text.length <= chunkSize) {
    return [{ text, startIndex: 0, endIndex: text.length }];
  }

  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    let chunkEnd = endIndex;

    // Try to break at a separator if not at end of text
    if (endIndex < text.length) {
      let bestSeparatorPos = -1;

      for (const separator of separators) {
        const separatorPos = text.lastIndexOf(separator, endIndex);
        if (separatorPos > startIndex && separatorPos > bestSeparatorPos) {
          bestSeparatorPos = separatorPos;
        }
      }

      if (bestSeparatorPos > startIndex) {
        chunkEnd = bestSeparatorPos + 1; // Include the separator
      }
    }

    const chunkText = text.slice(startIndex, chunkEnd).trim();
    if (chunkText.length > 0) {
      chunks.push({
        text: chunkText,
        startIndex,
        endIndex: chunkEnd,
      });
    }

    // Move start index forward with overlap
    startIndex = chunkEnd - chunkOverlap;

    // Ensure we make progress
    if (startIndex <= chunks[chunks.length - 1]?.startIndex) {
      startIndex = chunkEnd;
    }
  }

  return chunks;
}

/**
 * Prepare devotional for ingestion
 */
export function chunkDevotional(devotional: {
  id: number;
  date: string;
  title: string;
  author?: string;
  memoryVerse: string;
  content: string;
}) {
  const fullText = `${devotional.title}\n\n${devotional.memoryVerse}\n\n${devotional.content}`;
  const chunks = chunkText(fullText);

  return chunks.map((chunk, index) => ({
    ...chunk,
    metadata: {
      source: 'devotional',
      devotionalId: devotional.id,
      date: devotional.date,
      title: devotional.title,
      author: devotional.author,
      chunkIndex: index,
      totalChunks: chunks.length,
    },
  }));
}

/**
 * Prepare quarterly lesson day for ingestion
 */
export function chunkLessonDay(lessonDay: {
  id: number;
  lessonId: number;
  dayIndex: number;
  title: string;
  memoryVerse?: string;
  content: string;
}, lessonInfo: {
  lessonNumber: number;
  lessonTitle: string;
  quarterlyId: number;
  quarterlyTitle: string;
}) {
  const memoryVerseText = lessonDay.memoryVerse ? `${lessonDay.memoryVerse}\n\n` : '';
  const fullText = `${lessonDay.title}\n\n${memoryVerseText}${lessonDay.content}`;
  const chunks = chunkText(fullText);

  return chunks.map((chunk, index) => ({
    ...chunk,
    metadata: {
      source: 'quarterly',
      lessonDayId: lessonDay.id,
      lessonId: lessonDay.lessonId,
      lessonNumber: lessonInfo.lessonNumber,
      lessonTitle: lessonInfo.lessonTitle,
      dayIndex: lessonDay.dayIndex,
      dayTitle: lessonDay.title,
      quarterlyId: lessonInfo.quarterlyId,
      quarterlyTitle: lessonInfo.quarterlyTitle,
      chunkIndex: index,
      totalChunks: chunks.length,
    },
  }));
}

/**
 * Prepare Bible verse for ingestion
 */
export function chunkBibleVerse(verse: {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}) {
  // Bible verses are typically short, so we don't chunk them
  return [{
    text: verse.text,
    startIndex: 0,
    endIndex: verse.text.length,
    metadata: {
      source: 'bible',
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
    },
  }];
}
