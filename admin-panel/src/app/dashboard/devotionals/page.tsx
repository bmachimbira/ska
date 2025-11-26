'use client';

import Link from 'next/link';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface Devotional {
  id: number;
  slug: string;
  title: string;
  author: string;
  body_md: string;
  date: string;
  lang: string;
  view_count: number;
}

export default function DevotionalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevotionals();
  }, []);

  async function loadDevotionals() {
    try {
      setLoading(true);
      const data = await apiClient.get<{ devotionals: Devotional[] }>('/devotionals');
      setDevotionals(data.devotionals);
    } catch (error) {
      console.error('Failed to load devotionals:', error);
      alert('Failed to load devotionals. Please check if the backend is running on http://localhost:3000');
    } finally {
      setLoading(false);
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
                  Author
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
                    {devotional.author}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {devotional.view_count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/devotionals/${devotional.id}/edit`}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
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
      )}
    </div>
  );
}
