'use client';

import { useSession } from 'next-auth/react';
import { Video, BookOpen, Book, TrendingUp } from 'lucide-react';

interface StatCard {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const stats: StatCard[] = [
  {
    label: 'Total Sermons',
    value: '1,234',
    icon: Video,
    change: '+12%',
    changeType: 'increase',
  },
  {
    label: 'Devotionals',
    value: '365',
    icon: BookOpen,
    change: '+5%',
    changeType: 'increase',
  },
  {
    label: 'Quarterlies',
    value: '48',
    icon: Book,
    change: 'Current year',
  },
  {
    label: 'Total Views',
    value: '45.2K',
    icon: TrendingUp,
    change: '+23%',
    changeType: 'increase',
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {session?.user?.name || 'Admin'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's what's happening with your content today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                {stat.change && (
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === 'increase'
                        ? 'text-green-600 dark:text-green-400'
                        : stat.changeType === 'decrease'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Activity feed will be populated with backend data.
          </p>
        </div>
      </div>
    </div>
  );
}
