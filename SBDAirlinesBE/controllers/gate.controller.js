const { Gate } = require('../models/index.model');

const getAllGates = async (req, res) => {
  try {
    const gates = await Gate.find().populate('terminal_id');
    res.status(200).json(gates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGateById = async (req, res) => {
  try {
    const gate = await Gate.findById(req.params.id).populate('terminal_id');
    if (!gate) {
      return res.status(404).json({ message: 'Gate not found' });
    }
    res.status(200).json(gate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createGate = async (req, res) => {
  try {
    const newGate = new Gate(req.body);
    const savedGate = await newGate.save();
    res.status(201).json(savedGate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateGate = async (req, res) => {
  try {
    const updatedGate = await Gate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedGate) {
      return res.status(404).json({ message: 'Gate not found' });
    }
    
    res.status(200).json(updatedGate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteGate = async (req, res) => {
  try {
    const deletedGate = await Gate.findByIdAndDelete(req.params.id);
    
    if (!deletedGate) {
      return res.status(404).json({ message: 'Gate not found' });
    }
    
    res.status(200).json({ message: 'Gate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllGates,
  getGateById,
  createGate,
  updateGate,
  deleteGate
};