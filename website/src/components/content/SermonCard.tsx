import Link from 'next/link';
import { Play, User, Clock } from 'lucide-react';
import { Sermon } from '@/types/api';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatDuration, getRelativeTime } from '@/lib/utils';

export interface SermonCardProps {
  sermon: Sermon;
}

export function SermonCard({ sermon }: SermonCardProps) {
  const thumbnailUrl = sermon.thumbnailAsset?.url;
  const duration = sermon.videoAsset?.duration || sermon.audioAsset?.duration;

  return (
    <Link href={`/sermons/${sermon.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={sermon.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Play className="h-16 w-16 text-white/30" />
            </div>
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-white">
              <Play className="h-8 w-8 fill-current" />
            </div>
          </div>

          {/* Duration badge */}
          {duration && (
            <div className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-xs font-semibold text-white">
              {formatDuration(duration)}
            </div>
          )}

          {/* Featured badge */}
          {sermon.isFeatured && (
            <Badge variant="sermon" className="absolute left-2 top-2">
              Featured
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
            {sermon.title}
          </h3>

          {/* Description */}
          {sermon.description && (
            <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {sermon.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
            {sermon.speaker && (
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{sermon.speaker.name}</span>
              </div>
            )}
            {sermon.publishedAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{getRelativeTime(sermon.publishedAt)}</span>
              </div>
            )}
          </div>
        </CardContent>

        {/* Tags */}
        {sermon.tags && sermon.tags.length > 0 && (
          <CardFooter className="flex flex-wrap gap-1.5 px-4 pb-4">
            {sermon.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {sermon.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{sermon.tags.length - 3}
              </Badge>
            )}
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
