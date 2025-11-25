'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import VideoUpload from '@/components/VideoUpload';

export default function NewSermonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speakerId: '',
    seriesId: '',
    scriptureRefs: '',
    videoAssetId: '',
    videoUrl: '',
    audioUrl: '',
    thumbnailUrl: '',
    publishedAt: '',
    isFeatured: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Call API to create sermon
      console.log('Creating sermon:', formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push('/dashboard/sermons');
    } catch (error) {
      console.error('Error creating sermon:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="p-8">
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
            Add New Sermon
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create a new sermon entry
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
              <label
                htmlFor="speakerId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Speaker
              </label>
              <select
                id="speakerId"
                name="speakerId"
                value={formData.speakerId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select speaker</option>
                <option value="1">John Smith</option>
                <option value="2">Jane Doe</option>
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
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video Upload
            </label>
            <VideoUpload
              onUploadComplete={(assetId, hlsUrl, thumbnailUrl) => {
                setFormData((prev) => ({
                  ...prev,
                  videoAssetId: assetId,
                  videoUrl: hlsUrl,
                  thumbnailUrl: thumbnailUrl,
                }));
              }}
              onError={(error) => {
                console.error('Upload error:', error);
                alert(`Upload failed: ${error}`);
              }}
            />
          </div>

          {/* Display current video info if available */}
          {formData.videoUrl && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Video Information
              </p>
              <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  <span className="font-medium">HLS URL:</span>{' '}
                  <a
                    href={formData.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-800"
                  >
                    {formData.videoUrl}
                  </a>
                </p>
                {formData.thumbnailUrl && (
                  <p>
                    <span className="font-medium">Thumbnail:</span>{' '}
                    <a
                      href={formData.thumbnailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-800"
                    >
                      View
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Optional: Audio URL */}
          <div>
            <label
              htmlFor="audioUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Audio URL (Optional)
            </label>
            <input
              type="url"
              id="audioUrl"
              name="audioUrl"
              value={formData.audioUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty if video is the only source
            </p>
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
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Sermon'}
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
