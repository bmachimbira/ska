'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
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
  thumbnail_asset: string | null;
  is_active: boolean;
  is_featured: boolean;
}

export default function EditCausePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cause, setCause] = useState<Cause | null>(null);
  const { data: session } = useSession();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    raisedAmount: '',
    startDate: '',
    endDate: '',
    thumbnailAsset: '',
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    loadCause();
  }, [id]);

  async function loadCause() {
    try {
      setLoading(true);
      if (!session?.accessToken) { setError("Not authenticated."); return; }

      const apiClient = createApiClient(session.accessToken as string);

      const response = await apiClient.get<Cause>(`/causes/${id}`);
      setCause(response);

      // Populate form data
      setFormData({
        title: response.title,
        description: response.description,
        goalAmount: response.goal_amount?.toString() || '',
        raisedAmount: response.raised_amount?.toString() || '0',
        startDate: response.start_date
          ? new Date(response.start_date).toISOString().slice(0, 16)
          : '',
        endDate: response.end_date
          ? new Date(response.end_date).toISOString().slice(0, 16)
          : '',
        thumbnailAsset: response.thumbnail_asset || '',
        isActive: response.is_active,
        isFeatured: response.is_featured,
      });
    } catch (error) {
      console.error('Failed to load cause:', error);
      setError('Failed to load cause');
      router.push('/dashboard/causes');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!session?.accessToken) { setError("Not authenticated."); return; }

      const apiClient = createApiClient(session.accessToken as string);

      await apiClient.put(`/causes/${id}`, {
        title: formData.title,
        description: formData.description,
        goalAmount: formData.goalAmount ? parseFloat(formData.goalAmount) : null,
        raisedAmount: formData.raisedAmount ? parseFloat(formData.raisedAmount) : 0,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        thumbnailAsset: formData.thumbnailAsset || null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      });

      router.push('/dashboard/causes');
    } catch (error: any) {
      console.error('Error updating cause:', error);
      alert('Failed to update cause: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading cause...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/causes"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Cause
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update cause information
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Cause Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter cause title"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe the cause and its impact"
            />
          </div>

          {/* Fundraising Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="goalAmount"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Goal Amount ($)
              </label>
              <input
                type="number"
                id="goalAmount"
                name="goalAmount"
                min="0"
                step="0.01"
                value={formData.goalAmount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty for ongoing projects without a goal
              </p>
            </div>

            <div>
              <label
                htmlFor="raisedAmount"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Amount Raised ($)
              </label>
              <input
                type="number"
                id="raisedAmount"
                name="raisedAmount"
                min="0"
                step="0.01"
                value={formData.raisedAmount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Start Date
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                End Date
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty for ongoing causes
              </p>
            </div>
          </div>

          {/* Thumbnail Asset */}
          <div>
            <label
              htmlFor="thumbnailAsset"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Thumbnail Asset ID (Optional)
            </label>
            <input
              type="text"
              id="thumbnailAsset"
              name="thumbnailAsset"
              value={formData.thumbnailAsset}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="UUID of thumbnail asset"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty to use default cause thumbnail
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Mark as active (visible to users)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label
                htmlFor="isFeatured"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Feature this cause on the home page
              </label>
            </div>
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
              href="/dashboard/causes"
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
