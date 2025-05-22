import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightService } from '../services/api';
import { useTheme } from '../themeContext';
import { motion } from 'framer-motion';

export default function Bookmarks() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    fetchBookmarks();
  }, [navigate]);

  const fetchBookmarks = () => {
    // In a real implementation, this would fetch from an API
    // For now, we'll retrieve from localStorage
    setLoading(true);
    try {
      const storedBookmarks = localStorage.getItem('bookmarks');
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      } else {
        setBookmarks([]);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
      setError('Failed to load bookmarks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = (flightId) => {
    try {
      const updatedBookmarks = bookmarks.filter(bookmark => bookmark._id !== flightId);
      localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
      setBookmarks(updatedBookmarks);
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      setError('Failed to remove bookmark. Please try again later.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateFlightDuration = (departure, arrival) => {
    const departureTime = new Date(departure);
    const arrivalTime = new Date(arrival);
    const durationMs = arrivalTime - departureTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="pt-28 pb-16 min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          Your <span className="text-blue-600 dark:text-blue-400">Bookmarked</span> Flights
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Quick access to your favorite flights and destinations
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="ml-4 text-gray-600 dark:text-gray-400">Loading your bookmarks...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-8 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-medium mb-2">{error}</p>
          <button
            onClick={fetchBookmarks}
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            Try Again
          </button>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl shadow-lg p-8 text-center max-w-3xl mx-auto">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Bookmarks Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You haven't saved any flights to your bookmarks. Start exploring flights and save your favorites for quick access!
          </p>
          <button
            onClick={() => navigate('/bookflight')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 shadow-md transition-all duration-200"
          >
            Explore Flights
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((flight, index) => (
            <motion.div
              key={flight._id}
              className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:shadow-xl transition-shadow`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md mr-3">
                      <span className="text-lg font-bold text-white">
                        {flight.maskapai_id?.nama_maskapai?.substring(0, 2) || 'FL'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {flight.maskapai_id?.nama_maskapai || 'Unknown Airline'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Flight {flight._id.substring(0, 6)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBookmark(flight._id)}
                    className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    aria-label="Remove bookmark"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {flight.asal_bandara.split('(')[1]?.replace(')', '') || flight.asal_bandara.substring(0, 3)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {flight.asal_bandara.split('(')[0]?.trim() || flight.asal_bandara}
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-4">
                    <div className="w-full flex items-center">
                      <div className="h-0.5 flex-1 bg-gray-300 dark:bg-gray-600"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mx-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.43a1 1 0 00-.293-.707l-2-2A1 1 0 016 8.143v-.286a1 1 0 01.445-.832l6-3.5a1 1 0 011.11 0l6 3.5a1 1 0 01.445.832v.286a1 1 0 01-.293.707l-2 2a1 1 0 00-.293.707v4.143a1 1 0 00.553.894l5 2.429a1 1 0 001.447-1.053l-7-14z" />
                      </svg>
                      <div className="h-0.5 flex-1 bg-gray-300 dark:bg-gray-600"></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {calculateFlightDuration(flight.jadwal_keberangkatan, flight.jadwal_kedatangan)}
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {flight.tujuan_bandara.split('(')[1]?.replace(')', '') || flight.tujuan_bandara.substring(0, 3)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {flight.tujuan_bandara.split('(')[0]?.trim() || flight.tujuan_bandara}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Departure</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(flight.jadwal_keberangkatan).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {new Date(flight.jadwal_keberangkatan).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(flight.price || 2500000)}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    flight.status_penerbangan === 'On Time' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' :
                    flight.status_penerbangan === 'Delayed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                  }`}>
                    {flight.status_penerbangan || 'On Time'}
                  </span>
                  <button
                    onClick={() => navigate(`/flight-details/${flight._id}`)}
                    className="px-4 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}