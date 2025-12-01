'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Bell, AlertCircle } from 'lucide-react';
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

export default function AnnouncementDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const churchId = params.id as string;
  const announcementId = params.announcementId as string;

  const [announcement, setAnnouncement] = useState<ChurchAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.accessToken && churchId && announcementId) {
      fetchAnnouncement();
    }
  }, [session, churchId, announcementId]);

  const fetchAnnouncement = async () => {
    try {
      if (!session?.accessToken) return;

      const apiClient = createApiClient(session.accessToken);
      const data = await apiClient.get<{ announcement: ChurchAnnouncement }>(`/admin/churches/${churchId}/announcements/${announcementId}`);
      setAnnouncement(data.announcement);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    if (!session?.accessToken) return;

    try {
      const apiClient = createApiClient(session.accessToken);
      await apiClient.delete(`/admin/churches/${churchId}/announcements/${announcementId}`);
      router.push(`/dashboard/churches/${churchId}/announcements`);
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Announcement not found</p>
        </div>
      </div>
    );
  }

  const priorityConfig = PRIORITY_CONFIG[announcement.priority];
  const Icon = priorityConfig.icon;
  const isExpired = announcement.expiresAt && new Date(announcement.expiresAt) < new Date();

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link
          href={`/dashboard/churches/${churchId}/announcements`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Announcements
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className={`h-8 w-8 text-${priorityConfig.color}-600`} />
            <h1 className="text-3xl font-bold text-gray-900">{announcement.title}</h1>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/churches/${churchId}/announcements/${announcementId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${priorityConfig.color}-100 text-${priorityConfig.color}-800`}>
              {priorityConfig.label} Priority
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
        </div>

        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Content</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Posted</h3>
              <p className="text-gray-700">{new Date(announcement.createdAt).toLocaleString()}</p>
            </div>
            {announcement.expiresAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Expires</h3>
                <p className="text-gray-700">{new Date(announcement.expiresAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
