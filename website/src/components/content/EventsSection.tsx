'use client';

import Link from 'next/link';
import { Calendar, Clock, MapPin, User, ArrowRight } from 'lucide-react';
import type { Event } from '@/types/api';

interface EventsSectionProps {
  events: Event[];
}

export function EventsSection({ events }: EventsSectionProps) {
  if (!events || events.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return {
        day: '--',
        month: 'TBA',
        year: '',
        fullDate: 'TBA',
      };
    }
    
    return {
      day: date.getDate().toString(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear().toString(),
      fullDate: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
    };
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Events</h2>
              <p className="text-gray-600">Join us for these special gatherings</p>
            </div>
            <Link
              href="/about"
              className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              View All
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 6).map((event) => {
            const { day, month, year, fullDate } = formatDate(event.eventDate);
            
            return (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Date Badge */}
                <div className="bg-primary-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{day}</div>
                        <div className="text-sm uppercase tracking-wide">{month}</div>
                      </div>
                      <div className="h-12 w-px bg-white/30"></div>
                      <div className="text-sm">{year}</div>
                    </div>
                    <Calendar className="h-6 w-6 opacity-75" />
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {event.eventTime && (
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        <Clock className="h-4 w-4 text-primary-600 flex-shrink-0" />
                        <span>{event.eventTime}</span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-start gap-2 text-gray-700 text-sm">
                        <MapPin className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{event.location}</span>
                      </div>
                    )}

                    {event.speaker && (
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        <User className="h-4 w-4 text-primary-600 flex-shrink-0" />
                        <span>Speaker: {event.speaker.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View All Link */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            View All Events
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
