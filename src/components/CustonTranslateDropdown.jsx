import React, { useState, useEffect, useContext } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const CustomTranslateDropdown = () => {
  const [selectedLang, setSelectedLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslateReady, setIsTranslateReady] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )googtrans=\/[a-z]{2}\/([a-z]{2})/);
    if (match && match[1]) {
      setSelectedLang(match[1]);
    }
  }, []);

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' }
  ];

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,ta,te,kn,gu,bn,ml,pa,mr',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        },
        'google_translate_element'
      );
      
      setTimeout(() => {
        setIsTranslateReady(true);
      }, 1000);
    };

    if (!window.google || !window.google.translate) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      window.googleTranslateElementInit();
    }
  }, []);

    const handleLanguageChange = (langCode) => {
    setSelectedLang(langCode);
    setIsOpen(false);
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
    window.location.reload();
    };

  const selectedLanguage = languages.find(lang => lang.code === selectedLang);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex items-center justify-between w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="flex items-center">
            <Globe className="h-4 w-4 mr-2 text-green-600" />
            <span className="truncate">
              {selectedLanguage ? selectedLanguage.native : 'Select Language'}
            </span>
          </div>
          <ChevronDown 
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1 max-h-64 overflow-y-auto">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`group flex items-center w-full px-4 py-2 text-sm hover:bg-green-50 hover:text-green-900 transition-colors duration-150 ${
                  selectedLang === language.code
                    ? 'bg-green-100 text-green-900 font-medium'
                    : 'text-gray-700'
                }`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{language.native}</span>
                  <span className="text-xs text-gray-500">{language.name}</span>
                </div>
                {selectedLang === language.code && (
                  <div className="ml-auto">
                    <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div id="google_translate_element" style={{ display: 'none' }}></div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default CustomTranslateDropdown;
