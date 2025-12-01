'use client';

import { useSession } from 'next-auth/react';
import { Video, BookOpen, Book, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createApiClient } from '@/lib/api-client';

interface StatCard {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.accessToken) {
      loadStats();
    }
  }, [session]);

  async function loadStats() {
    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      setLoading(true);
      const apiClient = createApiClient(session.accessToken as string);
      const data = await apiClient.get<{
        stats: {
          sermons: { total: number; change?: string; changeType?: string };
          devotionals: { total: number };
          quarterlies: { total: number };
          totalViews: { total: number };
        };
      }>('/stats');

      const statsData: StatCard[] = [
        {
          label: 'Total Sermons',
          value: data.stats.sermons.total.toString(),
          icon: Video,
          change: data.stats.sermons.change,
          changeType: data.stats.sermons.changeType as 'increase' | 'decrease',
        },
        {
          label: 'Devotionals',
          value: data.stats.devotionals.total.toString(),
          icon: BookOpen,
        },
        {
          label: 'Quarterlies',
          value: data.stats.quarterlies.total.toString(),
          icon: Book,
        },
        {
          label: 'Total Views',
          value: data.stats.totalViews.total.toLocaleString(),
          icon: TrendingUp,
        },
      ];

      setStats(statsData);
      setError('');
    } catch (error) {
      console.error('Failed to load stats:', error);
      setError('Failed to load statistics. Please try again.');
      // Set default empty stats on error
      setStats([
        { label: 'Total Sermons', value: '0', icon: Video },
        { label: 'Devotionals', value: '0', icon: BookOpen },
        { label: 'Quarterlies', value: '0', icon: Book },
        { label: 'Total Views', value: '0', icon: TrendingUp },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {session?.user?.name || 'Admin'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's what's happening with your content today.
        </p>
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading statistics...</p>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                {stat.change && (
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === 'increase'
                        ? 'text-green-600 dark:text-green-400'
                        : stat.changeType === 'decrease'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stat.label}
              </p>
            </div>
            );
          })}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Activity feed will be populated with backend data.
          </p>
        </div>
      </div>
    </div>
  );
}
