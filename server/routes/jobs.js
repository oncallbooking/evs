const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Get all jobs
router.get('/', async (req,res)=>{
  const jobs = await Job.find().populate('customer','name');
  res.send(jobs);
});

// Post job
router.post('/', async (req,res)=>{
  const { title, description, category, location, customerId } = req.body;
  const job = new Job({ title, description, category, location, customer:customerId });
  await job.save();
  res.send({message:'Job posted', job});
});

// Bid on job
router.post('/:id/bid', async (req,res)=>{
  const { techId, price } = req.body;
  const job = await Job.findById(req.params.id);
  if(!job) return res.status(404).send({error:'Job not found'});
  job.bidders.push({techId, price});
  await job.save();
  res.send({message:'Bid added', job});
});

module.exports = router;
