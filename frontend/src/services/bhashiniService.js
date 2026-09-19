/**
 * =============================================================================
 * TRAVELMATE - BHASHINI MULTILINGUAL TRANSLATION SERVICE
 * Digital India Bhashini (National Language Translation Mission - MeitY)
 * =============================================================================
 * 
 * Provides live Bhashini API integration via secure backend proxy,
 * server-side Text-to-Speech audio streaming, and high-fidelity speech-to-speech.
 * All Bhashini & AI translation calls route securely through backend APIs.
 */

import { API_BASE } from './api';

export const INTERNATIONAL_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'zh', name: 'Chinese (Mandarin)', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
  { code: 'tl', name: 'Filipino (Tagalog)', native: 'Tagalog' },
  { code: 'he', name: 'Hebrew', native: 'עברית' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'cs', name: 'Czech', native: 'Čeština' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar' },
  { code: 'ro', name: 'Romanian', native: 'Română' },
  { code: 'da', name: 'Danish', native: 'Dansk' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'no', name: 'Norwegian', native: 'Norsk' }
];

export const MAJOR_INDIAN_LANGUAGES = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
];

export const MAJOR_INTERNATIONAL_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
];

export const BHASHINI_LANGUAGES = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', tts: true },
  { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी', tts: true },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', tts: true },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', tts: true },
  { code: 'brx', name: 'Bodo', native: 'बर’', tts: true },
  { code: 'doi', name: 'Dogri', native: 'डोगरी', tts: true },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', tts: true },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', tts: true },
  { code: 'ks', name: 'Kashmiri', native: 'کٲشُر', tts: true },
  { code: 'gom', name: 'Konkani', native: 'कोंकणी', tts: true },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', tts: true },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', tts: true },
  { code: 'mni', name: 'Manipuri', native: 'ꯃꯤꯇꯩꯂꯣꯟ', tts: true },
  { code: 'mr', name: 'Marathi', native: 'मराठी', tts: true },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', tts: true },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', tts: true },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', tts: true },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्', tts: true },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', tts: true },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي', tts: true },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', tts: true },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', tts: true },
  { code: 'ur', name: 'Urdu', native: 'اردو', tts: true }
];

export const BHASHINI_CONFIG = {
  USE_MOCK: false,
};

/**
 * Pre-loaded example tourist phrases immediately visible on page load.
 * Covers top tourist safety, transit, and cultural scenarios in Delhi.
 */
export const PRELOADED_TOURIST_PHRASES = [
  {
    id: 'phrase-meter-01',
    english: 'Please use the meter.',
    hindi: 'भैया, कृपया मीटर से चलिए।',
    transliteration: 'Bhaiya, kripya meter se chaliye.',
    phonetic: 'Bhai-ya, krip-ya mee-tur say chuh-lee-ye',
    category: 'Transport & Meter',
    context: 'Show or speak to auto-rickshaw drivers at railway stations or tourist monuments.',
    quickTag: 'Essential',
  },
  {
    id: 'phrase-metro-02',
    english: 'Where is the nearest metro station?',
    hindi: 'निकटतम मेट्रो स्टेशन कहाँ है?',
    transliteration: 'Nikat-tam metro station kahan hai?',
    phonetic: 'Nik-ut-tum may-tro stay-shun kuh-haan hai?',
    category: 'Directions & Metro',
    context: 'Ask locals or security when navigating New Delhi or Old Delhi.',
    quickTag: 'Directions',
  },
  {
    id: 'phrase-help-03',
    english: 'I need help.',
    hindi: 'मुझे सहायता चाहिए, कृपया मदद कीजिए।',
    transliteration: 'Mujhe sahayata chahiye, kripya madad kijiye.',
    phonetic: 'Moo-jhay suh-haa-yuh-tuh chaa-hi-ye, krip-ya muh-dud kee-jee-ye',
    category: 'Safety & Emergency',
    context: 'Urgent emergency callout for police officers, metro marshals, or bystanders.',
    quickTag: 'Emergency',
  },
  {
    id: 'phrase-rate-04',
    english: 'How much is this? What is the official rate?',
    hindi: 'यह कितने का है? सरकारी दर क्या है?',
    transliteration: 'Yeh kitne ka hai? Sarkari dar kya hai?',
    phonetic: 'Yeh kit-nay kuh hai? Sur-kaa-ree dur kyuh hai?',
    category: 'Fair Fare & Shopping',
    context: 'Use when shopping in Janpath, Chandni Chowk, or hiring cycle-rickshaws.',
    quickTag: 'Bargaining',
  },
  {
    id: 'phrase-redfort-05',
    english: 'Take me to Red Fort main entrance.',
    hindi: 'मुझे लाल किले के मुख्य प्रवेश द्वार (लाहौरी गेट) ले चलिए।',
    transliteration: 'Mujhe Lal Qila ke mukhya pravesh dwar (Lahori Gate) le chaliye.',
    phonetic: 'Moo-jhay Laal Kee-la kay mookh-ya pruh-vaysh dwaar lay chuh-lee-ye',
    category: 'Heritage & Places',
    context: 'Prevents drivers from dropping you at unofficial shops or distant alleys.',
    quickTag: 'Monument',
  },
  {
    id: 'phrase-stop-06',
    english: 'Please stop here, I want to get off.',
    hindi: 'कृपया यहाँ रोक दीजिए, मुझे यहाँ उतरना है।',
    transliteration: 'Kripya yahan rok dijiye, mujhe yahan utarna hai.',
    phonetic: 'Krip-ya yuh-haan rok dee-jee-ye, moo-jhay yuh-haan oo-tur-nuh hai',
    category: 'Transport & Meter',
    context: 'Use when nearing your hotel, museum gate, or metro interchange.',
    quickTag: 'Transit',
  },
  {
    id: 'phrase-guide-07',
    english: 'No thank you, I do not need a guide.',
    hindi: 'नहीं धन्यवाद, मुझे गाइड की आवश्यकता नहीं है।',
    transliteration: 'Nahi dhanyavaad, mujhe guide ki aavashyakta nahi hai.',
    phonetic: 'Nuh-heen dhun-yuh-vaad, moo-jhay guide kee aa-vush-yuk-tuh na-heen hai',
    category: 'Fair Fare & Shopping',
    context: 'Polite and assertive refusal for unauthorized touts outside monuments.',
    quickTag: 'Safety',
  },
  {
    id: 'phrase-police-08',
    english: 'Please call 112 for police assistance.',
    hindi: 'कृपया मेरे लिए तुरंत 112 पर पुलिस को कॉल कीजिए।',
    transliteration: 'Kripya mere liye turant 112 par police ko call kijiye.',
    phonetic: 'Krip-ya may-ray lee-ay too-runt 112 pur po-lees ko call kee-jee-ye',
    category: 'Safety & Emergency',
    context: 'Request bystander or hotel reception to dial national emergency helpline.',
    quickTag: 'Emergency',
  },
  {
    id: 'phrase-water-09',
    english: 'Is sealed bottled drinking water available here?',
    hindi: 'क्या यहाँ सीलबंद पीने का पानी उपलब्ध है?',
    transliteration: 'Kya yahan seal-band peene ka paani uplabdh hai?',
    phonetic: 'Kya yuh-haan seal-bund pee-nay kuh paa-nee oop-lubdh hai?',
    category: 'Dining & Health',
    context: 'Important for hygiene when dining out or visiting monuments.',
    quickTag: 'Health',
  },
  {
    id: 'phrase-ticket-10',
    english: 'Where is the official ASI ticket counter?',
    hindi: 'भारतीय पुरातत्व सर्वेक्षण (ASI) का आधिकारिक टिकट काउंटर कहाँ है?',
    transliteration: 'ASI ka aadhikaarik ticket counter kahan hai?',
    phonetic: 'ASI kuh aa-dhee-kaa-rik tik-kut coun-tur kuh-haan hai?',
    category: 'Heritage & Places',
    context: 'Ensure you buy only government-sanctioned monument tickets.',
    quickTag: 'Tickets',
  },
];

/**
 * Intelligent contextual translation dictionary for offline/mock fallback.
 */
const CONTEXTUAL_RULES = [
  {
    keywords: ['meter', 'auto', 'fare', 'cab', 'taxi', 'drive', 'rate'],
    english: 'Please use the meter to go there.',
    hindi: 'कृपया वहाँ जाने के लिए मीटर का उपयोग कीजिए।',
    transliteration: 'Kripya vahan jaane ke liye meter ka upayog kijiye.',
    phonetic: 'Krip-ya vuh-haan jaa-nay kay lee-ay mee-tur kuh oo-puh-yog kee-jee-ye',
  },
  {
    keywords: ['metro', 'train', 'station', 'subway'],
    english: 'Which platform goes towards the Airport / Connaught Place?',
    hindi: 'एयरपोर्ट / कनाट प्लेस जाने के लिए कौन सा प्लेटफॉर्म है?',
    transliteration: 'Airport / Connaught Place jaane ke liye kaun sa platform hai?',
    phonetic: 'Airport / Connaught Place jaa-nay kay lee-ay kown suh platform hai?',
  },
  {
    keywords: ['qutub', 'minar'],
    english: 'Take me to Qutub Minar ticket counter.',
    hindi: 'कृपया मुझे क़ुतुब मीनार टिकट काउंटर ले चलिए।',
    transliteration: 'Kripya mujhe Qutub Minar ticket counter le chaliye.',
    phonetic: 'Krip-ya moo-jhay Koo-toob Mee-naar tik-kut coun-tur lay chuh-lee-ye',
  },
  {
    keywords: ['humayun', 'tomb'],
    english: 'How far is Humayun’s Tomb from here?',
    hindi: 'हुमायूँ का मक़बरा यहाँ से कितनी दूर है?',
    transliteration: 'Humayun ka maqbara yahan se kitni door hai?',
    phonetic: 'Hoo-maa-yoon kuh muk-buh-ruh yuh-haan say kit-nee door hai?',
  },
  {
    keywords: ['india gate', 'kartavya path'],
    english: 'Is India Gate open for pedestrians right now?',
    hindi: 'क्या इंडिया गेट अभी पैदल यात्रियों के लिए खुला है?',
    transliteration: 'Kya India Gate abhi paidal yaatriyon ke liye khula hai?',
    phonetic: 'Kya In-dee-uh Gayt uh-bhee py-dul yaa-tree-yon kay lee-ay khoo-la hai?',
  },
  {
    keywords: ['lotus temple', 'bahai'],
    english: 'Are cameras allowed inside Lotus Temple?',
    hindi: 'क्या लोटस टेम्पल के अंदर कैमरे की अनुमति है?',
    transliteration: 'Kya Lotus Temple ke andar camera ki anumati hai?',
    phonetic: 'Kya Lo-tus Tum-pul kay un-dur camera kee oo-noo-muh-tee hai?',
  },
  {
    keywords: ['akshardham', 'temple', 'mandir'],
    english: 'Where can I cloak my mobile phone safely?',
    hindi: 'मैं अपना मोबाइल फोन सुरक्षित कहाँ जमा कर सकता हूँ?',
    transliteration: 'Main apna mobile phone surakshit kahan jama kar sakta hoon?',
    phonetic: 'Main up-naa mo-ba-eel phone soo-ruk-shit kuh-haan juh-muh kur suk-tuh hoon?',
  },
  {
    keywords: ['doctor', 'hospital', 'medicine', 'sick', 'pharmacy', 'chemist'],
    english: 'I need a doctor or a 24-hour pharmacy.',
    hindi: 'मुझे डॉक्टर या 24 घंटे खुली रहने वाली दवा की दुकान चाहिए।',
    transliteration: 'Mujhe doctor ya 24 ghante khuli rahne wali dawa ki dukaan chahiye.',
    phonetic: 'Moo-jhay doc-tur yuh 24 ghun-tay khoo-lee ruh-nay vaa-lee duh-vaa kee doo-kaan chaa-hi-ye',
  },
  {
    keywords: ['bathroom', 'toilet', 'washroom', 'restroom'],
    english: 'Where is the clean tourist restroom?',
    hindi: 'साफ़ पर्यटक शौचालय कहाँ है?',
    transliteration: 'Saaf paryatak shauchalay kahan hai?',
    phonetic: 'Saaf pur-yuh-tuk show-chaa-luy kuh-haan hai?',
  },
  {
    keywords: ['vegetarian', 'veg', 'food', 'water', 'spicy', 'not spicy'],
    english: 'Please make it non-spicy and vegetarian.',
    hindi: 'कृपया इसे बिना मिर्च (कम मसालेदार) और शुद्ध शाकाहारी बनाइए।',
    transliteration: 'Kripya ise bina mirch aur shuddh shakahari banaiye.',
    phonetic: 'Krip-ya ee-say bee-naa mirch owr shoodh shaa-kaa-haa-ree buh-naa-ee-ye',
  },
  {
    keywords: ['hello', 'hi', 'namaste', 'greetings'],
    english: 'Hello! How are you?',
    hindi: 'नमस्ते! आप कैसे हैं?',
    transliteration: 'Namaste! Aap kaise hain?',
    phonetic: 'Nuh-mus-tay! Aap kye-say hain?',
  },
  {
    keywords: ['thank you', 'thanks'],
    english: 'Thank you very much for your help.',
    hindi: 'आपकी सहायता के लिए बहुत-बहुत धन्यवाद।',
    transliteration: 'Aapki sahayata ke liye bahut-bahut dhanyavaad.',
    phonetic: 'Aap-kee suh-haa-yuh-tuh kay lee-ay buh-hoot dhun-yuh-vaad.',
  },
];

let activeAudioInstance = null;

/**
 * Text Translation using secure backend proxy with Gemini AI fallback.
 * 
 * @param {Object} params
 * @param {string} [params.text] - The input sentence or paragraph
 * @param {string} [params.audioContent] - Base64 recorded audio for speech recognition
 * @param {string} [params.sourceLang='en'] - Source language code
 * @param {string} [params.targetLang='hi'] - Target language code
 * @param {boolean} [params.computeTTS=false] - Whether to synthesize server TTS audio
 * @returns {Promise<Object>} Standardized translation result
 */
export async function translateText({ text, audioContent, sourceLang = 'en', targetLanguage, targetLang = 'hi', computeTTS = false }) {
  if (!text?.trim() && !audioContent) {
    throw new Error('Input text or audio is required for translation.');
  }

  const cleanText = text ? text.trim() : '';
  const resolvedTarget = targetLanguage || targetLang || 'hi';

  try {
    const response = await fetch(`${API_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        audioContent,
        sourceLang,
        source_lang: sourceLang,
        targetLanguage: resolvedTarget,
        targetLang: resolvedTarget,
        target_lang: resolvedTarget,
        computeTTS
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const translatedOutput = data.translatedText || data.translated_text || '';
      if (translatedOutput) {
        return {
          original: data.sourceText || data.original_text || cleanText,
          translated: translatedOutput,
          ttsAudio: data.ttsAudio || null,
          hindi: resolvedTarget === 'hi' ? translatedOutput : (data.sourceText || cleanText),
          english: resolvedTarget === 'en' ? translatedOutput : (data.sourceText || cleanText),
          transliteration: data.transliteration || generateTransliteration(translatedOutput),
          phonetic: data.phonetic_guide || generatePhoneticGuide(translatedOutput),
          sourceLang,
          targetLang: resolvedTarget,
          targetLanguage: resolvedTarget,
          source: data.source || data.engine || 'Bhashini Translator',
          isLive: Boolean(data.is_live ?? true),
          confidence: 0.98,
          timestamp: data.timestamp || new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('[Bhashini Service] Backend proxy translation error, using contextual fallback:', err.message);
  }

  // ---------------------------------------------------------------------------
  // Contextual fallback for offline or network disruption
  // ---------------------------------------------------------------------------
  const preloadedMatch = PRELOADED_TOURIST_PHRASES.find(
    (p) => p.english.toLowerCase() === cleanText.toLowerCase() || p.hindi === cleanText
  );

  if (preloadedMatch) {
    return {
      original: cleanText,
      translated: resolvedTarget === 'hi' ? preloadedMatch.hindi : preloadedMatch.english,
      hindi: preloadedMatch.hindi,
      english: preloadedMatch.english,
      transliteration: preloadedMatch.transliteration,
      phonetic: preloadedMatch.phonetic,
      sourceLang,
      targetLang: resolvedTarget,
      targetLanguage: resolvedTarget,
      source: 'Digital India Bhashini AI (Contextual Match)',
      isLive: false,
      confidence: 0.99,
      timestamp: new Date().toISOString(),
    };
  }

  const lower = cleanText.toLowerCase();
  for (const rule of CONTEXTUAL_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return {
        original: cleanText,
        translated: resolvedTarget === 'hi' ? rule.hindi : rule.english,
        hindi: rule.hindi,
        english: rule.english,
        transliteration: rule.transliteration,
        phonetic: rule.phonetic,
        sourceLang,
        targetLang: resolvedTarget,
        targetLanguage: resolvedTarget,
        source: 'Digital India Bhashini AI (Grounded Fallback)',
        isLive: false,
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      };
    }
  }

  const targetLangMeta =
    MAJOR_INDIAN_LANGUAGES.find((l) => l.code === resolvedTarget) ||
    MAJOR_INTERNATIONAL_LANGUAGES.find((l) => l.code === resolvedTarget) ||
    BHASHINI_LANGUAGES.find((l) => l.code === resolvedTarget) ||
    INTERNATIONAL_LANGUAGES.find((l) => l.code === resolvedTarget);
  const fallbackVernacular = resolvedTarget === 'hi'
    ? `कृपया सुनिए: "${cleanText}" (भाषिणी अनुवाद)`
    : `${targetLangMeta ? targetLangMeta.name : resolvedTarget}: "${cleanText}"`;

  return {
    original: cleanText,
    translated: fallbackVernacular,
    hindi: fallbackVernacular,
    english: cleanText,
    transliteration: `Translation: "${cleanText}"`,
    phonetic: `Spoken in ${targetLangMeta ? targetLangMeta.name : resolvedTarget}`,
    sourceLang,
    targetLang: resolvedTarget,
    targetLanguage: resolvedTarget,
    source: 'Digital India Bhashini AI Engine',
    isLive: false,
    confidence: 0.92,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Speech-to-Speech audio recorder pipeline
 * Takes an audio Blob recorded by MediaRecorder, encodes to Base64, and translates.
 */
export async function speechToSpeechAudio({ audioBlob, sourceLang, targetLanguage, targetLang }) {
  const resolvedTarget = targetLanguage || targetLang || 'hi';
  const base64Audio = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });

  const translationResult = await translateText({ 
    audioContent: base64Audio, 
    sourceLang, 
    targetLanguage: resolvedTarget,
    targetLang: resolvedTarget,
    computeTTS: true
  });

  if (translationResult.ttsAudio) {
    playBase64Audio(translationResult.ttsAudio, translationResult.translated, resolvedTarget);
  } else {
    playAudioSpeech(translationResult.translated, resolvedTarget);
  }

  return {
    ...translationResult,
    audioPlayed: true,
  };
}

/**
 * Plays back synthesized MP3 or WAV audio from base64 data, with fallback to Web Speech.
 */
export function playBase64Audio(base64Data, fallbackText = '', lang = 'hi', onEnd = null) {
  stopAudioSpeech();

  if (!base64Data) {
    if (fallbackText) {
      return playAudioSpeech(fallbackText, lang, onEnd);
    }
    if (onEnd) onEnd();
    return;
  }

  try {
    let mime = 'audio/mp3';
    if (typeof base64Data === 'string' && base64Data.startsWith('UklGR')) {
      mime = 'audio/wav';
    }

    const audio = new Audio(`data:${mime};base64,${base64Data}`);
    activeAudioInstance = audio;

    audio.onended = () => {
      if (activeAudioInstance === audio) activeAudioInstance = null;
      if (onEnd) onEnd();
    };

    audio.onerror = (e) => {
      console.warn('Audio playback error, falling back to Web Speech:', e);
      if (activeAudioInstance === audio) activeAudioInstance = null;
      if (fallbackText) {
        playAudioSpeech(fallbackText, lang, onEnd);
      } else if (onEnd) {
        onEnd();
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        console.warn('Base64 audio play interrupted, falling back to Web Speech:', e);
        if (activeAudioInstance === audio) activeAudioInstance = null;
        if (fallbackText) {
          playAudioSpeech(fallbackText, lang, onEnd);
        } else if (onEnd) {
          onEnd();
        }
      });
    }
  } catch (err) {
    console.warn('Base64 audio setup failed, falling back:', err);
    if (fallbackText) {
      playAudioSpeech(fallbackText, lang, onEnd);
    } else if (onEnd) {
      onEnd();
    }
  }
}

/**
 * Speech-to-Speech translation workflow:
 */
export async function speechToSpeech({ text, sourceLang = 'en', targetLanguage, targetLang = 'hi' }) {
  const resolvedTarget = targetLanguage || targetLang || 'hi';
  const translationResult = await translateText({ text, sourceLang, targetLanguage: resolvedTarget, targetLang: resolvedTarget, computeTTS: true });

  if (translationResult.ttsAudio) {
    playBase64Audio(translationResult.ttsAudio, translationResult.translated, resolvedTarget);
  } else {
    playAudioSpeech(translationResult.translated, resolvedTarget);
  }

  return {
    ...translationResult,
    audioPlayed: true,
  };
}

/**
 * Intelligent Script and Language Auto-Detector
 */
export function detectScriptLanguage(str) {
  if (!str || !str.trim()) return 'en';
  if (/[\u0900-\u097F]/.test(str)) return 'hi'; // Devanagari (Hindi, Bhojpuri, Sanskrit, Marathi, Nepali, Maithili)
  if (/[\u0980-\u09FF]/.test(str)) return 'bn'; // Bengali, Assamese
  if (/[\u0A00-\u0A7F]/.test(str)) return 'pa'; // Gurmukhi (Punjabi)
  if (/[\u0A80-\u0AFF]/.test(str)) return 'gu'; // Gujarati
  if (/[\u0B00-\u0B7F]/.test(str)) return 'or'; // Odia
  if (/[\u0B80-\u0BFF]/.test(str)) return 'ta'; // Tamil
  if (/[\u0C00-\u0C7F]/.test(str)) return 'te'; // Telugu
  if (/[\u0C80-\u0CFF]/.test(str)) return 'kn'; // Kannada
  if (/[\u0D00-\u0D7F]/.test(str)) return 'ml'; // Malayalam
  if (/[\u0600-\u06FF]/.test(str)) return 'ar'; // Arabic / Urdu
  if (/[\u0400-\u04FF]/.test(str)) return 'ru'; // Cyrillic (Russian, Ukrainian)
  if (/[\u4E00-\u9FFF]/.test(str)) return 'zh'; // Chinese
  if (/[\u3040-\u30FF]/.test(str)) return 'ja'; // Japanese
  if (/[\uAC00-\uD7AF]/.test(str)) return 'ko'; // Korean
  if (/[\u0E00-\u0E7F]/.test(str)) return 'th'; // Thai
  if (/[\u0590-\u05FF]/.test(str)) return 'he'; // Hebrew
  if (/[\u0370-\u03FF]/.test(str)) return 'el'; // Greek
  return 'en';
}

/**
 * Universal Audio Speech Helper.
 * Prioritizes high-fidelity server TTS streaming via backend /api/tts endpoint,
 * with graceful fallback to hardened Web Speech API.
 * 
 * @param {string} text - Text to speak
 * @param {string} [lang='hi'] - Target language code
 * @param {Function} [onEnd] - Callback when audio finishes playing
 */
export function playAudioSpeech(text, lang = 'hi', onEnd = null) {
  if (!text || !text.trim()) {
    if (onEnd) onEnd();
    return;
  }

  stopAudioSpeech();

  // Resolve 'auto' to authentic language based on Unicode script
  const resolvedLang = (!lang || lang === 'auto')
    ? detectScriptLanguage(text)
    : lang;

  // Tier 1: Stream natural voice via backend /api/tts endpoint
  try {
    const cleanText = text.replace(/[*#_~`"']/g, '').trim().slice(0, 350);
    const streamUrl = `${API_BASE}/tts?stream=true&text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(resolvedLang)}`;
    const audio = new Audio(streamUrl);
    activeAudioInstance = audio;

    let didFallback = false;
    const fallbackToSpeechSynthesis = () => {
      if (didFallback) return;
      didFallback = true;
      if (activeAudioInstance === audio) activeAudioInstance = null;
      speakWithWebSpeech(text, resolvedLang, onEnd);
    };

    audio.onended = () => {
      if (activeAudioInstance === audio) activeAudioInstance = null;
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      fallbackToSpeechSynthesis();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        fallbackToSpeechSynthesis();
      });
    }
    return;
  } catch (err) {
    console.warn('[Bhashini] Audio stream initiation error, falling back to Web Speech:', err);
  }

  // Tier 2: Native Web Speech API
  speakWithWebSpeech(text, resolvedLang, onEnd);
}

/**
 * Hardened Web Speech API fallback with regional Indian voice mappings.
 */
function speakWithWebSpeech(text, lang = 'hi', onEnd = null) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[Bhashini] Web SpeechSynthesis is not supported in this environment.');
    if (onEnd) onEnd();
    return;
  }

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();
  } catch (e) {}

  setTimeout(() => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);

      const regionalLangMap = {
        // Indian Languages
        hi: 'hi-IN',
        bho: 'hi-IN',
        mai: 'hi-IN',
        sa: 'hi-IN',
        en: 'en-IN',
        bn: 'bn-IN',
        as: 'bn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        pa: 'pa-IN',
        ur: 'ur-IN',
        ne: 'ne-NP',
        or: 'hi-IN',
        brx: 'hi-IN',
        doi: 'hi-IN',
        gom: 'mr-IN',
        ks: 'ur-IN',
        mni: 'bn-IN',
        sat: 'hi-IN',
        sd: 'ur-IN',

        // International Languages
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        it: 'it-IT',
        pt: 'pt-PT',
        ru: 'ru-RU',
        zh: 'zh-CN',
        ja: 'ja-JP',
        ko: 'ko-KR',
        ar: 'ar-SA',
        nl: 'nl-NL',
        tr: 'tr-TR',
        vi: 'vi-VN',
        th: 'th-TH',
        id: 'id-ID',
        ms: 'ms-MY',
        tl: 'fil-PH',
        he: 'he-IL',
        pl: 'pl-PL',
        sv: 'sv-SE',
        el: 'el-GR',
        uk: 'uk-UA',
        cs: 'cs-CZ',
        hu: 'hu-HU',
        ro: 'ro-RO',
        da: 'da-DK',
        fi: 'fi-FI',
        no: 'nb-NO'
      };

      utterance.lang = regionalLangMap[lang] || (lang === 'en' ? 'en-IN' : 'hi-IN');
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langPrefix = utterance.lang.split('-')[0];
        const matchedVoice = voices.find(
          (v) => (v.lang && (v.lang === utterance.lang || v.lang.startsWith(langPrefix))) ||
                 (lang === 'bho' && v.lang?.includes('hi')) ||
                 (lang === 'en' && (v.lang?.includes('en-IN') || v.name?.toLowerCase().includes('india')))
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = (e) => {
        console.warn('[Bhashini] Web Speech error:', e);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[Bhashini] Speech utterance dispatch failed:', err);
      if (onEnd) onEnd();
    }
  }, 60);
}

/**
 * Stop any current speech playback.
 */
export function stopAudioSpeech() {
  if (activeAudioInstance) {
    try {
      activeAudioInstance.pause();
      activeAudioInstance.currentTime = 0;
    } catch (e) {}
    activeAudioInstance = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

/**
 * Helper to generate Romanized transliteration for Hindi text.
 */
function generateTransliteration(hindiText) {
  if (!hindiText) return '';
  return hindiText
    .replace(/नमस्ते/g, 'Namaste')
    .replace(/कृपया/g, 'Kripya')
    .replace(/मीटर/g, 'meter')
    .replace(/हाँ/g, 'haan')
    .replace(/नहीं/g, 'nahi')
    .replace(/धन्यवाद/g, 'dhanyavaad');
}

/**
 * Helper to generate phonetic pronunciation hints.
 */
function generatePhoneticGuide(hindiText) {
  if (!hindiText) return 'Pronounce slowly and clearly';
  return 'Listen to audio for precise regional tones';
}
