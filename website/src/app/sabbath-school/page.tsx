import Link from 'next/link';
import { Filter } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { QuarterliesResponse } from '@/types/api';
import { REVALIDATE_TIMES, QUARTERLY_KINDS } from '@/lib/constants';
import { QuarterlyCard } from '@/components/content/QuarterlyCard';
import { Badge } from '@/components/ui/Badge';

export const revalidate = REVALIDATE_TIMES.quarterlies;

interface SabbathSchoolPageProps {
  searchParams: {
    kind?: 'adult' | 'youth' | 'kids';
  };
}

async function getQuarterlies(kind?: string): Promise<QuarterliesResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (kind) queryParams.set('kind', kind);

    const query = queryParams.toString();
    const endpoint = `/quarterlies${query ? `?${query}` : ''}`;

    return await apiClient.get<QuarterliesResponse>(endpoint);
  } catch (error) {
    console.error('Failed to fetch quarterlies:', error);
    return {
      quarterlies: [],
    };
  }
}

export default async function SabbathSchoolPage({ searchParams }: SabbathSchoolPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getQuarterlies(resolvedSearchParams.kind);
  const activeKind = resolvedSearchParams.kind;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-800 text-white overflow-hidden">
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
              Bible Study
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 font-heading">
              Sabbath School
              <span className="block text-secondary-200">Lessons</span>
            </h1>
            <p className="text-xl text-secondary-100 leading-relaxed">
              Study the Bible systematically with our quarterly lessons designed for all ages. 
              Deepen your understanding of Scripture and grow in faith.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Filter className="h-5 w-5 text-secondary-600" />
              <span>Age Group:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/sabbath-school">
                <Badge
                  variant={!activeKind ? 'quarterly' : 'secondary'}
                  className="cursor-pointer hover:opacity-80 transition-all"
                >
                  All Lessons
                </Badge>
              </Link>
              {Object.entries(QUARTERLY_KINDS).map(([key, label]) => (
                <Link key={key} href={`/sabbath-school?kind=${key}`}>
                  <Badge
                    variant={activeKind === key ? 'quarterly' : 'secondary'}
                    className="cursor-pointer hover:opacity-80 transition-all"
                  >
                    {label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Results count */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {activeKind ? QUARTERLY_KINDS[activeKind as keyof typeof QUARTERLY_KINDS] : 'All'} Quarterlies
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {data.quarterlies.length > 0 ? (
                <>{data.quarterlies.length} {data.quarterlies.length === 1 ? 'quarterly' : 'quarterlies'} available</>
              ) : (
                'No quarterlies found'
              )}
            </p>
          </div>
        </div>

        {data.quarterlies.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.quarterlies.map((quarterly) => (
              <QuarterlyCard key={quarterly.id} quarterly={quarterly} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary-100 dark:bg-secondary-900 rounded-full mb-6">
              <Filter className="h-10 w-10 text-secondary-600 dark:text-secondary-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Quarterlies Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              There are no {activeKind ? QUARTERLY_KINDS[activeKind as keyof typeof QUARTERLY_KINDS].toLowerCase() : ''} quarterlies available at this time. 
              Please check back later or try a different category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
