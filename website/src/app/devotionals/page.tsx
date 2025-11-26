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
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Daily Devotionals</h1>
            <p className="text-lg text-green-100 mb-8">
              Deepen your faith with daily spiritual reflections and inspiration
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/devotionals/today">
                <Calendar className="mr-2 h-5 w-5" />
                Read Today's Devotional
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <form method="get" action="/devotionals" className="max-w-md mx-auto">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jump to a specific date:
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                id="date"
                name="date"
                defaultValue={resolvedSearchParams.date}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
              <Button type="submit" variant="primary">
                Go
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No devotionals found for this date.
            </p>
            <Button asChild className="mt-4">
              <Link href="/devotionals/today">View Today's Devotional</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
