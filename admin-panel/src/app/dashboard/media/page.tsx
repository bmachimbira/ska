'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, Search, Trash2, Download, Eye, Play } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { formatBytes } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import VideoUpload from '@/components/VideoUpload';

interface MediaAsset {
  id: string;
  kind: string;
  hls_url: string | null;
  dash_url: string | null;
  download_url: string | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  metadata: {
    muxAssetId?: string;
    muxPlaybackId?: string;
    minioObjectName?: string;
    status?: string;
    duration?: number;
  };
  created_at: string;
  updated_at: string;
}


export default function MediaLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      setLoading(true);
      const data = await apiClient.get<{ media: MediaAsset[] }>('/media?limit=100');
      setMedia(data.media);
    } catch (error) {
      console.error('Failed to load media:', error);
      alert('Failed to load media');
    } finally {
      setLoading(false);
    }
  }

  const getFilename = (asset: MediaAsset): string => {
    return asset.metadata?.minioObjectName?.split('/').pop() || `${asset.kind}-${asset.id.substring(0, 8)}`;
  };

  const getFileSize = (asset: MediaAsset): string => {
    // Estimate size from duration for videos
    if (asset.kind === 'video' && asset.duration_seconds) {
      const estimatedBytes = asset.duration_seconds * 500000; // ~500KB per second estimate
      return formatBytes(estimatedBytes);
    }
    return 'N/A';
  };

  const filteredMedia = media.filter((item) =>
    getFilename(item).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMediaIcon = (kind: string) => {
    switch (kind) {
      case 'video':
        return <Play className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'audio':
        return '🎵';
      case 'image':
        return '🖼️';
      default:
        return '📄';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Media Library
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Upload and manage media files
        </p>
      </div>

      {/* Video Upload */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upload New Video
        </h2>
        <VideoUpload
          onUploadComplete={(assetId, url) => {
            loadMedia(); // Refresh the list
            alert('Video uploaded successfully!');
          }}
          onError={(error) => {
            console.error('Video upload error:', error);
            alert('Video upload failed: ' + error);
          }}
        />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading media...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredMedia.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No media found matching your search' : 'No media uploaded yet. Upload a video to get started.'}
          </p>
        </div>
      )}

      {/* Media Grid */}
      {!loading && filteredMedia.length > 0 && (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                File
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mux ID
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredMedia.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {getMediaIcon(item.kind)}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getFilename(item)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded capitalize">
                    {item.kind}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {getFileSize(item)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    item.metadata?.status === 'ready'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                  }`}>
                    {item.metadata?.status || 'processing'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => navigator.clipboard.writeText(item.metadata?.muxPlaybackId || item.id)}
                    className="text-xs font-mono text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    title="Click to copy"
                  >
                    {item.metadata?.muxPlaybackId?.substring(0, 16)}...
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {item.hls_url && (
                      <button
                        onClick={() => window.open(item.hls_url!, '_blank')}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Open HLS URL"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {item.download_url && (
                      <a
                        href={item.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Delete this media asset?')) {
                          alert('Delete functionality coming soon');
                        }
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
