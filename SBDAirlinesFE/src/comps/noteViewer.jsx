import React, { useState } from 'react';

const NoteViewer = ({ note, onClose, onDelete, tags, darkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  
  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(note.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
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
    setRemoveCurrentImage(false);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveCurrentImage(true);
    const fileInput = document.getElementById('editNoteImage');
    if (fileInput) fileInput.value = '';
  };
  
  return (
    <div className={`${
      darkMode 
        ? 'bg-gray-900/80 text-white' 
        : 'bg-gray-100/80 text-gray-800'
    } backdrop-blur-sm rounded-lg shadow-lg p-8 transition-colors duration-300`}>
      <div className="flex justify-between items-start mb-6">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`text-3xl font-bold w-full pb-3 focus:outline-none ${
              darkMode 
                ? 'bg-transparent border-b border-gray-700 focus:border-indigo-500' 
                : 'bg-transparent border-b border-gray-300 focus:border-indigo-500'
            }`} 
          />
        ) : (
          <h2 className="text-3xl font-bold">{note.title}</h2> 
        )}
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className={`px-4 py-2 text-base rounded ${
                  darkMode 
                    ? 'border border-gray-700 hover:bg-gray-800' 
                    : 'border border-gray-300 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 text-base rounded text-white ${
                  darkMode 
                    ? 'bg-indigo-500 hover:bg-indigo-600' 
                    : 'bg-indigo-500 hover:bg-indigo-600'
                }`} 
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className={`px-4 py-2 text-base rounded ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`} 
              >
                Edit
              </button>
              <button 
                onClick={handleDelete}
                className={`px-4 py-2 text-base rounded ${
                  confirmDelete 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : darkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`} 
              >
                {confirmDelete ? 'Confirm Delete' : 'Delete'}
              </button>
              <button 
                onClick={onClose}
                className={`px-4 py-2 text-base rounded ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`} 
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className={`flex items-center text-base mb-5 ${
        darkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <span>Created: {formatDate(note.created_at)}</span>
        {note.updated_at && note.updated_at !== note.created_at && (
          <span className="ml-6">Updated: {formatDate(note.updated_at)}</span>
        )}
      </div>
      
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {note.tags.map(tag => (
            <span
              key={tag.id}
              className="px-3 py-1.5 text-sm rounded-full text-white"
              style={{ backgroundColor: tag.color || '#6366F1' }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      
      {isEditing ? (
        <div className="mb-6">
          <label className={`block font-medium mb-3 text-xl ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}> 
            Image
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              id="editNoteImage"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label 
              htmlFor="editNoteImage" 
              className={`px-5 py-3 rounded cursor-pointer transition-colors text-base ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
              }`} 
            >
              {note.image_url && !removeCurrentImage ? 'Change Image' : 'Add Image'}
            </label>
            {(note.image_url && !removeCurrentImage) || imageFile ? (
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
            ) : null}
          </div>
          
          {imagePreview ? (
            <div className={`mt-4 border rounded-lg overflow-hidden ${
              darkMode ? 'border-gray-700' : 'border-gray-300'
            }`}> 
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-80 max-w-full object-contain mx-auto" 
              />
            </div>
          ) : note.image_url && !removeCurrentImage ? (
            <div className={`mt-4 border rounded-lg overflow-hidden ${
              darkMode ? 'border-gray-700' : 'border-gray-300'
            }`}> 
              <img 
                src={note.image_url} 
                alt={note.title} 
                className="max-h-80 max-w-full object-contain mx-auto" 
              />
            </div>
          ) : null}
        </div>
      ) : note.image_url ? (
        <div className={`mb-6 border rounded-lg overflow-hidden ${
          darkMode ? 'border-gray-700' : 'border-gray-300'
        }`}>
          <img 
            src={note.image_url} 
            alt={note.title} 
            className="max-h-[420px] max-w-full object-contain mx-auto"
          />
        </div>
      ) : null}
      
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`w-full min-h-[250px] p-5 border rounded-lg focus:outline-none focus:ring-2 text-lg ${
            darkMode 
              ? 'bg-gray-800/70 border-gray-700 text-white focus:ring-indigo-500' 
              : 'bg-white/80 border-gray-300 text-gray-800 focus:ring-indigo-500'
          }`} 
        />
      ) : (
        <div className={`p-6 rounded-lg whitespace-pre-wrap text-lg leading-relaxed ${
          darkMode ? 'bg-gray-800/70' : 'bg-white/80'
        }`}> 
          {note.content}
        </div>
      )}
    </div>
  );
};

export default NoteViewer;