import React, { useState } from 'react';

export default function DataTable({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  onView,
  isLoading,
  error 
}) {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredData = data.filter(item => {
    return columns.some(column => {
      const value = item[column.field]?.toString().toLowerCase() || '';
      return value.includes(search.toLowerCase());
    });
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
        <div className="text-red-600 dark:text-red-400 mb-2 font-medium">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm px-3 py-1 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent shadow-sm transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium bg-blue-50 dark:bg-gray-900 px-3 py-1 rounded-lg shadow-sm">
            Total: {data.length} records
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-xl overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.field} 
                  scope="col" 
                  className="px-6 py-4 text-left text-xs font-semibold text-blue-900 dark:text-blue-200 uppercase tracking-wider cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors select-none"
                  onClick={() => handleSort(column.field)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {sortField === column.field && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? 
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg> 
                          : 
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        }
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr 
                  key={item.id || index} 
                  className={`transition-colors ${index % 2 === 0 ? 'bg-blue-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'} hover:bg-blue-100 dark:hover:bg-gray-700`}
                >
                  {columns.map((column) => (
                    <td key={column.field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {column.render ? column.render(item) : item[column.field]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end gap-2">
                      {onView && (
                        <button 
                          onClick={() => onView(item)} 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors p-1"
                          title="View details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(item)} 
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors p-1"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(item)} 
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors p-1"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-gray-900">
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No data found</p>
                    {search && (
                      <button 
                        onClick={() => setSearch('')} 
                        className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="bg-gradient-to-r from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(startIndex + itemsPerPage, sortedData.length)}</span> of <span className="font-semibold">{sortedData.length}</span> results
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-700 border border-blue-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Previous
            </button>
            <div className="hidden md:flex space-x-1">
              {[...Array(Math.min(5, totalPages)).keys()].map(i => {
                const pageNum = Math.min(Math.max(currentPage - 2, 1) + i, totalPages);
                if (pageNum > totalPages) return null;
                
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg ${
                      currentPage === pageNum 
                        ? 'bg-blue-600 dark:bg-blue-700 text-white shadow' 
                        : 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-800'
                    } transition shadow-sm`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-700 border border-blue-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}