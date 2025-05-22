const mongoose = require('mongoose');

const terminalSchema = new mongoose.Schema({
  nama_terminal: {
    type: String,
    required: true,
    unique: true
  },
  kapasitas_penumpang: {
    type: Number,
    required: true
  },
  jumlah_gate: {
    type: Number,
    required: true
  },
  fasilitas: {
    type: String
  }
}, { timestamps: true });

const Terminal = mongoose.model('Terminal', terminalSchema);
module.exports = Terminal;