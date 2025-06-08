const mongoose = require('mongoose');

const penerbanganSchema = new mongoose.Schema({
  maskapai_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maskapai',
    required: true
  },
  pesawat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pesawat',
    required: true
  },
  asal_bandara: {
    type: String,
    required: true
  },
  tujuan_bandara: {
    type: String,
    required: true
  },
  jadwal_keberangkatan: {
    type: Date,
    required: true
  },
  jadwal_kedatangan: {
    type: Date,
    required: true
  },
  status_penerbangan: {
    type: String,
    enum: ['On Time', 'Delayed', 'Cancelled'],
    default: 'On Time',
    required: true
  },  gate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gate',
    required: true
  },
  booked_seats: {
    type: Number,
    default: 0,
    min: 0
  },
  kapasitas: {
    type: Number,
    default: 180 // Default flight capacity
  }
}, { timestamps: true });

const Penerbangan = mongoose.model('Penerbangan', penerbanganSchema);
module.exports = Penerbangan;