'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VideoUpload from '@/components/VideoUpload';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';

interface Speaker {
  id: number;
  name: string;
}

interface Devotional {
  id: number;
  slug: string;
  title: string;
  author: string | null;
  speaker_id: number | null;
  body_md: string;
  date: string;
  content_type: 'text' | 'audio' | 'video';
  audio_asset: string | null;
  video_asset: string | null;
  lang: string;
}

export default function EditDevotionalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const { data: session } = useSession();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    date: '',
    title: '',
    slug: '',
    author: '',
    speakerId: '',
    contentType: 'text' as 'text' | 'audio' | 'video',
    content: '',
    videoAssetId: '',
    audioAssetId: '',
    lang: 'en',
  });

  useEffect(() => {
    loadDevotional();
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

  async function loadDevotional() {
    try {
      setLoading(true);
      if (!session?.accessToken) { setError("Not authenticated."); return; }

      const apiClient = createApiClient(session.accessToken as string);

      const response = await apiClient.get<Devotional>(`/devotionals/${id}`);
      setDevotional(response);
      
      // Populate form data
      setFormData({
        date: response.date.split('T')[0], // Format date for input
        title: response.title,
        slug: response.slug,
        author: response.author || '',
        speakerId: response.speaker_id?.toString() || '',
        contentType: response.content_type,
        content: response.body_md,
        videoAssetId: response.video_asset || '',
        audioAssetId: response.audio_asset || '',
        lang: response.lang,
      });
    } catch (error) {
      console.error('Failed to load devotional:', error);
      setError('Failed to load devotional');
      router.push('/dashboard/devotionals');
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

      await apiClient.put(`/devotionals/${id}`, {
        title: formData.title,
        slug: formData.slug,
        author: formData.author || null,
        speakerId: formData.speakerId ? parseInt(formData.speakerId) : null,
        bodyMd: formData.content,
        date: formData.date,
        contentType: formData.contentType,
        videoAsset: formData.videoAssetId || null,
        audioAsset: formData.audioAssetId || null,
        lang: formData.lang,
      });

      router.push('/dashboard/devotionals');
    } catch (error: any) {
      console.error('Error updating devotional:', error);
      alert('Failed to update devotional: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading devotional...</p>
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
          href="/dashboard/devotionals"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Devotional
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update devotional information
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {previewMode ? (
            <>
              <Code className="w-4 h-4" />
              Edit
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Preview
            </>
          )}
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-6xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

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
          </div>

          {/* Title and Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="Enter devotional title"
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="url-friendly-slug"
              />
            </div>
          </div>

          {/* Content Type */}
          <div>
            <label
              htmlFor="contentType"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Content Type *
            </label>
            <select
              id="contentType"
              name="contentType"
              value={formData.contentType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="text">Text Only</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
          </div>

          {/* Content - Editor or Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content * (Markdown supported)
            </label>
            {previewMode ? (
              <div className="prose dark:prose-invert max-w-none p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 min-h-[400px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {formData.content || '*No content yet*'}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                id="content"
                name="content"
                required
                rows={16}
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                placeholder="Write your devotional content in markdown..."
              />
            )}
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Use markdown formatting for headers, lists, bold, italic, etc.
            </p>
          </div>

          {/* Video Upload (if content type is video) */}
          {formData.contentType === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video {formData.videoAssetId && '(Current video will be replaced)'}
              </label>
              {formData.videoAssetId && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Current Video Asset: {formData.videoAssetId}
                </p>
              )}
              <VideoUpload
                onUploadComplete={(assetId, url) => {
                  setFormData(prev => ({ ...prev, videoAssetId: assetId }));
                }}
                onError={(error) => {
                  console.error('Video upload error:', error);
                  alert('Video upload failed: ' + error);
                }}
              />
            </div>
          )}

          {/* Audio Upload Placeholder (if content type is audio) */}
          {formData.contentType === 'audio' && (
            <div>
              <label
                htmlFor="audioAssetId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Audio Asset ID
              </label>
              <input
                type="text"
                id="audioAssetId"
                name="audioAssetId"
                value={formData.audioAssetId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Audio upload coming soon"
              />
            </div>
          )}

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
              href="/dashboard/devotionals"
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
