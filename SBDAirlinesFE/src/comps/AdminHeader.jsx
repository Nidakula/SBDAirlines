import React from 'react';

export default function AdminHeader() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md z-10">
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Panel</h2>
        </div>
        <div className="flex items-center">
          <div className="relative mr-4">
            <input 
              type="text" 
              placeholder="Search..." 
              className="px-3 py-2 pr-8 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <i className="bi bi-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
          </div>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <span>A</span>
            </div>
            <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">Admin User</span>
          </div>
        </div>
      </div>
    </header>
  );
}