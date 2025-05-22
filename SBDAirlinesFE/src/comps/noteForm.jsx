import React, { useState } from 'react';

const NoteForm = ({ 
  title, 
  setTitle, 
  content, 
  setContent, 
  tags, 
  selectedTags, 
  handleTagSelection, 
  handleCreateNote,
  darkMode
}) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('noteImage');
    if (fileInput) fileInput.value = '';
  };
  
  const onSubmitNote = (e) => {
    e.preventDefault();
    handleCreateNote(e, imageFile);
  };
  
  return (
    <div className={`${
      darkMode 
        ? 'bg-gray-900/80 text-white' 
        : 'bg-gray-100/80 text-gray-800'
    } backdrop-blur-sm rounded-lg shadow-lg p-8 transition-colors duration-300`}>
      <h1 className="text-3xl font-bold mb-8">New Note</h1> 
      
      <form onSubmit={onSubmitNote}>
        <div className="mb-6"> 
          <label htmlFor="title" className={`block font-medium mb-3 text-xl ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}> 
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-lg ${
              darkMode 
                ? 'bg-gray-800/70 border-gray-700 text-white focus:ring-indigo-500' 
                : 'bg-white/80 border-gray-300 text-gray-800 focus:ring-indigo-500'
            }`} 
            placeholder="Note title"
            required
          />
        </div>
        
        <div className="mb-6"> 
          <label htmlFor="content" className={`block font-medium mb-3 text-xl ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}> 
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="12" /* Increased rows */
            className={`w-full px-5 py-4 border rounded-lg focus:outline-none focus:ring-2 text-lg ${
              darkMode 
                ? 'bg-gray-800/70 border-gray-700 text-white focus:ring-indigo-500' 
                : 'bg-white/80 border-gray-300 text-gray-800 focus:ring-indigo-500'
            }`} 
            placeholder="Your thoughts here..."
            required
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className={`block font-medium mb-3 text-xl ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}> 
            Image (Optional)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              id="noteImage"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label 
              htmlFor="noteImage" 
              className={`px-5 py-3 rounded cursor-pointer transition-colors text-base ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
              }`} 
            >
              Select Image
            </label>
            {imageFile && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className={`px-4 py-2 rounded text-base transition-colors ${
                  darkMode 
                    ? 'bg-red-600/80 text-white hover:bg-red-700/80' 
                    : 'bg-red-500/80 text-white hover:bg-red-600/80'
                }`} 
              >
                Remove Image
              </button>
            )}
          </div>
          
          {imagePreview && (
            <div className={`mt-4 border rounded-lg overflow-hidden ${
              darkMode ? 'border-gray-700' : 'border-gray-300'
            }`}> 
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-80 max-w-full object-contain mx-auto" 
              />
              <p className={`text-base mt-2 px-4 pb-3 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
        </div>
        
        {tags.length > 0 && (
          <div className="mb-8"> 
            <label className={`block font-medium mb-3 text-xl ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}> 
              Tags
            </label>
            <div className="flex flex-wrap gap-3">
              {tags.map(tag => (
                <div 
                  key={tag.id}
                  onClick={() => handleTagSelection(tag.id)}
                  className={`px-4 py-2 rounded-full text-white text-base cursor-pointer transition-opacity ${
                    selectedTags.includes(tag.id) ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                  }`} 
                  style={{ backgroundColor: tag.color || '#6366F1' }}
                >
                  {tag.name}
                </div>
              ))}
            </div>
            <p className={`text-base mt-3 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Click to attach tags to your note.
            </p>
          </div>
        )}
        
        <button
          type="submit"
          className={`${
            darkMode 
              ? 'bg-indigo-500 hover:bg-indigo-600' 
              : 'bg-indigo-500 hover:bg-indigo-600'
          } text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg`} 
        >
          Create Note
        </button>
      </form>
    </div>
  );
};

export default NoteForm;