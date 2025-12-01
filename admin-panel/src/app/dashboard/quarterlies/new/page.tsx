'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewQuarterlyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    kind: 'adult' as 'adult' | 'youth' | 'kids',
    year: new Date().getFullYear(),
    quarter: 1,
    title: '',
    description: '',
    lang: 'en',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!session?.accessToken) { setError("Not authenticated."); return; }

      const apiClient = createApiClient(session.accessToken as string);

      await apiClient.post('/quarterlies', formData);
      router.push('/dashboard/quarterlies');
    } catch (error: any) {
      alert('Failed to create quarterly: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/quarterlies"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quarterlies
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Quarterly
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Add a new Sabbath School quarterly to your content library
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(['adult', 'youth', 'kids'] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setFormData({ ...formData, kind })}
                className={`p-4 rounded-lg border-2 font-medium transition-all ${
                  formData.kind === kind
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <div className="capitalize text-lg">{kind}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Year and Quarter */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              min="2000"
              max="2100"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Quarter <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.quarter}
              onChange={(e) => setFormData({ ...formData, quarter: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="1">Q1 (January - March)</option>
              <option value="2">Q2 (April - June)</option>
              <option value="3">Q3 (July - September)</option>
              <option value="4">Q4 (October - December)</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Lessons on Faith"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the quarterly theme..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Language <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.lang}
            onChange={(e) => setFormData({ ...formData, lang: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Creating...' : 'Create Quarterly'}
          </button>
          <Link
            href="/dashboard/quarterlies"
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
