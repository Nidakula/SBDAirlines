const mongoose = require('mongoose');

const penumpangSchema = new mongoose.Schema({
  nama_penumpang: {
    type: String,
    required: true
  },
  nomor_passport: {
    type: String,
    sparse: true
  },
  nomor_identitas: {
    type: String,
    sparse: true
  },
  nomor_telepon: {
    type: String,
    sparse: true
  },
  email: {
    type: String,
    sparse: true 
  },
  alamat: {
    type: String
  },
  kewarganegaraan: {
    type: String,
    default: 'Not Specified'
  }
}, { timestamps: true });

const Penumpang = mongoose.model('Penumpang', penumpangSchema);
module.exports = Penumpang;