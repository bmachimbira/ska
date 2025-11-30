'use client';

import { useState } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Church Member',
    initials: 'SJ',
    quote: 'This church has been a beacon of light in my life. The warm fellowship and powerful Bible-based messages have helped me grow tremendously in my walk with God.',
  },
  {
    name: 'Michael Chen',
    role: 'Youth Leader',
    initials: 'MC',
    quote: 'The youth ministry here is exceptional. It\'s not just about fun activities, but about building genuine relationships and deepening our understanding of Scripture.',
  },
  {
    name: 'Grace Mutasa',
    role: 'New Member',
    initials: 'GM',
    quote: 'As a new believer, I was searching for a church family that would help me grow. I found exactly that here - a community that genuinely cares and teaches God\'s Word faithfully.',
  },
  {
    name: 'David Moyo',
    role: 'Deacon',
    initials: 'DM',
    quote: 'Serving in this church has been one of my greatest blessings. The emphasis on both spiritual growth and community service reflects the heart of Christ.',
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const currentTestimonial = testimonials[currentIndex];

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
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white font-heading">
            What People Are
            <span className="block text-secondary-400">Saying About Us</span>
          </h2>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-2xl border border-white/20">
            {/* Quote Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-secondary-400 rounded-full flex items-center justify-center">
                <Quote className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Testimonial Content */}
            <blockquote className="text-center mb-8">
              <p className="text-xl md:text-2xl text-white leading-relaxed font-serif italic mb-8">
                "{currentTestimonial.quote}"
              </p>

              {/* Author Info */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-white/30 mb-4 bg-secondary-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {currentTestimonial.initials}
                  </span>
                </div>
                <cite className="not-italic">
                  <div className="text-xl font-bold text-white mb-1">
                    {currentTestimonial.name}
                  </div>
                  <div className="text-primary-200">
                    {currentTestimonial.role}
                  </div>
                </cite>
              </div>
            </blockquote>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={prev}
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-300 transform hover:scale-110"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-8 bg-white'
                        : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-300 transform hover:scale-110"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
