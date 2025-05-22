import React from 'react';
import { useTheme } from '../themeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center w-14 h-8 rounded-full px-1 bg-gray-200 dark:bg-gray-700 transition-colors duration-200 focus:outline-none relative"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun size={18} className="text-yellow-400" />
      <span
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
          darkMode ? 'translate-x-6' : ''
        }`}
      />
      <Moon size={18} className="text-gray-500 ml-auto" />
    </button>
  );
}