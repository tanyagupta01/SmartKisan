import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
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
  const [selectedCrop, setSelectedCrop] = useState('');
  const [searchRadius, setSearchRadius] = useState('');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

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
      const response = await fetch('http://localhost:5050/api/market-data', {
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
                onChange={(e) => {
                  setSelectedCrop(e.target.value);
                  setMandis([]);
                  setHasFetched(false);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="" disabled>Select a crop…</option>
                {crops.map((crop) => (
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
                onChange={(e) => {
                  setSearchRadius(e.target.value);
                  setMandis([]);
                  setHasFetched(false);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="" disabled>Select radius…</option>
                {[10, 25, 50, 100, 200].map((r) => (
                  <option key={r} value={r}>{r} km</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex items-end">
              <Button
                onClick={() => { setHasFetched(true); fetchMarketData(); }}
                disabled={loading || !location || !selectedCrop || !searchRadius}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 disabled:bg-gray-400"
              >
                {loading ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Updating...</>
                ) : (
                  <><Search className="h-4 w-4 mr-2" />Search Mandis</>
                )}
              </Button>
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
                        <h3 className="text-lg font-semibold text-gray-900">{mandi.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />{mandi.distance}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />{cropData?.lastUpdated || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Price Info */}
                    {cropData ? (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600 capitalize">{selectedCrop}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{cropData.price}</div>
                      </div>
                    ) : (
                      <div className="mb-4"><div className="text-gray-500 text-sm">No data available for {selectedCrop}</div></div>
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
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Market Data Available</h3>
            <p className="text-gray-500 mb-4">Try increasing the search radius or check your location settings</p>
            <Button
              onClick={() => { setHasFetched(true); fetchMarketData(); }}
              disabled={!location}
              className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
            >
              <RefreshCw className="h-4 w-4 mr-2" />Retry Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketData;
