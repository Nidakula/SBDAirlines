const mongoose = require('mongoose');

const tiketSchema = new mongoose.Schema({
  penumpang_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Penumpang',
    required: true
  },
  flight_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Penerbangan',
    required: true
  },
  seat_number: {
    type: String,
    required: true
  },
  kelas_penerbangan: {
    type: String,
    enum: ['Ekonomi', 'Bisnis', 'First Class'],
    required: true
  },
  harga_tiket: {
    type: Number,
    required: true
  },
  status_tiket: {
    type: String,
    enum: ['Confirmed', 'Cancelled', 'Checked-in'],
    default: 'Confirmed',
    required: true
  }
}, { timestamps: true });

tiketSchema.index({ flight_id: 1, seat_number: 1 }, { unique: true });

const Tiket = mongoose.model('Tiket', tiketSchema);
module.exports = Tiket;