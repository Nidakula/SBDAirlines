const express = require('express');
const router = express.Router();
const {
  getAllAircraft,
  getAircraftById,
  createAircraft,
  updateAircraft,
  deleteAircraft,
  bulkCreateAircraft
} = require('../controllers/aircraft.controller');

router.get('/', getAllAircraft);

router.get('/:id', getAircraftById);

router.post('/', createAircraft);

router.put('/:id', updateAircraft);

router.delete('/:id', deleteAircraft);

router.post('/bulk', bulkCreateAircraft);

module.exports = router;