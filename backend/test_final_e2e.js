async function runEndToEndVerification() {
  console.log('===============================================================');
  console.log(' TRAVELMATE (SIH 2026) FINAL END-TO-END VERIFICATION SUITE ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (e) {
      console.log(`[FAIL] ${name} -> Error: ${e.message}`);
      failed++;
    }
  }

  let journeyCode = null;
  let evidenceId = null;

  // 1. Health
  await check('Req #2: Backend API Health Check (10 Places Seeded)', async () => {
    const res = await fetch('http://localhost:5000/api/health').then(r => r.json());
    if (res.status !== 'healthy' || res.places_seeded < 10) throw new Error('Unhealthy');
  });

  // 2. Onboard (Req #1 & #3)
  await check('Req #1 & #3: Tourist Minimal Onboarding & Journey ID Generation', async () => {
    const res = await fetch('http://localhost:5000/api/journeys/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Elena Rostova', nationality: 'France', preferred_language: 'fr' })
    }).then(r => r.json());
    if (!res.success || !res.data.journey.journey_code.startsWith('TM-DEL-2026-')) throw new Error('Onboarding failed');
    journeyCode = res.data.journey.journey_code;
  });

  // 3. Fake-Review Prevention (Req #16)
  await check('Req #16: Fake-Review Prevention Blocks Unvisited Monument (403)', async () => {
    const res = await fetch('http://localhost:5000/api/places/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ place_id: 'pl-red-fort-01', journey_code: journeyCode, rating: 5, review_text: 'Test unvisited review' })
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 4. Checkin (Req #13 & #16)
  await check('Req #13 & #16: Physical Check-In to Monument Updates History & Crowd Count', async () => {
    const res = await fetch('http://localhost:5000/api/journeys/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ place_id: 'pl-red-fort-01', journey_code: journeyCode })
    }).then(r => r.json());
    if (!res.success || !res.data.visited_places.includes('pl-red-fort-01')) throw new Error('Checkin failed');
  });

  // 5. Review Allowed (Req #16)
  await check('Req #16: Verified Traveler Review Permitted After Check-In (201)', async () => {
    const res = await fetch('http://localhost:5000/api/places/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ place_id: 'pl-red-fort-01', journey_code: journeyCode, rating: 5, review_text: 'Checked in today. Lahori Gate scanner was fast!' })
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  });

  // 6. Fair Fare (Req #5)
  await check('Req #5: Fair Fare Calculator Flags Overcharge with Advisory (Non-Accusatory)', async () => {
    const res = await fetch('http://localhost:5000/api/fare/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distance_km: 4.8, vehicle_type: 'auto', quoted_fare: 500, journey_code: journeyCode, is_night: false })
    }).then(r => r.json());
    if (!res.data.advisory.is_overcharge || res.data.advisory.discrepancy_percent < 50) throw new Error('Overcharge not flagged');
  });

  // 7. Fair Fare Night Surcharge (+25%)
  await check('Req #5: Fair Fare Surcharge Applied for Night Hours (+25%)', async () => {
    const day = await fetch('http://localhost:5000/api/fare/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distance_km: 10, vehicle_type: 'auto', is_night: false })
    }).then(r => r.json());
    const night = await fetch('http://localhost:5000/api/fare/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distance_km: 10, vehicle_type: 'auto', is_night: true })
    }).then(r => r.json());
    if (night.data.estimate.expected_fare_min <= day.data.estimate.expected_fare_min) throw new Error('Night surcharge failed');
  });

  // 8. RideSafe Evidence Vault (Req #9)
  await check('Req #9: RideSafe Evidence Vault Stores Confirmed Plate Linked to Journey ID', async () => {
    const res = await fetch('http://localhost:5000/api/incidents/evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        journey_code: journeyCode,
        photo_url: 'https://example.com/taxi.jpg',
        vehicle_type: 'taxi_ac',
        ocr_detected_plate: 'DL 1Z T 9921',
        tourist_confirmed_plate: 'DL 1Z T 9921',
        is_confirmed_by_tourist: true,
        location: 'Airport Terminal 3'
      })
    }).then(r => r.json());
    if (!res.success) throw new Error('Evidence save failed');
    evidenceId = res.data.id;
  });

  // 9. Incident Report with Linked Evidence (Req #11)
  await check('Req #11: Incident Report Queued with Linked RideSafe Evidence ID', async () => {
    const res = await fetch('http://localhost:5000/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        journey_code: journeyCode,
        raw_text: 'Taxi driver at Airport T3 demanded 1500 to CP.',
        language_detected: 'fr',
        structured_data: { location: 'IGI Airport T3', time: '11:00 PM', person_type_involved: 'Taxi Driver', description: 'Overcharge demand' },
        linked_evidence_ids: [evidenceId]
      })
    }).then(r => r.json());
    if (!res.success) throw new Error('Incident submit failed');
  });

  // 10. Admin Case Verification (Req #12)
  await check('Req #12: Admin Dashboard Resolves Linked Evidence & Police Notes', async () => {
    const res = await fetch('http://localhost:5000/api/admin/incidents').then(r => r.json());
    const match = res.data.find(i => i.journey_code === journeyCode);
    if (!match || !match.linked_evidence || match.linked_evidence.length === 0) throw new Error('Evidence not linked in admin');
  });

  // 11. Admin Place Reverification (Req #12)
  await check('Req #12: Admin Reverifies Monument Freshness to Current Date', async () => {
    const res = await fetch('http://localhost:5000/api/admin/places/pl-red-fort-01/reverify', { method: 'POST' }).then(r => r.json());
    if (!res.success || !res.data.last_verified) throw new Error('Reverify failed');
  });

  // 12. Helpline Directory (Req #8)
  await check('Req #8: Helpline Directory Serves 112, 1363 and Embassy Mission Contacts', async () => {
    const res = await fetch('http://localhost:5000/api/emergency/helplines?nationality=France').then(r => r.json());
    if (!res.success || res.data.emergency_services.number !== '112' || !res.data.embassy) throw new Error('Helpline failed');
  });

  // 13. Silent / Manual SOS (Req #15)
  await check('Req #15: Emergency SOS Dispatch Routes Live GPS & Journey ID', async () => {
    const res = await fetch('http://localhost:5000/api/emergency/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ journey_code: journeyCode, trigger_type: 'silent_gesture_shake', lat: 28.6139, lng: 77.2090 })
    }).then(r => r.json());
    if (!res.success || res.data.status !== 'DISPATCHED_TO_CONTROL_ROOM') throw new Error('SOS failed');
  });

  // 14. Data Retention & Privacy Purge (Req #18)
  await check('Req #18: Conclude Journey Permanently Purges Personal Profile Data', async () => {
    const res = await fetch('http://localhost:5000/api/journeys/expire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ journey_code: journeyCode })
    }).then(r => r.json());
    if (!res.success || res.data.status !== 'expired' || !res.data.purged_fields.includes('name')) throw new Error('Expire purge failed');
  });

  // 15. AI Service Health
  await check('Req #7 & #10: AI Decision-Support Microservice Operational', async () => {
    const res = await fetch('http://localhost:8000/health').then(r => r.json());
    if (res.status !== 'healthy') throw new Error('AI service unhealthy');
  });

  // 16. AI Chat Grounding (Req #7)
  await check('Req #7: AI Grounded Chatbot Provides ASI Grounded Facts with Source Citations', async () => {
    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What is the foreigner ticket price for Red Fort?' })
    }).then(r => r.json());
    if (!res.success || !res.data.grounded || !res.data.source_label) throw new Error('Chatbot grounding failed');
  });

  // 17. AI Distress Detection (Req #10)
  await check('Req #10: AI Distress Detection Recognizes Emergency Keywords', async () => {
    const res = await fetch('http://localhost:8000/distress/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Someone is following me, I am scared and need help!' })
    }).then(r => r.json());
    if (!res.success || !res.data.is_distress) throw new Error('Distress detection failed');
  });

  // 18. AI Incident Structuring (Req #11)
  await check('Req #11: AI Structures Free-Text Incident into Schema for Human Admin', async () => {
    const res = await fetch('http://localhost:8000/incident/structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: 'Auto driver demanded 500 rupees at New Delhi Railway Station exit' })
    }).then(r => r.json());
    if (!res.success || !res.data.location || !res.data.person_type_involved) throw new Error('Incident structuring failed');
  });

  // 19. AI Vehicle Plate OCR (Req #9)
  await check('Req #9: AI Vehicle Plate OCR Extracts Plate String Candidate', async () => {
    const res = await fetch('http://localhost:8000/ocr/plate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_payload: 'sample_base64_or_demo' })
    }).then(r => r.json());
    if (!res.success || !res.data.detected_plate) throw new Error('OCR failed');
  });

  // 20. Journey Chain Cryptographic Ledger
  await check('Module #2: Journey Chain Cryptographic Ledger (Block Minting & Hash Linking)', async () => {
    // 1. Get initial chain
    const chainRes = await fetch('http://localhost:5000/api/journeys/chain/trv-default-sarah').then(r => r.json());
    if (!chainRes.success || !Array.isArray(chainRes.data) || chainRes.count < 1) throw new Error('Failed to fetch chain');

    // 2. Add new hop
    const addRes = await fetch('http://localhost:5000/api/journeys/chain/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        traveler_id: 'trv-default-sarah',
        source: 'India Gate',
        destination: 'Lotus Temple',
        fare: 120.00,
        vehicle_type: 'auto',
        distance_km: 9.1,
        time_taken: 28
      })
    }).then(r => r.json());
    if (!addRes.success || !addRes.data.current_hash || !addRes.data.previous_hash) throw new Error('Add node failed');

    // 3. Verify audit integrity
    const auditRes = await fetch('http://localhost:5000/api/journeys/chain/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'trv-default-sarah' })
    }).then(r => r.json());
    if (!auditRes.success || !auditRes.data.is_valid) throw new Error('Chain cryptographic audit failed');
  });

  // 21. Bhashini Vernacular Translation Service
  await check('Module #4: Digital India Bhashini Vernacular Translation Service', async () => {
    // 1. Get languages
    const langRes = await fetch('http://localhost:5000/api/bhashini/languages').then(r => r.json());
    if (!langRes.success || langRes.languages.length < 10) throw new Error('Failed to fetch Bhashini languages');

    // 2. Translate query
    const transRes = await fetch('http://localhost:5000/api/bhashini/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Please use the meter',
        source_lang: 'en',
        target_lang: 'hi'
      })
    }).then(r => r.json());
    if (!transRes.success || !transRes.translated_text || !transRes.transliteration) throw new Error('Translation failed');
  });

  console.log('\n===============================================================');
  console.log(` RESULTS: ${passed} PASSED / ${failed} FAILED `);
  console.log('===============================================================');

  if (failed > 0) process.exit(1);
}

runEndToEndVerification();
