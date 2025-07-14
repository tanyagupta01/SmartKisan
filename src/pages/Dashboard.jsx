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
  MessageCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Button Component
const Button = React.forwardRef(({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "hover:bg-gray-100",
    link: "text-blue-600 underline-offset-4 hover:underline",
  };
  
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      className={classes}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

// Badge Component
const Badge = ({ className = '', variant = 'default', children, ...props }) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variantClasses = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "text-gray-900 border-gray-300",
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Card Components
const Card = React.forwardRef(({ className = '', children, ...props }, ref) => {
  const classes = `rounded-2xl bg-white text-gray-900 shadow-sm ${className}`;
  
  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
});

const CardHeader = React.forwardRef(({ className = '', children, ...props }, ref) => {
  const classes = `flex flex-col space-y-1.5 p-6 ${className}`;
  
  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
});

const CardTitle = React.forwardRef(({ className = '', children, ...props }, ref) => {
  const classes = `text-lg font-semibold leading-none tracking-tight ${className}`;
  
  return (
    <h3
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </h3>
  );
});

const CardContent = React.forwardRef(({ className = '', children, ...props }, ref) => {
  const classes = `p-8 pt-0 ${className}`;
  
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

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
      {/* Header */}
      <header className="bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌾</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SmartKisan Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, Farmer!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl h-60 flex items-center justify-center" onClick={() => handleNavigation('/crop-analysis')}>
            <CardContent className="p-6 text-center">
              <Camera className="text-white h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg text-white font-semibold mb-2">Analyze Crop</h3>
              <p className="text-blue-100 text-sm">Take a photo to detect issues</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 flex items-center justify-center" onClick={() => handleNavigation('/voice-chat')}>
            <CardContent className="p-6 text-center">
              <Mic className="text-white h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg text-white font-semibold mb-2">Voice Assistant</h3>
              <p className="text-purple-100 text-sm">Ask questions in your language</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white border-0 flex items-center justify-center" onClick={() => handleNavigation('/market-data')}>
            <CardContent className="p-6 text-center">
              <TrendingUp className="text-white h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg text-white font-semibold mb-2">Market Trends</h3>
              <p className="text-green-100 text-sm">Check latest crop prices</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Layout with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weather Card */}
            <Card className="bg-gradient-to-r from-sky-400 to-blue-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">Today's Weather</h3>
                  </div>
                  <MapPin className="h-5 w-5" />
                </div>

                {currentWeather ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-3xl font-bold">{currentWeather.temp}°C</p>
                      <p className="text-sm opacity-90 capitalize">{currentWeather.condition}</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{currentWeather.humidity}%</p>
                      <p className="text-sm opacity-90">Humidity</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{currentWeather.rainfall}</p>
                      <p className="text-sm opacity-90">Expected Rainfall</p>
                    </div>
                    <div>
                      <Badge className="bg-white/20 text-white border-0">Perfect for Sowing</Badge>
                    </div>
                  </div>
                ) : (
                  <p>Loading weather...</p>
                )}
              </CardContent>
            </Card>

            {/* Market Prices */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                  Market Prices
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {marketPrices.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.crop}</h4>
                        <p className="text-xl font-bold text-gray-900">{item.price}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                          {item.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Government Schemes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Government Schemes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {schemes.map((scheme, index) => (
                    <div key={index} className="py-3 border-b last:border-b-0">
                      <h4 className="font-semibold text-gray-900 mb-1">{scheme.name}</h4>
                      <p className="text-lg font-bold text-green-600 mb-2">{scheme.amount}</p>
                      <Badge 
                        className={`text-xs ${scheme.status === 'Active' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {scheme.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Today's Tips */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Today's Tips</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600 font-semibold">🌱</span>
                    <p className="text-sm text-gray-700">Perfect weather for wheat sowing in your region</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-semibold">💧</span>
                    <p className="text-sm text-gray-700">Light irrigation recommended for cotton crops</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-yellow-600 font-semibold">⚠️</span>
                    <p className="text-sm text-gray-700">Watch for pest activity in tomato plants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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