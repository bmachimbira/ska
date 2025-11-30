import { Heart, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';
import type { Cause } from '@/types/api';

interface CausesSectionProps {
  causes: Cause[];
}

export function CausesSection({ causes }: CausesSectionProps) {
  if (!causes || causes.length === 0) {
    return null;
  }

  const calculateProgress = (raised: number, goal?: number) => {
    if (!goal || goal === 0) return 0;
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
            Active Projects
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white font-heading">
            Supporting Our
            <span className="block text-secondary-400">Community Causes</span>
          </h2>
          <p className="text-lg text-primary-100 leading-relaxed">
            Join us in making a difference through these meaningful projects and initiatives.
          </p>
        </div>

        {/* Causes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {causes.map((cause) => {
            const progress = calculateProgress(cause.raisedAmount, cause.goalAmount);
            const hasGoal = cause.goalAmount && cause.goalAmount > 0;

            return (
              <div
                key={cause.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Cause Image/Icon */}
                <div className="h-48 bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center relative overflow-hidden">
                  {cause.thumbnailAsset?.url ? (
                    <img
                      src={cause.thumbnailAsset.url}
                      alt={cause.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Heart className="h-20 w-20 text-white opacity-80" />
                  )}
                  {cause.isFeatured && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold uppercase">
                      Featured
                    </div>
                  )}
                </div>

                {/* Cause Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-3 font-heading">
                    {cause.title}
                  </h3>
                  <p className="text-primary-100 mb-4 line-clamp-3">
                    {cause.description}
                  </p>

                  {/* Progress Section */}
                  {hasGoal && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-primary-200 font-semibold">
                          <TrendingUp className="inline h-4 w-4 mr-1" />
                          Progress
                        </span>
                        <span className="text-sm text-white font-bold">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-secondary-400 to-secondary-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-primary-200">
                          Raised: <span className="text-white font-bold">{formatCurrency(cause.raisedAmount)}</span>
                        </span>
                        <span className="text-sm text-primary-200">
                          Goal: <span className="text-white font-bold">{formatCurrency(cause.goalAmount!)}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* End Date */}
                  {cause.endDate && (
                    <div className="flex items-center gap-2 text-sm text-primary-200 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Ends: {new Date(cause.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Link
                    href="/about"
                    className="inline-block w-full px-6 py-3 bg-white text-primary-600 text-center text-sm font-bold uppercase tracking-wider rounded hover:bg-primary-50 transition-all duration-300 transform hover:scale-105"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All CTA */}
        {causes.length >= 3 && (
          <div className="text-center mt-12">
            <Link
              href="/about"
              className="inline-block px-8 py-3 bg-white/20 backdrop-blur-sm text-white border-2 border-white/40 text-sm font-bold uppercase tracking-wider rounded hover:bg-white/30 transition-all duration-300"
            >
              View All Projects
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
