const { GoogleGenAI } = require('@google/genai');

// Candidate models prioritized by responsiveness and availability per @google/genai rules
function getCandidateModels() {
  const envModels = process.env.GEMINI_MODELS;
  if (envModels && envModels.trim()) {
    return envModels.split(',').map(m => m.trim()).filter(Boolean);
  }
  return [
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];
}

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });
}

// 10 Official ASI Delhi Places & Cultural Landmarks Knowledge Base
const PLACES_KNOWLEDGE = [
  {
    name: "Red Fort (Lal Qila)",
    hindi: "लाल किला",
    category: "Heritage / UNESCO Site",
    timings: "09:30 AM - 04:30 PM (Closed on Mondays)",
    ticket: "Foreigners: ₹550 | Indians: ₹35 | SAARC/BIMSTEC: ₹35 | Children under 15: Free",
    metro: "Chandni Chowk / Lal Quila (Violet Line)",
    safety: "Buy tickets strictly through official ASI QR codes or asi.payumoney.com. Beware of touts outside claiming the monument is closed.",
    link: "/discover?place=red-fort"
  },
  {
    name: "Qutub Minar",
    hindi: "क़ुतुब मीनार",
    category: "Heritage / UNESCO Site",
    timings: "07:00 AM - 05:00 PM (Open Daily)",
    ticket: "Foreigners: ₹550 | Indians: ₹40 | SAARC/BIMSTEC: ₹40 | Children under 15: Free",
    metro: "Qutub Minar (Yellow Line)",
    safety: "Visit early morning (07:00 - 09:00 AM) to beat heat and crowds. Iron Pillar and ancient calligraphy are highlights.",
    link: "/discover?place=qutub-minar"
  },
  {
    name: "Humayun's Tomb",
    hindi: "हुमायूँ का मकबरा",
    category: "Heritage / UNESCO Site",
    timings: "06:00 AM - 06:00 PM (Open Daily, Sunrise to Sunset)",
    ticket: "Foreigners: ₹550 | Indians: ₹40 | SAARC/BIMSTEC: ₹40 | Children under 15: Free",
    metro: "JLN Stadium (Violet Line) or Hazrat Nizamuddin (Pink Line)",
    safety: "Mughal garden tomb architecture that inspired the Taj Mahal. High safety score and calm atmosphere.",
    link: "/discover?place=humayuns-tomb"
  },
  {
    name: "India Gate & Kartavya Path",
    hindi: "इण्डिया गेट",
    category: "National Monument",
    timings: "Open 24 Hours Daily (Best: 06:00 PM - 09:30 PM for illuminations)",
    ticket: "Completely Free Entry",
    metro: "Central Secretariat (Yellow/Violet Line)",
    safety: "Keep personal belongings close in evening crowds. Visit the adjoining National War Memorial.",
    link: "/discover?place=india-gate"
  },
  {
    name: "Lotus Temple (Bahá'í House of Worship)",
    hindi: "कमल मंदिर",
    category: "Architectural & Spiritual Landmark",
    timings: "08:00 AM - 05:00 PM (Closed on Mondays)",
    ticket: "Completely Free Entry",
    metro: "Kalkaji Mandir (Violet/Magenta Line)",
    safety: "Strict silence maintained in inner prayer hall. Free shoe deposit counter at entrance.",
    link: "/discover?place=lotus-temple"
  },
  {
    name: "Akshardham Temple",
    hindi: "स्वामीनारायण अक्षरधाम",
    category: "Cultural & Spiritual Complex",
    timings: "09:30 AM - 06:30 PM (Closed on Mondays)",
    ticket: "Complex entry is Free; Exhibitions & Sahaj Anand Water Show: ₹250 Adults / ₹150 Children",
    metro: "Akshardham (Blue Line)",
    safety: "Electronic devices (phones, cameras, smartwatches, power banks) are strictly forbidden inside. Free cloakroom available.",
    link: "/discover?place=akshardham"
  },
  {
    name: "Jama Masjid",
    hindi: "जामा मस्जिद",
    category: "Historic Mosque",
    timings: "07:00 AM - 12:00 PM & 01:30 PM - 06:30 PM (Daily, restricted during prayer times)",
    ticket: "Free Entry (Modest robes provided for ₹100; camera fee ₹300)",
    metro: "Jama Masjid (Violet Line)",
    safety: "Dress respectfully covering shoulders and knees. Remove shoes before entering courtyard.",
    link: "/discover?place=jama-masjid"
  },
  {
    name: "Chandni Chowk & Khari Baoli",
    hindi: "चाँदनी चौक",
    category: "Bazaar & Cultural Hub",
    timings: "10:00 AM - 08:00 PM (Closed on Sundays)",
    ticket: "Free exploration; Cycle rickshaw rides typically ₹50-₹100",
    metro: "Chandni Chowk (Yellow Line)",
    safety: "High density pedestrian area. Keep wallet and phone in front pockets. Famous for Paranthe Wali Gali and Asia's largest spice market.",
    link: "/discover?place=chandni-chowk"
  },
  {
    name: "National Museum",
    hindi: "राष्ट्रीय संग्रहालय",
    category: "Art & Antiquities Museum",
    timings: "10:00 AM - 06:00 PM (Closed on Mondays & Gazetted Holidays)",
    ticket: "Foreigners: ₹650 (includes audio guide) | Indians: ₹20 | Students: Free",
    metro: "Udyog Bhawan (Yellow Line) / Janpath (Violet Line)",
    safety: "Houses 5,000+ years of Indian heritage including Harappan Dancing Girl and Buddhist relics.",
    link: "/discover?place=national-museum"
  },
  {
    name: "Lodhi Gardens",
    hindi: "लोधी गार्डन",
    category: "Historic Urban Park",
    timings: "06:00 AM - 08:00 PM (Open Daily)",
    ticket: "Completely Free Entry",
    metro: "Jor Bagh (Yellow Line) / JLN Stadium (Violet Line)",
    safety: "Very safe, scenic 90-acre park featuring 15th-century Sayyid and Lodhi architectural tombs.",
    link: "/discover?place=lodhi-gardens"
  }
];

// App Navigation & Capabilities Map
const APP_FEATURES = [
  {
    name: "Discover Delhi Places",
    path: "/discover",
    description: "Explore 10 verified Delhi monuments and heritage spots with official dual-pricing, live crowd indicators, audio guides, and verified safety tips.",
    keywords: ["place", "monument", "visit", "tourist", "sightseeing", "ticket", "timing", "fort", "museum", "temple", "garden"]
  },
  {
    name: "Bhashini Translator",
    path: "/bhashini-translator",
    description: "Real-time speech-to-speech voice and text translation supporting 29 international languages and 23 Indian languages, powered by Digital India Bhashini. Includes audio playback and full-screen cards for drivers.",
    keywords: ["translate", "translation", "language", "bhashini", "hindi", "speak", "voice", "audio", "driver", "tourist phrases", "speech"]
  },
  {
    name: "Fare Meter Calculator",
    path: "/fare-meter",
    description: "Official Delhi Auto-Rickshaw & Taxi meter tariff calculator. Day rate: ₹30 for first 1.5 km + ₹11/km. Night surcharge (11 PM - 5 AM): +25%. Luggage: ₹7.50/bag. Detects driver overcharging instantly.",
    keywords: ["fare", "meter", "auto", "rickshaw", "taxi", "cab", "price", "charge", "cost", "cheating", "overcharging", "rate"]
  },
  {
    name: "Safe Journey & Live Transit",
    path: "/safe-journey",
    description: "Real-time route tracking, automated GPS deviation alerts, night journey checkpoints, and automated emergency contact pings.",
    keywords: ["safe journey", "transit", "track", "gps", "route", "deviation", "night", "monitoring", "checkpoint"]
  },
  {
    name: "Evidence Vault",
    path: "/vault",
    description: "Cryptographically timestamped vault to store taxi number plates, meter photos, driver badges, and incident voice recordings.",
    keywords: ["vault", "evidence", "photo", "plate", "license", "record", "tamper-proof", "store"]
  },
  {
    name: "Incident Report & SOS",
    path: "/incident",
    description: "One-tap emergency SOS alerting 112 (Delhi Police), 1091 (Women Helpline), 1363 (Tourist Infoline), and structured incident reporting.",
    keywords: ["incident", "report", "emergency", "sos", "police", "help", "danger", "harass", "complaint", "112", "1363"]
  },
  {
    name: "Trip Planner",
    path: "/planner",
    description: "Customized 1-day, 2-day, or 3-day Delhi itineraries based on your budget, pacing, and preferred heritage attractions.",
    keywords: ["plan", "planner", "itinerary", "trip", "day plan", "schedule", "tour"]
  },
  {
    name: "SafeVisit Pass",
    path: "/",
    description: "7-day temporary anonymous cryptographic pass for quick monument entry check-ins and tourist police verification with zero personal document retention.",
    keywords: ["pass", "safevisit", "qr", "qr code", "crypto pass", "onboard", "profile"]
  }
];

// Helper to formulate TM Chatbot responses via Gemini
async function askTMChatbot({ query, traveler_context }) {
  const userQuery = (query || '').trim();
  const lowerQuery = userQuery.toLowerCase();

  // 1. Build Grounded Context
  const placesSummary = PLACES_KNOWLEDGE.map(p => 
    `• ${p.name} (${p.hindi}): Timings: ${p.timings} | Ticket: ${p.ticket} | Metro: ${p.metro} | Safety: ${p.safety} | Route: ${p.link}`
  ).join('\n');

  const appFeaturesSummary = APP_FEATURES.map(f =>
    `• ${f.name} (App Path: ${f.path}): ${f.description}`
  ).join('\n');

  const systemInstruction = `You are "TM chatbot" (TravelMate Chatbot), the dedicated, official AI assistant for the TravelMate application in Delhi, India.

Your primary mission is to assist tourists and locals to navigate and find EVERYTHING in the TravelMate application and Delhi:
1. APP NAVIGATION: When a user asks how to do something or where something is in the app, clearly explain the feature and provide a clean navigation link in this format: [action: /path | Button Label].
   Available app routes:
   - /discover : Discover Delhi Places (10 verified ASI monuments, tickets, timings, crowd meters)
   - /bhashini-translator : Bhashini Translator (speech-to-speech voice in 29 international & 23 Indian languages)
   - /fare-meter : Fare Meter (Delhi auto/taxi fare calculator, day/night tariffs, anti-cheating meter check)
   - /safe-journey : Safe Journey (live GPS transit monitor, route deviation warnings)
   - /vault : Evidence Vault (store taxi plates, driver photos, meter readings)
   - /incident : Incident Report & Emergency SOS (112 police alert, structured incident reporting)
   - /planner : Trip Planner (1, 2, or 3 day curated Delhi itineraries)
   - / : SafeVisit Pass (7-day anonymous visitor QR pass)

2. VERIFIED HERITAGE & ASI MONUMENT FACTS:
${placesSummary}

3. OFFICIAL DELHI TRANSPORT TARIFFS:
   - Auto-Rickshaw: ₹30 for first 1.5 km (flag-down), ₹11 per subsequent km.
   - Night Surcharge: +25% between 11:00 PM and 05:00 AM.
   - Luggage: ₹7.50 per heavy suitcase/bag.
   - If an auto driver asks for a flat high fee (e.g., ₹200 for 3 km), tell them it is illegal under Delhi Motor Vehicles Rules, and direct them to the Fare Meter (/fare-meter).

4. EMERGENCY HELPLINES:
   - 112 : Unified Emergency Response Support System (Police, Fire, Ambulance)
   - 1363 : 24x7 Multi-lingual Tourist Infoline (Ministry of Tourism, Govt of India)
   - 1091 / 181 : Women Helpline
   - 8750871111 : Delhi Tourist Police Helpline / WhatsApp

Tone & Style:
- ULTRA-CONCISE MANDATE: DO NOT explain in long paragraphs. DO NOT give lengthy history, huge lists, or unnecessary text. The user explicitly requested: "no need to explain so much, just say click on it and find this".
- Keep your entire reply to 1 short sentence, followed immediately by saying: "Click on it and find this in the app!" and the action button [action: /path | Button Label].
- Example response for monument: "Here is Red Fort. Click on it and find this in the app! [action: /discover?place=red-fort | Discover Red Fort]"
- Example response for fares: "Here is the official fare calculator. Click on it and find this in the app! [action: /fare-meter | Open Fare Meter]"
- Example response for translator: "Here is the Bhashini translator. Click on it and find this in the app! [action: /bhashini-translator | Open Bhashini Translator]"
- Always identify yourself simply as TM chatbot if greeted.`;

  // 2. Call Gemini with multi-model fallback
  const ai = getGeminiClient();
  if (ai) {
    for (const model of getCandidateModels()) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [{ text: `Traveler Context: ${JSON.stringify(traveler_context || {})}\n\nUser Question: ${userQuery}` }]
            }
          ],
          config: {
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            temperature: 0.2,
            maxOutputTokens: 1024
          }
        });

        const replyText = response.text?.trim();
        if (replyText) {
          return {
            response: replyText,
            grounded: true,
            source_label: `TM chatbot • Gemini ${model.replace('gemini-', '')}`,
            confidence: "Official Grounded"
          };
        }
      } catch (err) {
        console.warn(`[TM Chatbot] Gemini ${model} notice:`, err.message || err);
        // Continue to next candidate model
      }
    }
  }

  // 3. Resilient Local Grounded Engine (Guaranteed zero failure & instant response)
  console.log('[TM Chatbot] Using resilient local grounded engine for query:', userQuery);
  return generateLocalGroundedReply(lowerQuery, traveler_context);
}

// Local Grounding Fallback Generator
function generateLocalGroundedReply(q, travelerContext) {
  // A. Check for Emergency or Distress
  const isEmergency = ["help", "scared", "follow", "attack", "danger", "trapped", "harass", "threat", "emergency", "hurt", "sos", "unsafe", "police"].some(k => q.includes(k));
  if (isEmergency) {
    return {
      response: `⚠️ Emergency assistance: Dial 112 immediately for police. Click on it and find this in the app!\n\n[action: /incident | Open Emergency SOS]`,
      grounded: true,
      source_label: "Delhi Tourist Police & 112 Directory",
      confidence: "Critical Safety Protocol"
    };
  }

  // B. Match Specific Monuments
  for (const place of PLACES_KNOWLEDGE) {
    const key = place.name.toLowerCase();
    const hindiKey = place.hindi;
    if (q.includes(key) || q.includes(place.name.split(' ')[0].toLowerCase()) || (place.hindi && q.includes(hindiKey))) {
      return {
        response: `Here is ${place.name}. Click on it and find this in the app!\n\n[action: ${place.link} | Discover ${place.name}]`,
        grounded: true,
        source_label: "Official ASI / Delhi Tourism Registry",
        confidence: "100% Grounded"
      };
    }
  }

  // C. Match App Features
  if (q.includes('fare') || q.includes('meter') || q.includes('auto') || q.includes('rickshaw') || q.includes('cab') || q.includes('taxi') || q.includes('cheat') || q.includes('overcharge')) {
    return {
      response: `Here is the official Delhi auto fare calculator. Click on it and find this in the app!\n\n[action: /fare-meter | Open Fare Meter]`,
      grounded: true,
      source_label: "Delhi Transport Department Fare Schedule",
      confidence: "Official Tariff"
    };
  }

  if (q.includes('translate') || q.includes('translation') || q.includes('language') || q.includes('bhashini') || q.includes('hindi') || q.includes('speak') || q.includes('voice')) {
    return {
      response: `Here is the Bhashini voice translator. Click on it and find this in the app!\n\n[action: /bhashini-translator | Open Bhashini Translator]`,
      grounded: true,
      source_label: "Digital India Bhashini (MeitY)",
      confidence: "Live Bhashini Suite"
    };
  }

  if (q.includes('itinerary') || q.includes('plan') || q.includes('day') || q.includes('trip') || q.includes('schedule')) {
    return {
      response: `Here is the Delhi trip planner. Click on it and find this in the app!\n\n[action: /planner | Open Trip Planner]`,
      grounded: true,
      source_label: "TravelMate Itinerary Engine",
      confidence: "Curated Tour Guide"
    };
  }

  if (q.includes('safe') || q.includes('track') || q.includes('transit') || q.includes('route') || q.includes('journey')) {
    return {
      response: `Here is the safe journey transit tracker. Click on it and find this in the app!\n\n[action: /safe-journey | Open Safe Journey Tracker]`,
      grounded: true,
      source_label: "TravelMate Safety Core",
      confidence: "Safety Monitor Active"
    };
  }

  if (q.includes('vault') || q.includes('evidence') || q.includes('photo') || q.includes('plate') || q.includes('license')) {
    return {
      response: `Here is the evidence vault. Click on it and find this in the app!\n\n[action: /vault | Open Evidence Vault]`,
      grounded: true,
      source_label: "Evidence Vault Cryptographic Storage",
      confidence: "Verified Vault"
    };
  }

  // D. General Greeting / Overview
  return {
    response: `Namaste! Click on it and find this in the app!\n\n[action: /discover | Discover Places] [action: /fare-meter | Check Fares] [action: /bhashini-translator | Open Translator]`,
    grounded: true,
    source_label: "TM chatbot • TravelMate Knowledge Hub",
    confidence: "Quick Guide"
  };
}

module.exports = {
  askTMChatbot,
  generateLocalGroundedReply
};
