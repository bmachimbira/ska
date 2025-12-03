'use client';

import { Bell, AlertCircle, AlertTriangle, Info, Church, Megaphone } from 'lucide-react';
import type { ChurchAnnouncement, AnnouncementPriority } from '@/types/api';

interface AnnouncementsSectionProps {
  announcements: ChurchAnnouncement[];
  compact?: boolean;
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

export function AnnouncementsSection({ announcements, compact = false }: AnnouncementsSectionProps) {
  if (!announcements || announcements.length === 0) {
    return null;
  }

  // Check if we have any church-specific announcements
  const hasChurchAnnouncements = announcements.some(a => a.scope === 'church');
  const hasGlobalAnnouncements = announcements.some(a => a.scope === 'global');
  
  // Determine header text based on content
  let headerTitle = 'Announcements';
  let headerDescription = 'Important updates';
  
  if (hasChurchAnnouncements && hasGlobalAnnouncements) {
    headerTitle = 'Announcements';
    headerDescription = 'Organization and church updates';
  } else if (hasChurchAnnouncements) {
    headerTitle = 'Church Announcements';
    headerDescription = `Important updates from ${announcements[0]?.churchName || 'your church'}`;
  } else if (hasGlobalAnnouncements) {
    headerTitle = 'Organization Announcements';
    headerDescription = 'Important updates for all churches';
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
    <div className={compact ? "" : "bg-white py-16"}>
      <div className={compact ? "" : "container mx-auto px-4"}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {hasChurchAnnouncements && !hasGlobalAnnouncements ? (
              <Church className="h-6 w-6 text-primary-600" />
            ) : (
              <Megaphone className="h-6 w-6 text-primary-600" />
            )}
            <h2 className="text-2xl font-bold text-gray-900">{headerTitle}</h2>
          </div>
          <p className="text-sm text-gray-600">
            {headerDescription}
          </p>
        </div>

        <div className="space-y-3">
          {announcements.slice(0, compact ? 3 : 10).map((announcement) => {
            const config = priorityConfig[announcement.priority];
            const Icon = config.icon;

            return (
              <div
                key={announcement.id}
                className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`text-base font-bold ${config.textColor} line-clamp-1`}>
                        {announcement.title}
                      </h3>
                      {!compact && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {announcement.scope === 'church' && announcement.churchName && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                              {announcement.churchName}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {announcement.priority}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className={`text-gray-700 text-sm whitespace-pre-wrap mb-2 ${compact ? 'line-clamp-2' : ''}`}>
                      {announcement.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(announcement.createdAt)}</span>
                      {announcement.expiresAt && !compact && (
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
