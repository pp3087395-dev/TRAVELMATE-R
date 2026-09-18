const { db, store } = require('./src/config/db');
const bhashiniCtrl = require('./src/controllers/bhashiniController');
const chainCtrl = require('./src/controllers/journeyChainController');

async function testNewModules() {
  console.log('=== TEST 1: Journey Chain Store Initial Seeding ===');
  const initialChain = await db.journeyChains.findByTraveler('trv-default-sarah');
  console.log(`Found ${initialChain.length} seeded chain blocks.`);
  if (initialChain.length < 4) throw new Error('Seeded chain expected >= 4 blocks');

  console.log('\n=== TEST 2: Initial Cryptographic Integrity Audit ===');
  const auditResult = await db.journeyChains.verifyChain('trv-default-sarah');
  console.log('Audit status:', auditResult.audit_verdict);
  if (!auditResult.is_valid) throw new Error('Initial chain audit failed');

  console.log('\n=== TEST 3: Minting a New Node to the Chain ===');
  const newNode = await db.journeyChains.appendNode({
    traveler_id: 'trv-default-sarah',
    source: 'India Gate',
    destination: 'Lotus Temple',
    fare: 110.00,
    vehicle_type: 'auto',
    distance_km: 8.5,
    time_taken: 24
  });
  console.log(`Minted Block #${newNode.sequence_index} with hash: ${newNode.current_hash.slice(0, 16)}...`);
  console.log(`Previous hash linked: ${newNode.previous_hash.slice(0, 16)}...`);
  if (!newNode.current_hash || !newNode.previous_hash) throw new Error('Node minting hash failure');

  console.log('\n=== TEST 4: Re-Verifying Chain Integrity after Minting ===');
  const reAudit = await db.journeyChains.verifyChain('trv-default-sarah');
  console.log(`Total nodes now: ${reAudit.total_nodes}, Audit: ${reAudit.audit_verdict}`);
  if (!reAudit.is_valid) throw new Error('Audit failed after node append');

  console.log('\n=== TEST 5: Bhashini Supported Vernacular Languages ===');
  const langReq = {};
  let languagesList = [];
  bhashiniCtrl.getLanguages(langReq, {
    json: (data) => {
      languagesList = data.languages;
      console.log(`Supported Indian Vernacular Languages: ${languagesList.length} languages.`);
    }
  });
  if (languagesList.length < 10) throw new Error('Expected >= 10 languages');

  console.log('\n=== TEST 6: Bhashini Vernacular Translation Pipeline ===');
  const transReq = {
    body: {
      text: 'Please use the meter.',
      source_lang: 'en',
      target_lang: 'hi'
    }
  };
  await bhashiniCtrl.translate(transReq, {
    json: (data) => {
      console.log('Original Text:', data.original_text);
      console.log('Translated Devanagari:', data.translated_text);
      console.log('Transliteration:', data.transliteration);
      console.log('Phonetic Guide:', data.phonetic_guide);
      if (!data.translated_text) throw new Error('Translation returned empty');
    }
  }, (err) => { throw err; });

  console.log('\n=== ALL MODULE 2 & MODULE 4 VERIFICATION TESTS PASSED! ===');
}

testNewModules().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
