'use client';

import Link from 'next/link';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import type { Event } from '@/types/api';

interface EventSectionProps {
  event?: Event;
}

export function EventSection({ event }: EventSectionProps) {
  if (!event) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Return default values for invalid dates
      return {
        day: '--',
        month: 'TBA',
        year: '',
      };
    }
    
    return {
      day: date.getDate().toString(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear().toString(),
    };
  };

  const { day, month, year } = formatDate(event.eventDate);
  const nextEvent = {
    title: event.title,
    pastor: event.speaker?.name || 'TBA',
    time: event.eventTime || 'TBA',
    location: event.location || 'TBA',
  };

  return (
    <div className="bg-primary-600 py-16">
      <div className="container mx-auto px-4">
        <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 lg:p-12">
            {/* Event Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Next Upcoming Event</h2>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 text-primary-600 mb-2">
                  <Clock className="h-5 w-5" />
                  <p className="font-semibold">@ {nextEvent.time}</p>
                </div>
              </div>

              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {nextEvent.title}
              </h3>

              <div className="flex items-center gap-2 text-gray-700 mb-3">
                <User className="h-5 w-5 text-primary-600" />
                <p className="text-lg">
                  - by: <span className="font-semibold">{nextEvent.pastor}</span>
                </p>
              </div>

              <div className="flex items-start gap-2 text-gray-700 mb-6">
                <MapPin className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                <p className="text-lg">Postal Address: {nextEvent.location}</p>
              </div>

              <div className="pt-4">
                <Link
                  href="/about"
                  className="inline-block px-8 py-3 bg-primary-600 text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-primary-700 transition-all duration-300 transform hover:scale-105"
                >
                  Join Us!
                </Link>
              </div>
            </div>

            {/* Date Display */}
            <div className="lg:col-span-1 flex lg:justify-end items-start">
              <div className="relative bg-primary-600 text-white rounded-lg p-8 text-center shadow-lg min-w-[160px]">
                <div className="text-6xl font-black mb-2">{day}</div>
                <div className="text-xl font-semibold uppercase tracking-wide">
                  {month}
                  <br />
                  {year}
                </div>
                {/* Decorative corner */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
