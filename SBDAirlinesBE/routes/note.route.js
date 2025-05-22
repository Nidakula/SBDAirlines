const express = require('express');
const router = express.Router();
const {
  getNotesByUserId,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
} = require('../controllers/note.controller');

// Get all notes by user ID
router.get('/user/:userId', getNotesByUserId);

// Get note by ID
router.get('/:id', getNoteById);

// Create a new note
router.post('/', createNote);

// Update a note
router.put('/:id', updateNote);

// Delete a note
router.delete('/:id', deleteNote);

module.exports = router;