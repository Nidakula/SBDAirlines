import React, { useState, useEffect } from 'react';
import { airlineService, aircraftService, flightService, passengerService, ticketService } from '../services/api';

export default function DashboardPanel() {
  const [stats, setStats] = useState({
    airlines: 0,
    aircraft: 0,
    flights: 0,
    passengers: 0,
    tickets: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemStatus, setSystemStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [airlinesRes, aircraftRes, flightsRes, passengersRes, ticketsRes] = await Promise.all([
          airlineService.getAllAirlines(),
          aircraftService.getAllAircraft(),
          flightService.getAllFlights(),
          passengerService.getAllPassengers(),
          ticketService.getAllTickets()
        ]);
        
        setStats({
          airlines: airlinesRes.data.length,
          aircraft: aircraftRes.data.length,
          flights: flightsRes.data.length,
          passengers: passengersRes.data.length,
          tickets: ticketsRes.data.length
        });

        const recentFlights = flightsRes.data
          .sort((a, b) => new Date(b.createdAt || b.departure_time) - new Date(a.createdAt || a.departure_time))
          .slice(0, 3);
          
        const activityItems = [
          ...recentFlights.map(flight => ({
            id: flight.id,
            message: `Flight ${flight.flight_number} ${flight.status === 'scheduled' ? 'scheduled' : 'updated'}`,
            time: formatTimeAgo(new Date(flight.createdAt || flight.departure_time))
          }))
        ];
        
        if (airlinesRes.data.length > 0) {
          const recentAirline = airlinesRes.data
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            
          activityItems.push({
            id: 'airline-' + recentAirline.id,
            message: `New airline ${recentAirline.name} registered`,
            time: formatTimeAgo(new Date(recentAirline.createdAt))
          });
        }
        
        setRecentActivity(activityItems.sort((a, b) => {
          const timeA = convertRelativeTimeToTimestamp(a.time);
          const timeB = convertRelativeTimeToTimestamp(b.time);
          return timeB - timeA;
        }).slice(0, 3));
        
        try {
          await airlineService.getAllAirlines();
          setSystemStatus({
            database: 'Online',
            api: 'Online',
            storage: 'Online'
          });
        } catch (error) {
          setSystemStatus({
            database: error.message.includes('database') ? 'Offline' : 'Online',
            api: 'Degraded',
            storage: 'Online'
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        
        setRecentActivity([
          { id: 1, message: 'New flight LH456 scheduled', time: '2 hours ago' },
          { id: 2, message: 'Gate B12 maintenance completed', time: '5 hours ago' },
          { id: 3, message: 'New airline partner registered', time: 'Yesterday' }
        ]);
        
        setSystemStatus({
          database: 'Unknown',
          api: 'Degraded',
          storage: 'Unknown'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };
  
  const convertRelativeTimeToTimestamp = (relativeTime) => {
    const now = new Date().getTime();
    
    if (relativeTime === 'Just now') return now;
    if (relativeTime.includes('minutes')) {
      const minutes = parseInt(relativeTime);
      return now - (minutes * 60 * 1000);
    }
    if (relativeTime.includes('hours')) {
      const hours = parseInt(relativeTime);
      return now - (hours * 60 * 60 * 1000);
    }
    if (relativeTime === 'Yesterday') return now - (24 * 60 * 60 * 1000);
    if (relativeTime.includes('days')) {
      const days = parseInt(relativeTime);
      return now - (days * 24 * 60 * 60 * 1000);
    }
    return now;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 font-[Montserrat]">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-800 p-4 sm:p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Dashboard Overview</h1>
          <p className="text-blue-100 text-base sm:text-lg">Welcome to your airport management system dashboard.</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 mt-4 sm:mt-6 justify-center items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <i className="bi bi-buildings text-xl sm:text-2xl"></i>
              </div>
              <div>
                <p className="text-blue-100 text-xs sm:text-sm">Total Airlines</p>
                <p className="text-xl sm:text-2xl font-semibold">{stats.airlines}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <i className="bi bi-calendar-check text-xl sm:text-2xl"></i>
              </div>
              <div>
                <p className="text-blue-100 text-xs sm:text-sm">Today's Date</p>
                <p className="text-xl sm:text-2xl font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 blur-2xl"></div>
        <div className="absolute bottom-5 -left-16 h-52 w-52 rounded-full bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 blur-3xl"></div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md p-3 sm:p-4 md:p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xs sm:text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wide">Airlines</p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.airlines}</h2>
            </div>
            <div className="bg-blue-500 dark:bg-blue-600 p-1.5 sm:p-2 md:p-2.5 rounded-lg text-white shadow-md flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
              <i className="bi bi-building text-sm sm:text-base"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md p-3 sm:p-4 md:p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xs sm:text-xs font-medium text-green-600 dark:text-green-300 uppercase tracking-wide">Aircraft</p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.aircraft}</h2>
            </div>
            <div className="bg-green-500 dark:bg-green-600 p-1.5 sm:p-2 md:p-2.5 rounded-lg text-white shadow-md flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
              <i className="bi bi-airplane text-sm sm:text-base"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md p-3 sm:p-4 md:p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xs sm:text-xs font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide">Flights</p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.flights}</h2>
            </div>
            <div className="bg-purple-500 dark:bg-purple-600 p-1.5 sm:p-2 md:p-2.5 rounded-lg text-white shadow-md flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
              <i className="bi bi-airplane-engines text-sm sm:text-base"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md p-3 sm:p-4 md:p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xs sm:text-xs font-medium text-amber-600 dark:text-amber-300 uppercase tracking-wide">Passengers</p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.passengers}</h2>
            </div>
            <div className="bg-amber-500 dark:bg-amber-600 p-1.5 sm:p-2 md:p-2.5 rounded-lg text-white shadow-md flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
              <i className="bi bi-people text-sm sm:text-base"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md p-3 sm:p-4 md:p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xs sm:text-xs font-medium text-rose-600 dark:text-rose-300 uppercase tracking-wide">Tickets</p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-1">{stats.tickets}</h2>
            </div>
            <div className="bg-rose-500 dark:bg-rose-600 p-1.5 sm:p-2 md:p-2.5 rounded-lg text-white shadow-md flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
              <i className="bi bi-ticket-perforated text-sm sm:text-base"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg mr-2 sm:mr-3">
              <i className="bi bi-clock-history text-lg sm:text-xl text-indigo-600 dark:text-indigo-300"></i>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="p-3 sm:p-4 border-l-4 border-indigo-400 bg-gray-50 dark:bg-gray-700 dark:border-indigo-600 rounded-r-lg transform transition hover:scale-[1.02]">
                  <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium">{activity.message}</p>
                  <div className="flex items-center mt-1 sm:mt-2 text-2xs sm:text-xs text-gray-500 dark:text-gray-400">
                    <i className="bi bi-clock mr-1"></i>
                    <span>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-24 sm:h-32 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <i className="bi bi-info-circle mr-2"></i>
                No recent activity found
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg mr-2 sm:mr-3">
              <i className="bi bi-hdd-stack text-lg sm:text-xl text-emerald-600 dark:text-emerald-300"></i>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">System Status</h3>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2 sm:mr-3">
                  <i className="bi bi-database text-sm sm:text-base text-blue-600 dark:text-blue-300"></i>
                </div>
                <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">Database</span>
              </div>
              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                systemStatus.database === 'Online' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {systemStatus.database || 'Unknown'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-2 sm:mr-3">
                  <i className="bi bi-hdd-network text-sm sm:text-base text-purple-600 dark:text-purple-300"></i>
                </div>
                <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">API</span>
              </div>
              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                systemStatus.api === 'Online' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : systemStatus.api === 'Degraded'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {systemStatus.api || 'Unknown'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mr-2 sm:mr-3">
                  <i className="bi bi-hdd text-sm sm:text-base text-emerald-600 dark:text-emerald-300"></i>
                </div>
                <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">Storage</span>
              </div>
              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                systemStatus.storage === 'Online' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {systemStatus.storage || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="bi bi-exclamation-triangle text-red-400"></i>
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}