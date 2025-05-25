const mongoose = require('mongoose');

const pesawatSchema = new mongoose.Schema({
  maskapai_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maskapai',
    required: true
  },
  model_pesawat: {
    type: String,
    required: true
  },
  kapasitas_penumpang: {
    type: Number,
    required: true
  },
  nomor_registrasi: {
    type: String,
    required: true,
    unique: true,
    maxlength: 20
  },
  status_pesawat: {
    type: String,
    enum: ['Aktif', 'Perawatan', 'Tidak Beroperasi'],
    default: 'Aktif',
    required: true
  }
}, { timestamps: true });

const Pesawat = mongoose.model('Pesawat', pesawatSchema);
module.exports = Pesawat;