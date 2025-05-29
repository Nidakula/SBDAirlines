const { Tiket, Penerbangan, Penumpang } = require('../models/index.model');
const mongoose = require('mongoose');

const getAllTickets = async (req, res) => {
  try {
    const tickets = await Tiket.find()
      .populate('penumpang_id')
      .populate({
        path: 'flight_id',
        populate: [
          { path: 'maskapai_id' },
          { path: 'pesawat_id' },
          { path: 'gate_id' }
        ]
      });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Tiket.findById(req.params.id)
      .populate('penumpang_id')
      .populate({
        path: 'flight_id',
        populate: [
          { path: 'maskapai_id' },
          { path: 'pesawat_id' },
          { path: 'gate_id' }
        ]
      });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTicket = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { flight_id, penumpang_id, seat_number, kelas, harga } = req.body;

    // Start transaction
    await session.startTransaction({
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority', j: true }
    });

    // Validate foreign key references within transaction
    const [flight, passenger] = await Promise.all([
      Penerbangan.findById(flight_id).session(session),
      Penumpang.findById(penumpang_id).session(session)
    ]);

    if (!flight) {
      throw new Error('Invalid flight ID - flight not found');
    }

    if (!passenger) {
      throw new Error('Invalid passenger ID - passenger not found');
    }    // Check flight capacity and existing tickets
    const existingTickets = await Tiket.countDocuments({ 
      flight_id: flight_id 
    }).session(session);

    // Use flight's capacity or default
    const flightCapacity = flight.kapasitas || 180;
    
    if (existingTickets >= flightCapacity) {
      throw new Error('Flight is fully booked');
    }

    // Check for duplicate seat assignment
    const seatTaken = await Tiket.findOne({ 
      flight_id: flight_id, 
      seat_number: seat_number 
    }).session(session);

    if (seatTaken) {
      throw new Error(`Seat ${seat_number} is already taken`);
    }

    // Create ticket within transaction
    const newTicket = new Tiket({
      flight_id,
      penumpang_id,
      seat_number,
      kelas,
      harga
    });
      const savedTicket = await newTicket.save({ session });

    // Update flight booking count
    await Penerbangan.findByIdAndUpdate(
      flight_id,
      { $inc: { booked_seats: 1 } },
      { session }
    );

    await session.commitTransaction();
    
    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: savedTicket
    });

  } catch (error) {
    await session.abortTransaction();
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      res.status(400).json({ 
        message: 'Duplicate seat assignment - seat already taken' 
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  } finally {
    await session.endSession();
  }
};

const updateTicket = async (req, res) => {
  try {
    const updatedTicket = await Tiket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTicket = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction({
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority', j: true }
    });

    const ticket = await Tiket.findById(req.params.id).session(session);
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Delete the ticket
    await Tiket.findByIdAndDelete(req.params.id).session(session);

    // Decrement flight booking count
    await Penerbangan.findByIdAndUpdate(
      ticket.flight_id,
      { $inc: { booked_seats: -1 } },
      { session }
    );

    await session.commitTransaction();
    
    res.status(200).json({ 
      message: 'Ticket deleted successfully',
      deletedTicket: {
        id: ticket._id,
        flight_id: ticket.flight_id,
        seat_number: ticket.seat_number
      }
    });

  } catch (error) {
    await session.abortTransaction();
    
    if (error.message === 'Ticket not found') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  } finally {
    await session.endSession();
  }
};

const getTicketsByPassenger = async (req, res) => {
  try {
    const tickets = await Tiket.find({ penumpang_id: req.params.id })
      .populate('penumpang_id')
      .populate({
        path: 'flight_id',
        populate: [
        { path: 'maskapai_id' },
        { path: 'pesawat_id' },
        { path: 'gate_id' }
        ]
      });

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


module.exports = {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketsByPassenger
};