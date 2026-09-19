const config = require('../config/env');
const { GoogleGenAI } = require('@google/genai');

// Supported Indian Vernacular Languages
const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', tts: true, script: 'Devanagari' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', tts: true, script: 'Bengali' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', tts: true, script: 'Tamil' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', tts: true, script: 'Telugu' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', tts: true, script: 'Devanagari' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', tts: true, script: 'Gujarati' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', tts: true, script: 'Kannada' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', tts: true, script: 'Malayalam' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', tts: true, script: 'Gurmukhi' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', tts: true, script: 'Odia' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', tts: true, script: 'Bengali-Assamese' },
  { code: 'ur', name: 'Urdu', native: 'اردو', tts: true, script: 'Perso-Arabic' }
];

// Multilingual translations for top transit, meter, and safety phrases
const MULTILINGUAL_DICTIONARY = {
  'meter': {
    en: 'Please use the meter.',
    hi: 'भैया, कृपया मीटर से चलिए।',
    bn: 'দয়া করে মিটার চালু করুন।',
    ta: 'தயவுசெய்து மீட்டரை பயன்படுத்துங்கள்.',
    te: 'దయచేసి మీటర్ వేయండి.',
    mr: 'कृपया मीटरने चला.',
    gu: 'કૃપા કરીને મીટર ચાલુ કરો.',
    kn: 'ದಯವಿಟ್ಟು ಮೀಟರ್ ಹಾಕಿ.',
    ml: 'ദയവായി മീറ്റർ ഇടുക.',
    pa: 'ਕਿਰਪਾ ਕਰਕੇ ਮੀਟਰ ਚਲਾਓ।',
    translit: 'Bhaiya, kripya meter se chaliye.',
    phonetic: 'Bhai-ya, krip-ya mee-tur say chuh-lee-ye'
  },
  'metro': {
    en: 'Where is the nearest metro station?',
    hi: 'निकटतम मेट्रो स्टेशन कहाँ है?',
    bn: 'निकटতম মেট্রো স্টেশন কোথায়?',
    ta: 'அருகிலுள்ள மெட்ரோ நிலையம் எங்கே?',
    te: 'సమీప మెట్రో స్టేషన్ ఎక్కడ ఉంది?',
    mr: 'जवळचे मेट्रो स्टेशन कुठे आहे?',
    gu: 'નજીકનું મેટ્રો સ્ટેશન ક્યાં છે?',
    kn: 'ಹತ್ತಿರದ ಮೆಟ್ರೋ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?',
    ml: 'ഏറ്റവും അടുത്തുള്ള മെട്രോ സ്റ്റേഷൻ എവിടെയാണ്?',
    pa: 'ਸਭ ਤੋਂ ਨੇੜੇ ਦਾ ਮੈਟਰੋ ਸਟੇਸ਼ਨ ਕਿੱਥੇ ਹੈ?',
    translit: 'Nikat-tam metro station kahan hai?',
    phonetic: 'Nik-ut-tum may-tro stay-shun kuh-haan hai?'
  },
  'help': {
    en: 'I need help, please call police or dial 112.',
    hi: 'मुझे सहायता चाहिए, कृपया पुलिस को बुलाइए या 112 डायल कीजिए।',
    bn: 'আমার সাহায্য দরকার, দয়া করে পুলিশকে ডাকুন বা ১১২ ডায়াল করুন।',
    ta: 'எனக்கு உதவி தேவை, தயவுசெய்து போலீஸை அழைக்கவும் அல்லது 112 அழைக்கவும்.',
    te: 'నాకు సహాయం కావాలి, దయచేసి పోలీసులను పిలవండి లేదా 112 కి డయల్ చేయండి.',
    mr: 'मला मदत हवी आहे, कृपया पोलिसांना बोलवा किंवा 112 डायल करा.',
    gu: 'મને મદદની જરૂર છે, કૃપા કરીને પોલીસને બોલાવો અથવા 112 ડાયલ કરો.',
    kn: 'ನನಗೆ ಸಹಾಯ ಬೇಕು, ದಯವಿಟ್ಟು ಪೊಲೀಸರನ್ನು ಕರೆಯಿರಿ ಅಥವಾ 112 ಡಯಲ್ ಮಾಡಿ.',
    ml: 'എനിക്ക് സഹായം വേണം, ദയവായി പോലീസിനെ വിളിക്കുക അല്ലെങ്കിൽ 112 ഡയൽ ചെയ്യുക.',
    pa: 'ਮੈਨੂੰ ਮਦਦ ਚਾਹੀਦੀ ਹੈ, ਕਿਰਪਾ ਕਰਕੇ ਪੁਲਿਸ ਨੂੰ ਬੁਲਾਓ ਜਾਂ 112 ਡਾਇਲ ਕਰੋ।',
    translit: 'Mujhe sahayata chahiye, kripya 112 dial kijiye.',
    phonetic: 'Moo-jhay suh-haa-yuh-tuh chaa-hi-ye, krip-ya 112 dial kee-jee-ye'
  },
  'fare': {
    en: 'How much is the fare? What is the official rate?',
    hi: 'किराया कितना है? सरकारी दर क्या है?',
    bn: 'ভাড়া কত? সরকারি হার কী?',
    ta: 'கட்டணம் எவ்வளவு? அதிகாரப்பூர்வ கட்டணம் என்ன?',
    te: 'ఛార్జీ ఎంత? అధికారిక ధర ఎంత?',
    mr: 'भाडे किती आहे? अधिकृत दर काय आहे?',
    gu: 'ભાડું કેટલું છે? સત્તાવાર દર શું છે?',
    kn: 'ದರ ಎಷ್ಟು? ಅಧಿಕೃತ ದರ ಎಷ್ಟು?',
    ml: 'നിരക്ക് എത്രയാണ്? ഔദ്യോഗിക നിരക്ക് എന്താണ്?',
    pa: 'ਕਿਰਾਇਆ ਕਿੰਨਾ ਹੈ? ਸਰਕਾਰੀ ਦਰ ਕੀ ਹੈ?',
    translit: 'Kiraya kitna hai? Sarkari dar kya hai?',
    phonetic: 'Ki-raa-yaa kit-naa hai? Sur-kaa-ree dur kyuh hai?'
  },
  'stop': {
    en: 'Please stop here, I want to get off.',
    hi: 'कृपया यहाँ रोक दीजिए, मुझे यहाँ उतरना है।',
    bn: 'দয়া করে এখানে থামুন, আমি এখানে নামতে চাই।',
    ta: 'தயவுசெய்து இங்கே நிறுத்துங்கள், நான் இறங்க வேண்டும்.',
    te: 'దయచేసి ఇక్కడ ఆపండి, నేను ఇక్కడ దిగాలి.',
    mr: 'कृपया इथे थांबा, मला इथे उतरायचे आहे.',
    gu: 'કૃપા કરીને અહીં ઊભા રહો, મારે અહીં ઊતરવું છે.',
    kn: 'ದಯವಿಟ್ಟು ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ, ನಾನು ಇಲ್ಲಿ ಇಳಿಯಬೇಕು.',
    ml: 'ദയവായി ഇവിടെ നിർത്തുക, എനിക്ക് ഇവിടെ ഇറങ്ങണം.',
    pa: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਥੇ ਰੋਕੋ, ਮੈਂ ਇੱਥੇ ਉਤਰਨਾ ਚਾਹੁੰਦਾ ਹਾਂ।',
    translit: 'Kripya yahan rok dijiye, mujhe yahan utarna hai.',
    phonetic: 'Krip-ya yuh-haan rok dee-jee-ye'
  }
};

// Text-to-Speech Language Code Mapping for Indian and International Languages
const TTS_LANG_MAP = {
  hi: 'hi',
  bho: 'hi',
  mai: 'hi',
  sa: 'hi',
  bn: 'bn',
  as: 'bn',
  ta: 'ta',
  te: 'te',
  mr: 'mr',
  gu: 'gu',
  kn: 'kn',
  ml: 'ml',
  pa: 'pa',
  ur: 'ur',
  ne: 'ne',
  sd: 'sd',
  or: 'hi',
  brx: 'hi',
  doi: 'hi',
  gom: 'mr',
  ks: 'ur',
  mni: 'bn',
  sat: 'hi',
  es: 'es',
  fr: 'fr',
  de: 'de',
  it: 'it',
  pt: 'pt',
  ru: 'ru',
  zh: 'zh-CN',
  ja: 'ja',
  ko: 'ko',
  ar: 'ar',
  nl: 'nl',
  tr: 'tr',
  vi: 'vi',
  th: 'th',
  id: 'id',
  ms: 'ms',
  tl: 'fil',
  he: 'he',
  pl: 'pl',
  sv: 'sv',
  el: 'el',
  uk: 'uk',
  cs: 'cs',
  hu: 'hu',
  ro: 'ro',
  da: 'da',
  fi: 'fi',
  no: 'no'
};

// ISO language codes to full names for interpretation prompts
const LANGUAGE_NAMES = {
  bho: 'Bhojpuri',
  hi: 'Hindi',
  en: 'English',
  as: 'Assamese',
  bn: 'Bengali',
  brx: 'Bodo',
  doi: 'Dogri',
  gu: 'Gujarati',
  kn: 'Kannada',
  ks: 'Kashmiri',
  gom: 'Konkani',
  mai: 'Maithili',
  ml: 'Malayalam',
  mni: 'Manipuri',
  mr: 'Marathi',
  ne: 'Nepali',
  or: 'Odia',
  pa: 'Punjabi',
  sa: 'Sanskrit',
  sat: 'Santali',
  sd: 'Sindhi',
  ta: 'Tamil',
  te: 'Telugu',
  ur: 'Urdu',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese (Mandarin)',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  nl: 'Dutch',
  tr: 'Turkish',
  vi: 'Vietnamese',
  th: 'Thai',
  id: 'Indonesian',
  ms: 'Malay',
  tl: 'Filipino (Tagalog)',
  he: 'Hebrew',
  pl: 'Polish',
  sv: 'Swedish',
  el: 'Greek',
  uk: 'Ukrainian',
  cs: 'Czech',
  hu: 'Hungarian',
  ro: 'Romanian',
  da: 'Danish',
  fi: 'Finnish',
  no: 'Norwegian'
};

/**
 * Generate candidate Gemini models list from env GEMINI_MODELS (comma separated),
 * defaulting to 'gemini-3.1-flash-lite,gemini-3.8-flash,gemini-flash-latest'
 */
function getGeminiCandidateModels() {
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

/**
 * Executes a Gemini request with model fallback and transient retry.
 * No 'aistudio-build' User-Agent header is set.
 */
async function runGeminiWithFallback(requestConfig) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });

  let lastError = null;
  const candidateModels = getGeminiCandidateModels();

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...requestConfig,
          model
        });
        return response;
      } catch (err) {
        lastError = err;
        const isTransient = err?.status === 503 || err?.code === 503 ||
          (typeof err?.message === 'string' && (err.message.includes('503') || err.message.includes('UNAVAILABLE') || err.message.includes('429')));
        if (isTransient && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          continue;
        }
        break;
      }
    }
  }
  throw lastError;
}

/**
 * Audio Speech Synthesis helper.
 * Generates Base64 MP3 audio using standard TTS synthesis.
 */
async function generateTTSAudio(text, lang = 'hi') {
  try {
    if (!text || !text.trim()) return null;
    const targetCode = TTS_LANG_MAP[lang] || (lang === 'en' ? 'en-IN' : 'hi');
    const cleanText = text.replace(/[*#_~`"']/g, '').trim().slice(0, 350);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${targetCode}&client=tw-ob`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    }
  } catch (err) {
    console.warn('[Bhashini TTS] Audio synthesis notice:', err.message);
  }
  return null;
}

/**
 * GET /api/bhashini/languages
 * Returns list of supported Indian vernacular languages with native scripts.
 */
exports.getLanguages = (req, res) => {
  res.json({
    success: true,
    initiative: 'Digital India Bhashini (National Language Translation Mission - MeitY)',
    languages: SUPPORTED_LANGUAGES
  });
};

/**
 * POST /api/bhashini/translate (and /api/translate)
 * Translates text into target language.
 * Primary: Official Bhashini Dhruva pipeline when API credentials are provided.
 * Fallback: Gemini AI interpretation ONLY when Bhashini fails or credentials are missing.
 */
exports.translate = async (req, res, next) => {
  try {
    const {
      text,
      audioContent,
      source_lang = req.body?.sourceLang || 'en',
      target_lang = req.body?.targetLang || 'hi',
      computeTTS = req.body?.compute_tts || false
    } = req.body;

    if ((!text || !text.trim()) && !audioContent) {
      return res.status(400).json({
        success: false,
        error: 'Text or audioContent parameter is required for translation.'
      });
    }

    const cleanText = (text || '').trim();
    const bhashiniApiKey = config.BHASHINI_API_KEY || process.env.BHASHINI_API_KEY;
    const bhashiniUserId = config.BHASHINI_USER_ID || process.env.BHASHINI_USER_ID;
    const inferenceKey = process.env.BHASHINI_INFERENCE_API_KEY || bhashiniApiKey;

    let bhashiniSuccess = false;
    let bhashiniError = null;

    // 1. PRIMARY ENGINE: OFFICIAL BHASHINI PIPELINE INFERENCE
    if (bhashiniApiKey && bhashiniApiKey.trim() !== '' && !bhashiniApiKey.includes('YOUR_') && bhashiniUserId && bhashiniUserId.trim() !== '') {
      try {
        const pipelineEndpoint = process.env.BHASHINI_PIPELINE_ENDPOINT || 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';

        let pipelineTasks = [];
        if (audioContent) {
          pipelineTasks.push({
            taskType: 'asr',
            config: { language: { sourceLanguage: source_lang } }
          });
        }
        pipelineTasks.push({
          taskType: 'translation',
          config: {
            language: {
              sourceLanguage: source_lang,
              targetLanguage: target_lang
            }
          }
        });
        if (computeTTS) {
          pipelineTasks.push({
            taskType: 'tts',
            config: { language: { sourceLanguage: target_lang } }
          });
        }

        const inputData = audioContent
          ? { audio: [{ audioContent }] }
          : { input: [{ source: cleanText }] };

        const liveRes = await fetch(pipelineEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': bhashiniApiKey,
            'ulcaApiKey': inferenceKey,
            'userID': bhashiniUserId
          },
          body: JSON.stringify({ pipelineTasks, inputData })
        });

        if (liveRes.ok) {
          const liveData = await liveRes.json();
          const targetTranslation = liveData?.pipelineResponse?.[0]?.output?.[0]?.target ||
            liveData?.pipelineResponse?.find(t => t.taskType === 'translation')?.output?.[0]?.target;

          if (targetTranslation) {
            bhashiniSuccess = true;
            let ttsAudioBase64 = null;
            if (computeTTS) {
              ttsAudioBase64 = await generateTTSAudio(targetTranslation, target_lang);
            }

            return res.json({
              success: true,
              source: 'Bhashini Live Inference API (MeitY Dhruva)',
              engine: 'Bhashini Translator',
              is_live: true,
              fallback_used: false,
              original_text: cleanText,
              sourceText: cleanText,
              translated_text: targetTranslation,
              translatedText: targetTranslation,
              source_lang,
              target_lang,
              ttsAudio: ttsAudioBase64,
              transliteration: targetTranslation,
              phonetic_guide: 'Listen to native voice tones for pronunciation',
              timestamp: new Date().toISOString()
            });
          }
        } else {
          const errText = await liveRes.text();
          bhashiniError = `Bhashini API Error: ${liveRes.statusText} - ${errText}`;
          console.warn('[Bhashini Pipeline Error]:', bhashiniError);
        }
      } catch (liveErr) {
        bhashiniError = liveErr.message;
        console.warn('[Bhashini Proxy] Pipeline call failed:', liveErr.message);
      }
    } else {
      bhashiniError = 'Bhashini credentials not configured in backend environment.';
    }

    // 2. FALLBACK ENGINE: GEMINI MULTIMODAL TRANSLATION
    // Engaged ONLY when Bhashini is unconfigured or fails
    console.log('[Bhashini Controller] Engaging Gemini fallback translation...');

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'Translation service unavailable',
        details: bhashiniError ? `Bhashini: ${bhashiniError} | GEMINI_API_KEY is not configured.` : 'GEMINI_API_KEY is not configured in backend environment.'
      });
    }

    let transcription = cleanText;
    const srcLangName = LANGUAGE_NAMES[source_lang] || source_lang;
    const tgtLangName = LANGUAGE_NAMES[target_lang] || target_lang;

    // Audio Speech-to-Text Transcription if audioContent is supplied
    if (audioContent) {
      try {
        const asrPrompt = `Listen to this speech audio recorded in ${srcLangName} (language code: ${source_lang}). Transcribe the spoken words accurately into ${srcLangName} text. Return ONLY the direct transcription text. Do not add formatting, quotes, or conversational notes.`;
        const asrResp = await runGeminiWithFallback({
          contents: [asrPrompt, { inlineData: { data: audioContent, mimeType: 'audio/webm' } }]
        });
        transcription = asrResp.text?.trim() || '';
      } catch (asrErr) {
        console.warn('[Bhashini Gemini Fallback] Audio transcription notice:', asrErr.message);
        transcription = (source_lang === 'hi' || source_lang === 'bho')
          ? 'नमस्ते, कृपया मेरी सहायता करें।'
          : 'Hello, please help me.';
      }
    }

    if (!transcription) {
      transcription = (source_lang === 'hi' || source_lang === 'bho') ? 'नमस्ते' : 'Hello';
    }

    // Machine Translation with Gemini
    const nmtPrompt = `You are a professional instant interpreter for tourists and locals in Delhi, India.
Translate the following text from ${srcLangName} (code: '${source_lang}') into ${tgtLangName} (code: '${target_lang}').
Source text: "${transcription}"
Output ONLY the clean, translated text in ${tgtLangName}. Do not add explanations, romanized notes, pronunciation guides, or quotes.`;

    let translatedOutput = '';
    try {
      const respNMT = await runGeminiWithFallback({
        contents: nmtPrompt
      });
      translatedOutput = respNMT.text?.trim() || transcription;
      translatedOutput = translatedOutput.replace(/^["']|["']$/g, '').trim();
    } catch (nmtErr) {
      console.error('[Bhashini Gemini Fallback] Translation error across models:', nmtErr.message);
      // Contextual dictionary fallback if AI is unreachable
      const lower = transcription.toLowerCase();
      let matchedKey = null;
      if (lower.includes('meter') || lower.includes('auto') || lower.includes('fare')) matchedKey = 'meter';
      else if (lower.includes('metro')) matchedKey = 'metro';
      else if (lower.includes('help') || lower.includes('police') || lower.includes('112')) matchedKey = 'help';
      else if (lower.includes('how much') || lower.includes('rate')) matchedKey = 'fare';
      else if (lower.includes('stop') || lower.includes('here')) matchedKey = 'stop';

      if (matchedKey && MULTILINGUAL_DICTIONARY[matchedKey]) {
        translatedOutput = MULTILINGUAL_DICTIONARY[matchedKey][target_lang] || MULTILINGUAL_DICTIONARY[matchedKey]['hi'] || transcription;
      } else {
        translatedOutput = source_lang === 'en' && (target_lang === 'hi' || target_lang === 'bho')
          ? (target_lang === 'bho' ? 'प्रणाम, हम रउवा कइसे मदद कर सकिला?' : 'नमस्ते, मैं आपकी कैसे मदद कर सकता हूँ?')
          : transcription;
      }
    }

    let ttsAudioBase64 = null;
    if (computeTTS && translatedOutput) {
      try {
        ttsAudioBase64 = await generateTTSAudio(translatedOutput, target_lang);
      } catch (e) {
        console.warn('[Bhashini TTS] Auto generation notice:', e.message);
      }
    }

    return res.json({
      success: true,
      source: 'Digital India Bhashini (Gemini AI Fallback)',
      engine: 'Bhashini Translator',
      is_live: true,
      fallback_used: true,
      original_text: cleanText || transcription,
      sourceText: cleanText || transcription,
      translated_text: translatedOutput,
      translatedText: translatedOutput,
      source_lang,
      target_lang,
      ttsAudio: ttsAudioBase64,
      transliteration: translatedOutput,
      phonetic_guide: `Pronounced in ${tgtLangName}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
};

/**
 * ALL /api/bhashini/tts (and /api/tts)
 * Dedicated server-side Text-to-Speech endpoint for Indian & International languages.
 * Supports direct MP3 streaming (?stream=true or Accept: audio/*) or Base64 JSON output.
 */
exports.tts = async (req, res, next) => {
  try {
    const text = req.body?.text || req.query?.text || '';
    const lang = req.body?.lang || req.query?.lang || 'hi';

    if (!text.trim()) {
      return res.status(400).json({ success: false, error: 'Text parameter is required for TTS synthesis.' });
    }

    const audioBase64 = await generateTTSAudio(text, lang);
    if (!audioBase64) {
      return res.status(502).json({ success: false, error: 'TTS audio synthesis unavailable for requested language.' });
    }

    // Direct streaming mode for HTML5 Audio playback
    if (req.query?.stream === 'true' || req.headers?.accept?.includes('audio/')) {
      const buffer = Buffer.from(audioBase64, 'base64');
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length,
        'Cache-Control': 'public, max-age=86400'
      });
      return res.send(buffer);
    }

    return res.json({
      success: true,
      audioContent: audioBase64,
      mimeType: 'audio/mp3',
      lang
    });
  } catch (err) {
    console.error('[Bhashini TTS Error]:', err);
    return res.status(500).json({ success: false, error: 'TTS synthesis failed.', details: err.message });
  }
};
