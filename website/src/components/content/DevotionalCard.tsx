import Link from 'next/link';
import { Calendar, BookOpen, Volume2, Video } from 'lucide-react';
import { Devotional } from '@/types/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export interface DevotionalCardProps {
  devotional: Devotional;
  href?: string;
}

export function DevotionalCard({ devotional, href }: DevotionalCardProps) {
  const link = href || `/devotionals/${devotional.id}`;

  return (
    <Link href={link} className="group block">
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <Badge variant="devotional" className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Devotional
            </Badge>
            <div className="flex items-center gap-2">
              {devotional.video_asset_details && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Video className="h-3.5 w-3.5" />
                  Video
                </div>
              )}
              {devotional.audio_asset_details && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Volume2 className="h-3.5 w-3.5" />
                  Audio
                </div>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <time dateTime={devotional.date}>{formatDate(devotional.date)}</time>
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
            {devotional.title}
          </h3>

          {/* Author */}
          {devotional.author && (
            <p className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              by {devotional.author}
            </p>
          )}

          {/* Speaker */}
          {devotional.speaker && (
            <p className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              Speaker: {devotional.speaker.name}
            </p>
          )}

          {/* Content preview */}
          {devotional.body_md && (
            <p className="mt-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
              {devotional.body_md.substring(0, 150)}...
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
