'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Calendar, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MuxPlayer from '@mux/mux-player-react';
import { apiClient } from '@/lib/api-client';

interface Devotional {
  id: number;
  slug: string;
  title: string;
  author: string | null;
  speaker_id: number | null;
  body_md: string;
  date: string;
  content_type: 'text' | 'audio' | 'video';
  audio_asset: string | null;
  video_asset: string | null;
  lang: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  speaker?: {
    id: number;
    name: string;
  } | null;
}

interface MediaAsset {
  id: string;
  kind: string;
  hls_url: string | null;
  metadata: {
    muxPlaybackId?: string;
    muxAssetId?: string;
    status?: string;
    duration?: number;
  };
}

export default function ViewDevotionalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [mediaAsset, setMediaAsset] = useState<MediaAsset | null>(null);

  useEffect(() => {
    loadDevotional();
  }, [id]);

  async function loadDevotional() {
    try {
      setLoading(true);
      const response = await apiClient.get<Devotional>(`/devotionals/${id}`);
      setDevotional(response);

      // Load media asset if video_asset exists
      if (response.video_asset) {
        try {
          const asset = await apiClient.get<MediaAsset>(`/media/${response.video_asset}`);
          setMediaAsset(asset);
        } catch (error) {
          console.error('Failed to load media asset:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load devotional:', error);
      alert('Failed to load devotional');
      router.push('/dashboard/devotionals');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading devotional...</p>
        </div>
      </div>
    );
  }

  if (!devotional) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/devotionals"
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {devotional.title}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              {devotional.speaker && (
                <span>Speaker: {devotional.speaker.name}</span>
              )}
              {devotional.author && !devotional.speaker && (
                <span>Author: {devotional.author}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(devotional.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {devotional.view_count.toLocaleString()} views
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                devotional.content_type === 'video' 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                  : devotional.content_type === 'audio'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400'
              }`}>
                {devotional.content_type}
              </span>
            </div>
          </div>
        </div>
        <Link
          href={`/dashboard/devotionals/${id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Devotional
        </Link>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Video Player (if content type is video) */}
        {devotional.content_type === 'video' && devotional.video_asset && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Video
            </h2>
            {mediaAsset?.metadata?.muxPlaybackId ? (
              <div className="rounded-lg overflow-hidden">
                <MuxPlayer
                  playbackId={mediaAsset.metadata.muxPlaybackId}
                  metadata={{
                    video_title: devotional.title,
                    viewer_user_id: 'admin',
                  }}
                  streamType="on-demand"
                  className="w-full"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {mediaAsset ? 'Video processing...' : 'Loading video...'}
                  </p>
                  {mediaAsset?.metadata?.status && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Status: {mediaAsset.metadata.status}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audio Player (if content type is audio) */}
        {devotional.content_type === 'audio' && devotional.audio_asset && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Audio
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Audio Asset: {devotional.audio_asset}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Audio player integration coming soon
            </p>
          </div>
        )}

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Content
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {devotional.body_md}
            </ReactMarkdown>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Metadata
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Slug:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-mono">
                {devotional.slug}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Language:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {devotional.lang}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Created:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(devotional.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(devotional.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
