'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search, Book, Heart, Video } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-gray-950/95">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {APP_NAME}
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          <Link
            href="/sermons"
            className="flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400 transition-colors"
          >
            <Video className="h-4 w-4" />
            Sermons
          </Link>
          <Link
            href="/devotionals/today"
            className="flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400 transition-colors"
          >
            <Heart className="h-4 w-4" />
            Devotionals
          </Link>
          <Link
            href="/sabbath-school"
            className="flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400 transition-colors"
          >
            <Book className="h-4 w-4" />
            Sabbath School
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search
          </Link>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link
            href="/about"
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400 transition-colors"
          >
            About
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <Link
              href="/sermons"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Video className="h-5 w-5" />
              Sermons
            </Link>
            <Link
              href="/devotionals/today"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className="h-5 w-5" />
              Devotionals
            </Link>
            <Link
              href="/sabbath-school"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Book className="h-5 w-5" />
              Sabbath School
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="h-5 w-5" />
              Search
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
