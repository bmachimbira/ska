import { Users, Heart, BookOpen, Music, Baby, Globe } from 'lucide-react';

const ministries = [
  {
    icon: Users,
    title: 'Youth Ministry',
    description: 'Engaging young people in faith, fellowship, and service through dynamic programs and activities.',
    color: 'bg-blue-500',
  },
  {
    icon: Heart,
    title: 'Community Outreach',
    description: 'Serving our community through food banks, health programs, and compassionate care.',
    color: 'bg-red-500',
  },
  {
    icon: BookOpen,
    title: 'Sabbath School',
    description: 'Weekly Bible study programs for all ages, exploring Scripture and growing in faith together.',
    color: 'bg-green-500',
  },
  {
    icon: Music,
    title: 'Worship Ministry',
    description: 'Leading the congregation in uplifting worship through music, song, and praise.',
    color: 'bg-purple-500',
  },
  {
    icon: Baby,
    title: "Children's Ministry",
    description: 'Nurturing young hearts with age-appropriate Bible lessons, activities, and Christian values.',
    color: 'bg-yellow-500',
  },
  {
    icon: Globe,
    title: 'Missions',
    description: 'Spreading the gospel locally and globally through evangelism and humanitarian work.',
    color: 'bg-indigo-500',
  },
];

export function MinistriesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
            Our Ministries
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900 font-heading">
            Serving God &
            <span className="block text-primary-600">Our Community</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We offer various ministries designed to help you grow spiritually,
            connect with others, and make a difference in our community.
          </p>
        </div>

        {/* Ministries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ministries.map((ministry, index) => {
            const Icon = ministry.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className={`w-16 h-16 ${ministry.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-heading">
                  {ministry.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {ministry.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-700 mb-6">
            Interested in getting involved? We'd love to have you join us!
          </p>
          <a
            href="/about"
            className="inline-block px-8 py-3 bg-primary-600 text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-primary-700 transition-all duration-300"
          >
            Get Involved
          </a>
        </div>
      </div>
    </section>
  );
}
