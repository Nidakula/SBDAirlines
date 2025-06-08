const { Penerbangan, Maskapai, Pesawat, Gate } = require('../models/index.model');
const mongoose = require('mongoose');

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
  const session = await mongoose.startSession();
  
  try {
    const { maskapai_id, pesawat_id, gate_id, asal_bandara, tujuan_bandara, jadwal_keberangkatan, jadwal_kedatangan, status_penerbangan } = req.body;

    const [airline, aircraft, gate] = await Promise.all([
      Maskapai.findById(maskapai_id),
      Pesawat.findById(pesawat_id),
      Gate.findById(gate_id)
    ]);

    if (!airline) {
      return res.status(400).json({ 
        message: 'Invalid airline ID - airline not found' 
      });
    }

    if (!aircraft) {
      return res.status(400).json({ 
        message: 'Invalid aircraft ID - aircraft not found' 
      });
    }

    if (!gate) {
      return res.status(400).json({ 
        message: 'Invalid gate ID - gate not found' 
      });
    }

    const departureTime = new Date(jadwal_keberangkatan);
    const arrivalTime = new Date(jadwal_kedatangan);

    if (arrivalTime <= departureTime) {
      return res.status(400).json({ 
        message: 'Arrival time must be after departure time' 
      });
    }

    await session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority', j: true },
      readPreference: 'primary'
    });

    const aircraftConflict = await Penerbangan.findOne({
      pesawat_id: pesawat_id,
      $or: [
        {
          jadwal_keberangkatan: { $lte: arrivalTime },
          jadwal_kedatangan: { $gte: departureTime }
        }
      ]
    }).session(session);

    if (aircraftConflict) {
      throw new Error('Aircraft is already scheduled for another flight during this time period');
    }

    const gateConflict = await Penerbangan.findOne({
      gate_id: gate_id,
      $or: [
        {
          jadwal_keberangkatan: { $lte: arrivalTime },
          jadwal_kedatangan: { $gte: departureTime }
        }
      ]
    }).session(session);

    if (gateConflict) {
      throw new Error('Gate is already occupied during this time period');
    }

    const newFlight = new Penerbangan({
      maskapai_id,
      pesawat_id,
      gate_id,
      asal_bandara,
      tujuan_bandara,
      jadwal_keberangkatan: departureTime,
      jadwal_kedatangan: arrivalTime,
      status_penerbangan: status_penerbangan || 'On Time',
      booked_seats: 0
    });

    const savedFlight = await newFlight.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: 'Flight created successfully',
      flight: savedFlight
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    await session.endSession();
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