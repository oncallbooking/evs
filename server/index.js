const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const techRoutes = require('./routes/technicians');
const walletRoutes = require('./routes/wallet');

// middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname,'uploads')));
app.use(express.static(path.join(__dirname,'../client')));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/technicians', techRoutes);
app.use('/api/wallet', walletRoutes);

// fallback to index.html
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'../client/index.html')));

// connect db & start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/labourconnect', {useNewUrlParser:true,useUnifiedTopology:true})
.then(()=> app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`)))
.catch(err=>console.error(err));
