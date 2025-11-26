import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { HomePageData } from '@/types/api';
import { REVALIDATE_TIMES } from '@/lib/constants';
import { SermonCard } from '@/components/content/SermonCard';
import { DevotionalCard } from '@/components/content/DevotionalCard';
import { QuarterlyCard } from '@/components/content/QuarterlyCard';
import { Button } from '@/components/ui/Button';

export const revalidate = REVALIDATE_TIMES.home;

async function getHomeData(): Promise<HomePageData> {
  try {
    return await apiClient.get<HomePageData>('/home');
  } catch (error) {
    console.error('Failed to fetch home data:', error);
    // Return empty data on error
    return {
      recentSermons: [],
      currentQuarterlies: [],
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Spiritual Resources for Every Day
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Strengthen Your Faith
              <span className="block text-secondary-400">Through God's Word</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-100">
              Access inspiring sermons, daily devotionals, and Sabbath School lessons
              to deepen your spiritual journey and grow closer to God.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/sermons">
                  Browse Sermons
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link href="/devotionals/today">Today's Devotional</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Devotional */}
      {data.todayDevotional && (
        <section className="bg-gray-50 dark:bg-gray-900 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Today's Devotional
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Start your day with spiritual nourishment
                </p>
              </div>
              <Button asChild variant="ghost">
                <Link href="/devotionals">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="max-w-2xl mx-auto">
              <DevotionalCard devotional={data.todayDevotional} href="/devotionals/today" />
            </div>
          </div>
        </section>
      )}

      {/* Featured Sermon */}
      {data.featuredSermon && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Featured Sermon
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Watch our latest inspiring message
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <SermonCard sermon={data.featuredSermon} />
            </div>
          </div>
        </section>
      )}

      {/* Recent Sermons */}
      {data.recentSermons && data.recentSermons.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Recent Sermons
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Explore our latest messages
                </p>
              </div>
              <Button asChild variant="ghost">
                <Link href="/sermons">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.recentSermons.slice(0, 6).map((sermon) => (
                <SermonCard key={sermon.id} sermon={sermon} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Current Quarterlies */}
      {data.currentQuarterlies && data.currentQuarterlies.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Current Sabbath School Lessons
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Study this quarter's lessons
                </p>
              </div>
              <Button asChild variant="ghost">
                <Link href="/sabbath-school">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.currentQuarterlies.map((quarterly) => (
                <QuarterlyCard key={quarterly.id} quarterly={quarterly} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Deepen Your Faith?
          </h2>
          <p className="mb-8 text-primary-100 max-w-2xl mx-auto">
            Explore our complete library of sermons, devotionals, and Bible study materials.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/search">Search Resources</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
