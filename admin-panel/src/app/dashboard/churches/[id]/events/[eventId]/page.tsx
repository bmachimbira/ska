'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';

interface ChurchEvent {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
  location?: string;
  eventType: string;
  isPublished: boolean;
  registrationRequired: boolean;
  maxAttendees?: number;
  createdAt: string;
}

export default function EventDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const churchId = params.id as string;
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<ChurchEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.accessToken && churchId && eventId) {
      fetchEvent();
    }
  }, [session, churchId, eventId]);

  const fetchEvent = async () => {
    try {
      if (!session?.accessToken) return;

      const apiClient = createApiClient(session.accessToken);
      const data = await apiClient.get<{ event: ChurchEvent }>(`/admin/churches/${churchId}/events/${eventId}`);
      setEvent(data.event);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    if (!session?.accessToken) return;

    try {
      const apiClient = createApiClient(session.accessToken);
      await apiClient.delete(`/admin/churches/${churchId}/events/${eventId}`);
      router.push(`/dashboard/churches/${churchId}/events`);
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link
          href={`/dashboard/churches/${churchId}/events`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Events
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/churches/${churchId}/events/${eventId}/edit`}
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
            {!event.isPublished && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Draft
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {event.eventType}
            </span>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {event.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Date & Time</h3>
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                <span>
                  {new Date(event.eventDate).toLocaleDateString()}
                  {event.eventTime && ` at ${event.eventTime}`}
                </span>
              </div>
            </div>

            {event.location && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Location</h3>
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{event.location}</span>
                </div>
              </div>
            )}

            {event.registrationRequired && event.maxAttendees && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Capacity</h3>
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 mr-2 text-gray-400" />
                  <span>Max {event.maxAttendees} attendees</span>
                </div>
              </div>
            )}

            {event.registrationRequired && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Registration</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Required
                </span>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Created {new Date(event.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
