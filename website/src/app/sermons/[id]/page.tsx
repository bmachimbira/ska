import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, User, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Sermon } from '@/types/api';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { AudioPlayer } from '@/components/media/AudioPlayer';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // 1 hour

interface SermonPageProps {
  params: Promise<{ id: string }>;
}

async function getSermon(id: string): Promise<Sermon | null> {
  try {
    return await apiClient.get<Sermon>(`/sermons/${id}`);
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: SermonPageProps): Promise<Metadata> {
  const { id } = await params;
  const sermon = await getSermon(id);

  if (!sermon) {
    return {
      title: 'Sermon Not Found',
    };
  }

  return {
    title: `${sermon.title} - Sermons`,
    description: sermon.description || `Watch ${sermon.title} by ${sermon.speaker?.name || 'our speaker'}`,
    openGraph: {
      title: sermon.title,
      description: sermon.description,
      images: sermon.thumbnailAsset?.url ? [sermon.thumbnailAsset.url] : [],
      type: 'video.other',
    },
  };
}

export default async function SermonPage({ params }: SermonPageProps) {
  const { id } = await params;
  const sermon = await getSermon(id);

  if (!sermon) {
    notFound();
  }

  const videoUrl = sermon.videoAsset?.url;
  const audioUrl = sermon.audioAsset?.url;
  const thumbnailUrl = sermon.thumbnailAsset?.url;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video/Audio Player */}
            {videoUrl ? (
              <VideoPlayer url={videoUrl} title={sermon.title} thumbnail={thumbnailUrl} />
            ) : audioUrl ? (
              <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center mb-4">
                <div className="text-center text-white p-8">
                  <h2 className="text-2xl font-bold mb-4">{sermon.title}</h2>
                  <p className="text-primary-100">Audio Only</p>
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No media available</p>
              </div>
            )}

            {audioUrl && <div className="mt-4"><AudioPlayer url={audioUrl} /></div>}

            {/* Title and Meta */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {sermon.isFeatured && <Badge variant="sermon">Featured</Badge>}
                {sermon.series && (
                  <Badge variant="secondary">{sermon.series.title}</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {sermon.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {sermon.speaker && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{sermon.speaker.name}</span>
                  </div>
                )}
                {sermon.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={sermon.publishedAt}>
                      {formatDate(sermon.publishedAt)}
                    </time>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{sermon.viewCount.toLocaleString()} views</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {sermon.description && (
              <Card className="mt-6 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  About This Sermon
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {sermon.description}
                </p>
              </Card>
            )}

            {/* Scripture References */}
            {sermon.scriptureRefs && sermon.scriptureRefs.length > 0 && (
              <Card className="mt-6 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Scripture References
                </h2>
                <div className="flex flex-wrap gap-2">
                  {sermon.scriptureRefs.map((ref, index) => (
                    <Badge key={index} variant="secondary">
                      {ref}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Transcript */}
            {sermon.transcript && (
              <Card className="mt-6 p-6">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between text-xl font-semibold text-gray-900 dark:text-gray-100">
                    <span>Transcript</span>
                    <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-serif">
                      {sermon.transcript}
                    </p>
                  </div>
                </details>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Speaker Info */}
            {sermon.speaker && (
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Speaker
                </h3>
                <div className="flex items-start gap-4">
                  {sermon.speaker.photoUrl && (
                    <img
                      src={sermon.speaker.photoUrl}
                      alt={sermon.speaker.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {sermon.speaker.name}
                    </p>
                    {sermon.speaker.bio && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {sermon.speaker.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Tags */}
            {sermon.tags && sermon.tags.length > 0 && (
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sermon.tags.map((tag) => (
                    <Link key={tag.id} href={`/sermons?tag=${tag.id}`}>
                      <Badge variant="secondary" className="hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Back to Sermons */}
            <Button asChild variant="outline" className="w-full">
              <Link href="/sermons">← Back to All Sermons</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
