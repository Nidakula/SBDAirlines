const mongoose = require('mongoose');

const maskapaiSchema = new mongoose.Schema({
  nama_maskapai: {
    type: String,
    required: true
  },
  kode_maskapai: {
    type: String,
    required: true,
    unique: true,
    maxlength: 10
  },
  negara_asal: {
    type: String,
    required: true
  },
  jumlah_pesawat: {
    type: Number,
    default: 0
  },
  tahun_berdiri: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const Maskapai = mongoose.model('Maskapai', maskapaiSchema);
module.exports = Maskapai;