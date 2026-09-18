const { db, store } = require('../config/db');

/**
 * GET /api/journeys/chain/:identifier
 * Retrieve complete cryptographic Journey Chain for a traveler or journey code,
 * with summary analytics and real-time cryptographic integrity audit.
 */
exports.getChain = async (req, res, next) => {
  try {
    const identifier = req.params.identifier || req.query.traveler_id || 'trv-default-sarah';
    const chain = await db.journeyChains.findByTraveler(identifier);
    const audit = await db.journeyChains.verifyChain(identifier);

    // Compute Summary Analytics
    let totalSpent = 0;
    let totalDistance = 0;
    let totalDuration = 0;

    chain.forEach(node => {
      totalSpent += parseFloat(node.fare) || 0;
      totalDistance += parseFloat(node.distance_km) || 0;
      totalDuration += parseInt(node.time_taken, 10) || 0;
    });

    const avgDuration = chain.length > 0 ? Math.round(totalDuration / chain.length) : 0;
    const carbonSavedKg = (totalDistance * 0.12).toFixed(2); // estimated CO2 reduction vs single-passenger private car

    const analytics = {
      total_spent: Math.round(totalSpent * 100) / 100,
      total_distance_km: Math.round(totalDistance * 10) / 10,
      avg_duration_min: avgDuration,
      total_hops: chain.length,
      carbon_saved_kg: parseFloat(carbonSavedKg),
      genesis_hash: chain.length > 0 ? chain[0].previous_hash : '0000000000000000000000000000000000000000000000000000000000000000',
      tip_hash: chain.length > 0 ? chain[chain.length - 1].current_hash : null,
      currency: 'INR',
      tamper_detected: !audit.is_valid
    };

    res.json({
      success: true,
      identifier,
      count: chain.length,
      analytics,
      audit,
      data: chain
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/journeys/chain/add
 * Append a new transit hop to the user's sequential immutable ledger.
 */
exports.addNode = async (req, res, next) => {
  try {
    const {
      traveler_id = 'trv-default-sarah',
      journey_id = 'journey-default-x89k',
      source,
      destination,
      fare,
      vehicle_type = 'auto',
      distance_km = 4.5,
      departure_time,
      arrival_time,
      time_taken = 20,
      verification_badge = 'Verified Transit Hop',
      metadata = {}
    } = req.body;

    if (!source || !destination || fare === undefined || fare === null) {
      return res.status(400).json({
        success: false,
        error: 'source, destination, and fare are required fields to append a Journey Chain node.'
      });
    }

    const now = new Date();
    const depTime = departure_time || new Date(now.getTime() - (parseInt(time_taken, 10) || 20) * 60 * 1000).toISOString();
    const arrTime = arrival_time || now.toISOString();

    const newNode = await db.journeyChains.appendNode({
      traveler_id,
      journey_id,
      source: source.trim(),
      destination: destination.trim(),
      fare: parseFloat(fare),
      vehicle_type,
      distance_km: parseFloat(distance_km) || 4.5,
      departure_time: depTime,
      arrival_time: arrTime,
      time_taken: parseInt(time_taken, 10) || 20,
      verification_badge,
      metadata
    });

    res.status(201).json({
      success: true,
      message: 'Node successfully minted and linked to Journey Chain ledger with SHA-256 cryptographic proof.',
      data: newNode
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/journeys/chain/verify
 * Cryptographically verify complete chain sequence and detect any data tampering.
 */
exports.verifyChain = async (req, res, next) => {
  try {
    const identifier = req.body.identifier || req.query.identifier || 'trv-default-sarah';
    const auditResult = await db.journeyChains.verifyChain(identifier);

    res.json({
      success: true,
      data: auditResult
    });
  } catch (error) {
    next(error);
  }
};
