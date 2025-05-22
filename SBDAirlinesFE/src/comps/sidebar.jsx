import React, { useRef, useEffect } from 'react';

const Sidebar = ({ user, notes, isLoading, onNoteSelect, selectedNoteId, darkMode }) => {

  const tagContainerRefs = useRef({});
  
  useEffect(() => {
    notes.forEach(note => {
      if (!note.tags || note.tags.length <= 2) return; 
      
      const containerRef = tagContainerRefs.current[note.id];
      if (!containerRef) return;
      
      const content = containerRef.querySelector('.tag-content');
      if (!content) return;
      
      const contentWidth = content.scrollWidth;
      const containerWidth = containerRef.clientWidth;
      
      if (contentWidth <= containerWidth) return;
      
      const duration = Math.max(contentWidth * 40, 5000);
      
      let startTime = null;
      let animationFrame = null;
      
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        const scrollDistance = contentWidth - containerWidth;
        const scrollProgress = (elapsed % duration) / duration;
        const position = scrollProgress * scrollDistance;
        
        content.style.transform = `translateX(-${position}px)`;
        
        animationFrame = requestAnimationFrame(animate);
      };
      
      animationFrame = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    });
  }, [notes]);
  
  return (
    <div className={`w-full h-full ${
      darkMode 
        ? 'bg-gray-900/80 text-white border-r border-gray-800' 
        : 'bg-gray-100/80 text-gray-800 border-r border-gray-300'
    } backdrop-blur-sm shadow-lg flex flex-col transition-colors duration-300`}>
      <div className={`p-6 ${
        darkMode ? 'border-b border-gray-800' : 'border-b border-gray-300'
      }`}>
        <h2 className="text-2xl font-semibold mb-1"> 
          {user ? `${user.name}` : 'My Notes'}
        </h2>
        <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}> 
          {user?.email}
        </p>
      </div>
      
      <div className="p-5 flex-1 overflow-y-auto"> 
        <h3 className={`font-medium text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}> 
          Your Notes
        </h3>
        {isLoading ? (
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-base`}>Loading notes...</p> 
        ) : notes.length === 0 ? (
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-base`}>
            No notes yet. Create your first note!
          </p>
        ) : (
          <div className="space-y-3"> 
            {notes.map(note => (
              <div 
                key={note.id} 
                className={`p-3 rounded transition-colors duration-200 cursor-pointer ${
                  selectedNoteId === note.id 
                    ? darkMode 
                      ? 'bg-gray-800 shadow-md' 
                      : 'bg-gray-200 shadow-md'
                    : darkMode 
                      ? 'hover:bg-gray-800/70' 
                      : 'hover:bg-gray-200/70'
                }`} 
                onClick={() => onNoteSelect(note)}
              >
                {note.image_url && (
                  <div className="mb-2 h-20 overflow-hidden rounded border border-gray-600/30"> {/* Increased height and margin */}
                    <img 
                      src={note.image_url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <p className="font-medium truncate text-base">{note.title}</p> 
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                } truncate`}> 
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
                
                {note.tags && note.tags.length > 0 && (
                  <div 
                    className="relative w-full mt-2 overflow-hidden" 
                    ref={el => tagContainerRefs.current[note.id] = el}
                  >
                    <div className="tag-content inline-flex gap-1.5 py-1.5"> 
                      {note.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="inline-block flex-shrink-0 px-2.5 py-1 text-sm rounded-full text-white whitespace-nowrap"
                          style={{ backgroundColor: tag.color || '#6366F1' }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;