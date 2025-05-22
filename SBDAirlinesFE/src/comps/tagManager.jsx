import React from 'react';

const TagManager = ({ 
  tags, 
  isTagsLoading, 
  showTagForm, 
  setShowTagForm, 
  newTagName, 
  setNewTagName, 
  newTagColor, 
  setNewTagColor, 
  handleCreateTag,
  handleDeleteTag,
  darkMode
}) => {
  
  const onSubmitTagForm = (e) => {
    e.preventDefault();
    const formattedColor = newTagColor.startsWith('#') ? newTagColor : `#${newTagColor}`;
    handleCreateTag(e, formattedColor);
  };
  
  return (
    <div className={`${
      darkMode 
        ? 'bg-gray-900/80 text-white' 
        : 'bg-gray-100/80 text-gray-800'
    } backdrop-blur-sm rounded-lg shadow-lg p-8 mb-8 transition-colors duration-300`}> 
      <div className="flex justify-between items-center mb-6"> 
        <h2 className="text-2xl font-bold">Your Tags</h2> 
        <button 
          onClick={() => setShowTagForm(!showTagForm)}
          className={`${
            darkMode 
              ? 'bg-indigo-500 hover:bg-indigo-600' 
              : 'bg-indigo-500 hover:bg-indigo-600'
          } text-white px-4 py-2 rounded text-base transition-colors duration-200`} 
        >
          {showTagForm ? 'Cancel' : 'New Tag'}
        </button>
      </div>
      
      {showTagForm && (
        <form onSubmit={onSubmitTagForm} className={`mb-6 p-6 border rounded-lg ${
          darkMode 
            ? 'bg-gray-800/70 border-gray-700' 
            : 'bg-gray-200/70 border-gray-300'
        }`}> 
          <div className="flex gap-4 items-end"> 
            <div className="flex-1">
              <label htmlFor="tagName" className={`block text-base font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } mb-2`}> 
                Tag Name
              </label>
              <input
                type="text"
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  darkMode 
                    ? 'bg-gray-700/70 border-gray-600 text-white focus:ring-indigo-500' 
                    : 'bg-white/80 border-gray-300 text-gray-800 focus:ring-indigo-500'
                } text-base`} 
                placeholder="Work, Personal, etc."
                required
              />
            </div>
            <div>
              <label htmlFor="tagColor" className={`block text-base font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } mb-2`}> 
                Color
              </label>
              <input
                type="color"
                id="tagColor"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-12 h-12 border rounded cursor-pointer" 
              />
            </div>
            <button
              type="submit"
              className={`${
                darkMode 
                  ? 'bg-indigo-500 hover:bg-indigo-600' 
                  : 'bg-indigo-500 hover:bg-indigo-600'
              } text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-base`} 
            >
              Add Tag
            </button>
          </div>
        </form>
      )}
      
      {isTagsLoading ? (
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-lg`}>Loading tags...</p> 
      ) : tags.length === 0 ? (
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-lg`}>No tags yet. Create your first tag!</p> 
      ) : (
        <div className="flex flex-wrap gap-3"> 
          {tags.map(tag => (
            <div 
              key={tag.id} 
              className="flex items-center px-4 py-2 rounded-full text-white text-base group relative" 
              style={{ backgroundColor: tag.color || '#6366F1' }}
            >
              {tag.name}
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="ml-2 text-sm bg-white/20 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-100 hover:bg-white/30"
                title="Delete tag"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagManager;