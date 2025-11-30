import Link from 'next/link';
import { Heart, Book, Users, ArrowRight } from 'lucide-react';

export function WelcomeSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&h=600&fit=crop"
                alt="Church Welcome"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary-100 rounded-lg -z-10"></div>
          </div>

          {/* Right side - Content */}
          <div>
            <div className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Welcome
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900 font-heading">
              Welcome to Our
              <span className="block text-primary-600">Community of Faith</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              We are a vibrant community of believers dedicated to proclaiming the Three Angels' Messages
              and preparing for Christ's imminent return. Our mission is to share God's love through worship,
              fellowship, and service to our community.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Whether you're a long-time believer or just beginning your spiritual journey,
              you'll find a warm welcome and a place to grow in faith.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-primary-50 transition-colors">
                <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center mb-3">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Community</h3>
                <p className="text-sm text-gray-600">A family of believers</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-primary-50 transition-colors">
                <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center mb-3">
                  <Book className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Bible Study</h3>
                <p className="text-sm text-gray-600">Growing in God's Word</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-primary-50 transition-colors">
                <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center mb-3">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Fellowship</h3>
                <p className="text-sm text-gray-600">Building relationships</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-primary-700 transition-all duration-300 transform hover:scale-105"
              >
                Learn More About Us
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
