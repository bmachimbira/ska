import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { SermonsResponse } from '@/types/api';
import { SermonCard } from '@/components/content/SermonCard';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';

interface SermonsPageProps {
  searchParams: {
    page?: string;
    search?: string;
    tag?: string;
    speaker?: string;
    series?: string;
  };
}

async function getSermons(params: SermonsPageProps['searchParams']): Promise<SermonsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page);
    if (params.search) queryParams.set('search', params.search);
    if (params.tag) queryParams.set('tag', params.tag);
    if (params.speaker) queryParams.set('speaker', params.speaker);
    if (params.series) queryParams.set('series', params.series);

    const query = queryParams.toString();
    const endpoint = `/sermons${query ? `?${query}` : ''}`;

    return await apiClient.get<SermonsResponse>(endpoint);
  } catch (error) {
    console.error('Failed to fetch sermons:', error);
    return {
      sermons: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
    };
  }
}

export default async function SermonsPage({ searchParams }: SermonsPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getSermons(resolvedSearchParams);
  const currentPage = data.pagination.page;
  const hasFilters = !!(resolvedSearchParams.search || resolvedSearchParams.tag || resolvedSearchParams.speaker || resolvedSearchParams.series);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Sermons
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Watch inspiring messages that strengthen your faith and deepen your understanding of God's Word.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form method="get" action="/sermons" className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={resolvedSearchParams.search}
                  placeholder="Search sermons by title, description, or speaker..."
                  className="w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
              <button type="submit" className="sr-only">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active filters:
              </span>
              {resolvedSearchParams.search && (
                <Badge variant="secondary">
                  Search: {resolvedSearchParams.search}
                  <Link
                    href={`/sermons?${new URLSearchParams({ ...resolvedSearchParams, search: '' }).toString()}`}
                    className="ml-1 hover:text-gray-900"
                  >
                    ×
                  </Link>
                </Badge>
              )}
              {resolvedSearchParams.tag && (
                <Badge variant="secondary">
                  Tag: {resolvedSearchParams.tag}
                  <Link
                    href={`/sermons?${new URLSearchParams({ ...resolvedSearchParams, tag: '' }).toString()}`}
                    className="ml-1 hover:text-gray-900"
                  >
                    ×
                  </Link>
                </Badge>
              )}
              <Link
                href="/sermons"
                className="ml-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Clear all
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.pagination.total > 0 ? (
              <>
                Showing {(currentPage - 1) * data.pagination.limit + 1}-
                {Math.min(currentPage * data.pagination.limit, data.pagination.total)} of {data.pagination.total} sermons
              </>
            ) : (
              'No sermons found'
            )}
          </p>
        </div>

        {/* Sermons Grid */}
        {data.sermons.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.sermons.map((sermon) => (
                <SermonCard key={sermon.id} sermon={sermon} />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.pages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={data.pagination.pages}
                  baseUrl="/sermons"
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No sermons found. Try adjusting your search or filters.
            </p>
            {hasFilters && (
              <Link
                href="/sermons"
                className="mt-4 inline-block text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Clear filters
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
