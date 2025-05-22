const express = require('express');
const router = express.Router();
const {
  getAllGates,
  getGateById,
  createGate,
  updateGate,
  deleteGate
} = require('../controllers/gate.controller');

router.get('/', getAllGates);

router.get('/:id', getGateById);

router.post('/', createGate);

router.put('/:id', updateGate);

router.delete('/:id', deleteGate);

module.exports = router;