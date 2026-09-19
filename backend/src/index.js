const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { store, db, initDatabase } = require('./config/db');

// Route imports
const journeyRoutes = require('./routes/journeys');
const journeyChainRoutes = require('./routes/journeyChains');
const placesRoutes = require('./routes/places');
const fareRoutes = require('./routes/fare');
const emergencyRoutes = require('./routes/emergency');
const incidentRoutes = require('./routes/incidents');
const adminRoutes = require('./routes/admin');
const bhashiniRoutes = require('./routes/bhashini');
const chatbotRoutes = require('./routes/chatbot');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
const configuredOrigins = config.CORS_ORIGIN === '*'
  ? '*'
  : config.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or wildcard
    if (!origin || configuredOrigins === '*' || (Array.isArray(configuredOrigins) && configuredOrigins.includes('*'))) {
      return callback(null, true);
    }
    if (
      configuredOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.vercel.app') ||
      origin.includes('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Journey-Code']
}));
app.use(express.json({ limit: '15mb' })); // Support base64 vehicle images for RideSafe vault
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('dev'));

// Static places images
app.use('/places', express.static(path.join(__dirname, '../../frontend/public/places')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'TravelMate Express API',
    version: '1.0.0-SIH2026',
    database_connected: db.isPostgresConnected(),
    database_mode: db.isPostgresConnected() ? 'Supabase PostgreSQL (Persistent)' : 'Resilient In-Memory Local Cache',
    places_seeded: store.places.length,
    active_journeys: store.journeys.filter(j => j.status === 'active').length,
    timestamp: new Date().toISOString()
  });
});

// Safety Zones API (NCRB + Delhi Police risk overlay)
app.get('/api/zones', (req, res) => {
  res.json({
    success: true,
    data: store.safety_zones,
    disclaimer: "Official NCRB and Delhi Police advisory layer. Data is lagging and provided strictly for risk-awareness, never as a safety guarantee."
  });
});

// Config endpoint for secure frontend delivery of Google Maps API Key
app.get('/api/config/maps', (req, res) => {
  res.json({
    success: true,
    mapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
  });
});

// Mount Routes
app.use('/api/journeys/chain', journeyChainRoutes);
app.use('/api/journeys', journeyRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/fare', fareRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bhashini', bhashiniRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/auth', authRoutes);

// Fallback aliases for frontend services requesting /api/translate or /api/tts directly
app.use('/api/translate', (req, res, next) => {
  req.url = '/translate';
  bhashiniRoutes(req, res, next);
});
app.use('/api/tts', (req, res, next) => {
  req.url = '/tts';
  bhashiniRoutes(req, res, next);
});

// Global Error Handler
app.use(errorHandler);

// Start Server with Database Initialization
let server = null;

async function startServer() {
  await initDatabase();
  server = app.listen(config.PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` TravelMate Backend API running on port ${config.PORT}`);
    console.log(` Mode: ${config.NODE_ENV}`);
    console.log(` Database: ${db.isPostgresConnected() ? '✅ Supabase PostgreSQL (Live & Persistent)' : '🛡️ Resilient Local Store'}`);
    console.log(` Seeded Places: ${store.places.length} Delhi heritage sites`);
    console.log(` Ready for SIH 2026 Demo: http://localhost:${config.PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

startServer();

module.exports = { app, server };
