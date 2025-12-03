import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { HomePageData } from '@/types/api';
import { SermonCard } from '@/components/content/SermonCard';
import { DevotionalCard } from '@/components/content/DevotionalCard';
import { QuarterlyCard } from '@/components/content/QuarterlyCard';
import { Button } from '@/components/ui/Button';
import { HeroSlider } from '@/components/layout/HeroSlider';
import { EventsSection } from '@/components/content/EventsSection';
import { AnnouncementsSection } from '@/components/content/AnnouncementsSection';
import { FeaturedSermonSection } from '@/components/content/FeaturedSermonSection';
import { WelcomeSection } from '@/components/content/WelcomeSection';
import { MinistriesSection } from '@/components/content/MinistriesSection';
import { CausesSection } from '@/components/content/CausesSection';

export const revalidate = 60; // 1 minute

async function getHomeData(): Promise<HomePageData> {
  try {
    // Get auth token from cookies if available
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;
    
    return await apiClient.get<HomePageData>('/home', undefined, authToken);
  } catch (error) {
    console.error('Failed to fetch home data:', error);
    // Return empty data on error
    return {
      recentSermons: [],
      currentQuarterlies: [],
      activeCauses: [],
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Featured Sermon */}
      <FeaturedSermonSection sermon={data.featuredSermon} />

      {/* Welcome Section */}
      <WelcomeSection />

      {/* Ministries Section */}
      <MinistriesSection />

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

      {/* Combined Announcements and Events Section */}
      {((data.announcements && data.announcements.length > 0) || (data.upcomingEvents && data.upcomingEvents.length > 0)) && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Announcements Card - Takes 1 column */}
              {data.announcements && data.announcements.length > 0 && (
                <div className="lg:col-span-1">
                  <AnnouncementsSection announcements={data.announcements} compact={true} />
                </div>
              )}

              {/* Events Section - Takes 2 columns */}
              {data.upcomingEvents && data.upcomingEvents.length > 0 && (
                <div className={data.announcements && data.announcements.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
                  <EventsSection events={data.upcomingEvents} compact={true} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Causes/Projects Section */}
      <CausesSection causes={data.activeCauses} />

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to grow Your Faith?
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
