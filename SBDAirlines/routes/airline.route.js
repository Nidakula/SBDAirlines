const express = require('express');
const router = express.Router();
const {
  getAllAirlines,
  getAirlineById,
  createAirline,
  updateAirline,
  deleteAirline
} = require('../controllers/airline.controller');

router.get('/', getAllAirlines);

router.get('/:id', getAirlineById);

router.post('/', createAirline);

router.put('/:id', updateAirline);

router.delete('/:id', deleteAirline);

module.exports = router;