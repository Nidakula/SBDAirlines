const express = require('express');
const router = express.Router();
const {
  getAllPassengers,
  getPassengerById,
  createPassenger,
  updatePassenger,
  deletePassenger,
  bulkCreatePassengers
} = require('../controllers/passenger.controller');

router.get('/', getAllPassengers);

router.get('/:id', getPassengerById);

router.post('/', createPassenger);

router.put('/:id', updatePassenger);

router.delete('/:id', deletePassenger);

router.post('/bulk', bulkCreatePassengers);

module.exports = router;