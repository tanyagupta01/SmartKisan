import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  ArrowLeft, 
  Loader2, 
  User,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { resizeAndCompress, fastCompress } from '../utils/compress-image';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import DashboardCard from '../components/DashboardCard';

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
    // Detect current Google Translate language
    const gtCombo = document.querySelector('.goog-te-combo');
    if (gtCombo) {
      return gtCombo.value || 'en';
    }
    
    // Fallback: check HTML lang attribute or document language
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

// Pre-configured axios instance
const apiClient = axios.create({
  baseURL: 'https://smartkisan.onrender.com',
  // baseURL: 'http://localhost:5050',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const CropAnalysis = () => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);
  const [progress, setProgress] = useState(0);

  const { translateAndCache } = useTranslation();

  // Force re-translation when analysis result changes
  useEffect(() => {
    if (analysisResult) {
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
  }, [analysisResult]);

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawDataUrl = e.target.result;
        // Use fast compression for quicker processing
        const compressed = await fastCompress(rawDataUrl, 384, 0.7);
        setSelectedImage(compressed);
        setAnalysisResult(null);
        setProcessingTime(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCameraCapture = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  const handleGalleryUpload = useCallback(() => {
    galleryInputRef.current?.click();
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const startTime = Date.now();
      
      // const { data } = await axios.post('https://smartkisan.onrender.com/api/analyze-image', {
      const { data } = await axios.post('http://localhost:5050/api/analyze-image', {
        imageBase64: selectedImage
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      setProgress(100);
      setAnalysisResult(data.result);
      setProcessingTime(totalTime);
      
      clearInterval(progressInterval);
      
    } catch (err) {
      clearInterval(progressInterval);
      const status = err.response?.status || 500;
      const payload = err.response?.data || { error: err.message };
      
      console.error(`❌ /api/analyze-image → HTTP ${status}`, JSON.stringify(payload, null, 2));
      
      // Show error to user
      setAnalysisResult({
        crop: 'Unknown',
        disease: 'Analysis Failed',
        description: 'Failed to analyze the image. Please try again with a clearer photo.',
        treatment: ['Retake photo with better lighting', 'Ensure crop is clearly visible', 'Try again'],
        mandi: []
      });
    } finally {
      setIsAnalyzing(false);
      clearInterval(progressInterval);
    }
  }, [selectedImage]);

  const navigate = useNavigate();
  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => handleNavigation('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌾</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Crop Analysis</h1>
                <p className="text-sm text-gray-600">AI-Powered Disease Detection</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Image Upload Section */}
          <DashboardCard
            title="Upload or Capture Crop Image"
            className="mb-8"
          >
            <div className="space-y-6">
              {/* Image Preview */}
              {selectedImage ? (
                <div className="relative">
                  <img 
                    src={selectedImage} 
                    alt="Selected crop" 
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedImage(null);
                      setAnalysisResult(null);
                      setProcessingTime(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-green-400 transition-colors">
                  <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">No image selected</p>
                  <p className="text-sm text-gray-500">Take a clear photo of your crop showing any affected areas</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleCameraCapture}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isAnalyzing}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Capture Photo
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleGalleryUpload}
                  disabled={isAnalyzing}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload from Gallery
                </Button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Analyze Button */}
              {selectedImage && !analysisResult && (
                <div className="text-center">
                  <div translate="no">
                    <Button 
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          <TranslatableText 
                            translationKey="analyzing_progress"
                          >
                            Analyzing... {progress}%
                          </TranslatableText>
                        </>
                      ) : (
                        <TranslatableText 
                          translationKey="analyze_button"
                        >
                          Analyze Crop Health
                        </TranslatableText>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DashboardCard>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <DashboardCard className="mb-8">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4" translate="no">
                  <div className="w-full h-full border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                </div>
                <TranslatableText 
                  translationKey="ai_analysis_title"
                  tag="h3"
                  className="text-xl font-semibold mb-2"
                >
                  AI Analysis in Progress
                </TranslatableText>
                <TranslatableText 
                  translationKey="processing_description"
                  tag="p"
                  className="text-gray-600 mb-4"
                >
                  Processing your crop image using advanced computer vision...
                </TranslatableText>
                <div className="bg-gray-200 rounded-full h-3 mb-4" translate="no">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">
                  {progress < 30 && (
                    <TranslatableText translationKey="progress_analyzing">
                      🔍 Analyzing image quality...
                    </TranslatableText>
                  )}
                  {progress >= 30 && progress < 60 && (
                    <TranslatableText translationKey="progress_identifying">
                      🌱 Identifying crop species...
                    </TranslatableText>
                  )}
                  {progress >= 60 && progress < 90 && (
                    <TranslatableText translationKey="progress_detecting">
                      🔬 Detecting diseases and pests...
                    </TranslatableText>
                  )}
                  {progress >= 90 && (
                    <TranslatableText translationKey="progress_finalizing">
                      ✅ Finalizing results...
                    </TranslatableText>
                  )}
                </p>
              </div>
            </DashboardCard>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Main Result Card */}
              <DashboardCard
                title="Analysis Results"
                subtitle={processingTime ? `Completed in ${(processingTime / 1000).toFixed(1)}s` : undefined}
                className="border-l-4 border-l-green-500"
              >
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <TranslatableText 
                        translationKey="crop_type_label"
                        tag="h4"
                        className="font-semibold text-gray-700 mb-1"
                      >
                        Crop Type
                      </TranslatableText>
                      <p className="text-lg font-bold text-gray-900" data-translate="dynamic">
                        {analysisResult.crop}
                      </p>
                    </div>
                    <div>
                      <TranslatableText 
                        translationKey="detected_issue_label"
                        tag="h4"
                        className="font-semibold text-gray-700 mb-1"
                      >
                        Detected Issue
                      </TranslatableText>
                      <p className="text-lg font-bold text-gray-900" data-translate="dynamic">
                        {analysisResult.disease}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700" data-translate="dynamic">
                      {analysisResult.description}
                    </p>
                  </div>
                </div>
              </DashboardCard>

              {/* Treatment Recommendations */}
              <DashboardCard
                title="Treatment Recommendations"
                className="text-blue-700"
              >
                <ul className="space-y-3">
                  {analysisResult.treatment.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" translate="no"></div>
                      <span className="text-gray-700" data-translate="dynamic">{item}</span>
                    </li>
                  ))}
                </ul>
              </DashboardCard>

              {/* Mandi Information - Only if available */}
              {analysisResult.mandi && analysisResult.mandi.length > 0 && (
                <DashboardCard
                  title="Nearby Market Information"
                  className="text-green-700"
                >
                  <ul className="space-y-3">
                    {analysisResult.mandi.map((market, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" translate="no"></div>
                        <span className="text-gray-700" data-translate="dynamic">{market}</span>
                      </li>
                    ))}
                  </ul>
                </DashboardCard>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div translate="no">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedImage(null);
                      setAnalysisResult(null);
                      setProcessingTime(null);
                    }}
                  >
                    <TranslatableText translationKey="analyze_another_button">
                      Analyze Another Image
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

export default CropAnalysis;