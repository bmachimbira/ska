'use client';

import Link from 'next/link';
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface Quarterly {
  id: string;
  kind: 'adult' | 'youth' | 'kids';
  year: number;
  quarter: number;
  title: string;
  description: string;
  lang: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuarterliesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [quarterlies, setQuarterlies] = useState<Quarterly[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'adult' | 'youth' | 'kids'>('all');

  useEffect(() => {
    loadQuarterlies();
  }, [filter]);

  async function loadQuarterlies() {
    try {
      setLoading(true);
      const endpoint = filter === 'all'
        ? '/quarterlies'
        : `/quarterlies?kind=${filter}`;
      const data = await apiClient.get<{ quarterlies: Quarterly[] }>(endpoint);
      setQuarterlies(data.quarterlies);
    } catch (error) {
      console.error('Failed to load quarterlies:', error);
      alert('Failed to load quarterlies. Please check if the backend is running on http://localhost:3002');
    } finally {
      setLoading(false);
    }
  }

  async function deleteQuarterly(id: string, title: string) {
    if (!confirm(`Delete "${title}"? All lessons will be deleted.`)) return;

    try {
      await apiClient.delete(`/quarterlies/${id}`);
      loadQuarterlies();
    } catch (error) {
      console.error('Failed to delete quarterly:', error);
      alert('Failed to delete quarterly');
    }
  }

  const filteredQuarterlies = quarterlies.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sabbath School Quarterlies
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage quarterly lessons and content
          </p>
        </div>
        <Link
          href="/dashboard/quarterlies/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Quarterly
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'adult', 'youth', 'kids'].map((kind) => (
          <button
            key={kind}
            onClick={() => setFilter(kind as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === kind
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {kind.charAt(0).toUpperCase() + kind.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search quarterlies..."
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quarterlies...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredQuarterlies.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery ? 'No quarterlies found matching your search' : 'No quarterlies found. Create one to get started.'}
          </p>
          {!searchQuery && (
            <Link
              href="/dashboard/quarterlies/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Quarterly
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && filteredQuarterlies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuarterlies.map((quarterly) => (
            <div
              key={quarterly.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                    <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded capitalize">
                    {quarterly.kind}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {quarterly.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {quarterly.description || 'No description'}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <span>Q{quarterly.quarter} {quarterly.year}</span>
                  <span>•</span>
                  <span>{quarterly.lang.toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/dashboard/quarterlies/${quarterly.id}/lessons`}
                    className="flex-1 px-4 py-2 text-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                  >
                    Manage Lessons
                  </Link>
                  <Link
                    href={`/dashboard/quarterlies/${quarterly.id}/edit`}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteQuarterly(quarterly.id, quarterly.title)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
