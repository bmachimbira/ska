'use client';

import Link from 'next/link';
import { Mic, Youtube, Download, FileText, Share2 } from 'lucide-react';
import type { Sermon } from '@/types/api';

interface FeaturedSermonSectionProps {
  sermon?: Sermon;
}

export function FeaturedSermonSection({ sermon }: FeaturedSermonSectionProps) {
  if (!sermon) return null;

  return (
    <div className="bg-gray-900 py-16 relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 to-gray-900"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border border-white/10">
          <div className="p-8 lg:p-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-full">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Latest Sermon</h2>
                <p className="text-gray-300 text-sm">
                  {new Date(sermon.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sermon Image */}
              <div className="lg:col-span-1">
                <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl">
                  {sermon.thumbnailUrl ? (
                    <img
                      src={sermon.thumbnailUrl}
                      alt={sermon.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                      <Mic className="h-20 w-20 text-white/50" />
                    </div>
                  )}
                </div>
              </div>

              {/* Sermon Details */}
              <div className="lg:col-span-2">
                <h3 className="text-3xl font-bold text-white mb-3">
                  {sermon.title}
                </h3>
                <p className="text-lg text-gray-300 mb-6">
                  - by: <span className="font-semibold text-white">{sermon.speaker}</span>
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-8">
                  {sermon.videoUrl && (
                    <a
                      href={sermon.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Youtube className="h-5 w-5" />
                      Watch
                    </a>
                  )}
                  {sermon.audioUrl && (
                    <a
                      href={sermon.audioUrl}
                      download
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      Download
                    </a>
                  )}
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <FileText className="h-5 w-5" />
                    Notes
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Share2 className="h-5 w-5" />
                    Share
                  </button>
                </div>

                {/* Audio Player */}
                {sermon.audioUrl && (
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <audio
                      controls
                      className="w-full"
                      src={sermon.audioUrl}
                      style={{
                        filter: 'invert(1) hue-rotate(180deg)',
                        width: '100%',
                        height: '40px'
                      }}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                {/* View More Link */}
                <div className="mt-6">
                  <Link
                    href={`/sermons/${sermon.id}`}
                    className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                  >
                    View Full Details
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
