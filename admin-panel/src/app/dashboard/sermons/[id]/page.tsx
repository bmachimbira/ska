'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Calendar, Eye } from 'lucide-react';
import MuxPlayer from '@mux/mux-player-react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';

interface Sermon {
  id: string;
  title: string;
  description: string | null;
  transcript: string | null;
  scripture_refs: string[] | null;
  speaker_id: number | null;
  series_id: number | null;
  video_asset: string | null;
  audio_asset: string | null;
  thumbnail_asset: string | null;
  published_at: string | null;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  speaker?: {
    id: number;
    name: string;
  };
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

export default function ViewSermonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [mediaAsset, setMediaAsset] = useState<MediaAsset | null>(null);
  const { data: session } = useSession();
  const [error, setError] = useState('');

  useEffect(() => {
    loadSermon();
  }, [id]);

  async function loadSermon() {
    try {
      setLoading(true);
      if (!session?.accessToken) { setError("Not authenticated."); return; }

      const apiClient = createApiClient(session.accessToken as string);

      const response = await apiClient.get<Sermon>(`/sermons/${id}`);
      setSermon(response);

      // Load media asset if video_asset exists
      if (response.video_asset) {
        try {
          if (!session?.accessToken) { setError("Not authenticated."); return; }

          const apiClient = createApiClient(session.accessToken as string);

          const asset = await apiClient.get<MediaAsset>(`/media/${response.video_asset}`);
          setMediaAsset(asset);
        } catch (error) {
          console.error('Failed to load media asset:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load sermon:', error);
      setError('Failed to load sermon');
      router.push('/dashboard/sermons');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sermon...</p>
        </div>
      </div>
    );
  }

  if (!sermon) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/sermons"
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {sermon.title}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              {sermon.speaker && (
                <span>Speaker: {sermon.speaker.name}</span>
              )}
              {sermon.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(sermon.published_at).toLocaleDateString()}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {sermon.view_count.toLocaleString()} views
              </span>
            </div>
          </div>
        </div>
        <Link
          href={`/dashboard/sermons/${id}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Sermon
        </Link>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Video Player (if available) */}
        {sermon.video_asset && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Video
            </h2>
            {mediaAsset?.metadata?.muxPlaybackId ? (
              <div className="rounded-lg overflow-hidden">
                <MuxPlayer
                  playbackId={mediaAsset.metadata.muxPlaybackId}
                  metadata={{
                    video_title: sermon.title,
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

        {/* Description */}
        {sermon.description && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {sermon.description}
            </p>
          </div>
        )}

        {/* Scripture References */}
        {sermon.scripture_refs && sermon.scripture_refs.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Scripture References
            </h2>
            <div className="flex flex-wrap gap-2">
              {sermon.scripture_refs.map((ref, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 rounded-full text-sm"
                >
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Transcript */}
        {sermon.transcript && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Transcript
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {sermon.transcript}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Metadata
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Featured:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {sermon.is_featured ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Created:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(sermon.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(sermon.updated_at).toLocaleString()}
              </span>
            </div>
            {sermon.video_asset && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Video Asset:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-mono text-xs">
                  {sermon.video_asset}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
