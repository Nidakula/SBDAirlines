const express = require('express');
const router = express.Router();
const {
  getAllTerminals,
  getTerminalById,
  createTerminal,
  updateTerminal,
  deleteTerminal
} = require('../controllers/terminal.controller');

router.get('/', getAllTerminals);

router.get('/:id', getTerminalById);

router.post('/', createTerminal);

router.put('/:id', updateTerminal);

router.delete('/:id', deleteTerminal);

module.exports = router;