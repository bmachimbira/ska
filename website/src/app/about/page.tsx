import Link from 'next/link';
import { Heart, Book, Video, Users, Cross } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { APP_NAME, FULL_CHURCH_NAME } from '@/lib/constants';

export const metadata = {
  title: 'About Us - Zimbabwe Conference of Sabbath Keeping Adventists',
  description: 'Learn about the Zimbabwe Conference of Sabbath Keeping Adventists, our fundamental beliefs, and our mission to spread the Three Angels\' Messages.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">{FULL_CHURCH_NAME}</h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Proclaiming the everlasting gospel and the Three Angels' Messages in preparation for Christ's imminent return
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Mission */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Our Mission
          </h2>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                The Zimbabwe Conference of Sabbath Keeping Adventists is committed to proclaiming the everlasting gospel to every nation, tribe, tongue, and people in preparation for the imminent Second Coming of Jesus Christ.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                We believe in the Bible and the Bible alone (Sola Scriptura), upholding the validity of all God's commandments including the seventh-day Sabbath. Our mission is to share present truth, the Three Angels' Messages of Revelation 14, calling people out of spiritual Babylon to prepare to receive the seal of God.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Beliefs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Our Fundamental Beliefs
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Cross className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      The Holy Scriptures
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We believe in the Bible alone (Sola Scriptura) as our rule of faith and conduct, embracing both Old and New Testaments as inspired by the Holy Spirit.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                      7
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      The Seventh-Day Sabbath
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We observe Saturday, the seventh day of the week, as the holy Sabbath - a day blessed and sanctified by God at creation and affirmed in the Ten Commandments.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Book className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      The Sanctuary Message
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      The sanctuary is the hub of Bible truth. We believe in the investigative judgment that began in 1844, as Christ entered the Most Holy Place of the heavenly sanctuary.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      The Second Coming
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We believe in the imminent, personal, literal, and visible return of Jesus Christ - the blessed hope that will end all suffering and establish God's eternal kingdom.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            What We Offer
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
                  <Video className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Inspiring Sermons
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Watch and listen to powerful messages that strengthen your faith and provide spiritual guidance.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Daily Devotionals
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start each day with spiritual nourishment through thoughtful reflections and scripture.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
                  <Book className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Sabbath School Lessons
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Study the Bible systematically with quarterly lessons designed for all ages.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-900 rounded-2xl text-white p-12 text-center">
          <Users className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Start your spiritual journey today with access to thousands of resources designed to strengthen your faith.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/">Explore Content</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Link href="/devotionals/today">Today's Devotional</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
