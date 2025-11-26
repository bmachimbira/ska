'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

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

export default function EditLessonDayPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  const dayIndex = params.dayIndex as string;

  const [day, setDay] = useState<LessonDay | null>(null);
  const [title, setTitle] = useState('');
  const [bodyMd, setBodyMd] = useState('');
  const [memoryVerse, setMemoryVerse] = useState('');
  const [date, setDate] = useState('');
  const [studyAim, setStudyAim] = useState('');
  const [studyHelp, setStudyHelp] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDay();
  }, [lessonId, dayIndex]);

  async function loadDay() {
    try {
      setLoading(true);
      const response = await apiClient.get<{ day: LessonDay }>(`/lessons/${lessonId}/days/${dayIndex}`);
      const dayData = response.day;
      setDay(dayData);
      setTitle(dayData.title);
      setBodyMd(dayData.bodyMd);
      setMemoryVerse(dayData.memoryVerse || '');
      setDate(dayData.date ? dayData.date.split('T')[0] : '');
      setStudyAim(dayData.studyAim || '');
      setStudyHelp(dayData.studyHelp || '');
      setIntroduction(dayData.introduction || '');
    } catch (error) {
      console.error('Failed to load day:', error);
      alert('Failed to load lesson day');
      router.push(`/dashboard/lessons/${lessonId}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await apiClient.put(`/lessons/${lessonId}/days/${dayIndex}`, {
        title,
        bodyMd,
        memoryVerse: memoryVerse || null,
        date: date || null,
        studyAim: studyAim || null,
        studyHelp: studyHelp || null,
        introduction: introduction || null,
      });
      router.push(`/dashboard/lessons/${lessonId}`);
    } catch (error: any) {
      console.error('Failed to save day:', error);
      alert('Failed to save lesson day: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/lessons/${lessonId}`}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lesson Days
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Day {dayIndex}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update lesson day content
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter day title"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date (Optional)
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Memory Verse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Memory Verse (Optional)
          </label>
          <input
            type="text"
            value={memoryVerse}
            onChange={(e) => setMemoryVerse(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., John 3:16 - 'For God so loved the world...'"
          />
        </div>

        {/* Study Aim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Study Aim (Optional)
          </label>
          <textarea
            value={studyAim}
            onChange={(e) => setStudyAim(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Learning objectives or aims for this study day..."
          />
        </div>

        {/* Study Help */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Study Help (Optional)
          </label>
          <textarea
            value={studyHelp}
            onChange={(e) => setStudyHelp(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Additional study resources, references, or helps..."
          />
        </div>

        {/* Introduction */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Introduction (Optional)
          </label>
          <textarea
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Introduction or overview for the study day..."
          />
        </div>

        {/* Body Markdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content (Markdown)
          </label>
          <textarea
            value={bodyMd}
            onChange={(e) => setBodyMd(e.target.value)}
            rows={20}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            placeholder="Enter content in markdown format..."
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Use Markdown formatting: # for headings, ** for bold, * for italic, - for lists, etc.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href={`/dashboard/lessons/${lessonId}`}
            className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
