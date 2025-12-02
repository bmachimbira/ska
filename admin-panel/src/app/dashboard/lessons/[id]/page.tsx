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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDayIndex, setNewDayIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    memoryVerse: '',
    date: '',
    studyAim: '',
    studyHelp: '',
    introduction: '',
  });

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

  function openAddDayModal() {
    // Find the first available day index (1-7)
    const existingIndices = new Set(days.map(d => d.dayIndex));
    let dayIndex = null;
    for (let i = 1; i <= 7; i++) {
      if (!existingIndices.has(i)) {
        dayIndex = i;
        break;
      }
    }

    if (!dayIndex) {
      setError('Maximum 7 days per lesson already reached');
      return;
    }

    setNewDayIndex(dayIndex);
    setFormData({
      title: '',
      memoryVerse: '',
      date: '',
      studyAim: '',
      studyHelp: '',
      introduction: '',
    });
    setShowAddModal(true);
  }

  async function handleSubmitDay(e: React.FormEvent) {
    e.preventDefault();
    if (!newDayIndex) return;

    try {
      if (!session?.accessToken) {
        setError("Not authenticated.");
        return;
      }

      const apiClient = createApiClient(session.accessToken as string);

      await apiClient.post(`/lessons/${id}/days`, {
        dayIndex: newDayIndex,
        title: formData.title,
        bodyMd: '# ' + formData.title + '\n\nAdd content here...',
        memoryVerse: formData.memoryVerse || null,
        date: formData.date || null,
        studyAim: formData.studyAim || null,
        studyHelp: formData.studyHelp || null,
        introduction: formData.introduction || null,
      });

      setShowAddModal(false);
      loadData();
    } catch (error: any) {
      setError('Failed to create day: ' + error.message);
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
            onClick={openAddDayModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Day
          </button>
        </div>
      </div>

      {/* Day Progress Indicator */}
      {days.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Lesson Days Progress:</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
              const exists = days.some(d => d.dayIndex === dayNum);
              return (
                <div
                  key={dayNum}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm ${
                    exists
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-600'
                  }`}
                  title={exists ? `Day ${dayNum} exists` : `Day ${dayNum} missing`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Days List */}
      {days.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No lesson days yet. Create your first day to get started.
          </p>
          <button
            onClick={openAddDayModal}
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

      {/* Add Day Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmitDay}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Add Day {newDayIndex}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter day title"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Memory Verse */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Memory Verse
                  </label>
                  <textarea
                    value={formData.memoryVerse}
                    onChange={(e) => setFormData({ ...formData, memoryVerse: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter memory verse (optional)"
                  />
                </div>

                {/* Study Aim */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Study Aim
                  </label>
                  <textarea
                    value={formData.studyAim}
                    onChange={(e) => setFormData({ ...formData, studyAim: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="What is the main objective of this lesson? (optional)"
                  />
                </div>

                {/* Study Help */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Study Help
                  </label>
                  <textarea
                    value={formData.studyHelp}
                    onChange={(e) => setFormData({ ...formData, studyHelp: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Additional study materials or references (optional)"
                  />
                </div>

                {/* Introduction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Introduction
                  </label>
                  <textarea
                    value={formData.introduction}
                    onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brief introduction to the day's lesson (optional)"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Note:</strong> You can edit the full lesson content (bodyMd) after creating the day.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Create Day {newDayIndex}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
