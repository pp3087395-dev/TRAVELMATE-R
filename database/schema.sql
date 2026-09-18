-- ==============================================================================
-- TravelMate: PostgreSQL Database Schema (SIH 2026 Prototype)
-- Cross-service tourist trust & safety layer for foreign tourists visiting Delhi
-- Core Concept: One tourist -> One temporary Journey ID -> End-to-end lifecycle
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TRAVELERS (Passport-free minimal profile with auto-expiry)
CREATE TABLE IF NOT EXISTS travelers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    temp_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. TM-DEL-2026-X89K
    name VARCHAR(150) NOT NULL,
    nationality VARCHAR(100) NOT NULL, -- ISO country or full name (e.g., 'United Kingdom', 'Germany', 'USA')
    preferred_language VARCHAR(50) DEFAULT 'en', -- e.g. 'en', 'es', 'fr', 'de', 'hi'
    emergency_contact VARCHAR(100), -- Phone or email of contact
    opt_in_location BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- 2. JOURNEYS (One temporary Journey ID per traveler trip)
CREATE TABLE IF NOT EXISTS journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    traveler_id UUID NOT NULL REFERENCES travelers(id) ON DELETE CASCADE,
    journey_code VARCHAR(50) UNIQUE NOT NULL, -- QR code representation
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    last_location_update TIMESTAMPTZ,
    active_route JSONB DEFAULT '{}'::jsonb, -- Expected polyline, origin, destination
    visited_places JSONB DEFAULT '[]'::jsonb,
    checkin_history JSONB DEFAULT '[]'::jsonb,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    concluded_at TIMESTAMPTZ
);

-- 3. PLACES (Verified Delhi heritage & tourist sites with dual fee & safety notes)
CREATE TABLE IF NOT EXISTS places (
    id VARCHAR(100) PRIMARY KEY,
    place_key VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'red-fort', 'qutub-minar'
    name VARCHAR(255) NOT NULL,
    hindi_name VARCHAR(255),
    category VARCHAR(100) NOT NULL, -- 'Heritage', 'Monument', 'Religious', 'Observatory', 'Memorial'
    coordinates JSONB NOT NULL, -- {"lat": 28.6562, "lng": 77.2410}
    timings JSONB NOT NULL, -- {"opening": "09:30", "closing": "16:30", "closed_on": "Mondays"}
    fee JSONB NOT NULL, -- {"indian": 35, "foreigner": 550, "saarc_bimstec": 35, "child": 0, "currency": "INR", "source_url": "...", "last_verified": "2026-08-15", "verification_status": "Official"}
    official_ticket_url TEXT NOT NULL,
    image_url TEXT,
    best_time_to_visit TEXT,
    safety_notes JSONB DEFAULT '[]'::jsonb, -- Array of scam advisories, dress codes, recommended gates
    crowd_data JSONB DEFAULT '{"estimated_crowd": "Medium", "peak_hours": "11:00-15:00"}'::jsonb,
    verification_status VARCHAR(50) DEFAULT 'Official' CHECK (verification_status IN ('Official', 'Authorized', 'Estimated', 'User-reported', 'Stale')),
    last_verified DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FARE_ESTIMATES (Fair Fare meter query logs & overcharge flags)
CREATE TABLE IF NOT EXISTS fare_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES journeys(id) ON DELETE SET NULL,
    origin_name VARCHAR(255) NOT NULL,
    destination_name VARCHAR(255) NOT NULL,
    origin_coords JSONB,
    destination_coords JSONB,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('auto', 'taxi_non_ac', 'taxi_ac')),
    distance_km DOUBLE PRECISION NOT NULL,
    duration_min INTEGER NOT NULL,
    expected_fare_min NUMERIC(10,2) NOT NULL,
    expected_fare_max NUMERIC(10,2) NOT NULL,
    quoted_fare NUMERIC(10,2),
    is_overcharge BOOLEAN DEFAULT FALSE,
    discrepancy_percent NUMERIC(5,2) DEFAULT 0,
    status_label VARCHAR(50) DEFAULT 'Estimated',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVIDENCE_VAULT (RideSafe photo + OCR + tourist confirmation step)
CREATE TABLE IF NOT EXISTS evidence_vault (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('auto', 'taxi', 'bus', 'other')),
    ocr_detected_plate VARCHAR(50),
    tourist_confirmed_plate VARCHAR(50),
    is_confirmed_by_tourist BOOLEAN DEFAULT FALSE, -- MUST BE CONFIRMED BY TOURIST BEFORE PERSISTENCE
    metadata JSONB DEFAULT '{}'::jsonb, -- Location, timestamp, vehicle notes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INCIDENTS (Multilingual tourist reports auto-structured by Claude)
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES journeys(id) ON DELETE SET NULL,
    raw_text TEXT NOT NULL,
    language_detected VARCHAR(20) DEFAULT 'en',
    structured_data JSONB NOT NULL, -- {location, time, person_type_involved, description, confidence, severity}
    linked_evidence_ids UUID[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'verified_by_human', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PLACE_REVIEWS (Only accessible to tourists who visited via Journey ID)
CREATE TABLE IF NOT EXISTS place_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id VARCHAR(100) NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    journey_id UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    scam_flag BOOLEAN DEFAULT FALSE,
    verification_badge VARCHAR(50) DEFAULT 'Verified Traveler',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_place_journey UNIQUE (place_id, journey_id)
);

-- 8. SAFETY_ZONES (NCRB + Delhi Police advisory risk overlay)
CREATE TABLE IF NOT EXISTS safety_zones (
    id VARCHAR(50) PRIMARY KEY,
    zone_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    polygon_coords JSONB NOT NULL, -- GeoJSON polygon or coordinate array
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('Green', 'Amber', 'Red')),
    ncrb_data_year VARCHAR(20) DEFAULT '2023-2024',
    advisory_text TEXT NOT NULL,
    source_label VARCHAR(100) DEFAULT 'Official NCRB & Delhi Police Advisory (Lagging data)',
    last_updated DATE DEFAULT CURRENT_DATE
);

-- 9. JOURNEY_CHAINS (Immutable-style sequential cryptographic transit ledger)
CREATE TABLE IF NOT EXISTS journey_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    traveler_id UUID NOT NULL REFERENCES travelers(id) ON DELETE CASCADE,
    journey_id UUID REFERENCES journeys(id) ON DELETE SET NULL,
    sequence_index INTEGER NOT NULL,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    fare NUMERIC(10,2) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL, -- 'auto', 'taxi_ac', 'taxi_non_ac', 'metro', 'bus'
    distance_km DOUBLE PRECISION NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    time_taken INTEGER NOT NULL, -- duration in minutes
    previous_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    verification_badge VARCHAR(100) DEFAULT 'Cryptographically Verified',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_traveler_chain_seq UNIQUE (traveler_id, sequence_index)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_journeys_code ON journeys(journey_code);
CREATE INDEX IF NOT EXISTS idx_places_key ON places(place_key);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_evidence_journey ON evidence_vault(journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_chains_traveler ON journey_chains(traveler_id);
CREATE INDEX IF NOT EXISTS idx_journey_chains_hash ON journey_chains(current_hash);
