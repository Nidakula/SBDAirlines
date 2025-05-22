import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userTicketService } from '../services/api';
import { useTheme } from '../themeContext';

export default function MyTickets() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login', { state: { redirectTo: '/my-tickets' } });
      return;
    }

    const fetchUserTickets = async () => {
      try {
        setLoading(true);
        const userId = JSON.parse(localStorage.getItem('user'))?._id;
        if (!userId) {
          throw new Error('User not found');
        }

        const response = await userTicketService.getUserTickets(userId);
        setTickets(response.data);
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
        setError('Failed to load your tickets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTickets();
  }, [navigate]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage your booked flights
          </p>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className={`rounded-xl shadow-lg overflow-hidden p-12 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No Tickets Found</h2>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              You haven't booked any flights yet.
            </p>
            <button
              onClick={() => navigate('/book-flight')}
              className={`px-6 py-2 text-white font-medium rounded-lg ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } transition-colors`}
            >
              Book a Flight
            </button>
          </div>
        ) : (
          <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Flight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Seat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tickets.map(ticket => (
                    <tr key={ticket._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                            <span className={`text-sm font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                              {ticket.flight_id?.maskapai_id?.nama_maskapai?.substring(0, 2) || 'FL'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">
                              {ticket.flight_id?.maskapai_id?.nama_maskapai || 'Unknown Airline'}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Flight ID: {ticket.flight_id?._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {ticket.flight_id?.asal_bandara || 'N/A'} → {ticket.flight_id?.tujuan_bandara || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {formatDateTime(ticket.flight_id?.jadwal_keberangkatan)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {ticket.seat_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {ticket.kelas_penerbangan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ticket.status_tiket === 'Confirmed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : ticket.status_tiket === 'Checked-in'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}>
                          {ticket.status_tiket}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}