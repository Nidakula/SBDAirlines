const { Terminal } = require('../models/index.model');

const getAllTerminals = async (req, res) => {
  try {
    const terminals = await Terminal.find();
    res.status(200).json(terminals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTerminalById = async (req, res) => {
  try {
    const terminal = await Terminal.findById(req.params.id);
    if (!terminal) {
      return res.status(404).json({ message: 'Terminal not found' });
    }
    res.status(200).json(terminal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTerminal = async (req, res) => {
  try {
    const newTerminal = new Terminal(req.body);
    const savedTerminal = await newTerminal.save();
    res.status(201).json(savedTerminal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTerminal = async (req, res) => {
  try {
    const updatedTerminal = await Terminal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedTerminal) {
      return res.status(404).json({ message: 'Terminal not found' });
    }
    
    res.status(200).json(updatedTerminal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTerminal = async (req, res) => {
  try {
    const deletedTerminal = await Terminal.findByIdAndDelete(req.params.id);
    
    if (!deletedTerminal) {
      return res.status(404).json({ message: 'Terminal not found' });
    }
    
    res.status(200).json({ message: 'Terminal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllTerminals,
  getTerminalById,
  createTerminal,
  updateTerminal,
  deleteTerminal
};