import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  RefreshCw,
  Calendar,
  Users,
  Info,
  ArrowLeft, 
  AlertCircle,
  CheckCircle,
  Clock,
  IndianRupee,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

const translateText = async (text, targetLang) => {
  if (window.google && window.google.translate) {
    try {
      const result = await window.google.translate.translate(text, { to: targetLang });
      return result.translatedText || text;
    } catch (error) {
      console.warn('Google Translate API failed:', error);
      return text;
    }
  }
  return text;
};

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

const GovernmentSchemes = () => {
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const navigate = useNavigate();
  
  // Add state for translated option texts
  const [translatedOptionTexts, setTranslatedOptionTexts] = useState({
    selectCategory: 'Select category…',
    selectState: 'Select state…'
  });

  const { translateAndCache } = useTranslation();

  // Translate option texts
  useEffect(() => {
    const translateOptions = async () => {
      const selectCategory = await translateAndCache('select_category_placeholder', 'Select category…');
      const selectState = await translateAndCache('select_state_placeholder', 'Select state…');
      
      setTranslatedOptionTexts({
        selectCategory,
        selectState
      });
    };
    
    translateOptions();
  }, [translateAndCache]);

  // Force re-translation when schemes data changes
  useEffect(() => {
    if (schemes.length > 0) {
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
  }, [schemes]);

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
          setError('Unable to get your location. Please select your state manually.');
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

  const fetchGovernmentSchemes = async () => {
    if (!selectedState && !location) return;

    setLoading(true);
    setSchemes([]);
    setError(null);

    try {
      const response = await fetch('http://localhost:5050/api/government-schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location?.lat,
          lon: location?.lon,
          selectedCategory,
          selectedState
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch government schemes');
      }

      const data = await response.json();
      if (data.error && data.fallback) {
        setError('Using sample data due to API limitations');
      }
      setSchemes(data.schemes || []);
    } catch (err) {
      console.error('Error fetching government schemes:', err);
      setError('Failed to load government schemes. Please try again.');
      setSchemes([
        {
          id: 1,
          name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
          category: "financial",
          benefits: "₹6,000 per year",
          eligibility: "Small and marginal farmers with cultivable land up to 2 hectares",
          applicationDeadline: "Open throughout the year",
          status: "active",
          documents: ["Aadhaar Card", "Land Records", "Bank Account Details"],
          lastUpdated: "2024-01-15"
        },
        {
          id: 2,
          name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
          category: "insurance",
          benefits: "Up to 100% sum insured for crop loss",
          eligibility: "All farmers including sharecroppers and tenant farmers",
          applicationDeadline: "Before sowing season",
          status: "active",
          documents: ["Land Records", "Sowing Certificate", "Bank Account Details"],
          lastUpdated: "2024-01-10"
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'financial', label: 'Financial Support' },
    { value: 'insurance', label: 'Crop Insurance' },
    { value: 'credit', label: 'Credit & Loans' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'subsidy', label: 'Subsidies' }
  ];

  const states = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
    'Tamil Nadu', 'Uttar Pradesh', 'West Bengal'
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'deadline-approaching':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'closed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'financial':
        return <IndianRupee className="h-4 w-4 text-green-600" />;
      case 'insurance':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'credit':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'technical':
        return <Info className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

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
                <h1 className="text-xl font-bold text-gray-900">Government Schemes</h1>
                <p className="text-sm text-gray-600">Agricultural schemes and subsidies for farmers</p>
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
                translationKey="select_category_label"
                tag="label" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Scheme Category
              </TranslatableText>
              <div translate="no">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSchemes([]);
                    setHasFetched(false);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">
                    All Categories
                  </option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <TranslatableText 
                translationKey="select_state_label"
                tag="label" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                State
              </TranslatableText>
              <div translate="no">
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSchemes([]);
                    setHasFetched(false);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="" disabled>
                    {translatedOptionTexts.selectState}
                  </option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2 flex items-end">
              <div translate="no" className="w-full md:w-auto">
                <Button
                  onClick={() => { setHasFetched(true); fetchGovernmentSchemes(); }}
                  disabled={loading || (!selectedState && locationError)}
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
                      <TranslatableText translationKey="search_schemes_button">
                        Search Schemes
                      </TranslatableText>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scheme Cards */}
        {hasFetched && schemes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Scheme Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 ml-2" data-translate="dynamic">
                          {scheme.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center ml-4">
                      {getStatusIcon(scheme.status)}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-4">
                    <TranslatableText 
                      translationKey="benefits_label"
                      tag="h4" 
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      Benefits
                    </TranslatableText>
                    <p className="text-sm text-green-600 font-medium" data-translate="dynamic">
                      {scheme.benefits}
                    </p>
                  </div>

                  {/* Eligibility */}
                  <div className="mb-4">
                    <TranslatableText 
                      translationKey="eligibility_label"
                      tag="h4" 
                      className="text-sm font-medium text-gray-700 mb-1"
                    >
                      Eligibility
                    </TranslatableText>
                    <p className="text-sm text-gray-600" data-translate="dynamic">
                      {scheme.eligibility}
                    </p>
                  </div>

                  {/* Application Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <TranslatableText 
                        translationKey="deadline_label"
                        tag="h4" 
                        className="text-sm font-medium text-gray-700 mb-1"
                      >
                        Deadline
                      </TranslatableText>
                      <p className="text-sm text-gray-600" data-translate="dynamic">
                        {scheme.applicationDeadline}
                      </p>
                    </div>
                  </div>

                  {/* Documents Required */}
                  {scheme.documents && (
                    <div className="mb-4">
                      <TranslatableText 
                        translationKey="documents_required_label"
                        tag="h4" 
                        className="text-sm font-medium text-gray-700 mb-2"
                      >
                        Documents Required
                      </TranslatableText>
                      <div className="flex flex-wrap gap-2">
                        {scheme.documents.map((doc, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                            data-translate="dynamic"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span data-translate="dynamic">{scheme.lastUpdated}</span>
                      </div>
                    </div>
                    {scheme.website && (
                      <div translate="no">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(scheme.website, '_blank')}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {hasFetched && schemes.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" translate="no" />
            <TranslatableText 
              translationKey="no_schemes_title"
              tag="h3" 
              className="text-lg font-medium text-gray-900 mb-2"
            >
              No Schemes Available
            </TranslatableText>
            <div translate="no">
              <Button
                onClick={() => { setHasFetched(true); fetchGovernmentSchemes(); }}
                disabled={!selectedState && locationError}
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

        {/* Initial State */}
        {!hasFetched && !loading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" translate="no" />
            <TranslatableText 
              translationKey="search_schemes_title"
              tag="h3" 
              className="text-lg font-medium text-gray-900 mb-2"
            >
              Find Government Schemes
            </TranslatableText>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentSchemes;