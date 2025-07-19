// import React, { useState, useEffect } from 'react';
// import { 
//   TrendingUp, 
//   MapPin, 
//   Search, 
//   Filter, 
//   ArrowUpIcon,
//   ArrowDownIcon,
//   RefreshCw,
//   Calendar,
//   BarChart3,
//   Info
// } from 'lucide-react';
// import Navbar from '../components/Navbar';
// import DashboardCard from '../components/DashboardCard';
// import Button from '../components/Button';

// const MarketData = () => {
//   const [loading, setLoading] = useState(false);
//   const [mandis, setMandis] = useState([]);
//   const [selectedCrop, setSelectedCrop] = useState('wheat');
//   const [location, setLocation] = useState(null);
//   const [searchRadius, setSearchRadius] = useState(50);

//   // Sample data - replace with Gemini API calls
//   const sampleMandis = [
//     {
//       name: "Ludhiana Mandi",
//       distance: "12 km",
//       crops: {
//         wheat: { price: "₹2,150/quintal", change: "+5.2%", trend: "up", lastUpdated: "2 hours ago" },
//         rice: { price: "₹3,200/quintal", change: "+2.1%", trend: "up", lastUpdated: "1 hour ago" },
//         cotton: { price: "₹5,800/quintal", change: "-1.5%", trend: "down", lastUpdated: "3 hours ago" }
//       }
//     },
//     {
//       name: "Jalandhar Mandi",
//       distance: "25 km",
//       crops: {
//         wheat: { price: "₹2,080/quintal", change: "+3.1%", trend: "up", lastUpdated: "4 hours ago" },
//         rice: { price: "₹3,150/quintal", change: "+1.8%", trend: "up", lastUpdated: "2 hours ago" },
//         cotton: { price: "₹5,750/quintal", change: "-2.1%", trend: "down", lastUpdated: "1 hour ago" }
//       }
//     },
//     {
//       name: "Amritsar Mandi",
//       distance: "45 km",
//       crops: {
//         wheat: { price: "₹2,200/quintal", change: "+6.8%", trend: "up", lastUpdated: "1 hour ago" },
//         rice: { price: "₹3,300/quintal", change: "+4.2%", trend: "up", lastUpdated: "3 hours ago" },
//         cotton: { price: "₹5,900/quintal", change: "+0.5%", trend: "up", lastUpdated: "2 hours ago" }
//       }
//     }
//   ];

//   useEffect(() => {
//     getUserLocation();
//     setMandis(sampleMandis);
//   }, []);

//   const getUserLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLocation({
//             lat: position.coords.latitude,
//             lon: position.coords.longitude
//           });
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//         }
//       );
//     }
//   };

//   const fetchMarketData = async () => {
//     setLoading(true);
//     try {
//       // Gemini API integration will go here
//       const prompt = `Find agricultural mandis (markets) within ${searchRadius}km of coordinates ${location?.lat}, ${location?.lon}. 
//       For each mandi, provide current market prices for wheat, rice, cotton, sugarcane, and other major crops.
//       Include distance from location, price trends, and last update time.
//       Format the response as JSON with mandi name, distance, and crop prices with trends.`;

//       // For now, using sample data
//       // const response = await callGeminiAPI(prompt);
      
//       setTimeout(() => {
//         setMandis(sampleMandis);
//         setLoading(false);
//       }, 1000);
//     } catch (error) {
//       console.error('Error fetching market data:', error);
//       setLoading(false);
//     }
//   };

//   const callGeminiAPI = async (prompt) => {
//     // Replace with your Gemini API integration
//     const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${import.meta.env.VITE_GEMINI_API_KEY}`
//       },
//       body: JSON.stringify({
//         contents: [{
//           parts: [{
//             text: prompt
//           }]
//         }]
//       })
//     });
//     return await response.json();
//   };

//   const getTrendColor = (trend) => {
//     return trend === 'up' ? 'text-green-600' : 'text-red-600';
//   };

//   const getTrendIcon = (trend) => {
//     return trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
//   };

//   const crops = ['wheat', 'rice', 'cotton', 'sugarcane', 'maize'];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
      
//       <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Prices</h1>
//           <p className="text-gray-600">Real-time prices from nearest mandis</p>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Select Crop</label>
//               <select 
//                 value={selectedCrop}
//                 onChange={(e) => setSelectedCrop(e.target.value)}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//               >
//                 {crops.map(crop => (
//                   <option key={crop} value={crop}>
//                     {crop.charAt(0).toUpperCase() + crop.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Search Radius</label>
//               <select 
//                 value={searchRadius}
//                 onChange={(e) => setSearchRadius(parseInt(e.target.value))}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//               >
//                 <option value={25}>25 km</option>
//                 <option value={50}>50 km</option>
//                 <option value={100}>100 km</option>
//                 <option value={200}>200 km</option>
//               </select>
//             </div>

//             <div className="md:col-span-2 flex items-end">
//               <Button 
//                 onClick={fetchMarketData}
//                 disabled={loading}
//                 className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3"
//               >
//                 {loading ? (
//                   <>
//                     <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
//                     Updating...
//                   </>
//                 ) : (
//                   <>
//                     <Search className="h-4 w-4 mr-2" />
//                     Search Mandis
//                   </>
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Market Price Cards */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//           {mandis.map((mandi, index) => {
//             const cropData = mandi.crops[selectedCrop];
//             const TrendIcon = getTrendIcon(cropData?.trend);
            
//             return (
//               <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
//                 <div className="p-6">
//                   {/* Mandi Header */}
//                   <div className="flex justify-between items-start mb-4">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900">{mandi.name}</h3>
//                       <div className="flex items-center text-sm text-gray-500 mt-1">
//                         <MapPin className="h-4 w-4 mr-1" />
//                         {mandi.distance}
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="flex items-center text-sm text-gray-500">
//                         <Calendar className="h-4 w-4 mr-1" />
//                         {cropData?.lastUpdated}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Price Info */}
//                   {cropData ? (
//                     <div className="mb-4">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="text-sm text-gray-600 capitalize">{selectedCrop}</span>
//                         <div className="flex items-center">
//                           <span className={`text-sm font-medium ${getTrendColor(cropData.trend)} mr-1`}>
//                             {cropData.change}
//                           </span>
//                           <TrendIcon className={`h-4 w-4 ${getTrendColor(cropData.trend)}`} />
//                         </div>
//                       </div>
//                       <div className="text-2xl font-bold text-gray-900">{cropData.price}</div>
//                     </div>
//                   ) : (
//                     <div className="mb-4">
//                       <div className="text-gray-500 text-sm">No data available for {selectedCrop}</div>
//                     </div>
//                   )}

//                   {/* All Crops Summary */}
//                   <div className="border-t pt-4">
//                     <h4 className="text-sm font-medium text-gray-700 mb-3">Other Crops</h4>
//                     <div className="grid grid-cols-2 gap-2">
//                       {Object.entries(mandi.crops)
//                         .filter(([crop]) => crop !== selectedCrop)
//                         .slice(0, 4)
//                         .map(([crop, data]) => {
//                           const Icon = getTrendIcon(data.trend);
//                           return (
//                             <div key={crop} className="text-xs">
//                               <div className="flex justify-between items-center">
//                                 <span className="text-gray-600 capitalize">{crop}</span>
//                                 <div className="flex items-center">
//                                   <span className={getTrendColor(data.trend)}>{data.change}</span>
//                                   <Icon className={`h-3 w-3 ml-1 ${getTrendColor(data.trend)}`} />
//                                 </div>
//                               </div>
//                               <div className="font-medium text-gray-900">{data.price}</div>
//                             </div>
//                           );
//                         })}
//                     </div>
//                   </div>
//                 </div>

//               </div>
//             );
//           })}
//         </div>

//         {/* Empty State */}
//         {mandis.length === 0 && !loading && (
//           <div className="text-center py-12">
//             <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No Market Data Available</h3>
//             <p className="text-gray-500 mb-4">Try increasing the search radius or check your location settings</p>
//             <Button onClick={fetchMarketData} className="bg-green-600 hover:bg-green-700 text-white">
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Retry Search
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MarketData;

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Search, 
  Filter, 
  ArrowUpIcon,
  ArrowDownIcon,
  RefreshCw,
  Calendar,
  BarChart3,
  Info,
  AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import Button from '../components/Button';

const MarketData = () => {
  const [loading, setLoading] = useState(false);
  const [mandis, setMandis] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [location, setLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(50);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (location && !locationError) {
      fetchMarketData();
    }
  }, [location, selectedCrop]);

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
          // Use a default location (example: Delhi)
          setLocation({
            lat: 28.6139,
            lon: 77.2090
          });
          setLoading(false);
        }
      );
    } else {
      setLocationError(true);
      setError('Geolocation is not supported by this browser.');
      setLocation({
        lat: 28.6139,
        lon: 77.2090
      });
    }
  };

  const fetchMarketData = async () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5050/api/market-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          searchRadius: searchRadius,
          selectedCrop: selectedCrop
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }

      const data = await response.json();
      
      if (data.error && data.fallback) {
        setError('Using sample data due to API limitations');
      }
      
      setMandis(data.mandis || []);
      
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError('Failed to load market data. Please try again.');
      setMandis([]);
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  };

  const crops = ['wheat', 'rice', 'cotton', 'sugarcane', 'maize'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Prices</h1>
          <p className="text-gray-600">Real-time prices from nearest mandis</p>
          {locationError && (
            <div className="flex items-center mt-2 text-amber-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">Using default location</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-yellow-400 mr-3" />
              <p className="text-yellow-800">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Crop</label>
              <select 
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {crops.map(crop => (
                  <option key={crop} value={crop}>
                    {crop.charAt(0).toUpperCase() + crop.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Radius</label>
              <select 
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
                <option value={200}>200 km</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-end">
              <Button 
                onClick={fetchMarketData}
                disabled={loading || !location}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search Mandis
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Market Price Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mandis.map((mandi, index) => {
            const cropData = mandi.crops[selectedCrop];
            const TrendIcon = getTrendIcon(cropData?.trend);
            
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Mandi Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{mandi.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {mandi.distance}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {cropData?.lastUpdated || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Price Info */}
                  {cropData ? (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 capitalize">{selectedCrop}</span>
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${getTrendColor(cropData.trend)} mr-1`}>
                            {cropData.change}
                          </span>
                          <TrendIcon className={`h-4 w-4 ${getTrendColor(cropData.trend)}`} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{cropData.price}</div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="text-gray-500 text-sm">No data available for {selectedCrop}</div>
                    </div>
                  )}

                  {/* All Crops Summary */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Other Crops</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(mandi.crops)
                        .filter(([crop]) => crop !== selectedCrop)
                        .slice(0, 4)
                        .map(([crop, data]) => {
                          const Icon = getTrendIcon(data.trend);
                          return (
                            <div key={crop} className="text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 capitalize">{crop}</span>
                                <div className="flex items-center">
                                  <span className={getTrendColor(data.trend)}>{data.change}</span>
                                  <Icon className={`h-3 w-3 ml-1 ${getTrendColor(data.trend)}`} />
                                </div>
                              </div>
                              <div className="font-medium text-gray-900">{data.price}</div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && mandis.length === 0 && (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-green-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Market Data...</h3>
            <p className="text-gray-500">Fetching latest prices from nearby mandis</p>
          </div>
        )}

        {/* Empty State */}
        {mandis.length === 0 && !loading && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Market Data Available</h3>
            <p className="text-gray-500 mb-4">Try increasing the search radius or check your location settings</p>
            <Button 
              onClick={fetchMarketData} 
              disabled={!location}
              className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketData;