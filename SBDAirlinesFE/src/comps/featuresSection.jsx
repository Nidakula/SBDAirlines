import React from 'react';
import { useTheme } from '../themeContext';
import { features } from '../data/features';

export default function FeaturesSection() {
  const { darkMode } = useTheme();
  
  return (
    <section id="features" className="py-20 relative z-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="inline-block">
            <div className="flex justify-center mb-4">
              <div className={`h-1 w-24 rounded-full ${darkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}></div>
            </div>
            
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 relative ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Features
              <span className="absolute -left-3 -top-3 w-10 h-10 rounded-full opacity-20 bg-indigo-500 -z-10 hidden md:block"></span>
            </h2>
          </div>
            <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Discover what makes <span className="text-indigo-500 font-medium">SBD Airlines</span> your premier choice for air travel
          </p>
        </div>
        
        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                darkMode ? 'bg-gray-800/50 backdrop-blur-sm text-white' : 'bg-white/80 backdrop-blur-sm border border-gray-100/50 text-gray-800'
              }`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{feature.description}</p>
            </div>
          ))}
        </div>
        
        {/* Get started button */}
        <div className="flex justify-center mt-12">          <a 
            href="/login"
            className={`
              px-8 py-3.5 rounded-lg text-white font-semibold text-lg
              transition-all duration-300 transform hover:scale-105 hover:shadow-xl
              ${darkMode 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
              } 
              focus:outline-none focus:ring-4 ${darkMode ? 'focus:ring-indigo-800' : 'focus:ring-indigo-300'}
              shadow-lg flex items-center gap-2
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Book Now
          </a>
        </div>
      </div>
    </section>
  );
}