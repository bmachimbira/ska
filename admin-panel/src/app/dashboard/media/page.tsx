'use client';

import { useState, useCallback } from 'react';
import { Upload, Search, Trash2, Download, Eye } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { formatBytes } from '@/lib/utils';

// Mock data
const mockMedia = [
  {
    id: '1',
    type: 'video',
    url: 'https://example.com/video1.mp4',
    filename: 'sermon-video-1.mp4',
    size: 15728640,
    mimeType: 'video/mp4',
    uploadedAt: '2024-06-15T10:00:00Z',
  },
  {
    id: '2',
    type: 'audio',
    url: 'https://example.com/audio1.mp3',
    filename: 'devotional-audio-1.mp3',
    size: 5242880,
    mimeType: 'audio/mpeg',
    uploadedAt: '2024-06-14T10:00:00Z',
  },
  {
    id: '3',
    type: 'image',
    url: 'https://example.com/image1.jpg',
    filename: 'sermon-thumbnail.jpg',
    size: 1048576,
    mimeType: 'image/jpeg',
    uploadedAt: '2024-06-13T10:00:00Z',
  },
];

export default function MediaLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [media] = useState(mockMedia);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    try {
      // TODO: Upload files to backend
      console.log('Uploading files:', acceptedFiles);

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
    },
  });

  const filteredMedia = media.filter((item) =>
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
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

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`mb-8 p-12 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {uploading ? (
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Uploading...
              </p>
              <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-primary-600 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          ) : isDragActive ? (
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Drop files here...
            </p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supports: Video (MP4, MOV), Audio (MP3, WAV), Images (JPG, PNG)
              </p>
            </div>
          )}
        </div>
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

      {/* Media Grid */}
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
                URL
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
                    <span className="text-2xl">{getMediaIcon(item.type)}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.filename}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded capitalize">
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {formatBytes(item.size)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => navigator.clipboard.writeText(item.url)}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Copy URL
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={item.url}
                      download
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
