import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Mic, 
  Cloud, 
  TrendingUp, 
  MapPin, 
  Home, 
  BarChart3, 
  MessageCircle,
} from 'lucide-react';
import { CalendarIcon } from "@heroicons/react/24/outline";
import Button from '../components/Button';
import Badge from '../components/Badge';
import DashboardCard from '../components/DashboardCard';
import CustomTranslateDropdown from '../components/CustonTranslateDropdown';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  const [location, setLocation] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocation({ lat, lon });

        try {
          const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
          );

          const weather = res.data;
          setCurrentWeather({
            temp: weather.main.temp,
            condition: weather.weather[0].description,
            humidity: weather.main.humidity,
            rainfall: weather.rain ? `${weather.rain['1h']}mm` : '0mm'
          });
        } catch (err) {
          console.error('Error fetching weather:', err);
        }
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }, []);

  const [schemes] = useState([
    { name: 'PM-KISAN', amount: '₹6,000', status: 'Available', type: 'Direct Benefit' },
    { name: 'Crop Insurance', amount: 'Up to ₹2L', status: 'Apply Now', type: 'Insurance' },
    { name: 'Soil Health Card', amount: 'Free', status: 'Active', type: 'Testing' }
  ]);

  const handleNavigation = (path) => {
    navigate(path);
    console.log(`Navigating to: ${path}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Cloud className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium text-gray-900">
                {currentWeather ? `${Math.round(currentWeather.temp)}°C, ${currentWeather.condition}` : 'Loading weather...'}
              </span>
            </div>
            {currentWeather && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{currentWeather.humidity}% humidity</span>
                <span>{currentWeather.rainfall} rain</span>
                <MapPin className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DashboardCard
            title="Analyze Crop"
            subtitle="Take a photo to detect issues"
            icon={Camera}
            onClick={() => handleNavigation('/crop-analysis')}
            actions={[
              { 
                label: 'Start Analysis', 
                onClick: () => handleNavigation('/crop-analysis') 
              }
            ]}
          />

          <DashboardCard
            title="Voice Assistant"
            subtitle="Ask questions in your language"
            icon={Mic}
            onClick={() => handleNavigation('/voice-chat')}
            actions={[
              { 
                label: 'Start Chat', 
                onClick: () => handleNavigation('/voice-chat') 
              }
            ]}
          />

          <DashboardCard
            title="Generate Calender"
            subtitle="Get a tailored farming timetable"
            icon={CalendarIcon}
            onClick={() => handleNavigation('/calender')}
            actions={[
              { 
                label: 'Get Timetable', 
                onClick: () => handleNavigation('/calender') 
              }
            ]}
          />

          <DashboardCard
              title="Mandi Prices"
              subtitle="Get latest crop prices in your region"
              icon={TrendingUp}
              onClick={() => handleNavigation('/market-data')}
              actions={[
                { 
                  label: 'Get mandi prices', 
                  onClick: () => handleNavigation('/market-data') 
                }
              ]}
            />

            <DashboardCard
              title="Government Schemes"
              subtitle="Check government schemes you are eligible for"
              icon={TrendingUp}
              onClick={() => handleNavigation('/govt-schemes')}
              actions={[
                { 
                  label: 'Get mandi prices', 
                  onClick: () => handleNavigation('/govt-schemes') 
                }
              ]}
            />
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
        <div className="grid grid-cols-5 gap-1 px-2 py-1">
          <Button variant="ghost" className="flex flex-col items-center py-2 px-1" onClick={() => handleNavigation('/dashboard')}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-2 px-1" onClick={() => handleNavigation('/crop-analysis')}>
            <Camera className="h-5 w-5" />
            <span className="text-xs mt-1">Analyze</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-2 px-1" onClick={() => handleNavigation('/voice-chat')}>
            <Mic className="h-5 w-5" />
            <span className="text-xs mt-1">Voice</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-2 px-1" onClick={() => handleNavigation('/market-data')}>
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs mt-1">Market</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-2 px-1">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs mt-1">Chat</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
