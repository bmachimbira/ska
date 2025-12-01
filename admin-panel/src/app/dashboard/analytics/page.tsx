'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Video, BookOpen, Eye, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';

interface AnalyticsData {
  totalViews: number;
  totalUsers: number;
  totalSermons: number;
  totalDevotionals: number;
  avgWatchTime: number;
  topContent: Array<{
    id: number;
    title: string;
    type: string;
    views: number;
  }>;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.accessToken) {
      fetchAnalytics();
    }
  }, [session]);

  const fetchAnalytics = async () => {
    try {
      if (!session?.accessToken) return;

      const apiClient = createApiClient(session.accessToken);
      const data = await apiClient.get<{ analytics: AnalyticsData }>('/admin/analytics');
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track content performance and user engagement
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.totalViews?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.totalUsers?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Video className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sermons</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.totalSermons?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Devotionals</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.totalDevotionals?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Watch Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.avgWatchTime ? `${Math.round(analytics.avgWatchTime)}m` : '0m'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Growth Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                Coming Soon
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Top Performing Content</h2>
        </div>
        <div className="px-6 py-4">
          {analytics?.topContent && analytics.topContent.length > 0 ? (
            <div className="space-y-4">
              {analytics.topContent.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              Analytics data will appear here once content is being viewed
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
