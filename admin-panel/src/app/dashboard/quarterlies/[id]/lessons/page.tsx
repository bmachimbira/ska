'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api-client';
import { ArrowLeft, Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Quarterly {
  id: string;
  kind: string;
  year: number;
  quarter: number;
  title: string;
}

interface Lesson {
  id: string;
  quarterlyId: string;
  indexInQuarter: number;
  title: string;
  description: string;
}

export default function LessonsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [quarterly, setQuarterly] = useState<Quarterly | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.accessToken) {
      loadData();
    }
  }, [session, id]);

  async function loadData() {
    try {
      if (!session?.accessToken) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      setLoading(true);
      const apiClient = createApiClient(session.accessToken as string);
      const [quarterlyData, lessonsData] = await Promise.all([
        apiClient.get<{ quarterly: Quarterly }>(`/quarterlies/${id}`),
        apiClient.get<{ lessons: Lesson[] }>(`/quarterlies/${id}/lessons`),
      ]);
      setQuarterly(quarterlyData.quarterly);
      setLessons(lessonsData.lessons);
      setError('');
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load lessons');
      router.push('/dashboard/quarterlies');
    } finally {
      setLoading(false);
    }
  }

  async function deleteLesson(lessonId: string, title: string) {
    if (!confirm(`Delete lesson "${title}"? All lesson days will be deleted.`)) return;

    try {
      if (!session?.accessToken) { setError("Not authenticated."); return; }

      const apiClient = createApiClient(session.accessToken as string);

      await apiClient.delete(`/lessons/${lessonId}`);
      loadData();
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      setError('Failed to delete lesson');
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading lessons...</p>
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
          href="/dashboard/quarterlies"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quarterlies
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {quarterly?.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Q{quarterly?.quarter} {quarterly?.year} • {quarterly?.kind} • {lessons.length} lessons
            </p>
          </div>
          <button
            onClick={async () => {
              const nextIndex = lessons.length + 1;
              const title = prompt('Enter lesson title:');
              if (!title) return;
              
              try {
                if (!session?.accessToken) {
                  setError('Not authenticated. Please log in.');
                  return;
                }

                const apiClient = createApiClient(session.accessToken as string);
                await apiClient.post(`/quarterlies/${id}/lessons`, {
                  indexInQuarter: nextIndex,
                  title,
                  description: '',
                });
                loadData();
              } catch (error: any) {
                setError('Failed to create lesson: ' + (error.message || 'Unknown error'));
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Lesson
          </button>
        </div>
      </div>

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No lessons yet. Create your first lesson to get started.
          </p>
          <button
            onClick={async () => {
              const title = prompt('Enter lesson title:');
              if (!title) return;
              
              try {
                if (!session?.accessToken) {
                  setError('Not authenticated. Please log in.');
                  return;
                }

                const apiClient = createApiClient(session.accessToken as string);
                await apiClient.post(`/quarterlies/${id}/lessons`, {
                  indexInQuarter: 1,
                  title,
                  description: '',
                });
                loadData();
              } catch (error: any) {
                setError('Failed to create lesson: ' + (error.message || 'Unknown error'));
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create First Lesson
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg font-bold">
                      {lesson.indexInQuarter}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/lessons/${lesson.id}`}
                    className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                  >
                    Manage Days
                  </Link>
                  <button
                    onClick={async () => {
                      const title = prompt('Enter new title:', lesson.title);
                      const description = prompt('Enter new description:', lesson.description);
                      if (title === null) return;
                      
                      try {
                        if (!session?.accessToken) {
                          setError('Not authenticated. Please log in.');
                          return;
                        }

                        const apiClient = createApiClient(session.accessToken as string);
                        await apiClient.put(`/lessons/${lesson.id}`, { title, description });
                        loadData();
                      } catch (error: any) {
                        setError('Failed to update lesson: ' + (error.message || 'Unknown error'));
                      }
                    }}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteLesson(lesson.id, lesson.title)}
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
