const express = require('express');
const router = express.Router();
const {
  getTagsByUserId,
  createTag,
  updateTag,
  deleteTag
} = require('../controllers/tag.controller');

// Get all tags by user ID
router.get('/user/:userId', getTagsByUserId);

// Create a new tag
router.post('/', createTag);

// Update a tag
router.put('/:id', updateTag);

// Delete a tag
router.delete('/:id', deleteTag);

module.exports = router;