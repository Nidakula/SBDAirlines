import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../themeContext';
import ThemeToggle from './themeToggle';

export default function Navbar() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 shadow-md ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link 
            to="/" 
            className={`text-2xl font-bold flex items-center ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            <img
              src="/sbd-airlines-icon.png"
              alt="SBD Airlines Logo"
              className="mr-2 h-9 w-9 rounded"
            />
            SBD Airlines
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className={`font-medium ${
                darkMode ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            {isLoggedIn ? (
              <Link 
                to="/bookflight" 
                className={`font-medium ${
                  darkMode ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'
                }`}
              >
                Book Flight
              </Link>
            ) : (
              <Link 
                to="/login" 
                className={`font-medium ${
                  darkMode ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'
                }`}
              >
                Get Started
              </Link>
            )}
            {isLoggedIn && (
              <>
                <Link 
                  to="/my-tickets" 
                  className={`font-medium ${
                    darkMode ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'
                  }`}
                >
                  My Trips
                </Link>
                <Link 
                  to="/bookmarks" 
                  className={`font-medium ${
                    darkMode ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'
                  }`}
                >
                  Bookmarks
                </Link>
                <Link 
                  to="/admin" 
                  className={`px-4 py-2 rounded-lg font-semibold shadow transition-all duration-200 border border-blue-500 ml-2
                    ${darkMode
                      ? 'bg-blue-700 text-white hover:bg-blue-800 hover:text-blue-200 border-blue-700'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900 border-blue-300'}
                  `}
                >
                  Admin Panel
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}