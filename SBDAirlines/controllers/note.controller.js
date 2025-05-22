const Note = require('../models/note.model');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
}).single('image');

const getNotesByUserId = async (req, res) => {
  try {
    const notes = await Note.find({ user_id: req.params.userId })
      .populate('tags')
      .sort({ created_at: -1 });
    
    res.status(200).json({
      success: true,
      payload: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('tags');
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    res.status(200).json({
      success: true,
      payload: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createNote = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      // Debug: Log the incoming request body to see what we're receiving
      console.log("Request body:", req.body);
      
      // Check if user_id exists and is valid
      if (!req.body.user_id) {
        return res.status(400).json({
          success: false,
          message: "user_id is required"
        });
      }

      const noteData = {
        title: req.body.title,
        content: req.body.content,
        user_id: req.body.user_id,
      };

      // Process tags if available
      if (req.body.tags) {
        noteData.tags = Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags);
      } else if (req.body['tags[]']) {
        noteData.tags = Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : [req.body['tags[]']];
      }

      // Add image if uploaded
      if (req.file) {
        noteData.image_url = `/uploads/${req.file.filename}`;
      }

      const newNote = new Note(noteData);
      const savedNote = await newNote.save();
      
      // Populate tags before sending response
      const populatedNote = await Note.findById(savedNote._id).populate('tags');
      
      res.status(201).json({ success: true, payload: populatedNote });
    } catch (error) {
      console.error("Note creation error:", error);
      res.status(400).json({ 
        success: false, 
        message: error.message,
        details: error.errors ? Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        })) : null
      });
    }
  });
};

const updateNote = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const noteId = req.params.id;
      const { title, content, tags } = req.body;
      
      const note = await Note.findById(noteId);
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }
      
      // Process tags
      let tagIds = [];
      if (tags) {
        // If tags is an array in string format (from FormData)
        if (req.body['tags[]']) {
          const tagsArray = Array.isArray(req.body['tags[]']) 
            ? req.body['tags[]'] 
            : [req.body['tags[]']];
          tagIds = tagsArray;
        } else {
          tagIds = Array.isArray(tags) ? tags : JSON.parse(tags);
        }
      }

      const updateData = {
        title: title || note.title,
        content: content || note.content,
        tags: tagIds.length > 0 ? tagIds : note.tags,
        updated_at: Date.now()
      };

      // Handle image upload
      if (req.file) {
        // Delete old image if it exists
        if (note.image_url) {
          const oldImagePath = path.join(__dirname, '..', note.image_url);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        updateData.image_url = `/uploads/${req.file.filename}`;
      }

      const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        updateData,
        { new: true, runValidators: true }
      ).populate('tags');

      res.status(200).json({
        success: true,
        payload: updatedNote
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Delete associated image if exists
    if (note.image_url) {
      const imagePath = path.join(__dirname, '..', note.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Note.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getNotesByUserId,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
};