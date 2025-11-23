const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  location: String,
  customer: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  bidders: [{ techId: { type: mongoose.Schema.Types.ObjectId, ref:'Technician' }, price:Number }]
}, { timestamps:true });

module.exports = mongoose.model('Job', jobSchema);
