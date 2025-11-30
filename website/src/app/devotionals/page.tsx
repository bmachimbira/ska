import Link from 'next/link';
import { Calendar, Search } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { DevotionalsResponse } from '@/types/api';
import { DevotionalCard } from '@/components/content/DevotionalCard';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';

interface DevotionalsPageProps {
  searchParams: {
    page?: string;
    date?: string;
  };
}

async function getDevotionals(params: DevotionalsPageProps['searchParams']): Promise<DevotionalsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page);
    if (params.date) queryParams.set('date', params.date);
    queryParams.set('lang', 'en');

    const query = queryParams.toString();
    const endpoint = `/devotionals${query ? `?${query}` : ''}`;

    return await apiClient.get<DevotionalsResponse>(endpoint);
  } catch (error) {
    console.error('Failed to fetch devotionals:', error);
    return {
      devotionals: [],
      pagination: {
        page: 1,
        limit: 30,
        total: 0,
        pages: 0,
      },
    };
  }
}

export default async function DevotionalsPage({ searchParams }: DevotionalsPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getDevotionals(resolvedSearchParams);
  const currentPage = data.pagination.page;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%),
                             radial-gradient(circle at 80% 80%, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`
          }}></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold uppercase tracking-wide mb-6">
              Daily Inspiration
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 font-heading">
              Daily
              <span className="block text-green-200">Devotionals</span>
            </h1>
            <p className="text-xl text-green-100 leading-relaxed mb-8">
              Deepen your faith with daily spiritual reflections and inspiration. Start each day with God's Word.
            </p>
            <Button asChild size="lg" className="bg-white text-green-700 hover:bg-green-50 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <Link href="/devotionals/today">
                <Calendar className="mr-2 h-5 w-5" />
                Read Today's Devotional
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <form method="get" action="/devotionals" className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
              <label htmlFor="date" className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                <Calendar className="inline h-5 w-5 text-green-600 mr-2" />
                Jump to Date:
              </label>
              <div className="flex gap-2 flex-1">
                <input
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={resolvedSearchParams.date}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                  Go
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Results count */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {resolvedSearchParams.date ? 'Devotionals for Selected Date' : 'All Devotionals'}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {data.pagination.total > 0 ? (
                <>
                  Showing {(currentPage - 1) * data.pagination.limit + 1}-
                  {Math.min(currentPage * data.pagination.limit, data.pagination.total)} of {data.pagination.total} devotionals
                </>
              ) : (
                'No devotionals found'
              )}
            </p>
          </div>
        </div>

        {/* Devotionals Grid */}
        {data.devotionals.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.devotionals.map((devotional) => (
                <DevotionalCard key={devotional.id} devotional={devotional} />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.pages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={data.pagination.pages}
                  baseUrl="/devotionals"
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
              <Calendar className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Devotionals Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              {resolvedSearchParams.date 
                ? 'No devotionals are available for the selected date. Try choosing a different date or view today\'s devotional.'
                : 'There are no devotionals available at this time. Please check back later.'}
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white font-semibold">
              <Link href="/devotionals/today">
                <Calendar className="mr-2 h-5 w-5" />
                View Today's Devotional
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
