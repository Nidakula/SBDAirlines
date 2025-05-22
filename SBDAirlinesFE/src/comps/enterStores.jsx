import React from 'react';
import { useTheme } from '../themeContext';
import { Link } from 'react-router-dom';

export default function EnterStores() {
  const { darkMode } = useTheme();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  return (
    <>
      <div className="mb-16 text-center">
        <div className="inline-block">
          <div className="flex justify-center mb-4">
            <div className={`h-1 w-24 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 relative ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Toko-Toko Terbaik Kami
            <span className="absolute -left-3 -top-3 w-10 h-10 rounded-full opacity-20 bg-blue-500 -z-10 hidden md:block"></span>
          </h1>
        </div>
        
        <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Explore our <span className="text-blue-500 font-medium">partner stores</span> across Indonesia and find the best products at great prices.
        </p>
        
        <div className="flex justify-center mt-12">
          {isLoggedIn ? (
            <Link 
              to="/stores"
              className={`
                px-8 py-3.5 rounded-lg text-white font-semibold text-lg
                transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                ${darkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                } 
                focus:outline-none focus:ring-4 ${darkMode ? 'focus:ring-blue-800' : 'focus:ring-blue-300'}
                shadow-lg flex items-center gap-2
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              View Stores
            </Link>
          ) : (
            <Link 
              to="/login"
              className={`
                px-8 py-3.5 rounded-lg text-white font-semibold text-lg
                transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                ${darkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                } 
                focus:outline-none focus:ring-4 ${darkMode ? 'focus:ring-blue-800' : 'focus:ring-blue-300'}
                shadow-lg flex items-center gap-2
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login to View Stores
            </Link>
          )}
        </div>
      </div>
    </>
  );
}