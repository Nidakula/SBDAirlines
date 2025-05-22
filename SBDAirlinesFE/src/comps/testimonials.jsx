import React from 'react';
import { useTheme } from '../themeContext';
import { testimonials } from '../data/testimonials';

export default function TestimonialsSection() {
  const { darkMode } = useTheme();
  
  return (
    <section className="py-20 relative z-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            What Our Passengers Say
          </h2>
          <div className="h-1 w-24 bg-indigo-500 mx-auto rounded-full mb-6"></div>
          <p className={`max-w-2xl mx-auto ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Thousands of satisfied travelers choose SBD Airlines for their journeys.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className={`
                p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl
                ${darkMode 
                  ? "bg-gray-700/70 border border-gray-600/50" 
                  : "bg-white/80 border border-gray-100/50 backdrop-blur-sm"
                }
              `}
            >
              <div className="mb-6">
                <svg 
                  className={`w-10 h-10 ${darkMode ? "text-indigo-400" : "text-indigo-500"} mb-4 opacity-50`} 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                
                <p className={`italic mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  "{testimonial.quote}"
                </p>
              </div>
              
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500"
                  />
                </div>
                <div>
                  <h4 className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {testimonial.author}
                  </h4>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {testimonial.position}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">          <p className={`text-lg font-medium mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Begin your journey with us today!
          </p>
          <a 
            href="/register" 
            className={`
              inline-block px-8 py-4 rounded-lg text-white font-semibold transition-all transform hover:scale-105
              ${darkMode 
                ? "bg-gradient-to-r from-indigo-600 to-purple-700 hover:shadow-lg hover:shadow-indigo-500/30" 
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30"
              }
            `}
          >
            Join Frequent Flyer Program
          </a>
        </div>
      </div>
    </section>
  );
}