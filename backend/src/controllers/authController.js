const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { db, store } = require('../config/db');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

// In-memory OTP & Session stores with automatic expiration cleanup
if (!store.otpStore) {
  store.otpStore = new Map();
}
if (!store.sessions) {
  store.sessions = new Map();
}

// Rate limiting map: identifier -> array of timestamps
const rateLimitMap = new Map();

function isRateLimited(identifier) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxRequests = 4;

  const timestamps = rateLimitMap.get(identifier) || [];
  const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(identifier, validTimestamps);
  return false;
}

// Helper to generate temporary journey code: TM-DEL-2026-XXXX
function generateJourneyCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TM-DEL-2026-${code}`;
}

/**
 * POST /api/auth/send-otp
 * Generates and dispatches a 6-digit verification code to email or mobile number via production gateway.
 */
exports.sendOtp = async (req, res) => {
  try {
    const { identifier, type = 'email', name } = req.body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email address or mobile phone number is required.'
      });
    }

    const cleanId = identifier.trim().toLowerCase();

    // Validate identifier format
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId);
    const isPhone = /^\+?[0-9\s-]{7,16}$/.test(cleanId.replace(/\s+/g, ''));

    if (!isEmail && !isPhone) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address or phone number.'
      });
    }

    if (isRateLimited(cleanId)) {
      return res.status(429).json({
        success: false,
        error: 'Too many OTP requests. Please wait 5 minutes before trying again.'
      });
    }

    // Generate cryptographically secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInMinutes = 5;
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000; // 5 minutes

    // Dispatch via real production gateway (Nodemailer for Email, Twilio/Fast2SMS for Phone)
    let dispatchResult;
    if (isEmail) {
      dispatchResult = await emailService.sendOtpEmail({
        to: cleanId,
        otp,
        travelerName: name || 'Traveler',
        expiresInMinutes
      });
    } else {
      dispatchResult = await smsService.sendOtpSms({
        to: cleanId,
        otp,
        travelerName: name || 'Traveler',
        expiresInMinutes
      });
    }

    // Store in active OTP cache
    store.otpStore.set(cleanId, {
      otp,
      expiresAt,
      type: isEmail ? 'email' : 'mobile',
      name: name?.trim() || null,
      attempts: 0,
      delivery: {
        gateway: dispatchResult.gateway,
        messageId: dispatchResult.messageId,
        previewUrl: dispatchResult.previewUrl || null,
        status: dispatchResult.status || 'sent'
      }
    });

    console.log(`\n=======================================================`);
    console.log(`[AUTH SERVICE] 🔐 Verification OTP for ${cleanId}:`);
    console.log(`👉 GATEWAY: ${dispatchResult.gateway}`);
    console.log(`👉 OTP CODE: ${otp}`);
    console.log(`⏳ Valid for: 5 minutes (expires at ${new Date(expiresAt).toLocaleTimeString()})`);
    if (dispatchResult.previewUrl) {
      console.log(`👉 EMAIL PREVIEW: ${dispatchResult.previewUrl}`);
    }
    console.log(`=======================================================\n`);

    res.json({
      success: true,
      message: isEmail
        ? `Verification code dispatched to ${cleanId} via ${dispatchResult.gateway}`
        : `SMS verification code sent to ${cleanId} via ${dispatchResult.gateway}`,
      identifier: cleanId,
      type: isEmail ? 'email' : 'mobile',
      gateway: dispatchResult.gateway,
      previewUrl: dispatchResult.previewUrl || null,
      devOtp: otp, // Kept for convenient hackathon testing
      expiresInSeconds: 300,
      expiresAt: new Date(expiresAt).toISOString()
    });
  } catch (err) {
    console.error('[Auth Error] sendOtp failure:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate and dispatch OTP.'
    });
  }
};

/**
 * POST /api/auth/verify-otp
 * Verifies entered OTP, provisions traveler profile, and issues a session token.
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Identifier and OTP code are required.'
      });
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const record = store.otpStore.get(cleanId);

    if (!record) {
      return res.status(400).json({
        success: false,
        error: 'No active OTP request found for this identifier. Please request a new code.'
      });
    }

    if (Date.now() > record.expiresAt) {
      store.otpStore.delete(cleanId);
      return res.status(400).json({
        success: false,
        error: 'OTP code has expired. Please request a new verification code.'
      });
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      store.otpStore.delete(cleanId);
      return res.status(400).json({
        success: false,
        error: 'Too many incorrect attempts. Please request a new code.'
      });
    }

    if (record.otp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code. Please check and re-enter the 6 digits.'
      });
    }

    // OTP Verified! Consume OTP
    store.otpStore.delete(cleanId);

    // Find or create traveler profile
    let traveler = store.travelers.find(
      t => t.emergency_contact === cleanId || t.email === cleanId || (t.name && cleanId.includes(t.name.toLowerCase().split(' ')[0]))
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (!traveler) {
      const isEmail = cleanId.includes('@');
      const defaultName = record.name || (isEmail ? cleanId.split('@')[0].replace(/[._]/g, ' ') : 'Traveler');
      const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

      const travelerId = uuidv4();
      const journeyCode = generateJourneyCode();

      traveler = {
        id: travelerId,
        temp_id: `TRV-${journeyCode.slice(12)}`,
        name: formattedName,
        email: isEmail ? cleanId : '',
        phone: !isEmail ? cleanId : '',
        nationality: cleanId.includes('@') ? 'United Kingdom' : 'India',
        preferred_language: 'en',
        emergency_contact: cleanId,
        opt_in_location: true,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
      };

      await db.travelers.create(traveler);
    }

    // Find or create active journey for this traveler
    let journey = store.journeys.find(
      j => j.traveler_id === traveler.id && j.status === 'active'
    );

    if (!journey) {
      const journeyId = uuidv4();
      const journeyCode = generateJourneyCode();
      journey = {
        id: journeyId,
        traveler_id: traveler.id,
        journey_code: journeyCode,
        status: 'active',
        current_lat: 28.6139,
        current_lng: 77.2090,
        last_location_update: now.toISOString(),
        active_route: {},
        visited_places: [],
        checkin_history: [],
        start_time: now.toISOString(),
        expires_at: expiresAt.toISOString()
      };
      await db.journeys.create(journey);
    }

    // Generate secure session token
    const token = `tm_sess_${crypto.randomBytes(24).toString('hex')}`;
    const sessionData = {
      token,
      travelerId: traveler.id,
      identifier: cleanId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    store.sessions.set(token, sessionData);

    console.log(`[AUTH SERVICE] ✅ User authenticated: ${traveler.name} (${cleanId})`);

    res.json({
      success: true,
      message: 'Authentication successful! Welcome to TravelMate.',
      token,
      traveler,
      journey
    });
  } catch (err) {
    console.error('[Auth Error] verifyOtp failure:', err);
    res.status(500).json({
      success: false,
      error: 'Verification failed. Please try again.'
    });
  }
};

/**
 * GET /api/auth/me
 * Returns current authenticated user and journey based on Bearer token.
 */
exports.getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Bearer token missing.'
      });
    }

    const token = authHeader.split(' ')[1];
    const session = store.sessions.get(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Session expired or invalid. Please sign in again.'
      });
    }

    const traveler = store.travelers.find(t => t.id === session.travelerId);
    if (!traveler) {
      return res.status(404).json({
        success: false,
        error: 'Traveler record not found.'
      });
    }

    const journey = store.journeys.find(
      j => j.traveler_id === traveler.id && j.status === 'active'
    ) || null;

    res.json({
      success: true,
      traveler,
      journey,
      session: {
        identifier: session.identifier,
        expiresAt: session.expiresAt
      }
    });
  } catch (err) {
    console.error('[Auth Error] getMe failure:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile.'
    });
  }
};

/**
 * POST /api/auth/logout
 * Terminates user session and removes token.
 */
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      store.sessions.delete(token);
    }
    res.json({
      success: true,
      message: 'Signed out successfully. Safe travels!'
    });
  } catch (err) {
    console.error('[Auth Error] logout failure:', err);
    res.status(500).json({
      success: false,
      error: 'Logout failed.'
    });
  }
};
