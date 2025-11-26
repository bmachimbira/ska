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
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Sabbath School Lessons</h1>
            <p className="text-lg text-amber-100 max-w-2xl mx-auto">
              Study the Bible systematically with our quarterly lessons for all ages
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Filter className="h-4 w-4" />
              <span>Filter by age group:</span>
            </div>
            <div className="flex gap-2">
              <Link href="/sabbath-school">
                <Badge
                  variant={!activeKind ? 'default' : 'secondary'}
                  className="cursor-pointer hover:opacity-80"
                >
                  All
                </Badge>
              </Link>
              {Object.entries(QUARTERLY_KINDS).map(([key, label]) => (
                <Link key={key} href={`/sabbath-school?kind=${key}`}>
                  <Badge
                    variant={activeKind === key ? 'quarterly' : 'secondary'}
                    className="cursor-pointer hover:opacity-80"
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
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.quarterlies.length > 0 ? (
              <>Showing {data.quarterlies.length} {activeKind ? QUARTERLY_KINDS[activeKind as keyof typeof QUARTERLY_KINDS] : ''} {data.quarterlies.length === 1 ? 'quarterly' : 'quarterlies'}</>
            ) : (
              'No quarterlies found'
            )}
          </p>
        </div>

        {data.quarterlies.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.quarterlies.map((quarterly) => (
              <QuarterlyCard key={quarterly.id} quarterly={quarterly} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No quarterlies found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
