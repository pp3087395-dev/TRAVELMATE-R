const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./env');

// Seeded 10 Delhi places (strictly aligned with Delhi ASI / official tourism sources)
const INITIAL_PLACES = [
  {
    id: "pl-red-fort-01",
    place_key: "red-fort",
    name: "Red Fort (Lal Qila)",
    hindi_name: "लाल किला",
    category: "Heritage / UNESCO Site",
    image_url: "/places/red-fort.jpg",
    best_time_to_visit: "Early Morning (09:30 – 11:00 AM) — Beat the intense Delhi afternoon heat and avoid peak tour bus crowds at Lahori Gate.",
    lighting_tip: "Golden hour (16:00 - 17:30) casts warm amber light across the massive red sandstone ramparts.",
    coordinates: { lat: 28.6562, lng: 77.2410 },
    timings: { opening: "09:30", closing: "16:30", closed_on: "Mondays", evening_show: "18:00 - 21:00 (Light & Sound)" },
    fee: {
      indian: 35,
      foreigner: 550,
      saarc_bimstec: 35,
      child: 0,
      currency: "INR",
      source_url: "https://asi.nic.in",
      last_verified: "2026-08-20",
      verification_status: "Official"
    },
    official_ticket_url: "https://asi.payumoney.com/#/monument/redfort",
    safety_notes: [
      "Beware of unauthorized touts outside Chandni Chowk metro claiming monument is closed.",
      "Buy tickets strictly via official ASI QR boards or ASI online portal to avoid counterfeit surcharges.",
      "Security checkpoint at Lahori Gate has separate lines for women and foreign visitors with passports/SafeVisit Pass.",
      "Audio guides are available at the official ASI kiosk near the inner gate."
    ],
    crowd_data: { estimated_crowd: "High", peak_hours: "11:00 - 15:30", best_time: "Morning 09:30 - 11:00" },
    verification_status: "Official",
    last_verified: "2026-08-20"
  },
  {
    id: "pl-qutub-minar-02",
    place_key: "qutub-minar",
    name: "Qutub Minar",
    hindi_name: "क़ुतुब मीनार",
    category: "Heritage / UNESCO Site",
    image_url: "/places/qutub-minar.jpg",
    best_time_to_visit: "Early Morning (07:00 – 09:00 AM) — Cool morning breeze, minimal crowds around the Iron Pillar, and soft directional light.",
    lighting_tip: "Early morning sun creates sharp relief on the intricate Arabic calligraphy bands.",
    coordinates: { lat: 28.5245, lng: 77.1855 },
    timings: { opening: "07:00", closing: "17:00", closed_on: "Open all days" },
    fee: {
      indian: 35,
      foreigner: 550,
      saarc_bimstec: 35,
      child: 0,
      currency: "INR",
      source_url: "https://asi.nic.in",
      last_verified: "2026-08-20",
      verification_status: "Official"
    },
    official_ticket_url: "https://asi.payumoney.com/#/monument/qutubminar",
    safety_notes: [
      "Keep belongings secure around the Iron Pillar complex during peak hours.",
      "Beware of unverified photographers offering instant prints for inflated rates.",
      "Official battery-operated carts available from main car park for elderly visitors."
    ],
    crowd_data: { estimated_crowd: "High", peak_hours: "12:00 - 16:00", best_time: "Morning 07:00 - 09:00" },
    verification_status: "Official",
    last_verified: "2026-08-20"
  },
  {
    id: "pl-humayun-tomb-03",
    place_key: "humayuns-tomb",
    name: "Humayun's Tomb",
    hindi_name: "हुमायूँ का मक़बरा",
    category: "Heritage / UNESCO Site",
    image_url: "/places/humayuns-tomb.jpg",
    best_time_to_visit: "Late Afternoon (15:30 – 17:30) — Experience the spectacular warm sunset glow illuminating the red sandstone dome.",
    lighting_tip: "Sunset backlights the Charbagh geometric water channels and Persian pavilion arches.",
    coordinates: { lat: 28.5933, lng: 77.2507 },
    timings: { opening: "06:00", closing: "18:00", closed_on: "Open all days" },
    fee: {
      indian: 35,
      foreigner: 550,
      saarc_bimstec: 35,
      child: 0,
      currency: "INR",
      source_url: "https://asi.nic.in",
      last_verified: "2026-08-20",
      verification_status: "Official"
    },
    official_ticket_url: "https://asi.payumoney.com/#/monument/humayuntomb",
    safety_notes: [
      "Extensive gardens; stay on designated paved paths after dusk.",
      "Authorized ASI guides carry official badges with government registration numbers."
    ],
    crowd_data: { estimated_crowd: "Medium", peak_hours: "14:00 - 17:00", best_time: "Morning 06:30 - 08:30" },
    verification_status: "Official",
    last_verified: "2026-08-20"
  },
  {
    id: "pl-india-gate-04",
    place_key: "india-gate",
    name: "India Gate & Kartavya Path",
    hindi_name: "इंडिया गेट एवं कर्तव्य पथ",
    category: "Memorial / Public Monument",
    image_url: "/places/india-gate.jpg",
    best_time_to_visit: "Evening (18:00 – 21:00) — Dramatic night floodlights, cool breeze along Kartavya Path, and the Amar Jawan Jyoti flame.",
    lighting_tip: "Architectural floodlights turn the 42-meter triumphal arch into a brilliant golden landmark after 19:00.",
    coordinates: { lat: 28.6129, lng: 77.2295 },
    timings: { opening: "00:00", closing: "23:59", closed_on: "Open 24/7 (Lawns open till 22:00)" },
    fee: {
      indian: 0,
      foreigner: 0,
      saarc_bimstec: 0,
      child: 0,
      currency: "INR",
      source_url: "https://delhitourism.gov.in",
      last_verified: "2026-08-15",
      verification_status: "Official"
    },
    official_ticket_url: "https://delhitourism.gov.in/delhitourism/tourist_place/india_gate.jsp",
    safety_notes: [
      "Completely free public monument. No tickets exist — report anyone demanding entry fees.",
      "High density of souvenir and toy hawkers; a polite 'No, thank you' is sufficient.",
      "Delhi Police booth and 24/7 tourist assistance van located right near National War Memorial pavilion."
    ],
    crowd_data: { estimated_crowd: "High", peak_hours: "17:00 - 21:00", best_time: "Evening 18:00 - 20:00" },
    verification_status: "Official",
    last_verified: "2026-08-15"
  },
  {
    id: "pl-lotus-temple-05",
    place_key: "lotus-temple",
    name: "Lotus Temple (Baháʼí House of Worship)",
    hindi_name: "लोटस टेम्पल (बहाई उपासना मंदिर)",
    category: "Place of Worship / Architecture",
    image_url: "/places/lotus-temple.jpg",
    best_time_to_visit: "Morning (09:00 – 10:30 AM) — Quietest time inside the meditation hall and best ambient light reflecting off the 9 surrounding blue water pools.",
    lighting_tip: "Morning sun casts immaculate bright highlights on the 27 freestanding white marble petals.",
    coordinates: { lat: 28.5535, lng: 77.2588 },
    timings: { opening: "08:30", closing: "17:00", closed_on: "Mondays" },
    fee: {
      indian: 0,
      foreigner: 0,
      saarc_bimstec: 0,
      child: 0,
      currency: "INR",
      source_url: "https://bahaihouseofworship.in",
      last_verified: "2026-08-15",
      verification_status: "Official"
    },
    official_ticket_url: "https://bahaihouseofworship.in",
    safety_notes: [
      "Entry is strictly free of charge. No tickets required for anyone.",
      "Shoe deposit is free and run by official temple volunteers. Never pay shoe deposit attendants.",
      "Absolute silence must be observed inside the prayer hall; flash photography strictly prohibited.",
      "Long queues form after 11:30 AM on weekends."
    ],
    crowd_data: { estimated_crowd: "High", peak_hours: "11:30 - 15:30", best_time: "Morning 08:30 - 10:30" },
    verification_status: "Official",
    last_verified: "2026-08-15"
  },
  {
    id: "pl-akshardham-06",
    place_key: "akshardham-temple",
    name: "Swaminarayan Akshardham",
    hindi_name: "स्वामीनारायण अक्षरधाम",
    category: "Spiritual / Cultural Campus",
    image_url: "/places/swaminarayan-akshardham.jpg",
    best_time_to_visit: "Late Afternoon to Evening (16:00 – 20:00) — Stroll the Mandir carving corridors, followed by the Sahaj Anand musical water fountain show at dusk.",
    lighting_tip: "The dusk Sahaj Anand water show features synchronised laser lights and water jets.",
    coordinates: { lat: 28.6127, lng: 77.2773 },
    timings: { opening: "10:00", closing: "19:00", closed_on: "Mondays", exhibition_timings: "11:00 - 18:00" },
    fee: {
      indian: 0,
      foreigner: 0,
      saarc_bimstec: 0,
      child: 0,
      water_show_adult: 90,
      water_show_child: 60,
      currency: "INR",
      source_url: "https://akshardham.com",
      last_verified: "2026-08-18",
      verification_status: "Official"
    },
    official_ticket_url: "https://akshardham.com/visitor-info/",
    safety_notes: [
      "Mandir campus entry is 100% free. Paid tickets only apply for optional exhibitions and evening Water Show.",
      "Strict security policy: ALL mobile phones, smartwatches, cameras, and large bags MUST be left in free lockers.",
      "Dress code: Shoulders, chest, and knees must be covered. Free sarongs provided at gate with refundable deposit."
    ],
    crowd_data: { estimated_crowd: "High", peak_hours: "15:00 - 19:30", best_time: "Morning 10:00 - 12:00" },
    verification_status: "Official",
    last_verified: "2026-08-18"
  },
  {
    id: "pl-jantar-mantar-07",
    place_key: "jantar-mantar",
    name: "Jantar Mantar",
    hindi_name: "जंतर मंतर",
    category: "Heritage / Astronomical Observatory",
    image_url: "/places/jantar-mantar.jpg",
    best_time_to_visit: "Mid-Day / Noon (11:30 AM – 01:30 PM) — Optimal direct sunlight to see the massive sundials and equinoctial instruments cast exact geometric time shadows.",
    lighting_tip: "High sun overhead casts crisp astronomical shadows across the red masonry instruments.",
    coordinates: { lat: 28.6271, lng: 77.2166 },
    timings: { opening: "06:00", closing: "18:00", closed_on: "Open all days" },
    fee: {
      indian: 25,
      foreigner: 300,
      saarc_bimstec: 25,
      child: 0,
      currency: "INR",
      source_url: "https://asi.nic.in",
      last_verified: "2026-08-15",
      verification_status: "Official"
    },
    official_ticket_url: "https://asi.payumoney.com/#/monument/jantarmantar",
    safety_notes: [
      "Located in central CP; quick 5-min walk from Patel Chowk Metro Station.",
      "Beware of unauthorized auto drivers outside claiming Connaught Place is shut."
    ],
    crowd_data: { estimated_crowd: "Low", peak_hours: "13:00 - 16:00", best_time: "Morning 08:00 - 11:00" },
    verification_status: "Official",
    last_verified: "2026-08-15"
  },
  {
    id: "pl-safdarjung-tomb-08",
    place_key: "safdarjungs-tomb",
    name: "Safdarjung's Tomb",
    hindi_name: "सफ़दरजंग का मक़बरा",
    category: "Heritage / Mughal Architecture",
    image_url: "/places/safdarjung-tomb.jpg",
    best_time_to_visit: "Early Morning (07:00 – 09:00 AM) — Peaceful, uncrowded Mughal garden with birdsong, very low visitor density, and soft morning mist.",
    lighting_tip: "Warm dawn sunlight glints through the ornate marble lattice screens of the central pavilion.",
    coordinates: { lat: 28.5893, lng: 77.2106 },
    timings: { opening: "07:00", closing: "17:00", closed_on: "Open all days" },
    fee: {
      indian: 25,
      foreigner: 300,
      saarc_bimstec: 25,
      child: 0,
      currency: "INR",
      source_url: "https://asi.nic.in",
      last_verified: "2026-08-15",
      verification_status: "Official"
    },
    official_ticket_url: "https://asi.payumoney.com/#/monument/safdarjungtomb",
    safety_notes: [
      "Low crowd density makes this one of the calmest heritage sites in Delhi.",
      "Jor Bagh metro station is just 200m away on the Yellow Line."
    ],
    crowd_data: { estimated_crowd: "Low", peak_hours: "14:00 - 16:30", best_time: "Morning 07:00 - 09:30" },
    verification_status: "Official",
    last_verified: "2026-08-15"
  },
  {
    id: "pl-jama-masjid-09",
    place_key: "jama-masjid",
    name: "Jama Masjid",
    hindi_name: "जामा मस्जिद",
    category: "Historic / Place of Worship",
    image_url: "/places/jama-masjid.jpg",
    best_time_to_visit: "Early Morning (08:00 – 10:30 AM) — Peaceful expansive courtyard before midday prayers (closed to tourists 12:00–13:30), softer light on minarets.",
    lighting_tip: "Morning sun illuminates the red sandstone gateway without courtyard ground heat.",
    coordinates: { lat: 28.6507, lng: 77.2334 },
    timings: { opening: "07:00", closing: "18:30", prayer_breaks: "Closed for non-Muslims 12:00-13:30 & 16:00-17:00" },
    fee: {
      indian: 0,
      foreigner: 0,
      saarc_bimstec: 0,
      child: 0,
      camera_fee: 300,
      currency: "INR",
      source_url: "https://delhitourism.gov.in",
      last_verified: "2026-08-12",
      verification_status: "Official"
    },
    official_ticket_url: "https://delhitourism.gov.in/delhitourism/tourist_place/jama_masjid.jsp",
    safety_notes: [
      "Monument entry itself is free. A photography fee (₹300) applies if carrying a camera or phone for photos.",
      "Respectful attire mandatory (robes available at Gate 2/3 for a small fee if required).",
      "Remove shoes before stepping into courtyard; shoe-keepers near gates usually expect ₹10-20 tip or carry them in your daypack."
    ],
    crowd_data: { estimated_crowd: "Medium", peak_hours: "14:00 - 16:00", best_time: "Morning 08:00 - 10:30" },
    verification_status: "Official",
    last_verified: "2026-08-12"
  },
  {
    id: "pl-bangla-sahib-10",
    place_key: "gurudwara-bangla-sahib",
    name: "Gurudwara Bangla Sahib",
    hindi_name: "गुरुद्वारा बंगला साहिब",
    category: "Spiritual / Community",
    image_url: "/places/gurudwara-bangla-sahib.jpg",
    best_time_to_visit: "Early Morning (07:00 – 09:30 AM) or Evening (08:00 – 10:00 PM) — Divine live Gurbani kirtan, tranquil reflection by the Sarovar pool, and fresh Langar.",
    lighting_tip: "Night illumination reflects the shimmering golden dome across the sacred water pool.",
    coordinates: { lat: 28.6263, lng: 77.2090 },
    timings: { opening: "00:00", closing: "23:59", closed_on: "Open 24/7" },
    fee: {
      indian: 0,
      foreigner: 0,
      saarc_bimstec: 0,
      child: 0,
      langar_free: true,
      currency: "INR",
      source_url: "https://dsgmc.in",
      last_verified: "2026-08-25",
      verification_status: "Official"
    },
    official_ticket_url: "https://dsgmc.in",
    safety_notes: [
      "Completely free entry and 24/7 Langar (community kitchen serving free nutritious vegetarian meals to all).",
      "Head covering required for everyone (free scarves provided at tourist counter at entry).",
      "Shoe deposit and foot-washing pool at entrance are completely free.",
      "Dedicated Foreign Visitor Assistance room near main entrance with English-speaking sevaks."
    ],
    crowd_data: { estimated_crowd: "Medium", peak_hours: "12:00 - 14:00 & 19:00 - 21:00", best_time: "Morning 07:00 - 09:30" },
    verification_status: "Official",
    last_verified: "2026-08-25"
  }
];

// Seeded Safety Zones (NCRB + Delhi Police advisory layer)
const INITIAL_SAFETY_ZONES = [
  {
    id: "sz-01",
    zone_code: "DEL-CP-CENTRAL",
    name: "Connaught Place & Janpath",
    district: "New Delhi",
    risk_level: "Green",
    ncrb_data_year: "2023-2024",
    advisory_text: "High police presence, well lit, round-the-clock tourist police kiosk. Watch for minor shop commission touts near Palika Bazaar.",
    source_label: "Official NCRB & Delhi Police Advisory (Lagging data)",
    last_updated: "2026-08-01"
  },
  {
    id: "sz-02",
    zone_code: "DEL-OLD-CHANDNI",
    name: "Chandni Chowk & Old Delhi Station",
    district: "North Delhi",
    risk_level: "Amber",
    ncrb_data_year: "2023-2024",
    advisory_text: "Heavy crowd congestion, narrow alleys. High rate of fare inflation from cycle-rickshaws and auto-rickshaws. Keep bags zipped in front.",
    source_label: "Official NCRB & Delhi Police Advisory (Lagging data)",
    last_updated: "2026-08-01"
  },
  {
    id: "sz-03",
    zone_code: "DEL-PAHARGANJ",
    name: "Paharganj / NDLS Railway Station Exit",
    district: "Central Delhi",
    risk_level: "Amber",
    ncrb_data_year: "2023-2024",
    advisory_text: "Known hotspot for auto-rickshaw overcharging and fake 'hotel closed' travel agency scams. Use official prepaid taxi counter inside NDLS.",
    source_label: "Official NCRB & Delhi Police Advisory (Lagging data)",
    last_updated: "2026-08-01"
  },
  {
    id: "sz-04",
    zone_code: "DEL-MEHRAULI",
    name: "Mehrauli Archeological Park / Qutub Perimeter",
    district: "South Delhi",
    risk_level: "Green",
    ncrb_data_year: "2023-2024",
    advisory_text: "Monitored heritage corridor. Avoid unlit forest trails inside Mehrauli park after sunset. Main monument complex is highly secure.",
    source_label: "Official NCRB & Delhi Police Advisory (Lagging data)",
    last_updated: "2026-08-01"
  }
];

// Cryptographic Hash Function for Sequential Journey Chains
function calculateChainHash(node) {
  const payload = `${node.sequence_index}|${node.traveler_id}|${node.source}|${node.destination}|${Number(node.fare).toFixed(2)}|${node.departure_time}|${node.arrival_time}|${node.distance_km}|${node.previous_hash}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

const DEMO_TRAVELER_ID = 'trv-default-sarah';
const DEMO_JOURNEY_CODE = 'TM-DEL-2026-X89K';
const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

const seedNode0 = {
  id: 'jc-node-00-genesis',
  traveler_id: DEMO_TRAVELER_ID,
  journey_id: 'journey-default-x89k',
  sequence_index: 0,
  source: 'Indira Gandhi International Airport (Terminal 3)',
  destination: 'Connaught Place (Inner Circle)',
  fare: 420.00,
  vehicle_type: 'taxi_ac',
  distance_km: 16.4,
  departure_time: '2026-09-17T09:30:00.000Z',
  arrival_time: '2026-09-17T10:08:00.000Z',
  time_taken: 38,
  previous_hash: GENESIS_PREV_HASH,
  status: 'confirmed',
  verification_badge: 'Prepaid Airport Taxi Voucher #DL-IGI-9821',
  created_at: '2026-09-17T10:08:05.000Z'
};
seedNode0.current_hash = calculateChainHash(seedNode0);

const seedNode1 = {
  id: 'jc-node-01-cp-redfort',
  traveler_id: DEMO_TRAVELER_ID,
  journey_id: 'journey-default-x89k',
  sequence_index: 1,
  source: 'Connaught Place',
  destination: 'Red Fort (Lal Qila - Lahori Gate)',
  fare: 85.00,
  vehicle_type: 'auto',
  distance_km: 4.8,
  departure_time: '2026-09-17T11:15:00.000Z',
  arrival_time: '2026-09-17T11:33:00.000Z',
  time_taken: 18,
  previous_hash: seedNode0.current_hash,
  status: 'confirmed',
  verification_badge: 'Delhi Gazette Fare Checked (100% Fair)',
  created_at: '2026-09-17T11:33:10.000Z'
};
seedNode1.current_hash = calculateChainHash(seedNode1);

const seedNode2 = {
  id: 'jc-node-02-redfort-humayun',
  traveler_id: DEMO_TRAVELER_ID,
  journey_id: 'journey-default-x89k',
  sequence_index: 2,
  source: 'Red Fort',
  destination: "Humayun's Tomb (Mathura Road)",
  fare: 145.00,
  vehicle_type: 'taxi_non_ac',
  distance_km: 8.2,
  departure_time: '2026-09-17T15:00:00.000Z',
  arrival_time: '2026-09-17T15:26:00.000Z',
  time_taken: 26,
  previous_hash: seedNode1.current_hash,
  status: 'confirmed',
  verification_badge: 'ASI Official Gate Verified',
  created_at: '2026-09-17T15:26:15.000Z'
};
seedNode2.current_hash = calculateChainHash(seedNode2);

const seedNode3 = {
  id: 'jc-node-03-humayun-indiagate',
  traveler_id: DEMO_TRAVELER_ID,
  journey_id: 'journey-default-x89k',
  sequence_index: 3,
  source: "Humayun's Tomb",
  destination: 'India Gate & Kartavya Path',
  fare: 65.00,
  vehicle_type: 'auto',
  distance_km: 3.6,
  departure_time: '2026-09-17T17:45:00.000Z',
  arrival_time: '2026-09-17T17:58:00.000Z',
  time_taken: 13,
  previous_hash: seedNode2.current_hash,
  status: 'confirmed',
  verification_badge: 'SafeTransit Night Corridor Verified',
  created_at: '2026-09-17T17:58:20.000Z'
};
seedNode3.current_hash = calculateChainHash(seedNode3);

const INITIAL_JOURNEY_CHAINS = [seedNode0, seedNode1, seedNode2, seedNode3];

// Unified In-Memory Fallback Store (Always kept in sync)
const store = {
  travelers: [
    {
      id: DEMO_TRAVELER_ID,
      temp_id: 'TRV-X89K',
      name: 'Sarah Jenkins',
      nationality: 'United Kingdom',
      preferred_language: 'en',
      emergency_contact: '+44 7700 900077',
      opt_in_location: true,
      created_at: '2026-09-17T09:00:00.000Z',
      expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  journeys: [
    {
      id: 'journey-default-x89k',
      traveler_id: DEMO_TRAVELER_ID,
      journey_code: DEMO_JOURNEY_CODE,
      status: 'active',
      current_lat: 28.6139,
      current_lng: 77.2090,
      last_location_update: new Date().toISOString(),
      active_route: {},
      visited_places: ['pl-red-fort-01', 'pl-humayun-tomb-03'],
      checkin_history: [],
      start_time: '2026-09-17T09:00:00.000Z',
      expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  places: [...INITIAL_PLACES],
  fare_estimates: [],
  evidence_vault: [],
  incidents: [],
  place_reviews: [],
  safety_zones: [...INITIAL_SAFETY_ZONES],
  journey_chains: [...INITIAL_JOURNEY_CHAINS]
};

// Database State
let pool = null;
let supabase = null;
let isPostgresConnected = false;

// Initialize Supabase Client if URL and Key exist
if (config.SUPABASE_URL && (config.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
  try {
    supabase = createClient(
      config.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY
    );
    console.log('[Supabase] Client initialized with project URL:', config.SUPABASE_URL);
  } catch (err) {
    console.warn('[Supabase] Client initialization warning:', err.message);
  }
}

/**
 * Initialize PostgreSQL connection, run schema migrations and seed places.
 * If DATABASE_URL is missing or unreachable, gracefully falls back to in-memory store.
 */
async function initDatabase() {
  const dbUrl = config.DATABASE_URL || process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.trim() === '' || dbUrl.includes('YOUR_') || dbUrl.includes('...')) {
    console.log('=======================================================');
    console.log('[Database] ℹ️  DATABASE_URL is not configured in backend/.env.');
    console.log('[Database] 🛡️  Running with resilient in-memory local data store.');
    console.log('[Database] (To activate live Supabase persistence, paste your DATABASE_URL into backend/.env)');
    console.log('=======================================================');
    isPostgresConnected = false;
    return false;
  }

  try {
    console.log('[Database] Attempting connection to Supabase PostgreSQL...');
    pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000
    });

    const client = await pool.connect();
    try {
      const res = await client.query('SELECT NOW() as current_time, current_database() as db_name;');
      console.log(`[Database] ✅ Successfully connected to PostgreSQL (${res.rows[0].db_name}) at ${res.rows[0].current_time}`);

      // 1. Run Schema SQL
      const schemaCandidates = [
        path.resolve(__dirname, '../../database/schema.sql'),
        path.resolve(__dirname, '../../../database/schema.sql'),
        path.resolve(process.cwd(), 'database/schema.sql')
      ];
      const schemaPath = schemaCandidates.find(p => fs.existsSync(p));
      if (schemaPath) {
        console.log(`[Database] Checking & applying schema tables from ${schemaPath}...`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('[Database] ✅ Tables verified: travelers, journeys, places, place_reviews, evidence_vault, incidents, fare_estimates, safety_zones.');
      } else {
        console.warn('[Database] ⚠️ schema.sql not found at candidate paths. Skipping automatic DDL verification.');
      }

      // 2. Check and Seed Places
      const placeCountRes = await client.query('SELECT COUNT(*) FROM places;');
      const placeCount = parseInt(placeCountRes.rows[0].count, 10);
      if (placeCount === 0) {
        console.log('[Database] Places table is empty. Seeding 10 verified Delhi monuments...');
        for (const p of INITIAL_PLACES) {
          await client.query(
            `INSERT INTO places (id, place_key, name, hindi_name, category, coordinates, timings, fee, official_ticket_url, image_url, best_time_to_visit, safety_notes, crowd_data, verification_status, last_verified)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             ON CONFLICT (place_key) DO UPDATE SET
               image_url = EXCLUDED.image_url,
               best_time_to_visit = EXCLUDED.best_time_to_visit;`,
            [
              p.id,
              p.place_key,
              p.name,
              p.hindi_name,
              p.category,
              JSON.stringify(p.coordinates),
              JSON.stringify(p.timings),
              JSON.stringify(p.fee),
              p.official_ticket_url,
              p.image_url,
              p.best_time_to_visit,
              JSON.stringify(p.safety_notes),
              JSON.stringify(p.crowd_data),
              p.verification_status,
              p.last_verified
            ]
          );
        }
        console.log(`[Database] ✅ Seeded ${INITIAL_PLACES.length} verified monuments into PostgreSQL.`);
      } else {
        console.log(`[Database] Places table already contains ${placeCount} verified sites. Synchronizing verified photos...`);
        for (const p of INITIAL_PLACES) {
          await client.query(
            `UPDATE places SET image_url = $1 WHERE place_key = $2;`,
            [p.image_url, p.place_key]
          );
        }
      }

      // 3. Check and Seed Safety Zones
      const zoneCountRes = await client.query('SELECT COUNT(*) FROM safety_zones;');
      if (parseInt(zoneCountRes.rows[0].count, 10) === 0) {
        console.log('[Database] Seeding NCRB safety zones...');
        for (const z of INITIAL_SAFETY_ZONES) {
          await client.query(
            `INSERT INTO safety_zones (id, zone_code, name, district, polygon_coords, risk_level, ncrb_data_year, advisory_text, source_label, last_updated)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (zone_code) DO NOTHING;`,
            [
              z.id,
              z.zone_code,
              z.name,
              z.district,
              JSON.stringify({ type: 'Polygon', coordinates: [] }),
              z.risk_level,
              z.ncrb_data_year,
              z.advisory_text,
              z.source_label,
              z.last_updated
            ]
          );
        }
        console.log('[Database] ✅ Seeded safety zones into PostgreSQL.');
      }

      // 4. Load persisted data into memory cache for instantaneous access
      const placesFromDb = await client.query('SELECT * FROM places ORDER BY name ASC;');
      if (placesFromDb.rows.length > 0) {
        store.places = placesFromDb.rows.map(row => ({
          ...row,
          coordinates: typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates,
          timings: typeof row.timings === 'string' ? JSON.parse(row.timings) : row.timings,
          fee: typeof row.fee === 'string' ? JSON.parse(row.fee) : row.fee,
          safety_notes: typeof row.safety_notes === 'string' ? JSON.parse(row.safety_notes) : (row.safety_notes || []),
          crowd_data: typeof row.crowd_data === 'string' ? JSON.parse(row.crowd_data) : row.crowd_data
        }));
      }

      const journeysFromDb = await client.query('SELECT * FROM journeys;');
      if (journeysFromDb.rows.length > 0) {
        store.journeys = journeysFromDb.rows.map(row => ({
          ...row,
          visited_places: typeof row.visited_places === 'string' ? JSON.parse(row.visited_places) : (row.visited_places || []),
          checkin_history: typeof row.checkin_history === 'string' ? JSON.parse(row.checkin_history) : (row.checkin_history || []),
          active_route: typeof row.active_route === 'string' ? JSON.parse(row.active_route) : row.active_route
        }));
      }

      const travelersFromDb = await client.query('SELECT * FROM travelers;');
      if (travelersFromDb.rows.length > 0) {
        store.travelers = travelersFromDb.rows;
      }

      isPostgresConnected = true;
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('[Database] ⚠️  PostgreSQL connection failed:', err.message);
    console.warn('[Database] 🛡️  Falling back to in-memory local data store so server remains operational.');
    isPostgresConnected = false;
    return false;
  }
}

// ==============================================================================
// PARAMETERIZED DATA ACCESS LAYER (DAL)
// Automatically queries PostgreSQL when connected, falls back to store in memory
// ==============================================================================

const db = {
  isPostgresConnected: () => isPostgresConnected,
  getPool: () => pool,
  getSupabase: () => supabase,

  // 1. TRAVELERS
  travelers: {
    async create(traveler) {
      if (isPostgresConnected && pool) {
        try {
          const res = await pool.query(
            `INSERT INTO travelers (id, temp_id, name, nationality, preferred_language, emergency_contact, opt_in_location, created_at, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *;`,
            [
              traveler.id,
              traveler.temp_id,
              traveler.name,
              traveler.nationality,
              traveler.preferred_language,
              traveler.emergency_contact,
              traveler.opt_in_location,
              traveler.created_at,
              traveler.expires_at
            ]
          );
          const saved = res.rows[0];
          store.travelers = store.travelers.filter(t => t.id !== saved.id);
          store.travelers.push(saved);
          return saved;
        } catch (e) {
          console.error('[DB DAL] travelers.create error:', e.message);
        }
      }
      store.travelers.push(traveler);
      return traveler;
    },

    async findById(id) {
      if (isPostgresConnected && pool) {
        try {
          const res = await pool.query('SELECT * FROM travelers WHERE id = $1;', [id]);
          if (res.rows.length > 0) return res.rows[0];
        } catch (e) {
          console.error('[DB DAL] travelers.findById error:', e.message);
        }
      }
      return store.travelers.find(t => t.id === id);
    },

    async anonymize(id) {
      if (isPostgresConnected && pool) {
        try {
          await pool.query(
            `UPDATE travelers SET name = '[PURGED - TRAVELER CONCLUDED]', emergency_contact = '[PURGED]' WHERE id = $1;`,
            [id]
          );
        } catch (e) {
          console.error('[DB DAL] travelers.anonymize error:', e.message);
        }
      }
      const t = store.travelers.find(x => x.id === id);
      if (t) {
        t.name = '[PURGED - TRAVELER CONCLUDED]';
        t.emergency_contact = '[PURGED]';
        t.is_anonymized = true;
      }
    }
  },

  // 2. JOURNEYS
  journeys: {
    async create(journey) {
      if (isPostgresConnected && pool) {
        try {
          const res = await pool.query(
            `INSERT INTO journeys (id, traveler_id, journey_code, status, current_lat, current_lng, last_location_update, active_route, visited_places, checkin_history, start_time, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *;`,
            [
              journey.id,
              journey.traveler_id,
              journey.journey_code,
              journey.status,
              journey.current_lat,
              journey.current_lng,
              journey.last_location_update,
              JSON.stringify(journey.active_route || {}),
              JSON.stringify(journey.visited_places || []),
              JSON.stringify(journey.checkin_history || []),
              journey.start_time,
              journey.expires_at
            ]
          );
          const saved = {
            ...res.rows[0],
            visited_places: journey.visited_places,
            checkin_history: journey.checkin_history
          };
          store.journeys = store.journeys.filter(j => j.id !== saved.id);
          store.journeys.push(saved);
          return saved;
        } catch (e) {
          console.error('[DB DAL] journeys.create error:', e.message);
        }
      }
      store.journeys.push(journey);
      return journey;
    },

    async findByCodeOrId(codeOrId) {
      if (isPostgresConnected && pool) {
        try {
          const res = await pool.query(
            'SELECT * FROM journeys WHERE journey_code = $1 OR id::text = $1;',
            [codeOrId]
          );
          if (res.rows.length > 0) {
            const row = res.rows[0];
            return {
              ...row,
              visited_places: typeof row.visited_places === 'string' ? JSON.parse(row.visited_places) : (row.visited_places || []),
              checkin_history: typeof row.checkin_history === 'string' ? JSON.parse(row.checkin_history) : (row.checkin_history || []),
              active_route: typeof row.active_route === 'string' ? JSON.parse(row.active_route) : row.active_route
            };
          }
        } catch (e) {
          console.error('[DB DAL] journeys.findByCodeOrId error:', e.message);
        }
      }
      return store.journeys.find(j => j.journey_code === codeOrId || j.id === codeOrId);
    },

    async updateLocation(journeyCode, lat, lng, lastUpdate) {
      if (isPostgresConnected && pool) {
        try {
          await pool.query(
            'UPDATE journeys SET current_lat = $1, current_lng = $2, last_location_update = $3 WHERE journey_code = $4;',
            [lat, lng, lastUpdate, journeyCode]
          );
        } catch (e) {
          console.error('[DB DAL] journeys.updateLocation error:', e.message);
        }
      }
      const j = store.journeys.find(x => x.journey_code === journeyCode);
      if (j) {
        j.current_lat = lat;
        j.current_lng = lng;
        j.last_location_update = lastUpdate;
      }
    },

    async checkinPlace(journeyCode, visitedPlaces, checkinHistory) {
      if (isPostgresConnected && pool) {
        try {
          await pool.query(
            'UPDATE journeys SET visited_places = $1, checkin_history = $2 WHERE journey_code = $3;',
            [JSON.stringify(visitedPlaces), JSON.stringify(checkinHistory), journeyCode]
          );
        } catch (e) {
          console.error('[DB DAL] journeys.checkinPlace error:', e.message);
        }
      }
      const j = store.journeys.find(x => x.journey_code === journeyCode || x.id === journeyCode);
      if (j) {
        j.visited_places = visitedPlaces;
        j.checkin_history = checkinHistory;
      }
    },

    async expire(journeyCode, concludedAt) {
      if (isPostgresConnected && pool) {
        try {
          await pool.query(
            'UPDATE journeys SET status = $1, concluded_at = $2 WHERE journey_code = $3 OR id::text = $3;',
            ['expired', concludedAt, journeyCode]
          );
        } catch (e) {
          console.error('[DB DAL] journeys.expire error:', e.message);
        }
      }
      const j = store.journeys.find(x => x.journey_code === journeyCode || x.id === journeyCode);
      if (j) {
        j.status = 'expired';
        j.concluded_at = concludedAt;
      }
    }
  },

  // 3. PLACES & REVIEWS
  places: {
    async getAll({ category, search }) {
      let list = [...store.places];
      if (isPostgresConnected && pool) {
        try {
          const res = await pool.query('SELECT * FROM places ORDER BY name ASC;');
          if (res.rows.length > 0) {
            list = res.rows.map(row => ({
              ...row,
              coordinates: typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates,
              timings: typeof row.timings === 'string' ? JSON.parse(row.timings) : row.timings,
              fee: typeof row.fee === 'string' ? JSON.parse(row.fee) : row.fee,
              safety_notes: typeof row.safety_notes === 'string' ? JSON.parse(row.safety_notes) : (row.safety_notes || []),
              crowd_data: typeof row.crowd_data === 'string' ? JSON.parse(row.crowd_data) : row.crowd_data
            }));
          }
        } catch (e) {
          console.error('[DB DAL] places.getAll error:', e.message);
        }
      }

      if (category && category !== 'All') {
        list = list.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
      }
      if (search) {
        const q = search.toLowerCase().trim();
        const tokens = q.split(/\s+/).filter(t => t.length > 1);
        list = list.filter(p => {
          const target = `${p.name} ${p.hindi_name || ''} ${p.place_key} ${p.category}`.toLowerCase();
          if (target.includes(q)) return true;
          return tokens.some(tok => tok !== 'delhi' && target.includes(tok));
        });
      }
      return list;
    },

    async findByKey(key) {
      if (isPostgresConnected && pool) {
        try {
          const res = await pool.query('SELECT * FROM places WHERE place_key = $1 OR id = $1;', [key]);
          if (res.rows.length > 0) {
            const row = res.rows[0];
            return {
              ...row,
              coordinates: typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates,
              timings: typeof row.timings === 'string' ? JSON.parse(row.timings) : row.timings,
              fee: typeof row.fee === 'string' ? JSON.parse(row.fee) : row.fee,
              safety_notes: typeof row.safety_notes === 'string' ? JSON.parse(row.safety_notes) : (row.safety_notes || []),
              crowd_data: typeof row.crowd_data === 'string' ? JSON.parse(row.crowd_data) : row.crowd_data
            };
          }
        } catch (e) {
          console.error('[DB DAL] places.findByKey error:', e.message);
        }
      }
      return store.places.find(p => p.place_key === key || p.id === key);
    },

    async createReview(review) {
      if (isPostgresConnected && pool) {
        try {
          const res = await pool.query(
            `INSERT INTO place_reviews (id, place_id, journey_id, rating, review_text, scam_flag, verification_badge, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (place_id, journey_id) DO UPDATE SET
               rating = EXCLUDED.rating,
               review_text = EXCLUDED.review_text,
               scam_flag = EXCLUDED.scam_flag
             RETURNING *;`,
            [
              review.id,
              review.place_id,
              review.journey_id,
              review.rating,
              review.review_text,
              review.scam_flag,
              review.verification_badge,
              review.created_at
            ]
          );
          store.place_reviews.push(res.rows[0]);
          return res.rows[0];
        } catch (e) {
          console.error('[DB DAL] places.createReview error:', e.message);
        }
      }
      store.place_reviews.push(review);
      return review;
    },

    async getReviewsForPlace(placeId) {
      if (isPostgresConnected && pool) {
        try {
          const res = await pool.query(
            'SELECT * FROM place_reviews WHERE place_id = $1 ORDER BY created_at DESC;',
            [placeId]
          );
          if (res.rows.length > 0) return res.rows;
        } catch (e) {
          console.error('[DB DAL] places.getReviewsForPlace error:', e.message);
        }
      }
      return store.place_reviews.filter(r => r.place_id === placeId);
    }
  },

  // 4. EVIDENCE VAULT
  evidence: {
    async create(evidence) {
      if (isPostgresConnected && pool) {
        try {
          const res = await pool.query(
            `INSERT INTO evidence_vault (id, journey_id, photo_url, vehicle_type, ocr_detected_plate, tourist_confirmed_plate, is_confirmed_by_tourist, metadata, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *;`,
            [
              evidence.id,
              evidence.journey_id,
              evidence.photo_url,
              evidence.vehicle_type,
              evidence.ocr_detected_plate,
              evidence.tourist_confirmed_plate,
              evidence.is_confirmed_by_tourist,
              JSON.stringify(evidence.metadata || {}),
              evidence.created_at
            ]
          );
          const saved = { ...res.rows[0], journey_code: evidence.journey_code };
          store.evidence_vault.push(saved);
          return saved;
        } catch (e) {
          console.error('[DB DAL] evidence.create error:', e.message);
        }
      }
      store.evidence_vault.push(evidence);
      return evidence;
    },

    async findByJourney(journeyCode) {
      if (isPostgresConnected && pool) {
        try {
          const res = await pool.query(
            `SELECT ev.*, j.journey_code 
             FROM evidence_vault ev
             LEFT JOIN journeys j ON ev.journey_id = j.id
             WHERE j.journey_code = $1 OR ev.journey_id::text = $1;`,
            [journeyCode]
          );
          if (res.rows.length > 0) {
            return res.rows.map(row => ({
              ...row,
              metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
            }));
          }
        } catch (e) {
          console.error('[DB DAL] evidence.findByJourney error:', e.message);
        }
      }
      return store.evidence_vault.filter(e => e.journey_code === journeyCode);
    }
  },

  // 5. INCIDENTS
  incidents: {
    async create(incident) {
      if (isPostgresConnected && pool) {
        try {
          const res = await pool.query(
            `INSERT INTO incidents (id, journey_id, raw_text, language_detected, structured_data, linked_evidence_ids, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *;`,
            [
              incident.id,
              incident.journey_id,
              incident.raw_text,
              incident.language_detected,
              JSON.stringify(incident.structured_data),
              incident.linked_evidence_ids || [],
              incident.status,
              incident.created_at,
              incident.updated_at
            ]
          );
          const saved = {
            ...res.rows[0],
            journey_code: incident.journey_code,
            structured_data: incident.structured_data
          };
          store.incidents.push(saved);
          return saved;
        } catch (e) {
          console.error('[DB DAL] incidents.create error:', e.message);
        }
      }
      store.incidents.push(incident);
      return incident;
    },

    async getAll(status) {
      if (isPostgresConnected && pool) {
        try {
          let query = `
            SELECT inc.*, j.journey_code
            FROM incidents inc
            LEFT JOIN journeys j ON inc.journey_id = j.id
          `;
          const params = [];
          if (status) {
            query += ` WHERE inc.status = $1`;
            params.push(status);
          }
          query += ` ORDER BY inc.created_at DESC;`;
          const res = await pool.query(query, params);
          if (res.rows.length > 0) {
            return res.rows.map(row => ({
              ...row,
              structured_data: typeof row.structured_data === 'string' ? JSON.parse(row.structured_data) : row.structured_data
            }));
          }
        } catch (e) {
          console.error('[DB DAL] incidents.getAll error:', e.message);
        }
      }
      let list = [...store.incidents];
      if (status) {
        list = list.filter(i => i.status === status);
      }
      return list;
    },

    async updateStatus(id, status, adminNotes) {
      if (isPostgresConnected && pool) {
        try {
          const res = await pool.query(
            `UPDATE incidents SET status = $1, admin_notes = $2, updated_at = NOW() WHERE id = $3 RETURNING *;`,
            [status, adminNotes, id]
          );
          if (res.rows.length > 0) {
            const updated = res.rows[0];
            const inc = store.incidents.find(i => i.id === id);
            if (inc) {
              inc.status = status;
              inc.admin_notes = adminNotes;
            }
            return updated;
          }
        } catch (e) {
          console.error('[DB DAL] incidents.updateStatus error:', e.message);
        }
      }
      const inc = store.incidents.find(i => i.id === id);
      if (inc) {
        inc.status = status;
        inc.admin_notes = adminNotes;
      }
      return inc;
    }
  },

  // 6. FARE ESTIMATES
  fares: {
    async create(estimate) {
      if (isPostgresConnected && pool) {
        try {
          await pool.query(
            `INSERT INTO fare_estimates (id, journey_id, origin_name, destination_name, origin_coords, destination_coords, vehicle_type, distance_km, duration_min, expected_fare_min, expected_fare_max, quoted_fare, is_overcharge, discrepancy_percent, status_label, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);`,
            [
              estimate.id,
              estimate.journey_id,
              estimate.origin_name || 'Origin',
              estimate.destination_name || 'Destination',
              JSON.stringify(estimate.origin_coords || {}),
              JSON.stringify(estimate.destination_coords || {}),
              estimate.vehicle_type,
              estimate.distance_km,
              estimate.duration_min || 0,
              estimate.expected_fare_min,
              estimate.expected_fare_max,
              estimate.quoted_fare,
              estimate.is_overcharge,
              estimate.discrepancy_percent,
              estimate.status_label || 'Estimated',
              estimate.created_at
            ]
          );
        } catch (e) {
          console.error('[DB DAL] fares.create error:', e.message);
        }
      }
      store.fare_estimates.push(estimate);
      return estimate;
    }
  },

  // 6b. JOURNEY CHAINS (Cryptographic Sequential Ledger)
  journeyChains: {
    async findByTraveler(travelerIdOrCode) {
      let targetTravelerId = travelerIdOrCode;
      const matchedJourney = store.journeys.find(j => j.journey_code === travelerIdOrCode || j.id === travelerIdOrCode);
      if (matchedJourney) {
        targetTravelerId = matchedJourney.traveler_id;
      } else {
        const matchedTraveler = store.travelers.find(t => t.temp_id === travelerIdOrCode || t.id === travelerIdOrCode);
        if (matchedTraveler) targetTravelerId = matchedTraveler.id;
      }

      if (isPostgresConnected && pool) {
        try {
          const res = await pool.query(
            `SELECT * FROM journey_chains WHERE traveler_id = $1 ORDER BY sequence_index ASC;`,
            [targetTravelerId]
          );
          if (res.rows.length > 0) {
            return res.rows.map(r => ({
              ...r,
              fare: parseFloat(r.fare),
              distance_km: parseFloat(r.distance_km),
              time_taken: parseInt(r.time_taken, 10),
              metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : (r.metadata || {})
            }));
          }
        } catch (e) {
          console.error('[DB DAL] journeyChains.findByTraveler error:', e.message);
        }
      }

      // Filter in-memory
      const inMem = store.journey_chains
        .filter(node => node.traveler_id === targetTravelerId || node.traveler_id === DEMO_TRAVELER_ID)
        .sort((a, b) => a.sequence_index - b.sequence_index);

      return inMem.length > 0 ? inMem : store.journey_chains;
    },

    async appendNode(nodeData) {
      const {
        traveler_id = DEMO_TRAVELER_ID,
        journey_id = 'journey-default-x89k',
        source,
        destination,
        fare,
        vehicle_type = 'auto',
        distance_km = 5.0,
        departure_time = new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        arrival_time = new Date().toISOString(),
        time_taken = 25,
        verification_badge = 'Verified Transit Hop',
        metadata = {}
      } = nodeData;

      const existingChain = await this.findByTraveler(traveler_id);
      const sequence_index = existingChain.length;
      const previous_hash = sequence_index > 0
        ? existingChain[sequence_index - 1].current_hash
        : GENESIS_PREV_HASH;

      const id = uuidv4();
      const nodeToHash = {
        id,
        traveler_id,
        journey_id,
        sequence_index,
        source: source.trim(),
        destination: destination.trim(),
        fare: parseFloat(fare),
        vehicle_type,
        distance_km: parseFloat(distance_km),
        departure_time,
        arrival_time,
        time_taken: parseInt(time_taken, 10),
        previous_hash,
        status: 'confirmed',
        verification_badge,
        metadata,
        created_at: new Date().toISOString()
      };

      nodeToHash.current_hash = calculateChainHash(nodeToHash);

      if (isPostgresConnected && pool) {
        try {
          await pool.query(
            `INSERT INTO journey_chains (id, traveler_id, journey_id, sequence_index, source, destination, fare, vehicle_type, distance_km, departure_time, arrival_time, time_taken, previous_hash, current_hash, status, verification_badge, metadata, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);`,
            [
              nodeToHash.id,
              nodeToHash.traveler_id,
              nodeToHash.journey_id,
              nodeToHash.sequence_index,
              nodeToHash.source,
              nodeToHash.destination,
              nodeToHash.fare,
              nodeToHash.vehicle_type,
              nodeToHash.distance_km,
              nodeToHash.departure_time,
              nodeToHash.arrival_time,
              nodeToHash.time_taken,
              nodeToHash.previous_hash,
              nodeToHash.current_hash,
              nodeToHash.status,
              nodeToHash.verification_badge,
              JSON.stringify(nodeToHash.metadata),
              nodeToHash.created_at
            ]
          );
        } catch (e) {
          console.error('[DB DAL] journeyChains.appendNode error:', e.message);
        }
      }

      store.journey_chains.push(nodeToHash);
      return nodeToHash;
    },

    async verifyChain(travelerIdOrCode) {
      const chain = await this.findByTraveler(travelerIdOrCode);
      const tamperedNodes = [];

      for (let i = 0; i < chain.length; i++) {
        const node = chain[i];
        if (i === 0) {
          if (node.previous_hash !== GENESIS_PREV_HASH) {
            tamperedNodes.push({ sequence_index: i, reason: 'Genesis previous hash mismatch', node_id: node.id });
          }
        } else {
          if (node.previous_hash !== chain[i - 1].current_hash) {
            tamperedNodes.push({ sequence_index: i, reason: 'Previous hash does not match prior node hash', node_id: node.id });
          }
        }

        const recalculated = calculateChainHash(node);
        if (recalculated !== node.current_hash) {
          tamperedNodes.push({ sequence_index: i, reason: 'Current hash cryptographic mismatch (content altered)', node_id: node.id });
        }
      }

      return {
        is_valid: tamperedNodes.length === 0,
        total_nodes: chain.length,
        tampered_count: tamperedNodes.length,
        tampered_nodes: tamperedNodes,
        verified_at: new Date().toISOString(),
        audit_verdict: tamperedNodes.length === 0 ? 'Cryptographically Verified - 0 Tampering Detected' : 'Warning: Ledger Integrity Compromised'
      };
    }
  },

  // 7. ADMIN STATS
  admin: {
    async getStats() {
      if (isPostgresConnected && pool) {
        try {
          const [journeysRes, incidentsRes, faresRes, evidenceRes, placesRes, zonesRes] = await Promise.all([
            pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active FROM journeys;`),
            pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'pending_review') as pending FROM incidents;`),
            pool.query(`SELECT COUNT(*) as flagged FROM fare_estimates WHERE is_overcharge = true;`),
            pool.query(`SELECT COUNT(*) as total FROM evidence_vault;`),
            pool.query(`SELECT COUNT(*) as total FROM places;`),
            pool.query(`SELECT COUNT(*) as total FROM safety_zones;`)
          ]);

          return {
            totalJourneys: parseInt(journeysRes.rows[0].total, 10),
            activeJourneys: parseInt(journeysRes.rows[0].active, 10),
            totalIncidents: parseInt(incidentsRes.rows[0].total, 10),
            pendingIncidents: parseInt(incidentsRes.rows[0].pending, 10),
            flaggedFares: parseInt(faresRes.rows[0].flagged, 10),
            totalEvidence: parseInt(evidenceRes.rows[0].total, 10),
            placesCount: parseInt(placesRes.rows[0].total, 10),
            safetyZonesCount: parseInt(zonesRes.rows[0].total, 10)
          };
        } catch (e) {
          console.error('[DB DAL] admin.getStats error:', e.message);
        }
      }

      return {
        totalJourneys: store.journeys.length,
        activeJourneys: store.journeys.filter(j => j.status === 'active').length,
        totalIncidents: store.incidents.length,
        pendingIncidents: store.incidents.filter(i => i.status === 'pending_review').length,
        flaggedFares: store.fare_estimates.filter(f => f.is_overcharge).length,
        totalEvidence: store.evidence_vault.length,
        placesCount: store.places.length,
        safetyZonesCount: store.safety_zones.length
      };
    }
  }
};

module.exports = {
  db,
  store,
  initDatabase,
  INITIAL_PLACES,
  INITIAL_SAFETY_ZONES
};
