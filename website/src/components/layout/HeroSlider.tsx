'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

const slides = [
  {
    id: 1,
    title: 'Welcome To Our',
    subtitle: 'House of Worship',
    description: 'We Come To Serving & Believing God\'s Word and Spirit.',
    gradient: 'from-primary-900 via-primary-800 to-primary-700',
  },
  {
    id: 2,
    title: 'Strengthen Your Faith',
    subtitle: 'Through God\'s Word',
    description: 'Join us for worship, fellowship, and spiritual growth.',
    gradient: 'from-primary-800 via-primary-700 to-secondary-700',
  },
  {
    id: 3,
    title: 'Growing Together',
    subtitle: 'In Christ',
    description: 'Building a community rooted in faith and love.',
    gradient: 'from-secondary-800 via-secondary-700 to-primary-800',
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}>
            <div className="absolute inset-0 bg-black/20"></div>
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%),
                               radial-gradient(circle at 80% 80%, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`
            }}></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-center">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-4xl mx-auto">
                {/* Logo/Brand */}
                <div className="mb-6 animate-fade-in-down">
                  <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-white/10 backdrop-blur-sm rounded-full">
                    <span className="text-3xl font-bold text-white">
                      {APP_NAME.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Slide Title */}
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-4 uppercase tracking-wide animate-fade-in-up font-heading">
                  {slide.title}
                  <br />
                  <span className="text-secondary-400">{slide.subtitle}</span>
                </h1>

                {/* Slide Description */}
                <p className="text-lg md:text-xl text-white/90 mb-8 font-serif italic animate-fade-in-up animation-delay-200">
                  {slide.description}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-400">
                  <Link
                    href="/about"
                    className="px-8 py-3 bg-primary-600 text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-primary-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Visit Us
                  </Link>
                  <Link
                    href="/sermons"
                    className="px-8 py-3 bg-white/10 backdrop-blur-sm border-2 border-white text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                  >
                    Watch Sermons
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-12 h-1 transition-all duration-300 ${
              index === currentSlide ? 'bg-white' : 'bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
