const { Maskapai } = require('../models/index.model');

const getAllAirlines = async (req, res) => {
  try {
    const airlines = await Maskapai.find();
    res.status(200).json(airlines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAirlineById = async (req, res) => {
  try {
    const airline = await Maskapai.findById(req.params.id);
    if (!airline) {
      return res.status(404).json({ message: 'Airline not found' });
    }
    res.status(200).json(airline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAirline = async (req, res) => {
  try {
    const newAirline = new Maskapai(req.body);
    const savedAirline = await newAirline.save();
    res.status(201).json(savedAirline);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAirline = async (req, res) => {
  try {
    const updatedAirline = await Maskapai.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedAirline) {
      return res.status(404).json({ message: 'Airline not found' });
    }
    
    res.status(200).json(updatedAirline);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAirline = async (req, res) => {
  try {
    const deletedAirline = await Maskapai.findByIdAndDelete(req.params.id);
    
    if (!deletedAirline) {
      return res.status(404).json({ message: 'Airline not found' });
    }
    
    res.status(200).json({ message: 'Airline deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAirlines,
  getAirlineById,
  createAirline,
  updateAirline,
  deleteAirline
};