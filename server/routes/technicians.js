const express = require('express');
const router = express.Router();
const Technician = require('../models/Technician');

// Get all technicians
router.get('/', async (req,res)=>{
  const techs = await Technician.find();
  res.send(techs);
});

// Add technician
router.post('/', async (req,res)=>{
  const { name, phone, category } = req.body;
  const tech = new Technician({name, phone, category});
  await tech.save();
  res.send({message:'Technician added', tech});
});

module.exports = router;
