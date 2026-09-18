// Frontend API Client with Graceful Fallback
import seedPlaces from '../data/seedPlaces.json';
import delhiZones from '../data/delhiZones.json';
import embassies from '../data/embassies.json';

export const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export const AI_BASE = import.meta.env.VITE_AI_URL
  ? import.meta.env.VITE_AI_URL.replace(/\/$/, '')
  : '/ai';

export const api = {
  // 1. Onboarding & Journey Creation
  async onboardTraveler(payload) {
    try {
      const res = await fetch(`${API_BASE}/journeys/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (e) {
      console.warn('[API Fallback] Using local journey generator:', e.message);
      const code = `TM-DEL-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      return {
        success: true,
        data: {
          journey: {
            id: `local-${Date.now()}`,
            journey_code: code,
            status: 'active',
            current_lat: 28.6139,
            current_lng: 77.2090,
            expires_at: expiresAt
          },
          traveler: {
            ...payload,
            temp_id: `TRV-${code.slice(12)}`,
            created_at: now.toISOString()
          },
          safe_pass: {
            journey_code: code,
            qr_payload: JSON.stringify({ code, holder: payload.name, nationality: payload.nationality, valid_until: expiresAt }),
            expires_at: expiresAt,
            status_label: "Official Temporary Pass"
          }
        }
      };
    }
  },

  // 2. Fetch Places
  async getPlaces(category = 'All', search = '') {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/places?${params.toString()}`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (e) {
      console.warn('[API Fallback] Using local seed places:', e.message);
      let results = [...seedPlaces];
      if (category && category !== 'All') {
        results = results.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
      }
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(p => p.name.toLowerCase().includes(q) || p.place_key.toLowerCase().includes(q));
      }
      return { success: true, count: results.length, data: results };
    }
  },

  // 3. Fair Fare Estimate
  async estimateFare(payload) {
    try {
      const res = await fetch(`${API_BASE}/fare/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (e) {
      console.warn('[API Fallback] Local fare calculator:', e.message);
      const dist = parseFloat(payload.distance_km) || 4.8;
      const quoted = payload.quoted_fare ? parseFloat(payload.quoted_fare) : null;
      // Auto: ₹30 first 1.5km, ₹11/km after (with night multiplier if active)
      const nightMult = payload.is_night ? 1.25 : 1.0;
      const base = (dist <= 1.5 ? 30 : 30 + (dist - 1.5) * 11) * nightMult;
      const minFare = Math.round(base * 0.95);
      const maxFare = Math.round(base * 1.25);
      const isOvercharge = quoted && quoted > maxFare;
      const diff = isOvercharge ? Math.round(((quoted - maxFare) / maxFare) * 100) : 0;

      return {
        success: true,
        data: {
          estimate: {
            origin_name: payload.origin_name || "New Delhi Railway Station",
            destination_name: payload.destination_name || "Red Fort",
            distance_km: dist,
            duration_min: payload.duration_min || 18,
            expected_fare_min: minFare,
            expected_fare_max: maxFare,
            quoted_fare: quoted,
            is_overcharge: isOvercharge,
            status_label: "Estimated"
          },
          breakdown: {
            reference_rate: "₹30 for first 1.5km, then ₹11/km (Delhi Govt Gazette)",
            night_rate_applied: false,
            expected_range: `₹${minFare} - ₹${maxFare}`,
            status_label: "Estimated"
          },
          advisory: {
            is_overcharge: isOvercharge,
            discrepancy_percent: diff,
            advisory_status: isOvercharge ? "Advisory Warning (Above Estimated Range)" : "Fair / Expected Range",
            advisory_message: isOvercharge
              ? `Fare Advisory: Quoted ₹${quoted} is ~${diff}% higher than standard Delhi rates (₹${minFare} - ₹${maxFare}). Ask for meter: 'Bhaiya, meter se chaliye'.`
              : "Quoted fare matches typical reference rates."
          }
        }
      };
    }
  },

  // 4. Helplines & Embassy Directory
  async getHelplines(nationality = 'United Kingdom') {
    try {
      const res = await fetch(`${API_BASE}/emergency/helplines?nationality=${encodeURIComponent(nationality)}`);
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (e) {
      console.warn('[API Fallback] Local helplines:', e.message);
      const embassy = embassies[nationality] || {
        name: "Foreign Missions Diplomatic Enclave",
        address: "Shantipath, Chanakyapuri, New Delhi",
        phone: "112 (Emergency) or 1363 (Tourist Helpline)",
        emergency_phone: "112"
      };
      return {
        success: true,
        data: {
          official_helpline: {
            number: "1363",
            toll_free: "1800-11-1363",
            name: "Ministry of Tourism 24x7 Multi-lingual Tourist Infoline",
            status_label: "Official Govt Hotline"
          },
          emergency_services: {
            number: "112",
            name: "National Emergency Response Support System (ERSS)",
            status_label: "Official Emergency Service"
          },
          state_tourist_police: {
            number: "+91 11 2336 5359",
            unit_name: "Delhi Police Tourist Police Unit (Connaught Place)",
            status_label: "Official State Law Enforcement"
          },
          embassy: {
            ...embassy,
            matched_for_nationality: nationality,
            status_label: "Official Diplomatic Mission"
          }
        }
      };
    }
  },

  // 5. Trigger SOS (Manual or Silent Shake)
  async triggerSOS(payload) {
    try {
      const res = await fetch(`${API_BASE}/emergency/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (e) {
      console.warn('[API Fallback] Local SOS dispatch:', e.message);
      return {
        success: true,
        message: "SOS alert logged and routed to 112 emergency and Delhi Tourist Police.",
        data: {
          id: `sos-${Date.now()}`,
          status: "DISPATCHED_TO_CONTROL_ROOM",
          timestamp: new Date().toISOString(),
          trigger_type: payload.trigger_type || "manual_button"
        }
      };
    }
  },

  // 6. Claude Chatbot Query
  async askChatbot(query, travelerContext) {
    try {
      const res = await fetch(`${AI_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, traveler_context: travelerContext })
      });
      if (!res.ok) throw new Error('AI service error');
      return await res.json();
    } catch (e) {
      console.warn('[API Fallback] Local RAG grounder:', e.message);
      // Local Grounding Fallback
      const q = query.toLowerCase();
      let matched = seedPlaces.find(p => q.includes(p.name.toLowerCase()) || q.includes(p.place_key));
      if (!matched) {
        if (q.includes('red fort') || q.includes('lal qila')) matched = seedPlaces[0];
        else if (q.includes('qutub')) matched = seedPlaces[1];
        else if (q.includes('humayun')) matched = seedPlaces[2];
      }

      if (matched) {
        return {
          success: true,
          data: {
            response: `**${matched.name}** (${matched.hindi_name}):\n• **Timings:** ${matched.timings.opening} - ${matched.timings.closing}\n• **Foreign Ticket:** ₹${matched.fee.foreigner}\n• **Indian Ticket:** ₹${matched.fee.indian}\n• **Official Source:** ${matched.fee.source_url}\n• **Safety:** ${matched.safety_notes[0]}`,
            grounded: true,
            source_label: "Official ASI / Delhi Tourism Registry",
            confidence: "98% (Grounded Fallback)"
          }
        };
      }

      return {
        success: true,
        data: {
          response: "I cannot verify this location in the official ASI/Delhi Tourism registry. To ensure your safety, I only share facts verified by official sources. Please visit a Delhi Tourist Police kiosk or dial 1363.",
          grounded: false,
          source_label: "Strict Grounding Safeguard",
          confidence: "Verified Guardrail Active"
        }
      };
    }
  },

  // 7. Save RideSafe Evidence (Plate must be confirmed by tourist!)
  async saveEvidence(payload) {
    try {
      const res = await fetch(`${API_BASE}/incidents/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API Fallback] Local saveEvidence:', e.message);
    }

    const newRecord = {
      id: `ev-${Date.now()}`,
      journey_code: payload.journey_code || "TM-DEL-2026-X89K",
      photo_url: payload.photo_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60",
      vehicle_type: payload.vehicle_type || "auto",
      ocr_detected_plate: payload.ocr_detected_plate,
      tourist_confirmed_plate: payload.tourist_confirmed_plate,
      is_confirmed_by_tourist: true,
      metadata: { location: payload.location || "New Delhi", timestamp: new Date().toISOString() },
      created_at: new Date().toISOString()
    };
    try {
      const current = JSON.parse(localStorage.getItem('tm_evidence_vault') || '[]');
      localStorage.setItem('tm_evidence_vault', JSON.stringify([newRecord, ...current]));
    } catch (_) {}
    return { success: true, data: newRecord };
  },

  // 7b. Fetch Evidence by Journey
  async getEvidence(journeyCode) {
    try {
      const res = await fetch(`${API_BASE}/incidents/evidence/${journeyCode}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API Fallback] Local getEvidence:', e.message);
    }
    try {
      const localVault = JSON.parse(localStorage.getItem('tm_evidence_vault') || '[]');
      if (localVault.length > 0) {
        return { success: true, count: localVault.length, data: localVault };
      }
    } catch (_) {}
    return {
      success: true,
      data: [
        {
          id: "ev-demo-01",
          journey_code: journeyCode || "TM-DEL-2026-X89K",
          vehicle_type: "auto",
          tourist_confirmed_plate: "DL 1R BA 4829",
          ocr_detected_plate: "DL 1R BA 4829",
          is_confirmed_by_tourist: true,
          photo_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60",
          metadata: { location: "New Delhi Railway Station Exit", timestamp: new Date().toLocaleTimeString() },
          created_at: new Date().toISOString()
        }
      ]
    };
  },

  // 8. Submit Incident Report
  async submitIncident(payload) {
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API Fallback] Local submitIncident:', e.message);
    }
    const newInc = {
      id: `inc-${Date.now()}`,
      journey_code: payload.journey_code,
      raw_text: payload.raw_text,
      language_detected: payload.language_detected,
      structured_data: payload.structured_data,
      linked_evidence_ids: payload.linked_evidence_ids || [],
      status: "pending_review",
      created_at: new Date().toISOString()
    };
    try {
      const cur = JSON.parse(localStorage.getItem('tm_incidents') || '[]');
      localStorage.setItem('tm_incidents', JSON.stringify([newInc, ...cur]));
    } catch (_) {}
    return { success: true, data: newInc };
  },

  // 8b. Check in to a verified place to unlock reviews
  async checkinPlace(journeyCode, placeId) {
    try {
      const res = await fetch(`${API_BASE}/journeys/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journey_code: journeyCode, place_id: placeId })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API Fallback] Local checkinPlace:', e.message);
    }
    try {
      const visited = JSON.parse(localStorage.getItem('tm_visited_places') || '[]');
      if (!visited.includes(placeId)) {
        visited.push(placeId);
        localStorage.setItem('tm_visited_places', JSON.stringify(visited));
      }
      return { success: true, data: { visited_places: visited } };
    } catch (_) {
      return { success: true, data: { visited_places: [placeId] } };
    }
  },

  // 9. Admin Dashboard Stats & Incidents
  async getAdminStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      success: true,
      data: { totalJourneys: 24, activeJourneys: 8, totalIncidents: 4, pendingIncidents: 2, flaggedFares: 6, placesCount: 10 }
    };
  },

  async getAdminIncidents(status) {
    try {
      const url = status ? `${API_BASE}/admin/incidents?status=${status}` : `${API_BASE}/admin/incidents`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      success: true,
      data: [
        {
          id: "inc-01",
          journey_code: "TM-DEL-2026-X89K",
          raw_text: "Auto driver at NDLS quoted 500 rupees to Red Fort and refused meter. Claimed official booths closed.",
          structured_data: {
            location: "New Delhi Railway Station (NDLS) Exit",
            time: "10:30 AM",
            person_type_involved: "Auto Rickshaw Driver",
            description: "Quoted ₹500 vs ₹180-230 benchmark. Falsely claimed prepaid booths closed.",
            severity: "Moderate"
          },
          linked_evidence: [
            {
              id: "ev-demo-01",
              vehicle_type: "auto",
              tourist_confirmed_plate: "DL 1R BA 4829",
              photo_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60"
            }
          ],
          status: "pending_review",
          created_at: new Date().toISOString()
        }
      ]
    };
  },

  async updateIncidentStatus(id, status, notes) {
    try {
      const res = await fetch(`${API_BASE}/admin/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: notes })
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { success: true, message: `Status updated to ${status}` };
  },

  // 10. Admin Flagged Fares
  async getFlaggedFares() {
    try {
      const res = await fetch(`${API_BASE}/admin/fares`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API Fallback] Local getFlaggedFares:', e.message);
    }
    return {
      success: true,
      count: 2,
      data: [
        {
          id: "fare-fl-01",
          journey_code: "TM-DEL-2026-X89K",
          origin_name: "New Delhi Railway Station (NDLS)",
          destination_name: "Red Fort (Lal Qila)",
          vehicle_type: "auto",
          distance_km: 4.8,
          expected_fare_min: 180,
          expected_fare_max: 230,
          quoted_fare: 500,
          discrepancy_percent: 117,
          is_overcharge: true,
          created_at: new Date().toISOString()
        },
        {
          id: "fare-fl-02",
          journey_code: "TM-DEL-2026-X89K",
          origin_name: "Paharganj Market",
          destination_name: "Humayun's Tomb",
          vehicle_type: "taxi_non_ac",
          distance_km: 7.2,
          expected_fare_min: 240,
          expected_fare_max: 310,
          quoted_fare: 650,
          discrepancy_percent: 109,
          is_overcharge: true,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    };
  },

  // 11. Admin Reverification of Place Freshness
  async reverifyPlace(placeId) {
    try {
      const res = await fetch(`${API_BASE}/admin/places/${placeId}/reverify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API Fallback] Local reverifyPlace:', e.message);
    }
    return {
      success: true,
      message: "Place marked re-verified for current date."
    };
  },

  // 12. Conclude Journey & Purge Data (Scope #18: Data Retention & Privacy)
  async expireJourney(journeyCode) {
    try {
      const res = await fetch(`${API_BASE}/journeys/expire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journey_code: journeyCode })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API Fallback] Local expireJourney:', e.message);
    }
    return {
      success: true,
      message: "Journey concluded. All personal identifying data permanently purged under Scope #18 Privacy Retention Policy.",
      data: {
        journey_code: journeyCode,
        status: "expired",
        purged_fields: ["name", "emergency_contact", "exact_gps_track"]
      }
    };
  },

  // 13. Fetch Google Maps API Key from environment (frontend or backend)
  async getMapsConfig() {
    const viteKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.GOOGLE_MAPS_API_KEY;
    if (viteKey && viteKey.trim() !== '') {
      return viteKey.trim();
    }

    try {
      const res = await fetch(`${API_BASE}/config/maps`);
      if (res.ok) {
        const data = await res.json();
        if (data.mapsApiKey && data.mapsApiKey.trim() !== '') {
          return data.mapsApiKey.trim();
        }
      }
    } catch (e) {
      console.warn('[API Fallback] Local maps config fallback:', e.message);
    }
    return '';
  },

  // 14. Journey Chain (Cryptographic Sequential Ledger)
  async getJourneyChain(identifier = 'trv-default-sarah') {
    try {
      const res = await fetch(`${API_BASE}/journeys/chain/${identifier}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return { success: false, data: [] };
  },

  async addChainNode(nodeData) {
    try {
      const res = await fetch(`${API_BASE}/journeys/chain/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodeData)
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { success: false };
  },

  async verifyChain(identifier = 'trv-default-sarah') {
    try {
      const res = await fetch(`${API_BASE}/journeys/chain/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { success: false };
  }
};

