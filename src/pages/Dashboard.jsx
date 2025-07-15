import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Mic, 
  Cloud, 
  TrendingUp, 
  MapPin, 
  Bell, 
  User, 
  Settings, 
  Home, 
  BarChart3, 
  MessageCircle,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  SunIcon
} from 'lucide-react';
import Button from '../components/Button';
import Badge from '../components/Badge';
import DashboardCard from '../components/DashboardCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  const [location, setLocation] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Get user's location
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

  const [marketPrices] = useState([
    { crop: 'Wheat', price: '₹2,150/quintal', change: '+5.2%', trend: 'up' },
    { crop: 'Rice', price: '₹3,200/quintal', change: '+2.1%', trend: 'up' },
    { crop: 'Cotton', price: '₹5,800/quintal', change: '-1.5%', trend: 'down' },
    { crop: 'Sugarcane', price: '₹340/quintal', change: '+3.8%', trend: 'up' }
  ]);

  const [schemes] = useState([
    { name: 'PM-KISAN', amount: '₹6,000', status: 'Available', type: 'Direct Benefit' },
    { name: 'Crop Insurance', amount: 'Up to ₹2L', status: 'Apply Now', type: 'Insurance' },
    { name: 'Soil Health Card', amount: 'Free', status: 'Active', type: 'Testing' }
  ]);

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const handleNavigation = (path) => {
    navigate(path);
    console.log(`Navigating to: ${path}`);
  };

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar/>

      <div id="google_translate_element" className="flex justify-center mt-4">
        <select
          className="border px-2 py-1 rounded-md text-md text-gray-800"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DashboardCard
            title="Analyze Crop"
            subtitle="Take a photo to detect issues"
            icon={Camera}
            onClick={() => handleNavigation('/crop-analysis')}
            actions={[
              { 
                label: 'Start Analysis', 
                icon: Camera, 
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
                icon: Mic, 
                onClick: () => handleNavigation('/voice-chat') 
              }
            ]}
          />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Weather Card */}
            <DashboardCard
              title="Today's Weather"
              subtitle={currentWeather ? `${currentWeather.temp}°C - ${currentWeather.condition}` : 'Loading weather...'}
              icon={Cloud}
              // badge="Perfect for Sowing"
            >
              {currentWeather && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white">
                  <div>
                    <p className="text-lg font-semibold">{currentWeather.humidity}%</p>
                    <p className="text-sm opacity-90">Humidity</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{currentWeather.rainfall}</p>
                    <p className="text-sm opacity-90">Expected Rainfall</p>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Current Location</span>
                  </div>
                </div>
              )}
            </DashboardCard>

            {/* Market Prices */}
            <DashboardCard
              title="Market Prices"
              subtitle="Latest crop prices in your region"
              icon={TrendingUp}
              actions={[
                { 
                  label: 'View All', 
                  icon: TrendingUp, 
                  onClick: () => handleNavigation('/market-data') 
                }
              ]}
            >
              <div className="space-y-4">
                {marketPrices.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.crop}</h4>
                      <p className="text-lg font-bold text-gray-900">{item.price}</p>
                    </div>
                    <div className="text-right flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                        {item.change}
                      </span>
                      {item.trend === 'up' ? (
                        <ArrowUpIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Government Schemes */}
            <DashboardCard
              title="Government Schemes"
              subtitle="Available schemes for farmers"
              badge="3 Active"
            >
              <div className="space-y-4">
                {schemes.map((scheme, index) => (
                  <div key={index} className="py-3 border-b last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{scheme.name}</h4>
                      <Badge 
                        className={`text-xs ${scheme.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
                      >
                        {scheme.status}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-green-600 mb-1">{scheme.amount}</p>
                    <p className="text-sm text-gray-500">{scheme.type}</p>
                  </div>
                ))}
              </div>
            </DashboardCard>

          </div>
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