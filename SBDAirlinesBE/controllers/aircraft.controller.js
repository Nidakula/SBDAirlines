const { Pesawat, Maskapai } = require('../models/index.model');
const mongoose = require('mongoose');

const getAllAircraft = async (req, res) => {
  try {
    const aircraft = await Pesawat.find().populate('maskapai_id');
    res.status(200).json(aircraft);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAircraftById = async (req, res) => {
  try {
    const aircraft = await Pesawat.findById(req.params.id).populate('maskapai_id');
    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }
    res.status(200).json(aircraft);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAircraft = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { maskapai_id, model_pesawat, kapasitas_penumpang, nomor_registrasi, status_pesawat } = req.body;

    await session.startTransaction({
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority', j: true }
    });

    const airline = await Maskapai.findById(maskapai_id).session(session);
    if (!airline) {
      throw new Error('Invalid airline ID - airline not found');
    }

    const existingAircraft = await Pesawat.findOne({ 
      nomor_registrasi: nomor_registrasi 
    }).session(session);

    if (existingAircraft) {
      throw new Error(`Aircraft with registration number ${nomor_registrasi} already exists`);
    }

    const newAircraft = new Pesawat({
      maskapai_id,
      model_pesawat,
      kapasitas_penumpang,
      nomor_registrasi,
      status_pesawat: status_pesawat || 'Aktif'
    });

    const savedAircraft = await newAircraft.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: 'Aircraft created successfully',
      aircraft: savedAircraft
    });

  } catch (error) {
    await session.abortTransaction();
    
    if (error.code === 11000) {
      res.status(400).json({ 
        message: 'Duplicate registration number - aircraft already exists' 
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  } finally {
    await session.endSession();
  }
};

const updateAircraft = async (req, res) => {
  try {
    const updatedAircraft = await Pesawat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedAircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }
    
    res.status(200).json(updatedAircraft);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAircraft = async (req, res) => {
  try {
    const deletedAircraft = await Pesawat.findByIdAndDelete(req.params.id);
    
    if (!deletedAircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }
    
    res.status(200).json({ message: 'Aircraft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkCreateAircraft = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Request body must be an array of aircraft' });
    }

    if (req.body.length === 0) {
      return res.status(400).json({ message: 'Cannot create empty aircraft list' });
    }

    const registrationSet = new Set();
    const airlineIds = new Set();

    for (const aircraft of req.body) {
      if (!aircraft.nomor_registrasi) {
        throw new Error('All aircraft must have a registration number');
      }
      if (!aircraft.maskapai_id) {
        throw new Error('All aircraft must have an airline ID');
      }
      if (registrationSet.has(aircraft.nomor_registrasi)) {
        throw new Error(`Duplicate registration number in request: ${aircraft.nomor_registrasi}`);
      }
      registrationSet.add(aircraft.nomor_registrasi);
      airlineIds.add(aircraft.maskapai_id);
    }

    await session.startTransaction({
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority', j: true }
    });

    const existingAirlines = await Maskapai.find({
      _id: { $in: Array.from(airlineIds) }
    }).session(session);

    if (existingAirlines.length !== airlineIds.size) {
      const foundIds = existingAirlines.map(a => a._id.toString());
      const missingIds = Array.from(airlineIds).filter(id => !foundIds.includes(id));
      throw new Error(`Invalid airline IDs: ${missingIds.join(', ')}`);
    }

    const startTime = Date.now();
    
    const createdAircraft = await Pesawat.insertMany(req.body, { 
      session,
      ordered: true 
    });
    
    await session.commitTransaction();
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    res.status(201).json({
      message: `Successfully created ${createdAircraft.length} aircraft`,
      processingTime: `${processingTime} ms`,
      count: createdAircraft.length,
      data: createdAircraft
    });

  } catch (error) {
    await session.abortTransaction();
    
    if (error.code === 11000) {
      res.status(400).json({ 
        message: 'Duplicate registration number found in aircraft data' 
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getAllAircraft,
  getAircraftById,
  createAircraft,
  updateAircraft,
  deleteAircraft,
  bulkCreateAircraft
};