"use client";
import { useState } from "react";
import Image from "next/image";

type AccommodationResult = {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  image: string;
  provider: string;
  url: string;
  type: string;
  description: string;
};

export default function AccommodationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('DE');
  const [selectedCity, setSelectedCity] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 300, max: 1500 });
  const [accommodationType, setAccommodationType] = useState('all');
  const [results, setResults] = useState<AccommodationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'idealista' | 'airbnb' | 'spotahome' | 'housinganywhere'>('idealista');

  const countries = {
    'DE': { name: 'Germany', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart'] },
    'NL': { name: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Delft'] },
    'FR': { name: 'France', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes'] },
    'IT': { name: 'Italy', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Bologna'] },
    'ES': { name: 'Spain', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Malaga'] },
    'SE': { name: 'Sweden', cities: ['Stockholm', 'Gothenburg', 'Malmo', 'Uppsala', 'Linkoping', 'Orebro'] }
  };

  const accommodationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'room', label: 'Private Room' },
    { value: 'studio', label: 'Studio' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'dorm', label: 'Dormitory' }
  ];

  const providers = [
    { id: 'idealista', name: 'Idealista', color: 'bg-blue-500', description: 'Spanish real estate platform' },
    { id: 'airbnb', name: 'Airbnb', color: 'bg-pink-500', description: 'Short & long term rentals' },
    { id: 'spotahome', name: 'Spotahome', color: 'bg-green-500', description: 'Student accommodation' },
    { id: 'housinganywhere', name: 'HousingAnywhere', color: 'bg-purple-500', description: 'International student housing' }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedCity) return;
    
    setIsLoading(true);
    try {
      // Simulate API calls to different providers
      const mockResults = await simulateAccommodationSearch();
      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAccommodationSearch = async (): Promise<AccommodationResult[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockData: AccommodationResult[] = [
      {
        id: '1',
        title: 'Modern Studio in City Center',
        price: 850,
        currency: 'EUR',
        location: `${selectedCity || 'Berlin'}, ${countries[selectedCountry as keyof typeof countries]?.name || 'Germany'}`,
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
        provider: activeProvider,
        url: '#',
        type: 'studio',
        description: 'Fully furnished studio with modern amenities, perfect for students.'
      },
      {
        id: '2',
        title: 'Shared Apartment - Private Room',
        price: 650,
        currency: 'EUR',
        location: `${selectedCity || 'Berlin'}, ${countries[selectedCountry as keyof typeof countries]?.name || 'Germany'}`,
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
        provider: activeProvider,
        url: '#',
        type: 'room',
        description: 'Private room in shared apartment with international students.'
      },
      {
        id: '3',
        title: 'Student Dormitory Room',
        price: 450,
        currency: 'EUR',
        location: `${selectedCity || 'Berlin'}, ${countries[selectedCountry as keyof typeof countries]?.name || 'Germany'}`,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
        provider: activeProvider,
        url: '#',
        type: 'dorm',
        description: 'Furnished dormitory room with shared facilities.'
      }
    ];

    return mockData.filter(item => 
      item.price >= priceRange.min && 
      item.price <= priceRange.max &&
      (accommodationType === 'all' || item.type === accommodationType)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Find Your Perfect Place</h1>
          
          {/* Search Filters */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., 'near university', 'furnished'"
                  className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  {Object.entries(countries).map(([code, country]) => (
                    <option key={code} value={code}>{country.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Cities</option>
                  {countries[selectedCountry as keyof typeof countries]?.cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={accommodationType}
                  onChange={(e) => setAccommodationType(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  {accommodationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: €{priceRange.min} - €{priceRange.max}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="200"
                    max="3000"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="200"
                    max="3000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? 'Searching...' : 'Search Accommodation'}
                </button>
              </div>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Search on:</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {providers.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => setActiveProvider(provider.id as 'idealista' | 'airbnb' | 'spotahome' | 'housinganywhere')}
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    activeProvider === provider.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${provider.color} mb-2`}></div>
                  <div className="font-medium text-gray-900">{provider.name}</div>
                  <div className="text-sm text-gray-600">{provider.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Found {results.length} places in {selectedCity || countries[selectedCountry as keyof typeof countries]?.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(result => (
                  <div key={result.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <Image
                      src={result.image}
                      alt={result.title}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{result.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{result.location}</p>
                      <p className="text-sm text-gray-700 mb-3">{result.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          €{result.price}/month
                        </span>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          View on {result.provider}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results yet</h3>
              <p className="text-gray-600">Try adjusting your search criteria and click &quot;Search Accommodation&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
