import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, User, ChevronLeft, ChevronRight, Volume2, Share2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Devotional } from '@/types/api';
import { REVALIDATE_TIMES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { AudioPlayer } from '@/components/media/AudioPlayer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { notFound } from 'next/navigation';

export const revalidate = REVALIDATE_TIMES.sermonDetail;

interface DevotionalPageProps {
  params: Promise<{ id: string }>;
}

async function getDevotional(id: string): Promise<Devotional | null> {
  try {
    return await apiClient.get<Devotional>(`/devotionals/${id}`);
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: DevotionalPageProps): Promise<Metadata> {
  const { id } = await params;
  const devotional = await getDevotional(id);

  if (!devotional) {
    return {
      title: 'Devotional Not Found',
    };
  }

  return {
    title: `${devotional.title} - Daily Devotionals`,
    description: devotional.memoryVerse || devotional.content.substring(0, 160),
  };
}

export default async function DevotionalPage({ params }: DevotionalPageProps) {
  const { id } = await params;
  const devotional = await getDevotional(id);

  if (!devotional) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge variant="devotional" className="mb-4">
            Daily Devotional
          </Badge>
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <time dateTime={devotional.date} className="text-sm">
              {formatDate(devotional.date)}
            </time>
          </div>
        </div>

        {/* Main Content */}
        <article className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900 md:p-12">
          {/* Title */}
          <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-gray-100 md:text-4xl font-serif">
            {devotional.title}
          </h1>

          {/* Author */}
          {devotional.author && (
            <div className="mb-8 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span className="text-sm">by {devotional.author}</span>
            </div>
          )}

          {/* Memory Verse */}
          {devotional.memoryVerse && (
            <blockquote className="mb-8 border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-950/30 pl-6 pr-4 py-4 italic">
              <p className="text-lg text-gray-800 dark:text-gray-200 font-serif">
                {devotional.memoryVerse}
              </p>
            </blockquote>
          )}

          {/* Audio Player */}
          {devotional.audioAsset && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Volume2 className="h-4 w-4" />
                <span>Listen to this devotional</span>
              </div>
              <AudioPlayer url={devotional.audioAsset.url} />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none font-serif">
            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
              {devotional.content}
            </div>
          </div>

          {/* Share Button */}
          <div className="mt-8 flex justify-center">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </article>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <Button asChild variant="outline">
            <Link href="/devotionals" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              All Devotionals
            </Link>
          </Button>

          <Button asChild>
            <Link href="/devotionals/today">Today's Devotional</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
