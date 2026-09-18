# TravelMate — Delhi Tourist Trust, Journey Chain & Safety Layer
### Smart India Hackathon (SIH) 2026 • Production Edition

> **Core Philosophy:** One tourist → One temporary Journey ID → connects Verified Destinations → Official ASI Ticket Gates → SafeVisit Pass → Fair Fare Checks → Digital India Bhashini Vernacular Translation → Cryptographic Journey Chain Ledger → RideSafe Evidence Vault → 112 Incident Dispatch.

---

## 🏛️ System Architecture

```
                                  ┌────────────────────────────────┐
                                  │   TravelMate Frontend (5173)   │
                                  │  React 18 + Vite + Tailwind    │
                                  └───────┬──────────────┬─────────┘
                                          │              │
                    REST API Calls & Proxy│              │ Live Audio / Speech API
                                          ▼              ▼
                    ┌─────────────────────────┐   ┌───────────────────────────────┐
                    │   Backend API (5000)    │   │ Digital India Bhashini Layer  │
                    │ Node.js + Express DAL   │◄──┤ MeitY Dhruva / ULCA Pipeline  │
                    └───────────┬─────────────┘   └───────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│ PostgreSQL / Supabase Engine  │               │ AI Decision Engine (Port 8000)│
│ • travelers & journeys        │               │ • Claude 3.5 Sonnet RAG       │
│ • journey_chains (SHA-256)    │               │ • OCR License Plate Reader    │
│ • places & fare_estimates     │               │ • Distress Keyword Classifier │
│ • in-memory resilient cache   │               └───────────────────────────────┘
└───────────────────────────────┘
```

---

## 🌟 The 5 Core Modules

### 1. High-Performance Modern Landing Page
- **Design System:** Deep slate tech aesthetic, ambient glowing gradients, glassmorphism cards (`backdrop-filter: blur`), dark/light theme switching, and smooth micro-interactions.
- **Components:**
  - **Hero Section:** Clear value propositions, dual CTA buttons (*"Launch App"*, *"Explore Journeys"*, *"Instant SafePass"*), and an interactive dynamic mock card displaying a live SafeVisit QR pass, GPS route hop, and Bhashini vernacular audio phrase.
  - **Features Grid:** 4 interactive subsystem cards (AI Route Planning, Live Safe Track, Cryptographic Journey Chain, Bhashini AI Translator).
  - **Quick Stats Bar:** 10+ ASI Verified Monuments, 100% Passport-Free Privacy, ₹0 Ticket Fraud, < 3s Emergency 112 Dispatch.
  - **Verified Testimonials:** Real stories from international and domestic travelers.
  - **Interactive Footer:** Links to government authorities (ASI, Delhi Police, MeitY Bhashini), language selector, theme toggle, and Scope #18 Privacy statement.

### 2. User Portal & Cryptographic "Journey Chain" System
- **User Portal Migration:** Replaces the legacy admin portal with a comprehensive personal traveler hub where active tourists manage their profile, 7-day QR SafeVisit Pass, and transit history.
- **Dual Mode Switch:** Includes a toggle to switch into **Control Room Audit Mode**, preserving human verification of incidents, monument fee freshness audits, and flagged fare dispute inspections for authorities and hackathon evaluators.
- **Journey Chain Ledger:**
  - Every single trip or multi-hop transit generates an indexed cryptographic node.
  - Node schema: `sequence_index`, `source`, `destination`, `fare`, `vehicle_type`, `distance_km`, `departure_time`, `arrival_time`, `time_taken`, `previous_hash`, `current_hash`.
  - Blocks are cryptographically linked using SHA-256 (`calculateChainHash`), guaranteeing 100% tamper-proof transit history.
  - **Analytics & Timeline:** Visual timeline with glowing connector dots, summary analytics (Total Spent ₹, Total Distance km, Average Time min, Cryptographic Integrity Seal), and a 1-click **Audit Ledger** verification engine.
  - **Hop Logging:** Log new transit hops on the fly with automatic SHA-256 hash minting.

### 3. Claude-Style Collapsible Sidebar Navigation
- **Responsive Sidebar:** Modeled directly after Claude’s minimalist UI.
- **Modes:**
  - **Expanded (260px):** Brand logo, collapse toggle, quick SafePass card, category headers, and user profile pill.
  - **Collapsed Rail (72px):** Minimalist icon rail with centered action icons and tooltips on hover.
  - **Mobile Slide-Over Drawer:** Glassmorphic translucent backdrop overlay, light-dismiss on tap or `Esc` key press.
- **Core Navigation Links:**
  - 🏠 **Dashboard / Home** (`/` and `/portal`)
  - 🚆 **Active Trips & Live Tracking** (`/safe-journey`)
  - 🔗 **Journey Chains (History & Ledger)** (`/journey-chain`)
  - 🗣️ **Bhashini AI Translator** (`/phrase-helper`)
  - 🚨 **Emergency / Distress Assistance** (`/emergency`)
  - ⚙️ **User Settings & Profile** (`/settings`)

### 4. Digital India Bhashini API Integration
- **Backend Service Layer (`/api/bhashini`):**
  - Live proxy to official MeitY Bhashini Dhruva / ULCA inference pipeline with API keys.
  - Resilient offline contextual multilingual engine supporting **12+ Indian vernacular languages** (Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu).
- **Floating Translation Widget (`FloatingBhashiniWidget`):**
  - Persistent floating launcher button with animated soundwaves at bottom-right.
  - Expands into a glassmorphism translation console with:
    - Text and voice microphone input (Web Speech API STT)
    - Regional vernacular script, Romanized transliteration, and phonetic pronunciation guide
    - Spoken native audio playback (TTS)
    - Quick driver & transit phrase presets ("Please use the meter", "Stop here", "Where is the ticket counter?")
    - Fullscreen Flashcard mode to display large text across taxi windows or counters.

### 5. UI/UX Enhancements & Clean Code Structure
- **Global Toast Notification System (`useToast`):** Non-intrusive animated alerts for success, error, warning, and info.
- **Loading Skeletons (`SkeletonCard`, `SkeletonRow`):** Smooth shimmering placeholders during asynchronous operations.
- **Settings & Privacy Page (`/settings`):** Manage profile, language preferences, download cryptographic ledger backup as JSON, and trigger Scope #18 Permanent Privacy Purge.
- **Clean Modular Folder Layout:**
  - `frontend/src/components/landing/`: Hero, FeaturesGrid, QuickStats, Testimonials, Footer
  - `frontend/src/components/portal/`: JourneyChainTimeline, ChainAnalytics, AddTripModal
  - `frontend/src/components/navigation/`: ClaudeSidebar, Header, Navbar
  - `frontend/src/components/bhashini/`: FloatingBhashiniWidget
  - `frontend/src/components/common/`: ToastContainer, Skeleton, StatusBadge, QRModal
  - `frontend/src/pages/`: LandingPage, UserPortalPage, JourneyChainPage, SettingsPage, etc.
  - `frontend/src/services/`: journeyChainService.js, bhashiniService.js, api.js
  - `backend/src/controllers/`: journeyChainController.js, bhashiniController.js, etc.

---

## ⚙️ Environment Variables Configuration

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*

# PostgreSQL / Supabase Database Connection
# If left unconfigured, TravelMate automatically runs in resilient in-memory mode!
DATABASE_URL=postgresql://user:password@host:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps Platform Key (for Geocoding & Route Directions)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Digital India Bhashini Translation Initiative (MeitY)
# Obtain from https://bhashini.gov.in or https://dhruva.bhashini.gov.in
BHASHINI_USER_ID=your_bhashini_user_id
BHASHINI_API_KEY=your_bhashini_api_key
BHASHINI_INFERENCE_API_KEY=your_bhashini_inference_key
BHASHINI_PIPELINE_ENDPOINT=https://dhruva-api.bhashini.gov.in/services/inference/pipeline

# Python AI Service
AI_SERVICE_URL=http://localhost:8000
```

### Frontend (`frontend/.env`)
```ini
# Google Maps Platform Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Bhashini Client Credentials (Optional if backend proxy is active)
VITE_BHASHINI_USER_ID=
VITE_BHASHINI_API_KEY=
VITE_BHASHINI_INFERENCE_API_KEY=
VITE_BHASHINI_PIPELINE_ENDPOINT=https://dhruva-api.bhashini.gov.in/services/inference/pipeline
```

---

## 🚀 Quick Start Guide

### 1. Start the Backend API (Port 5000)
```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

### 2. Start the Frontend Application (Port 5173)
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

### 3. (Optional) Start AI Microservice (Port 8000)
```powershell
cd ai-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Visit **http://localhost:5173** to experience the modern landing page and user portal!

---

## 🧪 Verification & Automated Tests

Run the complete Journey Chain and Bhashini test suite:
```powershell
cd backend
node test_modules_e2e.js
```

Build the production frontend bundle:
```powershell
cd frontend
npm.cmd run build
```
