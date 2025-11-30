import { MapPin, Phone, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const churches = [
  {
    id: 1,
    name: 'Ebenezer Church',
    address: '25 Kirkland Rd, Greenhill, Bulawayo',
    pastor: 'Pastor S Oliphant',
    city: 'Bulawayo',
  },
  {
    id: 2,
    name: 'Bethel Church',
    address: 'Stand 1431, Drinkwater Ave, Zvishavane',
    pastor: 'Pastor D Hall',
    city: 'Zvishavane',
  },
  {
    id: 3,
    name: 'Maranatha Church',
    address: '399 Musgrave Rd, Shurugwi',
    pastor: 'Pastor S Jerias',
    city: 'Shurugwi',
  },
  {
    id: 4,
    name: 'Mount of Olives Church',
    address: 'Cheshire Ranch, Zvishavane',
    pastor: 'Pastor E Z Mukubwa',
    city: 'Zvishavane',
  },
  {
    id: 5,
    name: 'Mutare City Centre Church',
    address: '77 First St, Mutare',
    pastor: null,
    city: 'Mutare',
  },
  {
    id: 6,
    name: 'Ray of Light Church',
    address: '3 Jessop Rd, Cranborne, Harare',
    pastor: 'Pastor John Connick',
    city: 'Harare',
  },
  {
    id: 7,
    name: 'Remnant Church',
    address: '8 Boundary Rd, Clonsilla, Gweru',
    pastor: 'Pastor S Jerias',
    city: 'Gweru',
  },
  {
    id: 8,
    name: 'Thorngrove Church',
    address: '18 Woolwich Rd, Thorngrove, Bulawayo',
    pastor: 'Pastor S Oliphant',
    city: 'Bulawayo',
  },
];

// Group churches by city
const churchesByCity = churches.reduce((acc, church) => {
  if (!acc[church.city]) {
    acc[church.city] = [];
  }
  acc[church.city].push(church);
  return acc;
}, {} as Record<string, typeof churches>);

export const metadata = {
  title: 'Church Locations - Find a Church Near You',
  description: 'Find a Zimbabwe Conference of Sabbath Keeping Adventists church near you. We have congregations across Zimbabwe.',
};

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%),
                             radial-gradient(circle at 80% 80%, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`
          }}></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold uppercase tracking-wide mb-6">
              Visit Us
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 font-heading">
              Church
              <span className="block text-primary-200">Locations</span>
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              Find a Zimbabwe Conference of Sabbath Keeping Adventists church near you. 
              We have congregations across Zimbabwe welcoming believers.
            </p>
          </div>
        </div>
      </div>

      {/* Churches by City */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {Object.entries(churchesByCity).sort(([cityA], [cityB]) => cityA.localeCompare(cityB)).map(([city, cityChurches]) => (
            <div key={city}>
              {/* City Header */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {city}
                </h2>
                <Badge variant="secondary">
                  {cityChurches.length} {cityChurches.length === 1 ? 'Church' : 'Churches'}
                </Badge>
              </div>

              {/* Churches Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cityChurches.map((church) => (
                  <Card key={church.id} className="hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      {/* Church Name */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        {church.name}
                      </h3>

                      {/* Address */}
                      <div className="flex items-start gap-3 mb-4">
                        <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Address
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {church.address}
                          </p>
                        </div>
                      </div>

                      {/* Pastor */}
                      {church.pastor && (
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Pastor
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {church.pastor}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Get Directions Link */}
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(church.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          Get Directions
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 rounded-lg bg-primary-50 dark:bg-primary-950 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Can't Find a Church Near You?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            We're always looking to expand our reach. If you're interested in starting a new congregation 
            or have questions about our churches, please get in touch.
          </p>
          <a
            href="/about"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
