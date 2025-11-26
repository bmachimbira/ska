'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Search Content
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find sermons, devotionals, and lessons across our library
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for sermons, devotionals, or lessons..."
              className="w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>

          <Button className="w-full" size="lg">
            <Search className="mr-2 h-5 w-5" />
            Search
          </Button>

          {/* Quick Links */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Or browse by category:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button asChild variant="outline">
                <a href="/sermons">Browse Sermons</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/devotionals">Browse Devotionals</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/sabbath-school">Browse Lessons</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Search functionality will be implemented to query across all content types.</p>
        </div>
      </div>
    </div>
  );
}
