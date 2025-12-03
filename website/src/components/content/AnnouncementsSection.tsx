'use client';

import { Bell, AlertCircle, AlertTriangle, Info, Church } from 'lucide-react';
import type { ChurchAnnouncement, AnnouncementPriority } from '@/types/api';

interface AnnouncementsSectionProps {
  announcements: ChurchAnnouncement[];
}

const priorityConfig: Record<AnnouncementPriority, {
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
}> = {
  urgent: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    textColor: 'text-red-900',
  },
  high: {
    icon: AlertCircle,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconColor: 'text-orange-600',
    textColor: 'text-orange-900',
  },
  normal: {
    icon: Bell,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-900',
  },
  low: {
    icon: Info,
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-600',
    textColor: 'text-gray-900',
  },
};

export function AnnouncementsSection({ announcements }: AnnouncementsSectionProps) {
  if (!announcements || announcements.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Church className="h-8 w-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-gray-900">Church Announcements</h2>
          </div>
          <p className="text-gray-600">
            Important updates from {announcements[0]?.churchName || 'your church'}
          </p>
        </div>

        <div className="space-y-4 max-w-4xl">
          {announcements.map((announcement) => {
            const config = priorityConfig[announcement.priority];
            const Icon = config.icon;

            return (
              <div
                key={announcement.id}
                className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${config.iconColor} flex-shrink-0 mt-1`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`text-lg font-bold ${config.textColor}`}>
                        {announcement.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {announcement.priority}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 whitespace-pre-wrap mb-3">
                      {announcement.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(announcement.createdAt)}</span>
                      {announcement.expiresAt && (
                        <span className="text-xs">
                          Expires: {new Date(announcement.expiresAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
