import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Search,
  RefreshCw,
  Calendar,
  BarChart3,
  Info,
  ArrowLeft, 
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

// Translation utility
const translateText = async (text, targetLang) => {
  // Check if Google Translate is available
  if (window.google && window.google.translate) {
    try {
      // Use Google Translate API if available
      const result = await window.google.translate.translate(text, { to: targetLang });
      return result.translatedText || text;
    } catch (error) {
      console.warn('Google Translate API failed:', error);
      return text;
    }
  }
  return text;
};

// Hook for managing translations
const useTranslation = () => {
  const [translations, setTranslations] = useState({});
  const [currentLang, setCurrentLang] = useState('en');

  const detectLanguage = useCallback(() => {
    const gtCombo = document.querySelector('.goog-te-combo');
    if (gtCombo) {
      return gtCombo.value || 'en';
    }
    
    return document.documentElement.lang || navigator.language.split('-')[0] || 'en';
  }, []);

  const translateAndCache = useCallback(async (key, text) => {
    const lang = detectLanguage();
    setCurrentLang(lang);

    if (lang === 'en' || translations[`${key}_${lang}`]) {
      return translations[`${key}_${lang}`] || text;
    }

    try {
      const translated = await translateText(text, lang);
      setTranslations(prev => ({
        ...prev,
        [`${key}_${lang}`]: translated
      }));
      return translated;
    } catch (error) {
      console.warn('Translation failed for:', key, error);
      return text;
    }
  }, [translations, detectLanguage]);

  return { translateAndCache, currentLang };
};

// Translatable Text Component
const TranslatableText = ({ children, translationKey, className = "", tag: Tag = "span" }) => {
  const { translateAndCache } = useTranslation();
  const [translatedText, setTranslatedText] = useState(children);

  useEffect(() => {
    if (translationKey && typeof children === 'string') {
      translateAndCache(translationKey, children).then(setTranslatedText);
    }
  }, [children, translationKey, translateAndCache]);

  return <Tag className={className}>{translatedText}</Tag>;
};

const MarketData = () => {
  const [loading, setLoading] = useState(false);
  const [mandis, setMandis] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [searchRadius, setSearchRadius] = useState('');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const navigate = useNavigate();
  
  // Add state for translated option texts
  const [translatedOptionTexts, setTranslatedOptionTexts] = useState({
    selectCrop: 'Select a crop…',
    selectRadius: 'Select radius…'
  });

  const { translateAndCache } = useTranslation();

  // Translate option texts
  useEffect(() => {
    const translateOptions = async () => {
      const selectCrop = await translateAndCache('select_crop_placeholder', 'Select a crop…');
      const selectRadius = await translateAndCache('select_radius_placeholder', 'Select radius…');
      
      setTranslatedOptionTexts({
        selectCrop,
        selectRadius
      });
    };
    
    translateOptions();
  }, [translateAndCache]);

  // Force re-translation when market data changes
  useEffect(() => {
    if (mandis.length > 0) {
      // Trigger translation of dynamic content
      const timer = setTimeout(() => {
        if (window.google && window.google.translate) {
          try {
            window.google.translate.getTranslateLib().then(() => {
              const elements = document.querySelectorAll('[data-translate="dynamic"]');
              elements.forEach(el => {
                if (!el.hasAttribute('translate')) {
                  el.setAttribute('translate', 'yes');
                }
              });
            });
          } catch (error) {
            console.warn('Could not trigger Google Translate:', error);
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [mandis]);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationError(false);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(true);
          setError('Unable to get your location. Using default location.');
          setLocation({ lat: 28.6139, lon: 77.2090 });
          setLoading(false);
        }
      );
    } else {
      setLocationError(true);
      setError('Geolocation is not supported by this browser.');
      setLocation({ lat: 28.6139, lon: 77.2090 });
    }
  };

  const fetchMarketData = async () => {
    if (!location) return;

    setLoading(true);
    setMandis([]);
    setError(null);

    try {
      const response = await fetch('https://smartkisan.onrender.com/api/market-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          searchRadius: Number(searchRadius),
          selectedCrop
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }

      const data = await response.json();
      if (data.error && data.fallback) {
        setError('Using sample data due to API limitations');
      }
      setMandis(data.mandis || []);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to load market data. Please try again.');
      setMandis([]);
    } finally {
      setLoading(false);
    }
  };

  const crops = ['wheat', 'rice', 'cotton', 'sugarcane', 'maize', 'chana', 'moong'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mandi Prices</h1>
                <p className="text-sm text-gray-600">Real-time prices from nearest mandis</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Error Alert */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-yellow-400 mr-3" translate="no" />
              <p className="text-yellow-800" data-translate="dynamic">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <TranslatableText 
                translationKey="select_crop_label"
                tag="label" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Crop
              </TranslatableText>
              <div translate="no">
                <select
                  value={selectedCrop}
                  onChange={(e) => {
                    setSelectedCrop(e.target.value);
                    setMandis([]);
                    setHasFetched(false);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="" disabled>
                    {translatedOptionTexts.selectCrop}
                  </option>
                  {crops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop.charAt(0).toUpperCase() + crop.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <TranslatableText 
                translationKey="search_radius_label"
                tag="label" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Radius
              </TranslatableText>
              <div translate="no">
                <select
                  value={searchRadius}
                  onChange={(e) => {
                    setSearchRadius(e.target.value);
                    setMandis([]);
                    setHasFetched(false);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="" disabled>
                    {translatedOptionTexts.selectRadius}
                  </option>
                  {[10, 25, 50, 100, 200].map((r) => (
                    <option key={r} value={r}>{r} km</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2 flex items-end">
              <div translate="no" className="w-full md:w-auto">
                <Button
                  onClick={() => { setHasFetched(true); fetchMarketData(); }}
                  disabled={loading || !location || !selectedCrop || !searchRadius}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      <TranslatableText translationKey="updating_button">
                        Updating...
                      </TranslatableText>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      <TranslatableText translationKey="search_mandis_button">
                        Search Mandis
                      </TranslatableText>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Market Price Cards */}
        {hasFetched && mandis.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mandis.map((mandi, index) => {
              const cropData = mandi.crops[selectedCrop];
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    {/* Mandi Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900" data-translate="dynamic">
                          {mandi.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" translate="no" />
                          <span data-translate="dynamic">{mandi.distance}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" translate="no" />
                          <span data-translate="dynamic">{cropData?.lastUpdated || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price Info */}
                    {cropData ? (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600 capitalize" data-translate="dynamic">
                            {selectedCrop}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900" data-translate="dynamic">
                          {cropData.price}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <div className="text-gray-500 text-sm">
                          <TranslatableText translationKey="no_data_available">
                            No data available for {selectedCrop}
                          </TranslatableText>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {hasFetched && mandis.length === 0 && !loading && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" translate="no" />
            <TranslatableText 
              translationKey="no_market_data_title"
              tag="h3" 
              className="text-lg font-medium text-gray-900 mb-2"
            >
              No Market Data Available
            </TranslatableText>
            <TranslatableText 
              translationKey="no_market_data_description"
              tag="p" 
              className="text-gray-500 mb-4"
            >
              Try increasing the search radius or check your location settings
            </TranslatableText>
            <div translate="no">
              <Button
                onClick={() => { setHasFetched(true); fetchMarketData(); }}
                disabled={!location}
                className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                <TranslatableText translationKey="retry_search_button">
                  Retry Search
                </TranslatableText>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketData;