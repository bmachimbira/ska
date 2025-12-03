'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';
import { Church, Event as EventType } from '@/types/api';

interface Speaker {
  id: number;
  name: string;
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<EventType | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [loadingChurches, setLoadingChurches] = useState(false);
  const { data: session } = useSession();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    speakerId: '',
    scope: 'global' as 'church' | 'global',
    churchId: '',
    thumbnailAsset: '',
    isFeatured: false,
    isPublished: true,
  });

  useEffect(() => {
    loadEvent();
    loadSpeakers();
    loadChurches();
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

  async function loadEvent() {
    try {
      setLoading(true);
      if (!session?.accessToken) { setError("Not authenticated."); return; }

      const apiClient = createApiClient(session.accessToken as string);

      const response = await apiClient.get<EventType>(`/events/${id}`);
      setEvent(response);

      // Populate form data
      setFormData({
        title: response.title,
        description: response.description || '',
        eventDate: response.event_date
          ? new Date(response.event_date).toISOString().slice(0, 16)
          : '',
        eventTime: response.event_time || '',
        location: response.location || '',
        speakerId: response.speaker?.id?.toString() || '',
        scope: response.scope || 'global',
        churchId: response.church?.id?.toString() || '',
        thumbnailAsset: response.thumbnailAsset?.id || '',
        isFeatured: response.is_featured,
        isPublished: response.is_published,
      });
    } catch (error) {
      console.error('Failed to load event:', error);
      setError('Failed to load event');
      router.push('/dashboard/events');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!session?.accessToken) { setError("Not authenticated."); return; }

      // Validate scope and churchId
      if (formData.scope === 'church' && !formData.churchId) {
        setError('Please select a church for church-specific events');
        setSaving(false);
        return;
      }

      const apiClient = createApiClient(session.accessToken as string);

      await apiClient.put(`/events/${id}`, {
        title: formData.title,
        description: formData.description || null,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime || null,
        location: formData.location || null,
        speakerId: formData.speakerId ? parseInt(formData.speakerId) : null,
        scope: formData.scope,
        churchId: formData.scope === 'church' ? parseInt(formData.churchId) : null,
        thumbnailAsset: formData.thumbnailAsset || null,
        isFeatured: formData.isFeatured,
        isPublished: formData.isPublished,
      });

      setError('');
      router.push('/dashboard/events');
    } catch (error: any) {
      console.error('Error updating event:', error);
      setError('Failed to update event: ' + (error.message || 'Unknown error'));
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading event...</p>
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
          href="/dashboard/events"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Event
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update event information
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
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter event title"
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
              placeholder="Enter event description"
            />
          </div>

          {/* Event Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="eventDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Event Date *
              </label>
              <input
                type="datetime-local"
                id="eventDate"
                name="eventDate"
                required
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="eventTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Event Time (Display Text)
              </label>
              <input
                type="text"
                id="eventTime"
                name="eventTime"
                value={formData.eventTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 10:00 AM - 12:00 PM"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Optional display text for the event time
              </p>
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter event location"
            />
          </div>

          {/* Scope */}
          <div>
            <label
              htmlFor="scope"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Event Scope *
            </label>
            <select
              id="scope"
              name="scope"
              required
              value={formData.scope}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="global">All Churches</option>
              <option value="church">Church-specific</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select whether this event is for all churches or a specific church
            </p>
          </div>

          {/* Church Selection (shown when scope is 'church') */}
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
                required
                value={formData.churchId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loadingChurches}
              >
                <option value="">Select a church</option>
                {churches.map(church => (
                  <option key={church.id} value={church.id}>
                    {church.name}
                  </option>
                ))}
              </select>
              {loadingChurches && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Loading churches...
                </p>
              )}
            </div>
          )}

          {/* Speaker */}
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
              Leave empty to use default event thumbnail
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
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
                Feature this event on the home page
              </label>
            </div>

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
                Publish this event (make it visible to users)
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
              href="/dashboard/events"
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
