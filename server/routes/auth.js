const express = require('express');
const router = express.Router();
const User = require('../models/User');

// OTP request
router.post('/request-otp', async (req,res)=>{
  const { phone } = req.body;
  if(!phone) return res.status(400).send({error:'Phone required'});
  const otp = Math.floor(100000 + Math.random()*900000).toString();
  const otpExpires = new Date(Date.now()+5*60000); // 5 min
  let user = await User.findOne({phone});
  if(!user) user = new User({phone});
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();
  console.log(`OTP for ${phone}: ${otp}`);
  res.send({message:'OTP sent (check server log for demo)'});
});

// OTP verify
router.post('/verify-otp', async (req,res)=>{
  const { phone, otp } = req.body;
  if(!phone||!otp) return res.status(400).send({error:'Phone & OTP required'});
  const user = await User.findOne({phone});
  if(!user) return res.status(404).send({error:'User not found'});
  if(user.otp !== otp || user.otpExpires<Date.now()) return res.status(400).send({error:'OTP invalid/expired'});
  user.otp = null; user.otpExpires = null;
  await user.save();
  res.send({message:'Login success', userId:user._id, name:user.name, wallet:user.wallet});
});

module.exports = router;
