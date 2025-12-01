import { Metadata } from 'next';
import Link from 'next/link';
import { Book, Calendar, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Quarterly, Lesson } from '@/types/api';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { notFound } from 'next/navigation';

import { QUARTERLY_KINDS } from '@/lib/constants';
export const revalidate = 3600; // 1 hour

interface QuarterlyPageProps {
  params: Promise<{ quarterlyId: string }>;
}

async function getQuarterly(id: string): Promise<Quarterly | null> {
  try {
    const response = await apiClient.get<{ quarterly: Quarterly }>(`/quarterlies/${id}`);
    return response.quarterly;
  } catch (error) {
    return null;
  }
}

async function getLessons(quarterlyId: string): Promise<Lesson[]> {
  try {
    const response = await apiClient.get<{ lessons: Lesson[] }>(`/quarterlies/${quarterlyId}/lessons`);
    return response.lessons || [];
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: QuarterlyPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const quarterly = await getQuarterly(resolvedParams.quarterlyId);

  if (!quarterly) {
    return { title: 'Quarterly Not Found' };
  }

  return {
    title: `${quarterly.title} - Sabbath School`,
    description: quarterly.description || `Study the ${quarterly.title} quarterly`,
  };
}

export default async function QuarterlyPage({ params }: QuarterlyPageProps) {
  const resolvedParams = await params;
  const [quarterly, lessons] = await Promise.all([
    getQuarterly(resolvedParams.quarterlyId),
    getLessons(resolvedParams.quarterlyId),
  ]);

  if (!quarterly) {
    notFound();
  }

  const kindLabel = QUARTERLY_KINDS[quarterly.kind];
  const quarterLabel = `Q${quarterly.quarter} ${quarterly.year}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Cover Image */}
            {(quarterly.coverUrl || (quarterly as any).heroImage) && (
              <div className="w-full md:w-64 flex-shrink-0">
                <img
                  src={quarterly.coverUrl || (quarterly as any).heroImage}
                  alt={quarterly.title}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="quarterly">{kindLabel}</Badge>
                <Badge variant="secondary">{quarterLabel}</Badge>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {quarterly.title}
              </h1>

              {quarterly.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  {quarterly.description}
                </p>
              )}

              {quarterly.startDate && quarterly.endDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(quarterly.startDate)} - {formatDate(quarterly.endDate)}
                  </span>
                </div>
              )}

              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link href="/sabbath-school">← Back to Quarterlies</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Book className="h-6 w-6" />
            Lessons ({lessons.length})
          </h2>
        </div>

        {lessons.length > 0 ? (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/sabbath-school/lessons/${lesson.id}`}
                className="block group"
              >
                <Card className="p-6 hover:shadow-lg transition-all hover:border-primary-300 dark:hover:border-primary-700">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary">Lesson {lesson.indexInQuarter}</Badge>
                        {lesson.startDate && lesson.endDate && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(lesson.startDate)} - {formatDate(lesson.endDate)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-2">
                        {lesson.title}
                      </h3>
                      {lesson.memoryVerse && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2">
                          {lesson.memoryVerse}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 flex-shrink-0 mt-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No lessons available for this quarterly yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
