'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Bell, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';

interface ChurchAnnouncement {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: string;
  isPublished: boolean;
  createdAt: string;
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'gray', icon: Bell },
  normal: { label: 'Normal', color: 'blue', icon: Bell },
  high: { label: 'High', color: 'orange', icon: AlertCircle },
  urgent: { label: 'Urgent', color: 'red', icon: AlertCircle },
};

export default function ChurchAnnouncementsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const churchId = params.id as string;

  const [announcements, setAnnouncements] = useState<ChurchAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.accessToken && churchId) {
      fetchAnnouncements();
    }
  }, [session, churchId]);

  const fetchAnnouncements = async () => {
    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      const apiClient = createApiClient(session.accessToken);
      const data = await apiClient.get<{ announcements: ChurchAnnouncement[] }>(`/admin/churches/${churchId}/announcements`);
      setAnnouncements(data.announcements || []);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load announcements';
      setError(errorMessage);
      console.error('Fetch announcements error:', err);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/dashboard/churches/${churchId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Church
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Church Announcements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage church announcements and notices
          </p>
        </div>
        <Link
          href={`/dashboard/churches/${churchId}/announcements/new`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Announcement
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((announcement) => {
          const priorityConfig = PRIORITY_CONFIG[announcement.priority];
          const Icon = priorityConfig.icon;
          const isExpired = announcement.expiresAt && new Date(announcement.expiresAt) < new Date();

          return (
            <Link
              key={announcement.id}
              href={`/dashboard/churches/${churchId}/announcements/${announcement.id}`}
              className="block bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className={`h-5 w-5 text-${priorityConfig.color}-600`} />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {announcement.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${priorityConfig.color}-100 text-${priorityConfig.color}-800`}
                    >
                      {priorityConfig.label}
                    </span>
                    {!announcement.isPublished && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Draft
                      </span>
                    )}
                    {isExpired && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Expired
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Posted {new Date(announcement.createdAt).toLocaleDateString()}</span>
                    {announcement.expiresAt && (
                      <span>
                        Expires {new Date(announcement.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {announcements.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new announcement
          </p>
          <div className="mt-6">
            <Link
              href={`/dashboard/churches/${churchId}/announcements/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Announcement
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
