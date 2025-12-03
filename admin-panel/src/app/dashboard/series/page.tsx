'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Film } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { createApiClient } from '@/lib/api-client';
import type { Series, SeriesResponse } from '@ska/shared/types';

export default function SeriesPage() {
  const { session, status } = useRequireAuth();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchSeries();
    }
  }, [status, session]);

  const fetchSeries = async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const apiClient = createApiClient(session.accessToken as string);
      const response = await apiClient.get<SeriesResponse>('/series');
      setSeries(response.series || []);
    } catch (error) {
      console.error('Failed to fetch series:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!session?.accessToken) return;
    if (!confirm('Are you sure you want to delete this series? This will remove all sermons from the series.')) return;

    try {
      setDeleting(id);
      const apiClient = createApiClient(session.accessToken as string);
      await apiClient.delete(`/series/${id}`);
      setSeries(series.filter(s => s.id !== id));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete series';
      alert(message);
    } finally {
      setDeleting(null);
    }
  };

  const filteredSeries = series.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sermon Series
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage sermon series and their content
          </p>
        </div>
        <Link
          href="/dashboard/series/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Series
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Series Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSeries.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Hero Image */}
            {item.hero_image_details?.kind === 'image' ? (
              <div className="aspect-video bg-gray-100 dark:bg-gray-900">
                <img
                  src={item.hero_image_details.download_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-center">
                <Film className="w-16 h-16 text-primary-600 dark:text-primary-400" />
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                  {item.description}
                </p>
              )}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>{item.sermon_count} sermon{item.sermon_count !== 1 ? 's' : ''}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/series/${item.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                >
                  {deleting === item.id ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSeries.length === 0 && !loading && (
        <div className="text-center py-12">
          <Film className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No series found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery ? 'Try a different search term' : 'Get started by creating a new series'}
          </p>
          {!searchQuery && (
            <Link
              href="/dashboard/series/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Series
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
