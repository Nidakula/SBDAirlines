import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../themeContext';
import { screenshots } from '../data/screenshots';

export default function ImageCarousel() {
  const { darkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);
  
  function resetTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }
  
  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === screenshots.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    
    return () => resetTimeout();
  }, [currentIndex]);
  
  return (
    <section className="py-20 relative z-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Premium Flights with World-Class Service
          </h2>
          <p className={`max-w-2xl mx-auto ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Experience luxury and comfort in every journey with SBD Airlines. From boarding to landing, we ensure a seamless experience.
          </p>
        </div>
        
        <div className="relative max-w-5xl mx-auto overflow-hidden rounded-xl shadow-2xl">
          {/* Shadow overlays for depth effect */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/20 to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/20 to-transparent z-10"></div>
          
          {/* Main carousel container */}
          <div 
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {screenshots.map((src, index) => (
              <div 
                key={index} 
                className="min-w-full flex-shrink-0 h-[500px] md:h-[600px]"
              >
                <img 
                  src={src} 
                  alt={`App screenshot ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          
          {/* Navigation dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {screenshots.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${
                  currentIndex === index 
                    ? "bg-indigo-500" 
                    : "bg-white/50 hover:bg-white/80"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}