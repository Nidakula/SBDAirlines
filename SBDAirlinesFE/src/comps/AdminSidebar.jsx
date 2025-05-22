import React from 'react';
import { useTheme } from '../themeContext';

export default function AdminSidebar({ activeSection, setActiveSection }) {
  const { darkMode } = useTheme();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'airlines', label: 'Airlines', icon: 'building' },
    { id: 'aircraft', label: 'Aircraft', icon: 'airplane' },
    { id: 'terminals', label: 'Terminals', icon: 'door-open' },
    { id: 'gates', label: 'Gates', icon: 'signpost-split' },
    { id: 'passengers', label: 'Passengers', icon: 'people' },
    { id: 'flights', label: 'Flights', icon: 'airplane-engines' },
    { id: 'tickets', label: 'Tickets', icon: 'ticket-perforated' }
  ];

  return (
    <div
      className={`w-64 flex flex-col shadow-xl transition-colors duration-300
        ${darkMode
          ? 'bg-gradient-to-b from-gray-800 to-gray-900 text-white'
          : 'bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900'}
      `}
    >
      <div className={`p-6 border-b flex items-center space-x-3 transition-colors duration-300
        ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}
      >
        <i className={`bi bi-airplane text-2xl ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}></i>
        <h1 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r
          ${darkMode ? 'from-indigo-400 to-purple-400' : 'from-indigo-600 to-purple-500'}`}
        >
          Airport Admin
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-1 px-3">
          {navItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 relative
                  ${activeSection === item.id
                    ? (darkMode
                        ? 'bg-indigo-600 text-white shadow-md pl-5'
                        : 'bg-indigo-100 text-indigo-900 shadow-md pl-5')
                    : (darkMode
                        ? 'text-gray-300 bg-gray-800 hover:bg-gray-700/50 hover:text-white hover:translate-x-1'
                        : 'text-gray-700 bg-white hover:bg-gray-200 hover:text-indigo-900 hover:translate-x-1')
                  }`}
              >
                {activeSection === item.id && (
                  <div className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${darkMode ? 'bg-indigo-400' : 'bg-indigo-600'}`}></div>
                )}
                <span className={`inline-flex items-center justify-center mr-3 ${
                  activeSection === item.id
                    ? (darkMode ? 'text-indigo-200' : 'text-indigo-600')
                    : (darkMode ? 'text-gray-400' : 'text-gray-400')
                }`}>
                  <i className={`bi bi-${item.icon} ${activeSection === item.id ? 'text-lg' : ''}`}></i>
                </span>
                <span className={activeSection === item.id ? 'font-medium' : ''}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className={`p-4 border-t transition-colors duration-300 ${darkMode ? 'border-gray-700/50' : 'border-gray-300/50'}`}>
        <button className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors group
          ${darkMode
            ? 'text-gray-300 bg-gray-800 hover:bg-red-500/10 hover:text-red-300'
            : 'text-gray-700 bg-white hover:bg-red-100 hover:text-red-500'}
        `}>
          <span className={`inline-flex items-center justify-center mr-3 transition-colors
            ${darkMode ? 'text-gray-400 group-hover:text-red-300' : 'text-gray-400 group-hover:text-red-500'}`}
          >
            <i className="bi bi-box-arrow-left"></i>
          </span>
          <span className="group-hover:translate-x-1 transition-transform duration-200">Logout</span>
        </button>
      </div>
    </div>
  );
}