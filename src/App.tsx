import React, { useState } from 'react';
import { Globe, MapPin, GraduationCap, Home, Calendar, Plane } from 'lucide-react';
import { getPredictedCost, type CostPredictionParams } from './lib/costPrediction';

type Continent = {
  name: string;
  countries: {
    [key: string]: {
      name: string;
      cities: {
        [key: string]: {
          name: string;
          universities: string[];
        };
      };
    };
  };
};

const CONTINENTS: { [key: string]: Continent } = {
  'europe': {
    name: 'Europe',
    countries: {
      'france': {
        name: 'France',
        cities: {
          'paris': {
            name: 'Paris',
            universities: [
              'EMLYON Business School',
              'ESSEC',
              'ESSCA Paris',
              'Sciences Po Paris',
              'SKEMA Business School',
              'Université Paris Dauphine'
            ]
          },
          'lyon': {
            name: 'Lyon',
            universities: [
              'EMLYON Business School',
              'ESSCA Lyon'
            ]
          }
        }
      },
      'uk': {
        name: 'United Kingdom',
        cities: {
          'london': {
            name: 'London',
            universities: [
              'City University (Bayes Business School)',
              'Imperial College London',
              'King\'s College London',
              'London School of Economics'
            ]
          },
          'manchester': {
            name: 'Manchester',
            universities: [
              'University of Manchester',
              'Manchester Metropolitan University'
            ]
          }
        }
      },
      'germany': {
        name: 'Germany',
        cities: {
          'berlin': {
            name: 'Berlin',
            universities: [
              'Humboldt University',
              'Free University of Berlin',
              'Technical University of Berlin'
            ]
          },
          'munich': {
            name: 'Munich',
            universities: [
              'Technical University of Munich',
              'Ludwig Maximilian University'
            ]
          }
        }
      }
    }
  },
  'asia': {
    name: 'Asia',
    countries: {
      'singapore': {
        name: 'Singapore',
        cities: {
          'singapore': {
            name: 'Singapore',
            universities: [
              'National University of Singapore (NUS)',
              'Nanyang Technological University (NTU)',
              'Singapore Management University (SMU)'
            ]
          }
        }
      },
      'japan': {
        name: 'Japan',
        cities: {
          'tokyo': {
            name: 'Tokyo',
            universities: [
              'University of Tokyo',
              'Waseda University',
              'Keio University'
            ]
          },
          'kyoto': {
            name: 'Kyoto',
            universities: [
              'Kyoto University',
              'Ritsumeikan University'
            ]
          }
        }
      }
    }
  },
  'northamerica': {
    name: 'North America',
    countries: {
      'usa': {
        name: 'United States',
        cities: {
          'newyork': {
            name: 'New York',
            universities: [
              'Columbia University',
              'New York University (NYU)',
              'Fordham University'
            ]
          },
          'boston': {
            name: 'Boston',
            universities: [
              'Harvard University',
              'MIT',
              'Boston University'
            ]
          }
        }
      },
      'canada': {
        name: 'Canada',
        cities: {
          'toronto': {
            name: 'Toronto',
            universities: [
              'University of Toronto',
              'York University',
              'Ryerson University'
            ]
          },
          'vancouver': {
            name: 'Vancouver',
            universities: [
              'University of British Columbia',
              'Simon Fraser University'
            ]
          }
        }
      }
    }
  },
  'oceania': {
    name: 'Oceania',
    countries: {
      'australia': {
        name: 'Australia',
        cities: {
          'sydney': {
            name: 'Sydney',
            universities: [
              'University of Sydney (USYD)',
              'University of New South Wales (UNSW)',
              'University of Technology Sydney'
            ]
          },
          'melbourne': {
            name: 'Melbourne',
            universities: [
              'University of Melbourne',
              'Monash University',
              'RMIT University'
            ]
          }
        }
      }
    }
  }
};

interface PreferenceScales {
  accommodation: number;
  dining: number;
  nightlife: number;
  activities: number;
  shopping: number;
}

function PreferenceScale({ value, onChange, label }: { 
  value: number; 
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500">Level: {value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Budget</span>
        <span>Luxury</span>
      </div>
    </div>
  );
}

function NumberInput({ 
  value, 
  onChange, 
  label, 
  min = 0, 
  max, 
  step = 1 
}: { 
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? min : Number(e.target.value);
    if (!isNaN(newValue) && (max === undefined || newValue <= max) && newValue >= min) {
      onChange(newValue);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => value > min && onChange(value - step)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => (max === undefined || value < max) && onChange(value + step)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [selectedContinent, setSelectedContinent] = useState('europe');
  const [selectedCountry, setSelectedCountry] = useState('france');
  const [selectedCity, setSelectedCity] = useState('paris');
  const [selectedUniversity, setSelectedUniversity] = useState(CONTINENTS[selectedContinent].countries[selectedCountry].cities[selectedCity].universities[0]);
  const [duration, setDuration] = useState<number>(6);
  const [preferences, setPreferences] = useState<PreferenceScales>({
    accommodation: 3,
    dining: 3,
    nightlife: 3,
    activities: 3,
    shopping: 3
  });
  const [trips, setTrips] = useState({
    localTrips: 2,
    internationalTrips: 1
  });
  const [predictedCost, setPredictedCost] = useState<number | null>(null);
  const [universityImage, setUniversityImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const handleContinentChange = (continent: string) => {
    setSelectedContinent(continent);
    const firstCountry = Object.keys(CONTINENTS[continent].countries)[0];
    setSelectedCountry(firstCountry);
    const firstCity = Object.keys(CONTINENTS[continent].countries[firstCountry].cities)[0];
    setSelectedCity(firstCity);
    setSelectedUniversity(CONTINENTS[continent].countries[firstCountry].cities[firstCity].universities[0]);
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    const firstCity = Object.keys(CONTINENTS[selectedContinent].countries[country].cities)[0];
    setSelectedCity(firstCity);
    setSelectedUniversity(CONTINENTS[selectedContinent].countries[country].cities[firstCity].universities[0]);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedUniversity(CONTINENTS[selectedContinent].countries[selectedCountry].cities[city].universities[0]);
  };

  const fetchUniversityImage = async (university: string, city: string, country: string) => {
    setImageLoading(true);
    setImageError(null);
    
    // Validate environment variables
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const searchEngineId = import.meta.env.VITE_SEARCH_ENGINE_ID;
    
    if (!apiKey || !searchEngineId) {
      setImageError('API configuration is missing');
      setImageLoading(false);
      return;
    }

    try {
      // Construct search query
      const searchQuery = `${university} ${city} ${country} university campus building`;
      
      // Build URL with search parameters
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      const params = {
        key: apiKey,
        cx: searchEngineId,
        q: searchQuery,
        searchType: 'image',
        num: '1',
        imgSize: 'large',
        imgType: 'photo',
        safe: 'active'
      };

      // Add parameters to URL
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      // Fetch image
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we have results
      if (data.items && data.items.length > 0) {
        const imageUrl = data.items[0].link;
        
        // Validate image URL
        const imgResponse = await fetch(imageUrl, { method: 'HEAD' });
        if (imgResponse.ok) {
          setUniversityImage(imageUrl);
        } else {
          throw new Error('Image URL is not accessible');
        }
      } else {
        throw new Error('No images found');
      }
    } catch (error) {
      console.error('Error fetching university image:', error);
      setImageError(error instanceof Error ? error.message : 'Failed to load image');
      setUniversityImage('/placeholder-university.jpg');
    } finally {
      setImageLoading(false);
    }
  };

  const handleUniversityChange = (university: string) => {
    setSelectedUniversity(university);
    
    const cityName = CONTINENTS[selectedContinent].countries[selectedCountry].cities[selectedCity].name;
    const countryName = CONTINENTS[selectedContinent].countries[selectedCountry].name;
    
    fetchUniversityImage(university, cityName, countryName);
  };

  const calculateBudget = () => {
    const params: CostPredictionParams = {
      cityId: selectedCity,
      universityId: selectedUniversity,
      durationMonths: duration,
      accommodationLevel: preferences.accommodation,
      diningLevel: preferences.dining,
      nightlifeLevel: preferences.nightlife,
      activitiesLevel: preferences.activities,
      shoppingLevel: preferences.shopping,
      localTrips: trips.localTrips,
      internationalTrips: trips.internationalTrips
    };

    const cost = getPredictedCost(params);
    setPredictedCost(cost);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">Study Abroad Budget Calculator</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Plan your study abroad budget based on your destination and lifestyle preferences.
            Our calculator provides personalized estimates using real student data.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            {/* Destination Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-indigo-600" />
                Destination
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Continent
                  </label>
                  <select
                    value={selectedContinent}
                    onChange={(e) => handleContinentChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.entries(CONTINENTS).map(([key, continent]) => (
                      <option key={key} value={key}>
                        {continent.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.entries(CONTINENTS[selectedContinent].countries).map(([key, country]) => (
                      <option key={key} value={key}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.entries(CONTINENTS[selectedContinent].countries[selectedCountry].cities).map(([key, city]) => (
                      <option key={key} value={key}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University
                  </label>
                  <select
                    value={selectedUniversity}
                    onChange={(e) => handleUniversityChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {CONTINENTS[selectedContinent].countries[selectedCountry].cities[selectedCity].universities.map((uni) => (
                      <option key={uni} value={uni}>
                        {uni}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 relative h-48">
                  {imageLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={universityImage || '/placeholder-university.jpg'}
                        alt={`${selectedUniversity} campus`}
                        className="w-full h-48 object-cover rounded-lg shadow-md transition-opacity duration-300"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = '/placeholder-university.jpg';
                          setImageError('Failed to load university image');
                        }}
                      />
                      {imageError && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-500 bg-opacity-80 text-white text-sm p-2 rounded-b-lg">
                          {imageError}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <NumberInput
                  label="Duration (months)"
                  value={duration}
                  onChange={setDuration}
                  min={1}
                  max={24}
                />
              </div>
            </div>

            {/* Lifestyle Preferences */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Home className="w-6 h-6 text-indigo-600" />
                Lifestyle Preferences
              </h2>
              
              <div className="space-y-6">
                <PreferenceScale
                  label="Accommodation Standard"
                  value={preferences.accommodation}
                  onChange={(value) => setPreferences({ ...preferences, accommodation: value })}
                />
                
                <PreferenceScale
                  label="Dining & Food"
                  value={preferences.dining}
                  onChange={(value) => setPreferences({ ...preferences, dining: value })}
                />
                
                <PreferenceScale
                  label="Nightlife & Entertainment"
                  value={preferences.nightlife}
                  onChange={(value) => setPreferences({ ...preferences, nightlife: value })}
                />
                
                <PreferenceScale
                  label="Activities & Culture"
                  value={preferences.activities}
                  onChange={(value) => setPreferences({ ...preferences, activities: value })}
                />
                
                <PreferenceScale
                  label="Shopping & Personal Expenses"
                  value={preferences.shopping}
                  onChange={(value) => setPreferences({ ...preferences, shopping: value })}
                />
              </div>
            </div>

            {/* Travel Plans */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Plane className="w-6 h-6 text-indigo-600" />
                Travel Plans
              </h2>
              
              <div className="space-y-4">
                <NumberInput
                  label="Local Trips (within country)"
                  value={trips.localTrips}
                  onChange={(value) => setTrips({ ...trips, localTrips: value })}
                  min={0}
                  max={50}
                />

                <NumberInput
                  label="International Trips"
                  value={trips.internationalTrips}
                  onChange={(value) => setTrips({ ...trips, internationalTrips: value })}
                  min={0}
                  max={20}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-semibold mb-6">Your Study Plan</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Selected Destination</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                      <span className="text-gray-700">
                        {CONTINENTS[selectedContinent].countries[selectedCountry].cities[selectedCity].name}, 
                        {CONTINENTS[selectedContinent].countries[selectedCountry].name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                      <span className="text-gray-700">{selectedUniversity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <span className="text-gray-700">{duration} months</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Lifestyle Overview</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Accommodation</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < preferences.accommodation ? 'bg-indigo-600' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Dining</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < preferences.dining ? 'bg-indigo-600' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Nightlife</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < preferences.nightlife ? 'bg-indigo-600' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Activities</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < preferences.activities ? 'bg-indigo-600' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Shopping</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < preferences.shopping ? 'bg-indigo-600' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Travel Plans</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Local Trips</span>
                      <span className="font-medium">{trips.localTrips}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">International Trips</span>
                      <span className="font-medium">{trips.internationalTrips}</span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={calculateBudget}
                >
                  Calculate Budget
                </button>

                {predictedCost !== null && (
                  <div className="mt-6 bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Estimated Budget</h3>
                    <p className="text-2xl font-bold text-green-700">
                      €{predictedCost.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      This estimate is based on historical data and similar student profiles.
                      Actual costs may vary based on individual circumstances and market conditions.
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Location Insights</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Most students in {CONTINENTS[selectedContinent].countries[selectedCountry].cities[selectedCity].name} choose {preferences.accommodation >= 4 ? 'private apartments' : 'shared accommodation'}</li>
                    <li>{CONTINENTS[selectedContinent].countries[selectedCountry].cities[selectedCity].name} offers excellent student discounts for public transport</li>
                    <li>Consider student housing near {selectedUniversity} for convenience</li>
                    <li>Local student cards can provide significant savings on activities</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;