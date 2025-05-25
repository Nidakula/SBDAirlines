const mongoose = require('mongoose');

const gateSchema = new mongoose.Schema({
  terminal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terminal',
    required: true
  },
  nomor_gate: {
    type: String,
    required: true,
    unique: true,
    maxlength: 10
  },
  lokasi_gate: {
    type: String,
    required: true
  },
  status_gate: {
    type: String,
    enum: ['Terbuka', 'Tertutup', 'Sedang Perbaikan'],
    default: 'Terbuka',
    required: true
  },
  kapasitas_area: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const Gate = mongoose.model('Gate', gateSchema);
module.exports = Gate;