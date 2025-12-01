'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';
import { ArrowLeft, Plus, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface Lesson {
  id: string;
  quarterlyId: string;
  indexInQuarter: number;
  title: string;
  description: string;
}

interface LessonDay {
  id: string;
  lessonId: string;
  dayIndex: number;
  date: string | null;
  title: string;
  bodyMd: string;
  memoryVerse: string | null;
  studyAim: string | null;
  studyHelp: string | null;
  introduction: string | null;
}

export default function LessonDaysPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [days, setDays] = useState<LessonDay[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      if (!session?.accessToken) { setError("Not authenticated."); return; }

      const apiClient = createApiClient(session.accessToken as string);

      const response = await apiClient.get<{ lesson: Lesson & { days: LessonDay[] } }>(`/lessons/${id}`);
      setLesson(response.lesson);
      setDays(response.lesson.days || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load lesson days');
      router.push('/dashboard/quarterlies');
    } finally {
      setLoading(false);
    }
  }

  async function deleteDay(dayIndex: number, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;

    try {
      if (!session?.accessToken) { setError("Not authenticated."); return; }

      const apiClient = createApiClient(session.accessToken as string);

      await apiClient.delete(`/lessons/${id}/days/${dayIndex}`);
      loadData();
    } catch (error) {
      console.error('Failed to delete day:', error);
      setError('Failed to delete lesson day');
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading lesson days...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Link
          href={lesson?.quarterlyId ? `/dashboard/quarterlies/${lesson.quarterlyId}/lessons` : '/dashboard/quarterlies'}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lessons
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {lesson?.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Lesson {lesson?.indexInQuarter} • {days.length} days
            </p>
          </div>
          <button
            onClick={async () => {
              const dayIndex = days.length + 1;
              if (dayIndex > 7) {
                setError('Maximum 7 days per lesson');
                return;
              }
              const title = prompt('Enter day title:');
              if (!title) return;
              const memoryVerse = prompt('Enter memory verse (optional):') || '';
              const date = prompt('Enter date (YYYY-MM-DD):');
              
              try {
                if (!session?.accessToken) { setError("Not authenticated."); return; }

                const apiClient = createApiClient(session.accessToken as string);

                await apiClient.post(`/lessons/${id}/days`, {
                  dayIndex,
                  title,
                  bodyMd: '# ' + title + '\n\nAdd content here...',
                  memoryVerse,
                  date,
                });
                loadData();
              } catch (error: any) {
                alert('Failed to create day: ' + error.message);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Day
          </button>
        </div>
      </div>

      {/* Days List */}
      {days.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No lesson days yet. Create your first day to get started.
          </p>
          <button
            onClick={async () => {
              const title = prompt('Enter day title:');
              if (!title) return;
              const memoryVerse = prompt('Enter memory verse (optional):') || '';
              const date = prompt('Enter date (YYYY-MM-DD):');
              
              try {
                if (!session?.accessToken) { setError("Not authenticated."); return; }

                const apiClient = createApiClient(session.accessToken as string);

                await apiClient.post(`/lessons/${id}/days`, {
                  dayIndex: 1,
                  title,
                  bodyMd: '# ' + title + '\n\nAdd content here...',
                  memoryVerse,
                  date,
                });
                loadData();
              } catch (error: any) {
                alert('Failed to create day: ' + error.message);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create First Day
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {days.map((day) => (
            <div
              key={day.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg font-bold">
                      {day.dayIndex}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {day.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>{formatDate(day.date)}</span>
                        {day.memoryVerse && (
                          <>
                            <span>•</span>
                            <span className="line-clamp-1">{day.memoryVerse}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/lessons/${id}/days/${day.dayIndex}/edit`}
                    className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                  >
                    Edit Content
                  </Link>
                  <button
                    onClick={() => deleteDay(day.dayIndex, day.title)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
