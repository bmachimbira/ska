'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Calendar, MapPin, Users as UsersIcon } from 'lucide-react';
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
}

export default function ChurchEventsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const churchId = params.id as string;

  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.accessToken && churchId) {
      fetchEvents();
    }
  }, [session, churchId]);

  const fetchEvents = async () => {
    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      const apiClient = createApiClient(session.accessToken);
      const data = await apiClient.get<{ events: ChurchEvent[] }>(`/admin/churches/${churchId}/events`);
      setEvents(data.events || []);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
      setError(errorMessage);
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/dashboard/churches/${churchId}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Church
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Church Events</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage church events and activities
          </p>
        </div>
        <Link
          href={`/dashboard/churches/${churchId}/events/new`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Event
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Events List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {events.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {events.map((event) => (
              <li key={event.id} className="hover:bg-gray-50">
                <Link href={`/dashboard/churches/${churchId}/events/${event.id}`} className="block px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {event.title}
                      </h3>
                      {!event.isPublished && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Draft
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.eventDate).toLocaleDateString()} 
                        {event.eventTime && ` at ${event.eventTime}`}
                      </div>
                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                      )}
                      {event.registrationRequired && event.maxAttendees && (
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-1" />
                          Max {event.maxAttendees}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {event.eventType}
                    </span>
                  </div>
                </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new event
            </p>
            <div className="mt-6">
              <Link
                href={`/dashboard/churches/${churchId}/events/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Event
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
