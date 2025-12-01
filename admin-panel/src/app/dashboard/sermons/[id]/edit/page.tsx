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
}

interface Sermon {
  id: string;
  title: string;
  description: string | null;
  transcript: string | null;
  scripture_refs: string[] | null;
  speaker_id: number | null;
  series_id: number | null;
  video_asset: string | null;
  audio_asset: string | null;
  thumbnail_asset: string | null;
  published_at: string | null;
  is_featured: boolean;
}

export default function EditSermonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const { data: session } = useSession();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    transcript: '',
    speakerId: '',
    seriesId: '',
    scriptureRefs: '',
    videoAssetId: '',
    publishedAt: '',
    isFeatured: false,
  });

  useEffect(() => {
    loadSermon();
    loadSpeakers();
  }, [id]);

  async function loadSpeakers() {
    try {
      if (!session?.accessToken) { setError("Not authenticated."); return; }

      const apiClient = createApiClient(session.accessToken as string);

      const data = await apiClient.get<{ speakers: Speaker[] }>('/speakers');
      setSpeakers(data.speakers);
    } catch (error) {
      console.error('Failed to load speakers:', error);
    }
  }

  async function loadSermon() {
    try {
      setLoading(true);
      if (!session?.accessToken) { setError("Not authenticated."); return; }

      const apiClient = createApiClient(session.accessToken as string);

      const response = await apiClient.get<Sermon>(`/sermons/${id}`);
      setSermon(response);
      
      // Populate form data
      setFormData({
        title: response.title,
        description: response.description || '',
        transcript: response.transcript || '',
        speakerId: response.speaker_id?.toString() || '',
        seriesId: response.series_id?.toString() || '',
        scriptureRefs: response.scripture_refs?.join(', ') || '',
        videoAssetId: response.video_asset || '',
        publishedAt: response.published_at 
          ? new Date(response.published_at).toISOString().slice(0, 16)
          : '',
        isFeatured: response.is_featured,
      });
    } catch (error) {
      console.error('Failed to load sermon:', error);
      setError('Failed to load sermon');
      router.push('/dashboard/sermons');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Parse scripture refs into array
      const scriptureRefsArray = formData.scriptureRefs
        .split(',')
        .map(ref => ref.trim())
        .filter(ref => ref.length > 0);

      if (!session?.accessToken) { setError("Not authenticated."); return; }


      const apiClient = createApiClient(session.accessToken as string);


      await apiClient.put(`/sermons/${id}`, {
        title: formData.title,
        description: formData.description || null,
        transcript: formData.transcript || null,
        scriptureRefs: scriptureRefsArray.length > 0 ? scriptureRefsArray : null,
        speakerId: formData.speakerId ? parseInt(formData.speakerId) : null,
        seriesId: formData.seriesId ? parseInt(formData.seriesId) : null,
        videoAsset: formData.videoAssetId || null,
        publishedAt: formData.publishedAt || null,
        isFeatured: formData.isFeatured,
      });

      router.push('/dashboard/sermons');
    } catch (error: any) {
      console.error('Error updating sermon:', error);
      alert('Failed to update sermon: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sermon...</p>
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
          href="/dashboard/sermons"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Sermon
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update sermon information
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
              placeholder="Enter sermon title"
            />
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
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter sermon description"
            />
          </div>

          {/* Speaker and Series */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="speakerId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Speaker
                </label>
                <Link
                  href="/dashboard/speakers"
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  target="_blank"
                >
                  Manage Speakers
                </Link>
              </div>
              <select
                id="speakerId"
                name="speakerId"
                value={formData.speakerId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select speaker</option>
                {speakers.map(speaker => (
                  <option key={speaker.id} value={speaker.id}>
                    {speaker.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="seriesId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Series
              </label>
              <select
                id="seriesId"
                name="seriesId"
                value={formData.seriesId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select series</option>
                <option value="1">Living Faith</option>
                <option value="2">Christian Living</option>
              </select>
            </div>
          </div>

          {/* Scripture References */}
          <div>
            <label
              htmlFor="scriptureRefs"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Scripture References
            </label>
            <input
              type="text"
              id="scriptureRefs"
              name="scriptureRefs"
              value={formData.scriptureRefs}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., John 3:16, Romans 8:28"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Separate multiple references with commas
            </p>
          </div>

          {/* Transcript */}
          <div>
            <label
              htmlFor="transcript"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Transcript (Optional)
            </label>
            <textarea
              id="transcript"
              name="transcript"
              rows={15}
              value={formData.transcript}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              placeholder="Full sermon transcript..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Add the full text transcript of the sermon for accessibility and search purposes
            </p>
          </div>

          {/* Video Asset ID */}
          <div>
            <label
              htmlFor="videoAssetId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Video Asset ID (Optional)
            </label>
            <input
              type="text"
              id="videoAssetId"
              name="videoAssetId"
              value={formData.videoAssetId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="UUID of video asset"
            />
          </div>

          {/* Published Date */}
          <div>
            <label
              htmlFor="publishedAt"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Published Date
            </label>
            <input
              type="datetime-local"
              id="publishedAt"
              name="publishedAt"
              value={formData.publishedAt}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Featured Checkbox */}
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
              Feature this sermon on the home screen
            </label>
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
              href="/dashboard/sermons"
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
