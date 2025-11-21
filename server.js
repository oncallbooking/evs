// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE);
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading DB, initializing new:', e);
    return { jobs: [], technicians: [], bids: [] };
  }
}

function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use('/', express.static(path.join(__dirname, 'public')));

// Simple API

// GET /api/technicians - list technicians
app.get('/api/technicians', (req, res) => {
  const db = readDB();
  res.json(db.technicians);
});

// GET /api/jobs - list jobs
app.get('/api/jobs', (req, res) => {
  const db = readDB();
  res.json(db.jobs);
});

// POST /api/jobs - create job
app.post('/api/jobs', (req, res) => {
  const db = readDB();
  const { title, description, pincode, budget, urgency, photos } = req.body;
  if (!title || !pincode) return res.status(400).json({ error: 'title & pincode required' });

  const job = {
    id: uuidv4(),
    title,
    description: description || '',
    pincode,
    budget: budget || null,
    urgency: urgency || 'normal',
    photos: photos || [],
    createdAt: new Date().toISOString(),
    status: 'open',
    bids: []
  };
  db.jobs.unshift(job);
  writeDB(db);
  res.json(job);
});

// GET /api/jobs/:id
app.get('/api/jobs/:id', (req, res) => {
  const db = readDB();
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'not found' });
  res.json(job);
});

// POST /api/bids - technician places a bid
app.post('/api/bids', (req, res) => {
  const db = readDB();
  const { jobId, technicianId, amount, note } = req.body;
  if (!jobId || !technicianId || !amount) return res.status(400).json({ error: 'jobId, technicianId, amount required' });

  const job = db.jobs.find(j => j.id === jobId);
  const tech = db.technicians.find(t => t.id === technicianId);
  if (!job) return res.status(404).json({ error: 'job not found' });
  if (!tech) return res.status(404).json({ error: 'technician not found' });

  const bid = {
    id: uuidv4(),
    jobId,
    technicianId,
    amount,
    note: note || '',
    createdAt: new Date().toISOString(),
    accepted: false
  };
  db.bids.unshift(bid);
  job.bids.push(bid.id);
  writeDB(db);
  res.json({ success: true, bid });
});

// POST /api/jobs/:id/accept - customer accepts a bid
app.post('/api/jobs/:id/accept', (req, res) => {
  const db = readDB();
  const job = db.jobs.find(j => j.id === req.params.id);
  const { bidId } = req.body;
  if (!job) return res.status(404).json({ error: 'job not found' });
  const bid = db.bids.find(b => b.id === bidId && b.jobId === job.id);
  if (!bid) return res.status(404).json({ error: 'bid not found for job' });

  // mark bid accepted, job closed, store assigned technician
  db.bids = db.bids.map(b => (b.id === bidId ? { ...b, accepted: true } : b));
  job.status = 'assigned';
  job.assignedTo = bid.technicianId;
  job.assignedBid = bidId;
  writeDB(db);
  res.json({ success: true, job });
});

// GET /api/bids?jobId=...
app.get('/api/bids', (req, res) => {
  const db = readDB();
  const jobId = req.query.jobId;
  if (jobId) {
    return res.json(db.bids.filter(b => b.jobId === jobId));
  }
  res.json(db.bids);
});

// Utility to reset demo DB (dev only)
app.post('/api/__reset_demo', (req, res) => {
  const demo = {
    technicians: [
      { id: 'tech-1', name: 'Rahul Sharma', skills: ['AC', 'Electrical'], rating: 4.7, pincodeCoverage: ['110001','110002'], priceFrom: 500, avatar: '' },
      { id: 'tech-2', name: 'Priya Verma', skills: ['Laptop/PC','Networking'], rating: 4.9, pincodeCoverage: ['400001','400002'], priceFrom: 800, avatar: '' },
      { id: 'tech-3', name: 'Amit Singh', skills: ['Plumbing','Home Appliances'], rating: 4.5, pincodeCoverage: ['560001','560002'], priceFrom: 300, avatar: '' }
    ],
    jobs: [
      {
        id: 'job-demo-1',
        title: 'AC not cooling - urgent',
        description: 'AC started blowing warm air after 2 hours of running.',
        pincode: '110001',
        budget: 1500,
        urgency: 'urgent',
        photos: [],
        createdAt: new Date().toISOString(),
        status: 'open',
        bids: []
      }
    ],
    bids: []
  };
  writeDB(demo);
  res.json({ success: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
  if (!fs.existsSync(DB_FILE)) writeDB({ technicians: [], jobs: [], bids: [] });
  console.log(`Server listening on http://localhost:${PORT}`);
});
