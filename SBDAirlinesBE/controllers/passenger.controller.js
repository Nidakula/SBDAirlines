const { Penumpang } = require('../models/index.model');
const mongoose = require('mongoose');

const getAllPassengers = async (req, res) => {
  try {
    const passengers = await Penumpang.find();
    res.status(200).json(passengers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPassengerById = async (req, res) => {
  try {
    const passenger = await Penumpang.findById(req.params.id);
    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }
    res.status(200).json(passenger);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPassenger = async (req, res) => {
  try {
    const newPassenger = new Penumpang(req.body);
    const savedPassenger = await newPassenger.save();
    res.status(201).json(savedPassenger);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePassenger = async (req, res) => {
  try {
    const updatedPassenger = await Penumpang.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPassenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }
    
    res.status(200).json(updatedPassenger);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePassenger = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction({
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority', j: true }
    });

    const passengerId = req.params.id;
    
    const passenger = await Penumpang.findById(passengerId).session(session);
    if (!passenger) {
      throw new Error('Passenger not found');
    }

    const { Tiket } = require('../models/index.model');
    const existingTickets = await Tiket.countDocuments({ 
      penumpang_id: passengerId 
    }).session(session);

    if (existingTickets > 0) {
      throw new Error(`Cannot delete passenger - ${existingTickets} ticket(s) exist for this passenger`);
    }

    const User = require('../models/user.model');
    const associatedUser = await User.findOne({ 
      penumpang_id: passengerId 
    }).session(session);

    if (associatedUser) {
      throw new Error('Cannot delete passenger - associated user account exists');
    }

    await Penumpang.findByIdAndDelete(passengerId).session(session);

    await session.commitTransaction();
    
    res.status(200).json({ 
      message: 'Passenger deleted successfully',
      deletedPassenger: {
        id: passenger._id,
        name: passenger.nama_penumpang,
        email: passenger.email
      }
    });

  } catch (error) {
    await session.abortTransaction();
    
    if (error.message === 'Passenger not found') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(400).json({ message: error.message });
    }
  } finally {
    await session.endSession();
  }
};

const bulkCreatePassengers = async (req, res) => {
  const session = await mongoose.startSession();
  let transactionStarted = false;
  
  try {
    const startTime = Date.now();
    const passengers = req.body;
    
    if (!Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ 
        message: 'Request body must be an array of passengers' 
      });
    }
    
    await session.startTransaction({
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority', j: true }
    });
    transactionStarted = true;
    
    const errors = [];
    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];
      
      if (!passenger.nama_penumpang || !passenger.email || !passenger.nomor_identitas) {
        errors.push(`Passenger ${i + 1}: Missing required fields (nama_penumpang, email, nomor_identitas)`);
      }
      
      const duplicateIndex = passengers.findIndex((p, index) => 
        index !== i && p.email === passenger.email
      );
      if (duplicateIndex !== -1) {
        errors.push(`Passenger ${i + 1}: Duplicate email with passenger ${duplicateIndex + 1}`);
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Validation failed:\n${errors.join('\n')}`);
    }
    
    const emails = passengers.map(p => p.email);
    const existingPassengers = await Penumpang.find({ 
      email: { $in: emails } 
    }).session(session);
    
    if (existingPassengers.length > 0) {
      const existingEmails = existingPassengers.map(p => p.email);
      throw new Error(`Duplicate emails found in database: ${existingEmails.join(', ')}`);
    }
    
    const createdPassengers = await Penumpang.insertMany(passengers, { session });
    
    await session.commitTransaction();
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    res.status(201).json({
      message: 'Passengers created successfully',
      count: createdPassengers.length,
      passengers: createdPassengers,
      processingTime: `${processingTime} ms`
    });

  } catch (error) {
    if (transactionStarted) {
      await session.abortTransaction();
    }
    
    if (error.code === 11000) {
      res.status(400).json({ 
        message: 'Duplicate entry detected',
        details: error.message 
      });
    } else {
      res.status(400).json({ 
        message: error.message 
      });
    }
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getAllPassengers,
  getPassengerById,
  createPassenger,
  updatePassenger,
  deletePassenger,
  bulkCreatePassengers
};