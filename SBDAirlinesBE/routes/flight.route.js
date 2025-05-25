const express = require('express');
const router = express.Router();
const {
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight
} = require('../controllers/flight.controller');

router.get('/', getAllFlights);

router.get('/:id', getFlightById);

router.post('/', createFlight);

router.put('/:id', updateFlight);

router.delete('/:id', deleteFlight);

module.exports = router;