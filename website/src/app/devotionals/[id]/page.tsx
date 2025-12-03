import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, User, ChevronLeft, ChevronRight, Volume2, Share2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Devotional } from '@/types/api';
import { formatDate } from '@/lib/utils';
import { AudioPlayer } from '@/components/media/AudioPlayer';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // 1 hour

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
    description: devotional.body_md?.substring(0, 160) || devotional.title,
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

          {/* Speaker */}
          {devotional.speaker && (
            <div className="mb-8 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span className="text-sm">Speaker: {devotional.speaker.name}</span>
            </div>
          )}

          {/* Video Player */}
          {devotional.video_asset_details?.hls_url && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Volume2 className="h-4 w-4" />
                <span>Watch this devotional</span>
              </div>
              {devotional.video_asset_details.metadata?.status === 'preparing' ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-blue-900 dark:text-blue-100 font-medium">Processing video...</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    Your video is being processed. Please check back in a few minutes.
                  </p>
                </div>
              ) : (
                <VideoPlayer
                  url={devotional.video_asset_details.hls_url}
                  title={devotional.title}
                />
              )}
            </div>
          )}

          {/* Audio Player */}
          {devotional.audio_asset_details?.hls_url && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Volume2 className="h-4 w-4" />
                <span>Listen to this devotional</span>
              </div>
              {devotional.audio_asset_details.metadata?.status === 'preparing' ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-blue-900 dark:text-blue-100 font-medium">Processing audio...</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    Your audio is being processed. Please check back in a few minutes.
                  </p>
                </div>
              ) : (
                <AudioPlayer
                  url={devotional.audio_asset_details.hls_url}
                  title={devotional.title}
                />
              )}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none font-serif">
            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
              {devotional.body_md}
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
