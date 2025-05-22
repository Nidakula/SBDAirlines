const { Penerbangan } = require('../models/index.model');

const getAllFlights = async (req, res) => {
  try {
    const flights = await Penerbangan.find()
      .populate('maskapai_id')
      .populate('pesawat_id')
      .populate('gate_id');
    res.status(200).json(flights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFlightById = async (req, res) => {
  try {
    const flight = await Penerbangan.findById(req.params.id)
      .populate('maskapai_id')
      .populate('pesawat_id')
      .populate('gate_id');
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    res.status(200).json(flight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFlight = async (req, res) => {
  try {
    const newFlight = new Penerbangan(req.body);
    const savedFlight = await newFlight.save();
    res.status(201).json(savedFlight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFlight = async (req, res) => {
  try {
    const updatedFlight = await Penerbangan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedFlight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    res.status(200).json(updatedFlight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFlight = async (req, res) => {
  try {
    const deletedFlight = await Penerbangan.findByIdAndDelete(req.params.id);
    
    if (!deletedFlight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    res.status(200).json({ message: 'Flight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight
};