const { Tag, Note } = require('../models/index.model');

const getTagsByUserId = async (req, res) => {
  try {
    const tags = await Tag.find({ user_id: req.params.userId });
    res.status(200).json({
      success: true,
      payload: tags
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createTag = async (req, res) => {
  try {
    const { name, color, user_id } = req.body;
    
    // Validate required fields
    if (!name || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Name and user_id are required'
      });
    }
    
    // Check if tag with same name already exists for this user
    const existingTag = await Tag.findOne({ name, user_id });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Tag with this name already exists'
      });
    }

    const newTag = new Tag({
      name,
      color: color || '#6366F1',
      user_id
    });

    const savedTag = await newTag.save();
    res.status(201).json({
      success: true,
      payload: savedTag
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    // Find the tag
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    
    // Check if another tag with the new name already exists for this user
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({ 
        name, 
        user_id: tag.user_id,
        _id: { $ne: tag._id } 
      });
      
      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: 'Another tag with this name already exists'
        });
      }
    }

    const updatedTag = await Tag.findByIdAndUpdate(
      req.params.id,
      { name, color },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      payload: updatedTag
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteTag = async (req, res) => {
  try {
    const tagId = req.params.id;
    
    // Find tag
    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    
    // Remove this tag from all notes that use it
    await Note.updateMany(
      { tags: tagId },
      { $pull: { tags: tagId } }
    );
    
    // Delete the tag
    await Tag.findByIdAndDelete(tagId);
    
    res.status(200).json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getTagsByUserId,
  createTag,
  updateTag,
  deleteTag
};