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
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
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
              Messages
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 font-heading">
              Sermons
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed mb-8">
              Watch inspiring messages that strengthen your faith and deepen your understanding of God's Word.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form method="get" action="/sermons" className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="search"
                    defaultValue={resolvedSearchParams.search}
                    placeholder="Search sermons by title, description, or speaker..."
                    className="w-full rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm pl-12 pr-4 py-4 text-white placeholder-white/60 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  />
                </div>
                <button type="submit" className="sr-only">
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Active Filters:
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {hasFilters ? 'Search Results' : 'All Sermons'}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full mb-6">
              <Search className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Sermons Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              {hasFilters 
                ? 'No sermons match your search criteria. Try adjusting your filters or search terms.'
                : 'There are no sermons available at this time. Please check back later.'}
            </p>
            {hasFilters && (
              <Link
                href="/sermons"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold"
              >
                Clear Filters
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
