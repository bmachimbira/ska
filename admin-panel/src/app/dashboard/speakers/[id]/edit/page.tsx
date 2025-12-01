'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';

interface Speaker {
  id: number;
  name: string;
  bio: string | null;
  photo_asset: string | null;
  created_at: string;
  updated_at: string;
}

export default function EditSpeakerPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [speaker, setSpeaker] = useState<Speaker | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  });

  useEffect(() => {
    if (session?.accessToken) {
      loadSpeaker();
    }
  }, [id, session]);

  async function loadSpeaker() {
    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      setLoading(true);
      const apiClient = createApiClient(session.accessToken as string);
      const response = await apiClient.get<Speaker>(`/speakers/${id}`);
      setSpeaker(response);
      
      // Populate form data
      setFormData({
        name: response.name,
        bio: response.bio || '',
      });
      setError('');
    } catch (error) {
      console.error('Failed to load speaker:', error);
      setError('Failed to load speaker. Please try again.');
      router.push('/dashboard/speakers');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        setSaving(false);
        return;
      }

      const apiClient = createApiClient(session.accessToken as string);
      await apiClient.put(`/speakers/${id}`, {
        name: formData.name,
        bio: formData.bio || null,
      });

      setError('');
      router.push('/dashboard/speakers');
    } catch (error: any) {
      console.error('Error updating speaker:', error);
      setError('Failed to update speaker: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading speaker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/speakers"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Speaker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update speaker information
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter speaker name"
            />
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Biography
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={6}
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter speaker biography..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Optional: Add background information about the speaker
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/dashboard/speakers"
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
