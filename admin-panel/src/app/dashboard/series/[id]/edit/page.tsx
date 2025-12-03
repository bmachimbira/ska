'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { createApiClient } from '@/lib/api-client';
import type { Speaker, Series, SpeakersResponse } from '@ska/shared/types';

interface SeriesPageProps {
  params: Promise<{ id: string }>;
}

export default function EditSeriesPage({ params }: SeriesPageProps) {
  const router = useRouter();
  const { session, status } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speakerId: '',
  });

  useEffect(() => {
    params.then(p => setSeriesId(p.id));
  }, [params]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchSpeakers();
      if (seriesId) {
        fetchSeries();
      }
    }
  }, [status, session, seriesId]);

  const fetchSpeakers = async () => {
    if (!session?.accessToken) return;

    try {
      const apiClient = createApiClient(session.accessToken as string);
      const response = await apiClient.get<SpeakersResponse>('/speakers');
      setSpeakers(response.speakers || []);
    } catch (error) {
      console.error('Failed to fetch speakers:', error);
    }
  };

  const fetchSeries = async () => {
    if (!session?.accessToken || !seriesId) return;

    try {
      setLoading(true);
      const apiClient = createApiClient(session.accessToken as string);
      const data = await apiClient.get<Series>(`/series/${seriesId}`);

      setFormData({
        title: data.title,
        description: data.description || '',
        speakerId: data.speaker_id ? String(data.speaker_id) : '',
      });
    } catch (error) {
      console.error('Failed to fetch series:', error);
      setError('Failed to load series');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || !seriesId) return;

    setSaving(true);
    setError('');

    try {
      const apiClient = createApiClient(session.accessToken as string);

      await apiClient.put(`/series/${seriesId}`, {
        title: formData.title,
        description: formData.description || null,
        speakerId: formData.speakerId ? parseInt(formData.speakerId) : null,
      });

      router.push('/dashboard/series');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update series';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.accessToken || !seriesId) return;
    if (!confirm('Are you sure you want to delete this series? This action cannot be undone.')) return;

    setDeleting(true);
    setError('');

    try {
      const apiClient = createApiClient(session.accessToken as string);
      await apiClient.delete(`/series/${seriesId}`);
      router.push('/dashboard/series');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete series';
      setError(message);
      setDeleting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-red-900 dark:text-red-100 font-medium">
                {error}
              </p>
            </div>
            <button
              onClick={() => setError('')}
              className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/series"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Series
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update series information
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-5 h-5" />
              Delete
            </>
          )}
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
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
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Speaker */}
          <div>
            <label
              htmlFor="speakerId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Primary Speaker *
            </label>
            <select
              id="speakerId"
              required
              value={formData.speakerId}
              onChange={(e) => setFormData({ ...formData, speakerId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a speaker</option>
              {speakers.map((speaker) => (
                <option key={speaker.id} value={speaker.id}>
                  {speaker.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              The primary speaker for this sermon series
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
            <Link
              href="/dashboard/series"
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
