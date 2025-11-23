const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  name: String,
  phone: String,
  category: String,
  skills: [String],
  location: String,
  pricePerChat: { type:Number, default:10 },
  status: { type:String, enum:['Online','Busy','Offline'], default:'Offline' }
}, { timestamps:true });

module.exports = mongoose.model('Technician', technicianSchema);
