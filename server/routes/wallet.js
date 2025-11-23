const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Wallet balance
router.get('/:userId', async (req,res)=>{
  const user = await User.findById(req.params.userId);
  if(!user) return res.status(404).send({error:'User not found'});
  res.send({wallet:user.wallet});
});

// Recharge (manual / QR upload simulation)
router.post('/:userId/recharge', async (req,res)=>{
  const { amount } = req.body;
  const user = await User.findById(req.params.userId);
  if(!user) return res.status(404).send({error:'User not found'});
  user.wallet += parseInt(amount);
  await user.save();
  res.send({message:`Wallet recharged ₹${amount}`, wallet:user.wallet});
});

module.exports = router;
