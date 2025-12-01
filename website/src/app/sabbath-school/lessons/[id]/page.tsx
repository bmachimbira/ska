import { Metadata } from 'next';
import Link from 'next/link';
import { Book, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Lesson, LessonDay } from '@/types/api';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // 1 hour

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

async function getLesson(id: string): Promise<Lesson | null> {
  try {
    const response = await apiClient.get<{ lesson: Lesson }>(`/lessons/${id}`);
    return response.lesson;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { id } = await params;
  const lesson = await getLesson(id);

  if (!lesson) {
    return { title: 'Lesson Not Found' };
  }

  return {
    title: `${lesson.title} - Sabbath School`,
    description: lesson.description || `Study ${lesson.title}`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const lesson = await getLesson(id);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back to Quarterly */}
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/sabbath-school/${lesson.quarterlyId}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Quarterly
            </Link>
          </Button>
        </div>

        {/* Lesson Header */}
        <div className="mb-8">
          <Badge variant="quarterly" className="mb-4">
            Lesson {lesson.indexInQuarter}
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {lesson.title}
          </h1>
        </div>

        {/* Lesson Days */}
        {lesson.days && lesson.days.length > 0 ? (
          <div className="space-y-6">
            {lesson.days.map((day) => (
              <Card key={day.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        Day {day.dayIndex}
                      </Badge>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {day.title}
                      </h2>
                      {day.date && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <time dateTime={day.date}>{formatDate(day.date)}</time>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Memory Verse */}
                  {day.memoryVerse && (
                    <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-950 rounded-lg border-l-4 border-primary-500">
                      <p className="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-1">
                        Memory Verse
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 italic">
                        {day.memoryVerse}
                      </p>
                    </div>
                  )}

                  {/* Introduction */}
                  {day.introduction && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Introduction
                      </h3>
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: day.introduction.replace(/\n/g, '<br />'),
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Study Aim */}
                  {day.studyAim && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                        Study Aim
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {day.studyAim}
                      </p>
                    </div>
                  )}

                  {/* Main Content */}
                  {day.bodyMd && (
                    <div className="mb-6">
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: day.bodyMd.replace(/\n/g, '<br />'),
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Study Help */}
                  {day.studyHelp && (
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                        Study Help
                      </p>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: day.studyHelp.replace(/\n/g, '<br />'),
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Book className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              No lesson content available yet.
            </p>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button asChild variant="outline">
            <Link href={`/sabbath-school/${lesson.quarterlyId}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Lessons
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
