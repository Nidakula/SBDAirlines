import React from 'react';
import { useTheme } from '../themeContext';
// Komponen Kartu
export default function Card({ title, body, image }) {
  const { darkMode } = useTheme();
  
  return (
    <div className={`rounded-lg overflow-hidden shadow-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} transition-colors duration-300 h-full flex flex-col`}>
      <div className="relative overflow-hidden">
        <img 
          className="w-full h-56 object-cover transition-transform duration-700 hover:scale-110" 
          src={image} 
          alt={title} 
        />
        <div className={`absolute inset-0 ${darkMode ? 'bg-blue-900' : 'bg-blue-500'} opacity-20`}></div>
      </div>
      
      <div className="p-5 flex-grow">
        <h2 className="font-bold text-xl mb-3 line-clamp-1">{title}</h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-4 mb-4`}>
          {body.replace(/\\n/g, ' ')}
        </p>
      </div>
      
      <div className="px-5 pb-5 mt-auto">
        <button className={`px-4 py-2 rounded-md ${darkMode ? 
          'bg-blue-600 hover:bg-blue-600 text-white' : 
          'bg-blue-500 hover:bg-blue-600 text-white'
        } transition-colors duration-300 w-full font-medium`}>
          Read More
        </button>
      </div>
    </div>
  );
}