const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.route');
const airlineRoutes = require('./routes/airline.route');
const aircraftRoutes = require('./routes/aircraft.route');
const terminalRoutes = require('./routes/terminal.route');
const gateRoutes = require('./routes/gate.route');
const passengerRoutes = require('./routes/passenger.route');
const flightRoutes = require('./routes/flight.route');
const ticketRoutes = require('./routes/ticket.route');
const noteRoutes = require('./routes/note.route');
const tagRoutes = require('./routes/tag.route');

const app = express();
const PORT = process.env.PORT || 3000;
const SHARD_ID = process.env.SHARD_ID || '0';

console.log(`🔧 Starting Shard ID: ${SHARD_ID}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic CORS setup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log(`✅ [Shard ${SHARD_ID}] Connected to MongoDB`))
  .catch(err => console.error(`❌ [Shard ${SHARD_ID}] Failed to connect to MongoDB:`, err));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/airlines', airlineRoutes);
app.use('/api/aircraft', aircraftRoutes);
app.use('/api/terminals', terminalRoutes);
app.use('/api/gates', gateRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tags', tagRoutes);

// Test route
app.get('/', (req, res) => {
  res.send(`Airport Management API - Shard ${SHARD_ID}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 [Shard ${SHARD_ID}] Server running on port ${PORT}`);
});
