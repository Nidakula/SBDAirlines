const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketsByPassenger
} = require('../controllers/ticket.controller');

router.get('/', getAllTickets);

router.get('/passenger/:id', getTicketsByPassenger);

router.get('/:id', getTicketById);

router.post('/', createTicket);

router.put('/:id', updateTicket);

router.delete('/:id', deleteTicket);

module.exports = router;