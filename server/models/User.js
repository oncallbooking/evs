const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required:true },
  phone: { type: String, required:true, unique:true },
  email: { type: String, unique:true, sparse:true },
  wallet: { type: Number, default:0 },
  unlockedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Technician' }],
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps:true });

module.exports = mongoose.model('User', userSchema);
