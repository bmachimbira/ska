import Link from 'next/link';
import { Book, Calendar } from 'lucide-react';
import { Quarterly } from '@/types/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { QUARTERLY_KINDS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export interface QuarterlyCardProps {
  quarterly: Quarterly;
}

export function QuarterlyCard({ quarterly }: QuarterlyCardProps) {
  const coverUrl = quarterly.coverUrl || '/placeholder-quarterly.jpg';
  const kindLabel = QUARTERLY_KINDS[quarterly.kind];
  const quarterLabel = `Q${quarterly.quarter} ${quarterly.year}`;

  return (
    <Link href={`/sabbath-school/${quarterly.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Cover image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-950 dark:to-secondary-950">
          <img
            src={coverUrl}
            alt={quarterly.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />

          {/* Kind badge */}
          <Badge variant="quarterly" className="absolute left-2 top-2">
            {kindLabel}
          </Badge>

          {/* Quarter label */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <Calendar className="h-3.5 w-3.5" />
              {quarterLabel}
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
            {quarterly.title}
          </h3>

          {/* Description */}
          {quarterly.description && (
            <p className="mb-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
              {quarterly.description}
            </p>
          )}

          {/* Date range */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            <Book className="h-3.5 w-3.5" />
            <span>
              {formatDate(quarterly.startDate)} - {formatDate(quarterly.endDate)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
