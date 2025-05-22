const { Tiket } = require('../models/index.model');

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
  try {
    const newTicket = new Tiket(req.body);  // Here "Tiket" is used instead of "Ticket"
    const savedTicket = await newTicket.save();
    res.status(201).json(savedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
  try {
    const deletedTicket = await Tiket.findByIdAndDelete(req.params.id);
    
    if (!deletedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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