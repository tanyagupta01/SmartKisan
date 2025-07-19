import React, { useState, useCallback, useEffect } from 'react';
import { 
  Calendar,
  ArrowLeft, 
  MapPin,
  Thermometer,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import DashboardCard from '../components/DashboardCard';
import Button from '../components/Button';
import Navbar from '../components/Navbar';

// Translation utility (same as CropAnalysis)
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

const Calender = () => {
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [selectedLocation, setSelectedLocation] = useState('dadri');
  const [calendarData, setCalendarData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const { translateAndCache } = useTranslation();

  useEffect(() => {
    if (calendarData) {
      // Trigger translation of dynamic content
      const timer = setTimeout(() => {
        // Manually trigger Google Translate for dynamic content
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
  }, [calendarData]);

  const navigate = useNavigate();
  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  // Function to call Gemini API for calendar generation
  const generateCalendarWithGemini = async (crop, location) => {
    const prompt = `Generate a comprehensive farming calendar for ${crop} cultivation in ${location}. 

Please provide the response in the following JSON format:
{
  "crop": "${crop}",
  "location": "${location}",
  "season": "appropriate season (e.g., Rabi 2025-26, Kharif 2025)",
  "activities": [
    {
      "month": "Month Year",
      "tasks": [
        {
          "date": "Date range (e.g., Jan 1-15)",
          "activity": "Activity name",
          "description": "Detailed description of the activity",
        }
      ]
    }
  ],
  "weather": {
    "temperature": "Expected temperature range",
    "rainfall": "Expected rainfall",
    "humidity": "Expected humidity range",
    "sunshine": "Expected daily sunshine hours"
  }
}

Include all major farming activities like land preparation, sowing, irrigation, fertilization, pest control, disease management, weeding, and harvesting. Consider the local climate and soil conditions of ${location}. Provide at least 6 months of detailed farming schedule.`;

    try {
      const response = await fetch('http://localhost:5050/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          crop,
          location,
          prompt
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate calendar');
      }

      const data = await response.json();
      
      // Try to parse JSON from Gemini response
      try {
        const calendarJson = JSON.parse(data.calendar);
        return calendarJson;
      } catch (parseError) {
        console.warn('Failed to parse JSON, using fallback structure');
        return createFallbackCalendar(crop, location, data.calendar);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  };

  // Fallback function to create calendar structure if JSON parsing fails
  const createFallbackCalendar = (crop, location, responseText) => {
    return {
      crop: crop.charAt(0).toUpperCase() + crop.slice(1),
      location: location.charAt(0).toUpperCase() + location.slice(1).replace(/([A-Z])/g, ', $1'),
      season: "Rabi 2025-26",
      activities: [
        {
          month: "November 2025",
          tasks: [
            { date: "Nov 1-15", activity: "Land Preparation", description: "Deep plowing and adding organic manure" },
            { date: "Nov 15-30", activity: "Sowing", description: "Sow seeds at optimal depth"}
          ]
        },
        {
          month: "December 2025",
          tasks: [
            { date: "Dec 1-10", activity: "First Irrigation", description: "Light irrigation after germination" },
            { date: "Dec 20-31", activity: "Fertilizer Application", description: "Apply appropriate fertilizer" }
          ]
        }
      ],
      aiResponse: responseText // Store the original AI response for reference
    };
  };

  const generateCalendar = useCallback(async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const generatedCalendar = await generateCalendarWithGemini(selectedCrop, selectedLocation);
      
      setProgress(100);
      setCalendarData(generatedCalendar);
      
      clearInterval(progressInterval);
      
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Error generating calendar:', err);
      setError('Failed to generate calendar. Please try again.');
    } finally {
      setIsGenerating(false);
      clearInterval(progressInterval);
    }
  }, [selectedCrop, selectedLocation]);

  const cropOptions = [
    { value: 'wheat', label: 'Wheat' },
    { value: 'rice', label: 'Rice' },
    { value: 'corn', label: 'Corn' },
    { value: 'sugarcane', label: 'Sugarcane' },
    { value: 'potato', label: 'Potato' },
    { value: 'tomato', label: 'Tomato' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'soybean', label: 'Soybean' }
  ];

  const locationOptions = [
    { value: 'dadri', label: 'Dadri, Uttar Pradesh' },
    { value: 'delhi', label: 'Delhi, NCR' },
    { value: 'punjab', label: 'Punjab' },
    { value: 'haryana', label: 'Haryana' },
    { value: 'rajasthan', label: 'Rajasthan' },
    { value: 'maharashtra', label: 'Maharashtra' },
    { value: 'gujarat', label: 'Gujarat' },
    { value: 'karnataka', label: 'Karnataka' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => handleNavigation('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Farming Calendar</h1>
                <p className="text-sm text-gray-600">Gemini AI-Generated Farming Schedule</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Input Form Section */}
          <DashboardCard 
            title={
              <TranslatableText translationKey="generate_calendar_title">
                Generate AI Farming Calendar
              </TranslatableText>
            }
            className="mb-8"
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <TranslatableText 
                    translationKey="select_crop_label"
                    tag="label"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select Crop
                  </TranslatableText>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isGenerating}
                  >
                    {cropOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <TranslatableText 
                    translationKey="select_location_label"
                    tag="label"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select Location
                  </TranslatableText>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isGenerating}
                  >
                    {locationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generate Button - Using a stable container with translate="no" but translatable content */}
              <div className="text-center">
                <div translate="no">
                  <Button 
                    onClick={generateCalendar}
                    disabled={isGenerating}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <TranslatableText translationKey="generating_progress">
                          Generating... {progress}%
                        </TranslatableText>
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-5 w-5" />
                        <TranslatableText translationKey="generate_calendar_button">
                          Generate AI Calendar
                        </TranslatableText>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                  <p className="text-red-700" data-translate="dynamic">{error}</p>
                  <div translate="no">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={generateCalendar}
                      className="mt-2"
                      disabled={isGenerating}
                    >
                      <TranslatableText translationKey="try_again_button">
                        Try Again
                      </TranslatableText>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DashboardCard>

          {/* Generation Progress - Protected container with translatable content */}
          {isGenerating && (
            <DashboardCard 
              title={
                <TranslatableText translationKey="generating_calendar_title">
                  Generating Your AI Calendar
                </TranslatableText>
              } 
              className="mb-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4" translate="no">
                  <div className="w-full h-full border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                </div>
                <TranslatableText 
                  translationKey="ai_creating_title"
                  tag="h3"
                  className="text-xl font-semibold mb-2"
                >
                  AI is Creating Your Calendar
                </TranslatableText>
                <TranslatableText 
                  translationKey="gemini_analyzing_description"
                  tag="p"
                  className="text-gray-600 mb-4"
                >
                  Gemini AI is analyzing your crop and location to create a tailored farming schedule...
                </TranslatableText>
                <div className="bg-gray-200 rounded-full h-3 mb-4" translate="no">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">
                  {progress < 30 && (
                    <TranslatableText translationKey="progress_crop_requirements">
                      🌱 Analyzing crop requirements...
                    </TranslatableText>
                  )}
                  {progress >= 30 && progress < 60 && (
                    <TranslatableText translationKey="progress_climate_data">
                      🌍 Processing climate data...
                    </TranslatableText>
                  )}
                  {progress >= 60 && progress < 90 && (
                    <TranslatableText translationKey="progress_generating_schedule">
                      📊 Generating schedule...
                    </TranslatableText>
                  )}
                  {progress >= 90 && (
                    <TranslatableText translationKey="progress_finalizing_calendar">
                      ✅ Finalizing your calendar...
                    </TranslatableText>
                  )}
                </p>
              </div>
            </DashboardCard>
          )}

          {/* Calendar Results - Protected container with translatable dynamic content */}
          {calendarData && (
            <div className="space-y-6 mt-3">
              {/* Header Info */}
              <DashboardCard 
                title={
                  <TranslatableText translationKey="generated_calendar_title">
                    Your AI-Generated Farming Calendar
                  </TranslatableText>
                }
                className="border-l-4 border-l-green-500"
              >
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">🌾</span>
                    </div>
                    <div>
                      <TranslatableText 
                        translationKey="crop_label"
                        tag="p"
                        className="text-sm text-gray-600"
                      >
                        Crop
                      </TranslatableText>
                      <p className="font-semibold" data-translate="dynamic">{calendarData.crop}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <div>
                      <TranslatableText 
                        translationKey="location_label"
                        tag="p"
                        className="text-sm text-gray-600"
                      >
                        Location
                      </TranslatableText>
                      <p className="font-semibold" data-translate="dynamic">{calendarData.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <div>
                      <TranslatableText 
                        translationKey="season_label"
                        tag="p"
                        className="text-sm text-gray-600"
                      >
                        Season
                      </TranslatableText>
                      <p className="font-semibold" data-translate="dynamic">{calendarData.season}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    <div>
                      <TranslatableText 
                        translationKey="temperature_label"
                        tag="p"
                        className="text-sm text-gray-600"
                      >
                        Temperature
                      </TranslatableText>
                      <p className="font-semibold" data-translate="dynamic">{calendarData.weather?.temperature || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </DashboardCard>

              {/* Monthly Activities */}
              <div className="space-y-6">
                {calendarData.activities?.map((monthData, monthIndex) => (
                  <DashboardCard 
                    key={monthIndex}
                    title={<span className="text-lg text-blue-700" data-translate="dynamic">{monthData.month}</span>}
                  >
                    <div className="space-y-4">
                      {monthData.tasks?.map((task, taskIndex) => (
                        <div key={taskIndex} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" data-translate="dynamic">
                              {task.date}
                            </span>
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-semibold text-gray-900 mb-1" data-translate="dynamic">{task.activity}</h4>
                            <p className="text-gray-600 text-sm" data-translate="dynamic">{task.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DashboardCard>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div translate="no">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCalendarData(null);
                      setError(null);
                    }}
                  >
                    <TranslatableText translationKey="generate_new_calendar_button">
                      Generate New Calendar
                    </TranslatableText>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calender;