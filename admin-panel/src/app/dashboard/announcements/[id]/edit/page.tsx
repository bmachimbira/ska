'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';
import { Announcement, Church } from '@/types/api';

export default function EditAnnouncementPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [churches, setChurches] = useState<Church[]>([]);
  const [loadingChurches, setLoadingChurches] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    scope: 'global' as 'church' | 'global',
    churchId: '',
    expiresAt: '',
    isPublished: false,
  });

  useEffect(() => {
    if (session?.accessToken) {
      loadAnnouncement();
      loadChurches();
    }
  }, [session, params.id]);

  async function loadAnnouncement() {
    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        setLoadingData(false);
        return;
      }

      setLoadingData(true);
      const apiClient = createApiClient(session.accessToken as string);
      const announcement = await apiClient.get<Announcement>(`/announcements/${params.id}`);
      
      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        scope: announcement.scope,
        churchId: announcement.church?.id.toString() || '',
        expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : '',
        isPublished: announcement.isPublished,
      });
      setError('');
    } catch (error: any) {
      console.error('Failed to load announcement:', error);
      setError('Failed to load announcement: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingData(false);
    }
  }

  async function loadChurches() {
    try {
      if (!session?.accessToken) return;

      setLoadingChurches(true);
      const apiClient = createApiClient(session.accessToken as string);
      const data = await apiClient.get<{ churches: Church[] }>('/churches');
      setChurches(data.churches);
    } catch (error) {
      console.error('Failed to load churches:', error);
    } finally {
      setLoadingChurches(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      // Validate scope and churchId
      if (formData.scope === 'church' && !formData.churchId) {
        setError('Please select a church for church-specific announcements');
        setLoading(false);
        return;
      }

      const apiClient = createApiClient(session.accessToken as string);
      await apiClient.put(`/announcements/${params.id}`, {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        scope: formData.scope,
        churchId: formData.scope === 'church' ? parseInt(formData.churchId) : null,
        expiresAt: formData.expiresAt || null,
        isPublished: formData.isPublished,
      });

      setError('');
      router.push('/dashboard/announcements');
    } catch (error: any) {
      console.error('Error updating announcement:', error);
      setError('Failed to update announcement: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        return;
      }

      setDeleting(true);
      const apiClient = createApiClient(session.accessToken as string);
      await apiClient.delete(`/announcements/${params.id}`);
      
      router.push('/dashboard/announcements');
    } catch (error: any) {
      console.error('Failed to delete announcement:', error);
      setError('Failed to delete announcement: ' + (error.message || 'Unknown error'));
      setDeleting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  if (loadingData) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading announcement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/announcements"
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Announcement
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update announcement details
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter announcement title"
            />
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              rows={6}
              required
              value={formData.content}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter announcement content"
            />
          </div>

          {/* Scope and Church */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="scope"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Scope *
              </label>
              <select
                id="scope"
                name="scope"
                value={formData.scope}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="global">Global (Organization-wide)</option>
                <option value="church">Church-specific</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Global announcements are visible to all users
              </p>
            </div>

            {formData.scope === 'church' && (
              <div>
                <label
                  htmlFor="churchId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Church *
                </label>
                <select
                  id="churchId"
                  name="churchId"
                  value={formData.churchId}
                  onChange={handleChange}
                  required={formData.scope === 'church'}
                  disabled={loadingChurches}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select church</option>
                  {churches.map(church => (
                    <option key={church.id} value={church.id}>
                      {church.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Priority and Expires At */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="expiresAt"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Expires At (Optional)
              </label>
              <input
                type="datetime-local"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty for no expiration
              </p>
            </div>
          </div>

          {/* Published Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label
              htmlFor="isPublished"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
            >
              Published
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/dashboard/announcements"
              className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
