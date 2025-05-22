import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightService, airlineService } from '../services/api';
import { motion } from 'framer-motion';

export default function BookFlight() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);

  // Search filters
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    airline: '',
    priceRange: [0, 10000000] // Default price range in IDR
  });
  
  // Sort options
  const [sortOption, setSortOption] = useState('departure');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      fetchFlights();
      fetchAirlines();
    }
  }, [navigate]);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await flightService.getAllFlights();
      // Add a random price for each flight for demo purposes
      const flightsWithPrices = response.data.map(flight => ({
        ...flight,
        price: Math.floor(Math.random() * 3000000) + 500000, // Random price between 500K-3.5M IDR
        seats: generateDemoSeats()
      }));
      setFlights(flightsWithPrices);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch flights:', err);
      setError('Failed to load flights. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Generate demo seats for visualization
  const generateDemoSeats = () => {
    const seatMap = [];
    const rows = 20;
    const seatsPerRow = 6;
    const takenSeats = new Set();
    
    // Randomly mark 30% of seats as taken
    for (let i = 0; i < rows * seatsPerRow * 0.3; i++) {
      const row = Math.floor(Math.random() * rows) + 1;
      const seatLetter = String.fromCharCode(65 + Math.floor(Math.random() * seatsPerRow));
      takenSeats.add(`${row}${seatLetter}`);
    }
    
    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let seat = 0; seat < seatsPerRow; seat++) {
        const seatLetter = String.fromCharCode(65 + seat);
        const seatId = `${row}${seatLetter}`;
        rowSeats.push({
          id: seatId,
          row: row,
          seat: seatLetter,
          status: takenSeats.has(seatId) ? 'taken' : 'available',
          class: row <= 2 ? 'first' : row <= 5 ? 'business' : 'economy'
        });
      }
      seatMap.push(rowSeats);
    }
    
    return seatMap;
  };

  const fetchAirlines = async () => {
    try {
      const response = await airlineService.getAllAirlines();
      setAirlines(response.data);
    } catch (err) {
      console.error('Failed to fetch airlines:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceRangeChange = (range) => {
    setSearchParams(prev => ({
      ...prev,
      priceRange: range
    }));
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
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

  const openSeatSelection = (flight) => {
    setSelectedFlight(flight);
    setShowSeatSelection(true);
    // Scroll to seat selection
    setTimeout(() => {
      document.getElementById('seat-selection')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSeatSelect = (seat) => {
    if (seat.status === 'taken') return;
    
    // Deselect if already selected
    if (selectedSeat && selectedSeat.id === seat.id) {
      setSelectedSeat(null);
      return;
    }
    
    setSelectedSeat(seat);
  };

  const handleBookFlight = () => {
    if (!selectedSeat) {
      alert('Please select a seat to continue');
      return;
    }
    
    // Here you would normally handle the booking API call
    alert(`Booking confirmed!\nFlight: ${selectedFlight.maskapai_id.nama_maskapai} from ${selectedFlight.asal_bandara} to ${selectedFlight.tujuan_bandara}\nSeat: ${selectedSeat.id}`);
    
    // Navigate to confirmation page (would implement in real app)
    // navigate('/booking-confirmation');
  };

  // Filter and sort flights
  const processedFlights = flights
    .filter(flight => {
      const matchesOrigin = searchParams.origin ?
        flight.asal_bandara.toLowerCase().includes(searchParams.origin.toLowerCase()) : true;

      const matchesDestination = searchParams.destination ?
        flight.tujuan_bandara.toLowerCase().includes(searchParams.destination.toLowerCase()) : true;

      const matchesAirline = searchParams.airline ?
        flight.maskapai_id._id === searchParams.airline : true;

      const matchesPrice = flight.price >= searchParams.priceRange[0] && flight.price <= searchParams.priceRange[1];

      let matchesDate = true;
      if (searchParams.departureDate) {
        const searchDate = new Date(searchParams.departureDate);
        const flightDate = new Date(flight.jadwal_keberangkatan);
        matchesDate = flightDate.toDateString() === searchDate.toDateString();
      }

      return matchesOrigin && matchesDestination && matchesAirline && matchesDate && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'duration':
          const durationA = new Date(a.jadwal_kedatangan) - new Date(a.jadwal_keberangkatan);
          const durationB = new Date(b.jadwal_kedatangan) - new Date(b.jadwal_keberangkatan);
          return durationA - durationB;
        case 'departure':
        default:
          return new Date(a.jadwal_keberangkatan) - new Date(b.jadwal_keberangkatan);
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with animated text */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            Find Your Perfect <span className="text-blue-600 dark:text-blue-400">Flight</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Search for available flights, compare prices, and book your next journey with ease
          </p>
        </motion.div>

        {/* Search Filters - Enhanced card with subtle animation */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Origin
                </div>
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={searchParams.origin}
                onChange={handleInputChange}
                placeholder="From City or Airport"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Destination
                </div>
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={searchParams.destination}
                onChange={handleInputChange}
                placeholder="To City or Airport"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Departure Date
                </div>
              </label>
              <input
                type="date"
                id="departureDate"
                name="departureDate"
                value={searchParams.departureDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="airline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.43a1 1 0 00-.293-.707l-2-2A1 1 0 016 8.143v-.286a1 1 0 01.445-.832l6-3.5a1 1 0 011.11 0l6 3.5a1 1 0 01.445.832v.286a1 1 0 01-.293.707l-2 2a1 1 0 00-.293.707v4.143a1 1 0 00.553.894l5 2.429a1 1 0 001.447-1.053l-2-10a1 1 0 00-.894-.894l-6-1a1 1 0 00-.553.106l-6 3a1 1 0 00-.553.894l2 10a1 1 0 001.447 1.053l5-2.429a1 1 0 00.553-.894V8.143a1 1 0 01.293-.707l2-2a1 1 0 00.293-.707v-.286a1 1 0 00-.445-.832l-6-3.5a1 1 0 00-1.11 0l-6 3.5A1 1 0 015 6.857v.286a1 1 0 00.293.707l2 2a1 1 0 01.293.707v4.143a1 1 0 01-.553.894l-5 2.429a1 1 0 01-1.447-1.053l2-10a1 1 0 01.894-.894l6-1a1 1 0 01.553.106l6 3a1 1 0 01.553.894l-2 10a1 1 0 01-1.447 1.053l-5-2.429a1 1 0 01-.553-.894V8.143a1 1 0 00-.293-.707l-2-2a1 1 0 01-.293-.707v-.286a1 1 0 01.445-.832l6-3.5z" />
                  </svg>
                  Airline
                </div>
              </label>
              <select
                id="airline"
                name="airline"
                value={searchParams.airline}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Airlines</option>
                {airlines.map(airline => (
                  <option key={airline._id} value={airline._id}>
                    {airline.nama_maskapai}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced filters */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Price range filter */}
              <div className="space-y-2 w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    Price Range
                  </div>
                </label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPrice(searchParams.priceRange[0])}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={searchParams.priceRange[0]}
                    onChange={(e) => handlePriceRangeChange([parseInt(e.target.value), searchParams.priceRange[1]])}
                    className="w-24 md:w-32 accent-blue-500"
                  />
                  <span className="mx-2 text-gray-500">to</span>
                  <input
                    type="range"
                    min="500000"
                    max="10000000"
                    step="100000"
                    value={searchParams.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange([searchParams.priceRange[0], parseInt(e.target.value)])}
                    className="w-24 md:w-32 accent-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPrice(searchParams.priceRange[1])}
                  </span>
                </div>
              </div>

              {/* Sort options */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                >
                  <option value="departure">Departure Time</option>
                  <option value="duration">Duration</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Flights List */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading available flights...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg inline-block mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{error}</p>
              </div>
              <button
                onClick={fetchFlights}
                className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{processedFlights.length}</span> {processedFlights.length === 1 ? 'flight' : 'flights'} found
                  </p>
                  {processedFlights.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Showing flights from {formatPrice(Math.min(...processedFlights.map(f => f.price)))}
                    </p>
                  )}
                </div>
              </div>

              {processedFlights.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No flights found</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    No flights match your search criteria. Try adjusting your filters or selecting different dates.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {processedFlights.map((flight, index) => (
                    <motion.li
                      key={flight._id}
                      className="p-6 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-xl font-bold text-white">
                              {flight.maskapai_id?.nama_maskapai?.substring(0, 2) || 'FL'}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {flight.maskapai_id?.nama_maskapai || 'Unknown Airline'}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                              </svg>
                              {calculateFlightDuration(flight.jadwal_keberangkatan, flight.jadwal_kedatangan)}
                              <span className="mx-2">•</span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                flight.status_penerbangan === 'On Time' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' :
                                flight.status_penerbangan === 'Delayed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300' :
                                  'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                              }`}>
                                {flight.status_penerbangan}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Departure</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{flight.asal_bandara}</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {new Date(flight.jadwal_keberangkatan).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(flight.jadwal_keberangkatan).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center justify-center">
                            <div className="w-full flex items-center">
                              <div className="h-0.5 flex-1 bg-gray-300 dark:bg-gray-600"></div>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mx-2 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.43a1 1 0 00-.293-.707l-2-2A1 1 0 016 8.143v-.286a1 1 0 01.445-.832l6-3.5a1 1 0 011.11 0l6 3.5a1 1 0 01.445.832v.286a1 1 0 01-.293.707l-2 2a1 1 0 00-.293.707v4.143a1 1 0 00.553.894l5 2.429a1 1 0 001.447-1.053l-7-14z" />
                              </svg>
                              <div className="h-0.5 flex-1 bg-gray-300 dark:bg-gray-600"></div>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Arrival</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{flight.tujuan_bandara}</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {new Date(flight.jadwal_kedatangan).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(flight.jadwal_kedatangan).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            {formatPrice(flight.price)}
                          </p>
                          <button
                            className="w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            onClick={() => navigate(`/flight-details/${flight._id}`)}
                          >
                            Select Seats
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </>
          )}
        </motion.div>

        {/* Seat Selection Section */}
        {showSeatSelection && selectedFlight && (
          <motion.div
            id="seat-selection"
            className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Select Your Seat
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {selectedFlight.maskapai_id?.nama_maskapai} flight from {selectedFlight.asal_bandara} to {selectedFlight.tujuan_bandara}
              </p>
            </div>

            <div className="p-6">
              {/* Flight info summary */}
              <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Flight</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedFlight.maskapai_id?.nama_maskapai} {selectedFlight._id.substring(0, 6)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedFlight.jadwal_keberangkatan).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Departure</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedFlight.jadwal_keberangkatan).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Arrival</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedFlight.jadwal_kedatangan).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {calculateFlightDuration(selectedFlight.jadwal_keberangkatan, selectedFlight.jadwal_kedatangan)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Price</p>
                    <p className="font-medium text-blue-600 dark:text-blue-400">{formatPrice(selectedFlight.price)}</p>
                  </div>
                </div>
              </div>

              {/* Seat selection legend */}
              <div className="mb-6 flex flex-wrap gap-6 justify-center">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-400 dark:bg-gray-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Occupied</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-200 dark:bg-purple-900 border border-purple-300 dark:border-purple-700 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">First Class</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-indigo-200 dark:bg-indigo-900 border border-indigo-300 dark:border-indigo-700 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Business</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-200 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Economy</span>
                </div>
              </div>

              {/* Airplane diagram */}
              <div className="mb-8">
                {/* Cockpit */}
                <div className="w-1/2 h-16 mx-auto bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-t-full flex items-center justify-center mb-4">
                  <span className="text-xs text-gray-700 dark:text-gray-300">COCKPIT</span>
                </div>

                {/* Airplane body */}
                <div className="max-w-2xl mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg p-8 relative">
                  {/* Aisle label */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs text-blue-800 dark:text-blue-200">
                    AISLE
                  </div>
                  
                  {/* Seats container */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* First class section */}
                    <div>
                      <div className="text-center mb-2 pb-2 border-b border-dashed border-gray-300 dark:border-gray-600">
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">First Class</span>
                      </div>
                      <div className="grid grid-cols-6 gap-2 mb-4">
                        {selectedFlight.seats.slice(0, 2).map((row, rowIndex) => (
                          <React.Fragment key={`first-${rowIndex}`}>
                            {row.map((seat, seatIndex) => (
                              <button
                                key={seat.id}
                                className={`aspect-square p-1 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                                  seat.status === 'taken' 
                                    ? 'bg-gray-400 dark:bg-gray-500 cursor-not-allowed text-white' 
                                    : selectedSeat?.id === seat.id
                                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                      : 'bg-purple-200 dark:bg-purple-900 border border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200 hover:bg-purple-300 dark:hover:bg-purple-800'
                                }`}
                                onClick={() => handleSeatSelect(seat)}
                                disabled={seat.status === 'taken'}
                              >
                                {seat.id}
                              </button>
                            ))}
                            {seatIndex === 2 && <div className="col-span-6 h-4"></div>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Business class section */}
                    <div>
                      <div className="text-center mb-2 pb-2 border-b border-dashed border-gray-300 dark:border-gray-600">
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Business Class</span>
                      </div>
                      <div className="grid grid-cols-6 gap-2 mb-4">
                        {selectedFlight.seats.slice(2, 5).map((row, rowIndex) => (
                          <React.Fragment key={`business-${rowIndex}`}>
                            {row.map((seat, seatIndex) => (
                              <button
                                key={seat.id}
                                className={`aspect-square p-1 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                                  seat.status === 'taken' 
                                    ? 'bg-gray-400 dark:bg-gray-500 cursor-not-allowed text-white' 
                                    : selectedSeat?.id === seat.id
                                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                      : 'bg-indigo-200 dark:bg-indigo-900 border border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-300 dark:hover:bg-indigo-800'
                                }`}
                                onClick={() => handleSeatSelect(seat)}
                                disabled={seat.status === 'taken'}
                              >
                                {seat.id}
                              </button>
                            ))}
                            {seatIndex === 2 && <div className="col-span-6 h-4"></div>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Economy class section */}
                    <div>
                      <div className="text-center mb-2 pb-2 border-b border-dashed border-gray-300 dark:border-gray-600">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Economy Class</span>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {selectedFlight.seats.slice(5).map((row, rowIndex) => (
                          <React.Fragment key={`economy-${rowIndex}`}>
                            {row.map((seat, seatIndex) => (
                              <button
                                key={seat.id}
                                className={`aspect-square p-1 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                                  seat.status === 'taken' 
                                    ? 'bg-gray-400 dark:bg-gray-500 cursor-not-allowed text-white' 
                                    : selectedSeat?.id === seat.id
                                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                      : 'bg-blue-200 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 hover:bg-blue-300 dark:hover:bg-blue-800'
                                }`}
                                onClick={() => handleSeatSelect(seat)}
                                disabled={seat.status === 'taken'}
                              >
                                {seat.id}
                              </button>
                            ))}
                            {seatIndex === 2 && <div className="col-span-6 h-4"></div>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Emergency exits */}
                  <div className="absolute left-0 top-1/3 -ml-6 bg-red-500 text-white text-xs p-1 rounded">EXIT</div>
                  <div className="absolute right-0 top-1/3 -mr-6 bg-red-500 text-white text-xs p-1 rounded">EXIT</div>
                  <div className="absolute left-0 bottom-1/4 -ml-6 bg-red-500 text-white text-xs p-1 rounded">EXIT</div>
                  <div className="absolute right-0 bottom-1/4 -mr-6 bg-red-500 text-white text-xs p-1 rounded">EXIT</div>
                </div>
              </div>

              {/* Seat selection info */}
              <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your Selection</h3>
                {selectedSeat ? (
                  <div className="flex flex-wrap gap-4 items-center">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Seat</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedSeat.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Class</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedSeat.class}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(selectedFlight.price * 
                          (selectedSeat.class === 'first' ? 2 : selectedSeat.class === 'business' ? 1.5 : 1)
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Please select a seat to continue</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-between">
                <button
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => {
                    setShowSeatSelection(false);
                    setSelectedSeat(null);
                  }}
                >
                  Back to Flights
                </button>
                <button
                  className={`px-6 py-3 rounded-lg transition-colors ${
                    selectedSeat 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={handleBookFlight}
                  disabled={!selectedSeat}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}