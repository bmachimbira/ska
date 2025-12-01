'use client';

import Link from 'next/link';
import { Plus, Search, Edit, Trash2, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';

interface Cause {
  id: number;
  title: string;
  description: string;
  goal_amount: number | null;
  raised_amount: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  is_featured: boolean;
}

export default function CausesPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.accessToken) {
      loadCauses();
    }
  }, [session]);

  async function loadCauses() {
    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      setLoading(true);
      const apiClient = createApiClient(session.accessToken as string);
      const data = await apiClient.get<Cause[]>('/causes');
      setCauses(Array.isArray(data) ? data : []);
      setError('');
    } catch (error) {
      console.error('Failed to load causes:', error);
      setError('Failed to load causes. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(cause: Cause) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${cause.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        return;
      }

      setDeleting(cause.id);
      const apiClient = createApiClient(session.accessToken as string);
      await apiClient.delete(`/causes/${cause.id}`);

      // Remove from local state
      setCauses(prev => prev.filter(c => c.id !== cause.id));
      setError('');

    } catch (error: any) {
      console.error('Failed to delete cause:', error);
      setError('Failed to delete cause: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleting(null);
    }
  }

  const filteredCauses = causes.filter((cause) =>
    cause.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (raised: number, goal: number | null) => {
    if (!goal || goal === 0) return 0;
    return Math.min((raised / goal) * 100, 100);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Causes & Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage community causes and fundraising projects
          </p>
        </div>
        <Link
          href="/dashboard/causes/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Cause
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search causes..."
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading causes...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCauses.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No causes found matching your search' : 'No causes found. Create one to get started.'}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && filteredCauses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Raised / Goal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCauses.map((cause) => {
                const progress = calculateProgress(cause.raised_amount, cause.goal_amount);

                return (
                  <tr
                    key={cause.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {cause.title}
                        </span>
                        {cause.is_featured && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {cause.goal_amount && cause.goal_amount > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>
                          {formatCurrency(cause.raised_amount)}
                          {cause.goal_amount && ` / ${formatCurrency(cause.goal_amount)}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {cause.end_date ? formatDate(cause.end_date) : 'Ongoing'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        cause.is_active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                      }`}>
                        {cause.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/causes/${cause.id}/edit`}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit cause"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(cause)}
                          disabled={deleting === cause.id}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete cause"
                        >
                          {deleting === cause.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
