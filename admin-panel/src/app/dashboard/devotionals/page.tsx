'use client';

import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';

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
  speaker?: {
    id: number;
    name: string;
  } | null;
}

export default function DevotionalsPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.accessToken) {
      loadDevotionals();
    }
  }, [session]);

  async function loadDevotionals() {
    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      setLoading(true);
      const apiClient = createApiClient(session.accessToken as string);
      const data = await apiClient.get<{ devotionals: Devotional[] }>('/devotionals');
      setDevotionals(data.devotionals);
      setError('');
    } catch (error) {
      console.error('Failed to load devotionals:', error);
      setError('Failed to load devotionals. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(devotional: Devotional) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${devotional.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        return;
      }

      setDeleting(devotional.id);
      const apiClient = createApiClient(session.accessToken as string);
      await apiClient.delete(`/devotionals/${devotional.id}`);
      
      // Remove from local state
      setDevotionals(prev => prev.filter(d => d.id !== devotional.id));
      setError('');
    } catch (error: any) {
      console.error('Failed to delete devotional:', error);
      setError('Failed to delete devotional: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleting(null);
    }
  }

  const filteredDevotionals = devotionals.filter((dev) =>
    dev.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Devotionals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage daily devotional content
          </p>
        </div>
        <Link
          href="/dashboard/devotionals/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Devotional
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search devotionals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading devotionals...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDevotionals.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No devotionals found matching your search' : 'No devotionals found. Create one to get started.'}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && filteredDevotionals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Speaker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDevotionals.map((devotional) => (
                <tr
                  key={devotional.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                    {formatDate(devotional.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {devotional.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {devotional.speaker?.name || devotional.author || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      devotional.content_type === 'video' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                        : devotional.content_type === 'audio'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400'
                    }`}>
                      {devotional.content_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {devotional.view_count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/devotionals/${devotional.id}`}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="View devotional"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/devotionals/${devotional.id}/edit`}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Edit devotional"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(devotional)}
                        disabled={deleting === devotional.id}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete devotional"
                      >
                        {deleting === devotional.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
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
