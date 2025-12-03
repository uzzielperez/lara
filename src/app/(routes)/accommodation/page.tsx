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
    'DE': { name: '🇩🇪 Germany', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart'] },
    'NL': { name: '🇳🇱 Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Delft'] },
    'FR': { name: '🇫🇷 France', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes'] },
    'IT': { name: '🇮🇹 Italy', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Bologna'] },
    'ES': { name: '🇪🇸 Spain', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Malaga'] },
    'SE': { name: '🇸🇪 Sweden', cities: ['Stockholm', 'Gothenburg', 'Malmo', 'Uppsala', 'Linkoping', 'Orebro'] }
  };

  const accommodationTypes = [
    { value: 'all', label: '🏠 All Types' },
    { value: 'room', label: '🚪 Private Room' },
    { value: 'studio', label: '🛋️ Studio' },
    { value: 'apartment', label: '🏢 Apartment' },
    { value: 'dorm', label: '🛏️ Dormitory' }
  ];

  const providers = [
    { id: 'idealista', name: 'Idealista', color: 'bg-teal', description: 'Spanish real estate platform' },
    { id: 'airbnb', name: 'Airbnb', color: 'bg-gold-500', description: 'Short & long term rentals' },
    { id: 'spotahome', name: 'Spotahome', color: 'bg-primary-500', description: 'Student accommodation' },
    { id: 'housinganywhere', name: 'HousingAnywhere', color: 'bg-primary-700', description: 'International student housing' }
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
    
    const countryName = countries[selectedCountry as keyof typeof countries]?.name.slice(4) || 'Germany';
    
    const mockData: AccommodationResult[] = [
      {
        id: '1',
        title: 'Modern Studio in City Center',
        price: 850,
        currency: 'EUR',
        location: `${selectedCity || 'Berlin'}, ${countryName}`,
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
        location: `${selectedCity || 'Berlin'}, ${countryName}`,
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
        location: `${selectedCity || 'Berlin'}, ${countryName}`,
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
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="section-heading">Find Your Perfect Place</h1>
        <p className="section-subheading">Search student-friendly accommodation across Europe</p>
      </div>
      
      {/* Search Filters */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-teal mb-2">🔍 Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., 'near university', 'furnished'"
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-teal mb-2">🌍 Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="input-field"
            >
              {Object.entries(countries).map(([code, country]) => (
                <option key={code} value={code}>{country.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-teal mb-2">📍 City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input-field"
            >
              <option value="">All Cities</option>
              {countries[selectedCountry as keyof typeof countries]?.cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-teal mb-2">🏠 Type</label>
            <select
              value={accommodationType}
              onChange={(e) => setAccommodationType(e.target.value)}
              className="input-field"
            >
              {accommodationTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-teal mb-2">
              💰 Price Range: <span className="text-gold-600">€{priceRange.min} - €{priceRange.max}</span>
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="range"
                min="200"
                max="3000"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                className="flex-1 accent-teal"
              />
              <input
                type="range"
                min="200"
                max="3000"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className="flex-1 accent-teal"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-charcoal-dark/30 border-t-charcoal-dark rounded-full animate-spin"></span>
                  Searching...
                </>
              ) : (
                <>🔍 Search Accommodation</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-teal mb-4">Search on:</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {providers.map(provider => (
            <button
              key={provider.id}
              onClick={() => setActiveProvider(provider.id as 'idealista' | 'airbnb' | 'spotahome' | 'housinganywhere')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                activeProvider === provider.id
                  ? 'border-teal bg-primary-50 shadow-sm'
                  : 'border-cream-400 hover:border-primary-300 bg-white'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${provider.color} mb-2`}></div>
              <div className="font-semibold text-charcoal">{provider.name}</div>
              <div className="text-sm text-charcoal-light">{provider.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6 animate-slide-up">
          <h2 className="text-xl font-semibold text-teal">
            Found {results.length} places in {selectedCity || countries[selectedCountry as keyof typeof countries]?.name.slice(4)}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, i) => (
              <div 
                key={result.id} 
                className="card overflow-hidden hover:shadow-lg transition-all duration-200"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="-mx-6 -mt-6 mb-4">
                  <Image
                    src={result.image}
                    alt={result.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-teal text-lg">{result.title}</h3>
                  <p className="text-sm text-charcoal-light flex items-center gap-1">
                    <span>📍</span> {result.location}
                  </p>
                  <p className="text-sm text-charcoal">{result.description}</p>
                  <div className="flex justify-between items-center pt-3 border-t border-cream-300">
                    <span className="text-xl font-bold text-gold-600">
                      €{result.price}/mo
                    </span>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-light transition-colors text-sm font-medium"
                    >
                      View →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !isLoading && (
        <div className="card text-center py-16">
          <div className="w-20 h-20 bg-cream-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">🏠</span>
          </div>
          <h3 className="text-xl font-semibold text-teal mb-2">No results yet</h3>
          <p className="text-charcoal-light">Select a city and click &quot;Search Accommodation&quot; to find your perfect place</p>
        </div>
      )}
    </div>
  );
}
