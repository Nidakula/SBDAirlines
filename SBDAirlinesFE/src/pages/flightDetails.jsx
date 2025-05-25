import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightService, userTicketService } from '../services/api';
import { useTheme } from '../themeContext';
import { motion } from 'framer-motion';

export default function FlightDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const [flight, setFlight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [bookingDetails, setBookingDetails] = useState({
        seat_number: '',
        kelas_penerbangan: 'Ekonomi',
        harga_tiket: 0
    });
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [seatMap, setSeatMap] = useState([]);
    const [isBookmarked, setIsBookmarked] = useState(false);    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            navigate('/login', { state: { redirectTo: `/flight-details/${id}` } });
            return;
        }

        const fetchFlightDetails = async () => {
            try {
                setLoading(true);
                const response = await flightService.getFlightById(id);
                setFlight(response.data);

                // Set default pricing based on flight
                const basePrice = 750000; // Example base price
                setBookingDetails(prev => ({
                    ...prev,
                    harga_tiket: basePrice
                }));

                // Generate demo seat map
                setSeatMap(generateDemoSeats());

                // Check if flight is bookmarked
                checkIfBookmarked(response.data._id);

            } catch (err) {
                console.error('Failed to fetch flight details:', err);
                setError('Failed to load flight details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchFlightDetails();
    }, [id, navigate]);

    // Check if flight is already bookmarked
    const checkIfBookmarked = (flightId) => {
        try {
            const storedBookmarks = localStorage.getItem('bookmarks');
            if (storedBookmarks) {
                const bookmarks = JSON.parse(storedBookmarks);
                const isAlreadyBookmarked = bookmarks.some(bookmark => bookmark._id === flightId);
                setIsBookmarked(isAlreadyBookmarked);
            } else {
                setIsBookmarked(false);
            }
        } catch (err) {
            console.error('Error checking bookmarks:', err);
            setIsBookmarked(false);
        }
    };

    // Toggle bookmark status
    const toggleBookmark = () => {
        if (!flight) return;

        try {
            let bookmarks = [];
            const storedBookmarks = localStorage.getItem('bookmarks');
            
            if (storedBookmarks) {
                bookmarks = JSON.parse(storedBookmarks);
            }

            if (isBookmarked) {
                // Remove from bookmarks
                bookmarks = bookmarks.filter(bookmark => bookmark._id !== flight._id);
                setIsBookmarked(false);
            } else {
                // Add to bookmarks
                bookmarks.push(flight);
                setIsBookmarked(true);
            }

            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        } catch (err) {
            console.error('Error toggling bookmark:', err);
        }
    };

    // Generate demo seats for visualization
    const generateDemoSeats = () => {
        const seatMap = [];
        const rows = 10;
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
                    class: row <= 2 ? 'first' : row <= 4 ? 'business' : 'economy'
                });
            }
            seatMap.push(rowSeats);
        }
        
        return seatMap;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let updatedPrice = bookingDetails.harga_tiket;

        // Update price based on class
        if (name === 'kelas_penerbangan') {
            const basePrice = 750000; // Example base price
            updatedPrice = value === 'Ekonomi' ? basePrice :
                value === 'Bisnis' ? basePrice * 2 :
                    basePrice * 4; // First Class
        }

        setBookingDetails(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'kelas_penerbangan' ? { harga_tiket: updatedPrice } : {})
        }));
    };

    const handleSeatSelect = (seat) => {
        if (seat.status === 'taken') return;
        
        // Set the selected seat
        setSelectedSeat(seat);
        
        // Update the booking details
        setBookingDetails(prev => ({
            ...prev,
            seat_number: seat.id,
            kelas_penerbangan: 
                seat.class === 'first' ? 'First Class' : 
                seat.class === 'business' ? 'Bisnis' : 'Ekonomi',
            harga_tiket: prev.harga_tiket // Price will be updated via the useEffect when kelas_penerbangan changes
        }));
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        
        // Get user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user._id) {
            setBookingError('You must be logged in to book a flight');
            return;
        }
        
        // Check if user has a passenger ID in localStorage
        if (!user.penumpang_id && !user.passenger_details) {
            setBookingError('Your account is not properly set up as a passenger. Please contact support.');
            return;
        }
        
        try {
            setIsBooking(true);
            setBookingError(null);
            
            await userTicketService.bookTicketForUser(
                user._id,
                flight._id,
                bookingDetails
            );
            
            setBookingSuccess(true);
            
            // Redirect to tickets page after a delay
            setTimeout(() => {
                navigate('/my-tickets');
            }, 2000);
        } catch (err) {
            console.error('Booking error:', err);
            if (err.response && err.response.status === 404) {
                setBookingError('User passenger profile not found. Please update your profile first.');
            } else {
                setBookingError(err.response?.data?.message || 'Failed to book ticket. Please try again.');
            }
        } finally {
            setIsBooking(false);
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    const calculateFlightDuration = (departure, arrival) => {
        const departureTime = new Date(departure);
        const arrivalTime = new Date(arrival);
        const durationMs = arrivalTime - departureTime;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center text-red-500 dark:text-red-400 p-8">
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!flight) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center text-gray-600 dark:text-gray-400 p-8">
                    Flight not found
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-6xl mx-auto">
                {/* Back button */}
                <button 
                    onClick={() => navigate('/book-flight')} 
                    className={`mb-6 flex items-center text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Flights
                </button>

                {/* Flight Info Card - Enhanced with animations */}
                <motion.div 
                    className={`rounded-xl shadow-xl overflow-hidden mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-blue-50'}`}>
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold">Flight Details</h1>
                            <div className={`px-3 py-1 text-xs font-medium rounded-full ${
                                flight.status_penerbangan === 'On Time'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                    : flight.status_penerbangan === 'Delayed'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            }`}>
                                {flight.status_penerbangan}
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Airline Info */}                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className={`flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-blue-900 to-indigo-900' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                                    <span className="text-2xl font-bold text-white">
                                        {flight.maskapai_id?.nama_maskapai?.substring(0, 2) || 'FL'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">
                                        {flight.maskapai_id?.nama_maskapai || 'Unknown Airline'}
                                    </h3>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Aircraft: {flight.pesawat_id?.model_pesawat || 'Unknown'}
                                    </p>
                                    <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium mt-1`}>
                                        Flight {flight._id.substring(0, 6).toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className="flex items-center mb-2">
                                    <button 
                                        onClick={toggleBookmark} 
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                                            isBookmarked 
                                                ? darkMode ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                                : darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        } transition-colors`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isBookmarked ? "0" : "1.5"}>
                                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                        </svg>
                                        {isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
                                    </button>
                                </div>
                                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Flight Date</div>
                                <div className="text-lg font-medium">{formatDate(flight.jadwal_keberangkatan)}</div>
                                <div className={`mt-2 px-3 py-1 text-xs font-medium rounded-full ${darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                                    Duration: {calculateFlightDuration(flight.jadwal_keberangkatan, flight.jadwal_kedatangan)}
                                </div>
                            </div>
                        </div>

                        {/* Flight Route Information - Enhanced visuals */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center">
                                <div className="md:col-span-3">
                                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Departure</p>
                                    <p className="text-2xl font-bold">{flight.asal_bandara}</p>
                                    <p className={`text-lg ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-semibold`}>
                                        {formatTime(flight.jadwal_keberangkatan)}
                                    </p>
                                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Terminal: {flight.terminal_keberangkatan || 'TBA'}
                                    </p>
                                </div>

                                <div className="md:col-span-1 flex justify-center">
                                    <div className="relative">
                                        <div className="w-full flex items-center justify-center">
                                            <div className={`h-1 w-16 md:w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                                        </div>
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11.43a1 1 0 00-.293-.707l-2-2A1 1 0 016 8.143v-.286a1 1 0 01.445-.832l6-3.5a1 1 0 011.11 0l6 3.5a1 1 0 01.445.832v.286a1 1 0 01-.293.707l-2 2a1 1 0 00-.293.707v4.143a1 1 0 00.553.894l5 2.429a1 1 0 001.447-1.053l-7-14z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-3">
                                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Arrival</p>
                                    <p className="text-2xl font-bold">{flight.tujuan_bandara}</p>
                                    <p className={`text-lg ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-semibold`}>
                                        {formatTime(flight.jadwal_kedatangan)}
                                    </p>
                                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Terminal: {flight.terminal_kedatangan || 'TBA'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Flight Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gate</p>
                                <p className="text-lg font-semibold">{flight.gate_id?.nomor_gate || 'TBA'}</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {flight.gate_id?.lokasi_gate || 'Location not available'}
                                </p>
                            </div>

                            <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Boarding Time</p>
                                <p className="text-lg font-semibold">
                                    {formatTime(new Date(new Date(flight.jadwal_keberangkatan).getTime() - 30 * 60000))}
                                </p>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    30 minutes before departure
                                </p>
                            </div>

                            <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Flight Status</p>
                                <p className={`text-lg font-semibold ${
                                    flight.status_penerbangan === 'On Time'
                                        ? 'text-green-500 dark:text-green-400'
                                        : flight.status_penerbangan === 'Delayed'
                                            ? 'text-yellow-500 dark:text-yellow-400'
                                            : 'text-red-500 dark:text-red-400'
                                }`}>
                                    {flight.status_penerbangan}
                                </p>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Updated {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Booking Section */}
                {bookingSuccess ? (
                    <motion.div 
                        className={`rounded-xl shadow-lg overflow-hidden p-8 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Booking Successful!</h2>
                        <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Your flight has been booked successfully. Redirecting to your tickets...
                        </p>
                        <div className="animate-pulse flex justify-center">
                            <div className="h-1 w-16 bg-blue-500 rounded"></div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        className={`rounded-xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-blue-50'}`}>
                            <h2 className="text-2xl font-bold">Book This Flight</h2>
                        </div>

                        <div className="p-6">
                            {bookingError && (
                                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
                                    <div className="flex items-center">
                                        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {bookingError}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Seat Selection */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Select Your Seat</h3>
                                    
                                    {/* Seat selection legend */}
                                    <div className="mb-4 flex flex-wrap gap-4">
                                        <div className="flex items-center">
                                            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded mr-2"></div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-5 h-5 bg-blue-500 rounded mr-2"></div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Selected</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-5 h-5 bg-gray-400 dark:bg-gray-500 rounded mr-2"></div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Occupied</span>
                                        </div>
                                    </div>
                                    
                                    {/* Airplane diagram */}
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative">
                                        {/* Cockpit */}
                                        <div className="w-32 h-12 mx-auto bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-t-full flex items-center justify-center mb-6">
                                            <span className="text-xs text-gray-700 dark:text-gray-300">COCKPIT</span>
                                        </div>
                                        
                                        {/* Aisle label */}
                                        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs text-blue-800 dark:text-blue-200">
                                            AISLE
                                        </div>

                                        {/* Seat sections */}
                                        <div className="space-y-6">
                                            {/* First Class */}
                                            <div>
                                                <div className="text-center mb-2">
                                                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">First Class</span>
                                                </div>
                                                <div className="grid grid-cols-6 gap-2">
                                                    {seatMap.slice(0, 2).map((row, rowIndex) => (
                                                        <React.Fragment key={`first-${rowIndex}`}>
                                                            {row.map((seat) => (
                                                                <button
                                                                    key={seat.id}
                                                                    className={`aspect-square p-1 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                                                                        seat.status === 'taken' 
                                                                            ? 'bg-gray-400 dark:bg-gray-500 cursor-not-allowed text-white' 
                                                                            : selectedSeat?.id === seat.id
                                                                                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                                                                : 'bg-purple-200 dark:bg-purple-900/70 border border-purple-300 dark:border-purple-700/50 text-purple-800 dark:text-purple-300 hover:bg-purple-300 dark:hover:bg-purple-800'
                                                                    }`}
                                                                    onClick={() => handleSeatSelect(seat)}
                                                                    disabled={seat.status === 'taken'}
                                                                >
                                                                    {seat.id}
                                                                </button>
                                                            ))}
                                                            {rowIndex === 0 && <div className="col-span-6 h-2"></div>}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {/* Business Class */}
                                            <div>
                                                <div className="text-center mb-2">
                                                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">Business Class</span>
                                                </div>
                                                <div className="grid grid-cols-6 gap-2">
                                                    {seatMap.slice(2, 4).map((row, rowIndex) => (
                                                        <React.Fragment key={`business-${rowIndex}`}>
                                                            {row.map((seat) => (
                                                                <button
                                                                    key={seat.id}
                                                                    className={`aspect-square p-1 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                                                                        seat.status === 'taken' 
                                                                            ? 'bg-gray-400 dark:bg-gray-500 cursor-not-allowed text-white' 
                                                                            : selectedSeat?.id === seat.id
                                                                                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                                                                : 'bg-indigo-200 dark:bg-indigo-900/70 border border-indigo-300 dark:border-indigo-700/50 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-300 dark:hover:bg-indigo-800'
                                                                    }`}
                                                                    onClick={() => handleSeatSelect(seat)}
                                                                    disabled={seat.status === 'taken'}
                                                                >
                                                                    {seat.id}
                                                                </button>
                                                            ))}
                                                            {rowIndex === 0 && <div className="col-span-6 h-2"></div>}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {/* Economy Class */}
                                            <div>
                                                <div className="text-center mb-2">
                                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">Economy Class</span>
                                                </div>
                                                <div className="grid grid-cols-6 gap-2">
                                                    {seatMap.slice(4).map((row, rowIndex) => (
                                                        <React.Fragment key={`economy-${rowIndex}`}>
                                                            {row.map((seat) => (
                                                                <button
                                                                    key={seat.id}
                                                                    className={`aspect-square p-1 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                                                                        seat.status === 'taken' 
                                                                            ? 'bg-gray-400 dark:bg-gray-500 cursor-not-allowed text-white' 
                                                                            : selectedSeat?.id === seat.id
                                                                                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                                                                : 'bg-blue-200 dark:bg-blue-900/70 border border-blue-300 dark:border-blue-700/50 text-blue-800 dark:text-blue-300 hover:bg-blue-300 dark:hover:bg-blue-800'
                                                                    }`}
                                                                    onClick={() => handleSeatSelect(seat)}
                                                                    disabled={seat.status === 'taken'}
                                                                >
                                                                    {seat.id}
                                                                </button>
                                                            ))}
                                                            {rowIndex % 2 === 0 && rowIndex < 4 && <div className="col-span-6 h-2"></div>}
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

                                {/* Booking Form */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Booking Details</h3>
                                    
                                    <form onSubmit={handleBooking} className="space-y-6">
                                        <div className={`p-4 rounded-lg border ${darkMode ? 'border-blue-800 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`}>
                                            <h4 className="font-medium mb-3">Selected Seat Information</h4>
                                            {selectedSeat ? (
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Seat Number</p>
                                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedSeat.id}</p>
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Class</p>
                                                        <p className="font-medium capitalize">{selectedSeat.class}</p>
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location</p>
                                                        <p className="font-medium">
                                                            {selectedSeat.seat <= 'C' ? 'Window' : selectedSeat.seat >= 'D' ? 'Aisle' : 'Middle'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Please select a seat from the seat map
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="seat_number" className={`block mb-2 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                Seat Number
                                            </label>
                                            <input
                                                type="text"
                                                id="seat_number"
                                                name="seat_number"
                                                value={bookingDetails.seat_number}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 12A (or select from map)"
                                                className={`w-full px-4 py-3 border rounded-lg ${darkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200`}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="kelas_penerbangan" className={`block mb-2 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                Class
                                            </label>
                                            <select
                                                id="kelas_penerbangan"
                                                name="kelas_penerbangan"
                                                value={bookingDetails.kelas_penerbangan}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg ${darkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200`}
                                                required
                                            >
                                                <option value="Ekonomi">Economy</option>
                                                <option value="Bisnis">Business</option>
                                                <option value="First Class">First Class</option>
                                            </select>
                                        </div>

                                        {/* Price breakdown */}
                                        <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                                            <h4 className="font-medium mb-3">Price Details</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Base Fare</span>
                                                    <span>{formatPrice(750000)}</span>
                                                </div>
                                                {bookingDetails.kelas_penerbangan !== 'Ekonomi' && (
                                                    <div className="flex justify-between">
                                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Class Upgrade</span>
                                                        <span>{formatPrice(bookingDetails.harga_tiket - 750000)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Taxes & Fees</span>
                                                    <span>Included</span>
                                                </div>
                                                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                                                    <div className="flex justify-between font-bold">
                                                        <span>Total</span>
                                                        <span className="text-lg text-blue-600 dark:text-blue-400">{formatPrice(bookingDetails.harga_tiket)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> 

                                        <button
                                            type="submit"
                                            disabled={isBooking || !bookingDetails.seat_number}
                                            className={`w-full px-4 py-3 text-white font-medium rounded-lg ${darkMode
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                                                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                                                } focus:outline-none focus:ring-4 ${darkMode ? 'focus:ring-blue-800' : 'focus:ring-blue-300'} ${
                                                    (isBooking || !bookingDetails.seat_number) ? 'opacity-70 cursor-not-allowed' : ''
                                                } transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center mt-4`}
                                        >
                                            {isBooking ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Confirm Booking
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}