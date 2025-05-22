import React, { useState, useEffect } from 'react';
import { noteService, tagService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../comps/sidebar';
import TagManager from '../comps/tagManager';
import NoteForm from '../comps/noteForm';
import NoteViewer from '../comps/noteViewer';
import { useTheme } from '../themeContext'; 

const Notes = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme(); 
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTagsLoading, setIsTagsLoading] = useState(true);
  
  const [selectedNote, setSelectedNote] = useState(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366F1'); 
  const [showTagForm, setShowTagForm] = useState(false);
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    fetchNotes(parsedUser.id);
    
    fetchTags(parsedUser.id);
  }, [navigate]);
  
  const fetchNotes = async (userId) => {
    try {
      setIsLoading(true);
      const response = await noteService.getNotesByUserId(userId);
      if (response.data.success) {
        setNotes(response.data.payload);
      } else {
        console.error("Failed to fetch notes:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTags = async (userId) => {
    try {
      setIsTagsLoading(true);
      const response = await tagService.getTagsByUserId(userId);
      if (response.data.success) {
        setTags(response.data.payload);
      } else {
        console.error("Failed to fetch tags:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsTagsLoading(false);
    }
  };
  

const handleCreateTag = async (e, formattedColor) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      alert("Tag name is required!");
      return;
    }
    
    try {
      const tagData = {
        name: newTagName,
        user_id: user.id,
        color: formattedColor || newTagColor  
      };
      
      console.log("Creating tag with color:", tagData.color); 
      const response = await tagService.createTag(tagData);
      
      if (response.data.success) {
        const newTag = response.data.payload;
        console.log("Created tag:", newTag); 
        
        setTags([...tags, newTag]);
        
        setNewTagName('');
        setNewTagColor('#6366F1');
        setShowTagForm(false);
      } else {
        alert(`Failed to create tag: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      alert("An error occurred while creating the tag.");
    }
  };
  
  const handleCreateNote = async (e, imageFile) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required!");
      return;
    }
    
    try {
      const noteData = {
        title,
        content,
        user_id: user.id,
        tags: selectedTags
      };
      
      const response = await noteService.createNote(noteData, imageFile);
      
      if (response.data.success) {
        setTitle('');
        setContent('');
        setSelectedTags([]);
        
        setNotes([response.data.payload, ...notes]);
      } else {
        alert(`Failed to create note: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error creating note:", error);
      alert("An error occurred while creating the note.");
    }
  };
    
  const handleTagSelection = (tagId) => {
    setSelectedTags(prevSelectedTags => {
      if (prevSelectedTags.includes(tagId)) {
        return prevSelectedTags.filter(id => id !== tagId);
      } else {
        return [...prevSelectedTags, tagId];
      }
    });
  };
  

const handleDeleteTag = async (tagId) => {
    try {
      const notesWithTag = notes.filter(note => 
        note.tags && note.tags.some(tag => tag.id === tagId)
      );
      
      if (notesWithTag.length > 0) {
        const confirm = window.confirm(
          `This tag is used in ${notesWithTag.length} note(s). Deleting it will remove the tag from these notes. Continue?`
        );
        
        if (!confirm) {
          return;
        }
      }
      
      const response = await tagService.deleteTag(tagId);
      
      if (response.data.success) {
        setTags(tags.filter(tag => tag.id !== tagId));
        
        setNotes(notes.map(note => {
          if (note.tags && note.tags.some(tag => tag.id === tagId)) {
            return {
              ...note,
              tags: note.tags.filter(tag => tag.id !== tagId)
            };
          }
          return note;
        }));
        
        setSelectedTags(selectedTags.filter(id => id !== tagId));
        
      } else {
        alert(`Failed to delete tag: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      alert("An error occurred while deleting the tag.");
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await noteService.deleteNote(noteId);
      
      if (response.data.success) {
        setNotes(notes.filter(note => note.id !== noteId));
        setSelectedNote(null);
      } else {
        alert(`Failed to delete note: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("An error occurred while deleting the note.");
    }
  };
  
  const handleNoteSelect = (note) => {
    setSelectedNote(note);
  };
  
  return (
    <div className={`flex h-screen bg-transparent mt-[100px] ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
      <div className="w-72 shrink-0">
        <Sidebar 
          user={user} 
          notes={notes} 
          isLoading={isLoading}
          onNoteSelect={handleNoteSelect}
          selectedNoteId={selectedNote?.id}
          darkMode={darkMode}
        />
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto"> 
          <TagManager
            tags={tags}
            isTagsLoading={isTagsLoading}
            showTagForm={showTagForm}
            setShowTagForm={setShowTagForm}
            newTagName={newTagName}
            setNewTagName={setNewTagName}
            newTagColor={newTagColor}
            setNewTagColor={setNewTagColor}
            handleCreateTag={handleCreateTag}
            handleDeleteTag={handleDeleteTag}
            darkMode={darkMode}
          />
          
          {selectedNote ? (
            <NoteViewer
              note={selectedNote}
              onClose={() => setSelectedNote(null)}
              onDelete={handleDeleteNote}
              tags={tags}
              darkMode={darkMode}
            />
          ) : (
            <NoteForm
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              tags={tags}
              selectedTags={selectedTags}
              handleTagSelection={handleTagSelection}
              handleCreateNote={handleCreateNote}
              darkMode={darkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;