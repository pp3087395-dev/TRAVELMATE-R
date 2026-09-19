import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowRightLeft,
  Search,
  Car,
  Compass,
  ShieldAlert,
  ShoppingBag,
  Landmark,
  Utensils,
  Share2,
  Info,
  Radio,
  RefreshCw,
} from 'lucide-react';
import {
  translateText,
  speechToSpeech,
  speechToSpeechAudio,
  playBase64Audio,
  playAudioSpeech,
  stopAudioSpeech,
  PRELOADED_TOURIST_PHRASES,
  BHASHINI_CONFIG,
  BHASHINI_LANGUAGES,
  INTERNATIONAL_LANGUAGES,
  MAJOR_INDIAN_LANGUAGES,
} from '../services/bhashiniService';
import StatusBadge from '../components/common/StatusBadge';
import { useTraveler } from '../context/TravelerContext';
// Journey chain fallback helper when standalone
const useJourneyChain = () => {
  const { journey } = useTraveler();
  return {
    activeJourney: { id: journey?.journey_code || 'TM-DEL-2026-X89K' },
    addTimelineEvent: (evt) => {
      console.log('[JourneyChain Event]', evt);
    }
  };
};

export default function BhashiniTranslatorPage() {
  const { traveler } = useTraveler();
  const { activeJourney, addTimelineEvent } = useJourneyChain();
  const [savedPhraseMsg, setSavedPhraseMsg] = useState('');

  // Translation States
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [targetLang, setTargetLang] = useState('hi');

  const updateTargetLanguage = (code) => {
    setTargetLanguage(code);
    setTargetLang(code);
  };
  const [inputText, setInputText] = useState('');
  const [translationResult, setTranslationResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Audio Playback States
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Fullscreen Driver Card Overlay
  const [fullscreenPhrase, setFullscreenPhrase] = useState(null);

  // Live Conversation Mode States
  const [liveHistory, setLiveHistory] = useState([]);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [processingSpeaker, setProcessingSpeaker] = useState(null);
  const [liveTranslationError, setLiveTranslationError] = useState(null);
  const [micError, setMicError] = useState(null);
  const [speakingLiveId, setSpeakingLiveId] = useState(null);

  const handleMicError = (err) => {
    console.error("Microphone permission denied:", err);
    if (window.self !== window.top) {
      setMicError("Microphone access is blocked by your browser in this embedded preview. Please click the 'Open in New Tab' button (↗) at the top right of the screen.");
    } else {
      setMicError("Microphone access was denied by your system. Please allow microphone access in your browser's site settings (URL bar lock icon) and check your Operating System Privacy settings.");
    }
    setTimeout(() => setMicError(null), 10000);
  };

  // Filter & Search
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Text Translation
  const handleTranslate = async (textToTranslate = inputText, sLang = sourceLang, tLang = targetLanguage || targetLang) => {
    const query = (textToTranslate || '').trim();
    if (!query) return;

    setIsTranslating(true);
    try {
      const result = await translateText({
        text: query,
        sourceLang: sLang,
        targetLanguage: tLang,
        targetLang: tLang,
      });
      setTranslationResult(result);
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle Speech-to-Speech (voice input -> translated voice output)
  const handleSpeechToSpeechTranslation = async (spokenText) => {
    if (!spokenText.trim()) return;
    setIsTranslating(true);
    try {
      const result = await speechToSpeech({
        text: spokenText,
        sourceLang,
        targetLanguage,
        targetLang,
      });
      setTranslationResult(result);
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 3000);
    } catch (err) {
      console.error('Speech-to-speech error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

    // MediaRecorder Ref for actual audio capturing
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Live Conversation Speech Handler
  const handleLiveConversationSpeech = async (speaker) => {
    if (activeSpeaker === speaker) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
         mediaRecorderRef.current.stop();
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      stopAudioSpeech();
      setActiveSpeaker(speaker);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setActiveSpeaker(null);
        setProcessingSpeaker(speaker);
        setLiveTranslationError(null);
        stream.getTracks().forEach(t => t.stop());
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const sLang = speaker === 'tourist' ? sourceLang : targetLang;
        const tLang = speaker === 'tourist' ? targetLang : sourceLang;
        
        try {
          const result = await speechToSpeechAudio({
            audioBlob,
            sourceLang: sLang,
            targetLang: tLang,
          });
          
          setLiveHistory(prev => [...prev, {
            id: Date.now(),
            speaker,
            original: result.original,
            translated: result.translated,
            phonetic: result.phonetic,
            ttsAudio: result.ttsAudio,
            sLang,
            tLang
          }]);
        } catch(err) {
          console.error("Live translation error:", err);
          setLiveTranslationError(err.message || "Translation could not be completed. Please tap to speak again.");
        } finally {
          setProcessingSpeaker(null);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      handleMicError(err);
      setActiveSpeaker(null);
      setProcessingSpeaker(null);
    }
  };

  // Toggle Voice Input
  const toggleListening = async () => {
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      return;
    } 

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      stopAudioSpeech();
      setIsListening(true);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        stream.getTracks().forEach(t => t.stop());
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          setIsTranslating(true);
          const result = await speechToSpeechAudio({
            audioBlob,
            sourceLang,
            targetLang,
          });
          setInputText(result.original);
          setTranslationResult(result);
          setIsPlayingAudio(true);
          setTimeout(() => setIsPlayingAudio(false), 3000);
        } catch(err) {
          console.error("Translation error:", err);
          setLiveTranslationError(err.message || "Failed to translate audio.");
        } finally {
          setIsTranslating(false);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      handleMicError(err);
      setIsListening(false);
    }
  };

  // Play Audio Output with language resolution and callback
  const handlePlayAudio = (text, lang = targetLang) => {
    setIsPlayingAudio(true);
    const resolvedLang = (!lang || lang === 'auto') ? (targetLang !== 'auto' ? targetLang : 'hi') : lang;
    playAudioSpeech(text, resolvedLang, () => {
      setIsPlayingAudio(false);
    });
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 4500);
  };

  // Dedicated Live Conversation audio handler with visual speaking states
  const handlePlayLiveAudio = (id, text, lang, base64Audio) => {
    setSpeakingLiveId(id);
    const onEnd = () => {
      setSpeakingLiveId(prev => (prev === id ? null : prev));
    };

    const resolvedLang = (!lang || lang === 'auto')
      ? (targetLang !== 'auto' ? targetLang : 'hi')
      : lang;

    if (base64Audio) {
      playBase64Audio(base64Audio, text, resolvedLang, onEnd);
    } else {
      playAudioSpeech(text, resolvedLang, onEnd);
    }

    setTimeout(() => {
      setSpeakingLiveId(prev => (prev === id ? null : prev));
    }, 6000);
  };

  // Language Swap

  // Copy to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Select a Preloaded Example Phrase
  const handleSelectPreloaded = (phrase) => {
    setInputText(phrase.english);
    setTranslationResult({
      original: phrase.english,
      translated: phrase.hindi,
      hindi: phrase.hindi,
      english: phrase.english,
      transliteration: phrase.transliteration,
      phonetic: phrase.phonetic,
      sourceLang: 'en',
      targetLang: 'hi',
      source: 'Digital India Bhashini (Pre-loaded Official Phrase)',
      isLive: false,
      confidence: 1.0,
      timestamp: new Date().toISOString(),
    });
    // Auto-scroll slightly to translation workspace on mobile
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Categories for Filtering
  const categories = [
    { label: 'All', icon: Sparkles },
    { label: 'Transport & Meter', icon: Car },
    { label: 'Directions & Metro', icon: Compass },
    { label: 'Safety & Emergency', icon: ShieldAlert },
    { label: 'Fair Fare & Shopping', icon: ShoppingBag },
    { label: 'Heritage & Places', icon: Landmark },
    { label: 'Dining & Health', icon: Utensils },
  ];

  // Filtered Preloaded Phrases
  const filteredPhrases = PRELOADED_TOURIST_PHRASES.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.english.toLowerCase().includes(q) ||
      item.hindi.includes(q) ||
      item.transliteration.toLowerCase().includes(q) ||
      item.context.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const lastTouristMessage = [...liveHistory].reverse().find(m => m.speaker === 'tourist');
  const lastLocalMessage = [...liveHistory].reverse().find(m => m.speaker === 'local');

  const currentTargetLangName = targetLanguage === 'auto' ? 'Hindi' : ([...MAJOR_INDIAN_LANGUAGES, ...BHASHINI_LANGUAGES, ...INTERNATIONAL_LANGUAGES].find(l => l.code === targetLanguage || l.code === targetLang)?.name || 'Local Language');
  const currentSourceLangName = sourceLang === 'auto' ? 'English' : ([...INTERNATIONAL_LANGUAGES, ...BHASHINI_LANGUAGES].find(l => l.code === sourceLang)?.name || 'English');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-in fade-in duration-300">
      {/* Fullscreen "Show to Driver" Overlay */}
      {fullscreenPhrase && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
          <button
            onClick={() => setFullscreenPhrase(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all focus:outline-none"
            title="Close Fullscreen"
          >
            <Minimize2 className="w-6 h-6" />
          </button>

          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs uppercase tracking-widest font-bold mb-6">
            <span>Show this screen to Auto-Rickshaw / Cab Driver</span>
          </div>

          <div className="w-full max-w-2xl bg-surface border-2 border-emerald-500 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-emerald-500/20 space-y-6">
            <div className="text-4xl sm:text-6xl font-black text-white leading-tight font-display tracking-wide">
              {fullscreenPhrase.translated}
            </div>

            <p className="text-xl sm:text-2xl font-mono text-emerald-300">
              "{fullscreenPhrase.transliteration}"
            </p>

            {fullscreenPhrase.phonetic && (
              <p className="text-xs sm:text-sm text-slate-400 italic">
                Pronunciation: {fullscreenPhrase.phonetic}
              </p>
            )}

            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-slate-300">
                {[...INTERNATIONAL_LANGUAGES, ...BHASHINI_LANGUAGES].find(l => l.code === fullscreenPhrase.sourceLang)?.name || 'Original'}: <strong>{fullscreenPhrase.original}</strong>
              </span>

              <button
                onClick={() => handlePlayAudio(fullscreenPhrase.translated, fullscreenPhrase.targetLang)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30"
              >
                <Volume2 className="w-5 h-5" />
                <span>Play Audio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner with Bhashini Accreditation */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <Globe className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                Bhashini Translator & Multilingual Voice
              </h1>
              <span className="px-3 py-1 text-[11px] font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Digital India Bhashini</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Official Indian Language AI Translation Mission by MeitY. Translate tourist instructions, verify meter requests, and communicate via Speech-to-Speech with drivers and locals.
            </p>
          </div>

          {/* Target Language Badge & Bhashini Live / Mock Status Badge */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
            <div className="flex items-center space-x-2 bg-indigo-500/10 px-3.5 py-2 rounded-2xl border border-indigo-500/30 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-slate-400">Target</span>
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs uppercase border border-indigo-500/30">
                {targetLanguage}
              </span>
              <span className="text-xs font-bold text-white">
                {currentTargetLangName}
              </span>
            </div>

            <div className="flex items-center space-x-2.5 bg-white/[0.04] px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className={`w-2.5 h-2.5 rounded-full ${BHASHINI_CONFIG.USE_MOCK ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-indigo-400'} animate-pulse`} />
              <div className="text-left">
                <div className="text-[11px] font-bold text-slate-200">
                  {BHASHINI_CONFIG.USE_MOCK ? 'Bhashini-Ready AI Engine' : 'Live ULCA Inference'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {BHASHINI_CONFIG.USE_MOCK ? 'Offline Fallback Active' : 'Connected to MeitY Cloud'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 1: PRE-LOADED TOURIST EXAMPLE PHRASES (VISIBLE IMMEDIATELY) */}
      {/* ===================================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white font-display flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Instant Tourist Phrases (Pre-translated)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Select any phrase below to hear audio pronunciation, copy, or project fullscreen to your driver.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search phrases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grid of Preloaded Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhrases.map((phrase) => (
            <div
              key={phrase.id}
              className="glass-card p-5 rounded-2xl border border-surface-border hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white/5 text-emerald-300 border border-white/10 uppercase tracking-wide">
                    {phrase.quickTag}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePlayAudio(phrase.hindi, 'hi')}
                      title="Play Audio"
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setFullscreenPhrase(phrase)}
                      title="Show to Driver"
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  "{phrase.english}"
                </h3>

                <div className="text-lg font-black text-emerald-400 font-display">
                  {phrase.hindi}
                </div>

                <div className="text-xs font-mono text-slate-300">
                  {phrase.transliteration}
                </div>

                <div className="text-[11px] text-slate-400 italic">
                  Say: {phrase.phonetic}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 truncate max-w-[190px]" title={phrase.context}>
                  {phrase.context}
                </span>
                <button
                  onClick={() => handleSelectPreloaded(phrase)}
                  className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <span>Use in Translator</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 2: INTERACTIVE BHASHINI TRANSLATION & SPEECH-TO-SPEECH WORKSPACE */}
      {/* ===================================================================== */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-surface-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-display">
                  Interactive Text & Speech-to-Speech Translator
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30 uppercase">
                  {targetLanguage}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target: <strong className="text-amber-300 font-semibold">{([ ...MAJOR_INDIAN_LANGUAGES, ...BHASHINI_LANGUAGES, ...INTERNATIONAL_LANGUAGES ].find(l => l.code === targetLanguage)?.name) || targetLanguage} ({([ ...MAJOR_INDIAN_LANGUAGES, ...BHASHINI_LANGUAGES, ...INTERNATIONAL_LANGUAGES ].find(l => l.code === targetLanguage)?.native) || targetLanguage.toUpperCase()})</strong> • Type or speak aloud. Voice inputs are automatically transcribed, translated, and spoken back.
              </p>
            </div>
          </div>

          {/* Language Switcher Bar */}
          <div className="flex items-center space-x-2 bg-white/[0.04] p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
            <select
              value={sourceLang}
              onChange={(e) => {
                const newSource = e.target.value;
                setSourceLang(newSource);
                if (inputText.trim()) {
                  handleTranslate(inputText, newSource, targetLang);
                }
              }}
              className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="auto" className="bg-surface text-emerald-300 font-bold">✨ Auto Detect Language</option>
              <optgroup label="International Languages" className="bg-surface text-slate-400 font-normal italic">
                {INTERNATIONAL_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-surface text-slate-200 not-italic font-medium">
                    {lang.name} {lang.native && lang.native !== lang.name ? `• ${lang.native}` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Indian Languages" className="bg-surface text-slate-400 font-normal italic">
                {BHASHINI_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-surface text-slate-200 not-italic font-medium">
                    {lang.name} {lang.native && lang.native !== lang.name ? `• ${lang.native}` : ''}
                  </option>
                ))}
              </optgroup>
            </select>
            <button
              onClick={() => {
                const tempSource = sourceLang;
                setSourceLang(targetLanguage);
                updateTargetLanguage(tempSource);
                if (translationResult && translationResult.translated) {
                  setInputText(translationResult.translated);
                  handleTranslate(translationResult.translated, targetLanguage, tempSource);
                }
              }}
              title="Swap Languages"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
            <select
              id="select-target-language"
              value={targetLanguage}
              onChange={(e) => {
                const newTarget = e.target.value;
                updateTargetLanguage(newTarget);
                if (inputText.trim()) {
                  handleTranslate(inputText, sourceLang, newTarget);
                }
              }}
              className="px-3 py-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 rounded-xl border border-indigo-500/20 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <optgroup label="Major Indian Languages" className="bg-surface text-amber-400 font-bold not-italic">
                {MAJOR_INDIAN_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-surface text-slate-100 not-italic font-semibold">
                    {lang.name} ({lang.native})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other Regional Languages" className="bg-surface text-slate-400 font-normal italic">
                {BHASHINI_LANGUAGES.filter(l => !MAJOR_INDIAN_LANGUAGES.some(m => m.code === l.code)).map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-surface text-slate-200 not-italic font-medium">
                    {lang.name} {lang.native && lang.native !== lang.name ? `• ${lang.native}` : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="International Languages" className="bg-surface text-slate-400 font-normal italic">
                {INTERNATIONAL_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-surface text-slate-200 not-italic font-medium">
                    {lang.name} {lang.native && lang.native !== lang.name ? `• ${lang.native}` : ''}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Two-Column Translation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Input (Text + Speech Voice Recorder) */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>{sourceLang === 'auto' ? 'Auto Detected' : ([...INTERNATIONAL_LANGUAGES, ...BHASHINI_LANGUAGES].find(l => l.code === sourceLang)?.name || 'Input')} Input</span>
              <span className="text-[10px] text-slate-500 lowercase">
                {speechSupported ? 'mic ready' : 'speech input not supported'}
              </span>
            </label>

            <div className="relative">
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                lang={sourceLang === 'auto' ? undefined : sourceLang}
                placeholder={
                  sourceLang === 'en'
                    ? "Type any tourist request e.g. 'Can you drop me at Connaught Place inner circle by meter?' or tap the microphone to speak..."
                    : `Type or speak in ${[...INTERNATIONAL_LANGUAGES, ...BHASHINI_LANGUAGES].find(l => l.code === sourceLang)?.name}...`
                }
                className="w-full p-4 bg-surface border border-surface-border rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />

              {inputText && (
                <button
                  onClick={() => {
                    setInputText('');
                    setTranslationResult(null);
                  }}
                  className="absolute top-3 right-3 text-xs text-slate-400 hover:text-white bg-surface-card px-2 py-1 rounded-md border border-white/10"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Actions Bar: Mic Button & Translate Button */}
            <div className="flex items-center gap-3">
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 animate-bounce" />
                      <span>Listening... (Tap to stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Speech-to-Speech (Speak)</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => handleTranslate()}
                disabled={isTranslating || !inputText.trim()}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTranslating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Translating via Bhashini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Translate Text</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Column 2: Translated Output Panel */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span>{([ ...MAJOR_INDIAN_LANGUAGES, ...BHASHINI_LANGUAGES, ...INTERNATIONAL_LANGUAGES ].find(l => l.code === targetLanguage)?.name) || targetLanguage} Translation</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  {targetLanguage}
                </span>
              </span>
              {translationResult && (
                <span className="text-[10px] text-emerald-400 font-mono">
                  {Math.round(translationResult.confidence * 100)}% Confidence
                </span>
              )}
            </label>

            {translationResult ? (
              <div className="p-5 bg-surface border border-emerald-500/40 rounded-2xl space-y-4 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{translationResult.source || 'Bhashini Translator'}</span>
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopy(translationResult.translated)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                      title="Copy text"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handlePlayAudio(translationResult.translated, targetLang)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isPlayingAudio
                          ? 'text-emerald-300 bg-emerald-500/20 animate-pulse'
                          : 'text-slate-400 hover:text-emerald-400 hover:bg-white/5'
                      }`}
                      title="Play Pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setFullscreenPhrase(translationResult)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-white/5 transition-colors"
                      title="Show to Driver Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Translated Text */}
                <div className="text-xl sm:text-2xl font-black text-white font-display">
                  {translationResult.translated}
                </div>

                {/* Transliteration */}
                {translationResult.transliteration && (
                  <div className="text-sm font-mono text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    "{translationResult.transliteration}"
                  </div>
                )}

                {/* Phonetic Pronunciation Guide */}
                {translationResult.phonetic && (
                  <div className="text-xs text-slate-400 italic">
                    Say aloud: {translationResult.phonetic}
                  </div>
                )}

                {/* Quick Show to Driver & Save to Journey Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={() => setFullscreenPhrase(translationResult)}
                    className="flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-surface-card hover:bg-surface border border-surface-border text-emerald-400 hover:text-emerald-300 font-bold text-xs rounded-xl transition-all"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Show Large to Driver</span>
                  </button>
                  <button
                    onClick={() => {
                      addTimelineEvent({
                        title: `Translated: "${translationResult.english || translationResult.original || 'Phrase'}"`,
                        module: 'Bhashini Translator',
                        description: `Translated to ${translationResult.translated} (${targetLang}). Saved for driver communication.`,
                        actionPath: '/bhashini-translator'
                      });
                      setSavedPhraseMsg('✓ Saved to Journey Chain');
                      setTimeout(() => setSavedPhraseMsg(''), 3000);
                    }}
                    className="inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savedPhraseMsg || `Save to Chain (${activeJourney.id})`}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-surface-border rounded-2xl flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
                <Globe className="w-8 h-8 text-slate-500" />
                <div className="text-xs text-slate-400 max-w-xs">
                  Your translation and pronunciation guide will appear here. Choose a phrase above or use voice input to begin.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 3: LIVE TO LIVE CONVERSATION (WALKIE-TALKIE MODE) */}
      {/* ===================================================================== */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                Live Conversation Mode
              </h2>
              <p className="text-xs text-slate-400">
                Hold to speak. The other person hears your translated voice in real-time.
              </p>
            </div>
          </div>
        </div>

        {liveTranslationError && (
          <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-4 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{liveTranslationError}</span>
            </div>
            <button
              onClick={() => setLiveTranslationError(null)}
              className="text-xs font-bold text-rose-400 hover:text-rose-200 ml-3 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tourist Side */}
          <div className="bg-surface-card p-6 rounded-2xl border border-surface-border text-center space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-200">Tourist Side</h3>
              <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400">
                <span className="shrink-0">Speaks:</span>
                <select
                  id="live-tourist-lang-select"
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-indigo-400 cursor-pointer max-w-[210px] truncate"
                >
                  <option value="auto" className="bg-surface text-indigo-300 font-bold">✨ Auto Detect</option>
                  <optgroup label="International Languages" className="bg-surface text-slate-400 italic">
                    {INTERNATIONAL_LANGUAGES.map(l => (
                      <option key={l.code} value={l.code} className="bg-surface text-slate-200 not-italic">
                        {l.name} {l.native && l.native !== l.name ? `• ${l.native}` : ''}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Indian Languages" className="bg-surface text-slate-400 italic">
                    {BHASHINI_LANGUAGES.map(l => (
                      <option key={l.code} value={l.code} className="bg-surface text-slate-200 not-italic">
                        {l.name} {l.native && l.native !== l.name ? `• ${l.native}` : ''}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleLiveConversationSpeech('tourist')}
              disabled={processingSpeaker !== null}
              className={`mx-auto w-24 h-24 rounded-full flex flex-col items-center justify-center space-y-2 transition-all ${
                activeSpeaker === 'tourist'
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 animate-pulse scale-110'
                  : processingSpeaker === 'tourist'
                  ? 'bg-indigo-500/20 text-indigo-300 border-2 border-indigo-500/40'
                  : 'bg-indigo-500/10 text-indigo-400 border-2 border-indigo-500/30 hover:bg-indigo-500/20 hover:scale-105'
              } ${processingSpeaker !== null && processingSpeaker !== 'tourist' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {processingSpeaker === 'tourist' ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {activeSpeaker === 'tourist' ? 'Stop & Translate' : processingSpeaker === 'tourist' ? 'Translating...' : 'Tap to Talk'}
              </span>
            </button>
            
            {processingSpeaker === 'tourist' && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-center text-xs text-indigo-300 animate-pulse">
                Converting your speech to {currentTargetLangName}...
              </div>
            )}

            {lastTouristMessage && !processingSpeaker && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-xl text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Your Speech & {currentTargetLangName} Translation</span>
                  <span className="text-[10px] text-indigo-300/70 font-mono">Ready to play</span>
                </div>
                <div className="text-xs text-slate-300 italic">"{lastTouristMessage.original}"</div>
                <div className="text-sm font-semibold text-indigo-100 bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-500/20">
                  {lastTouristMessage.translated}
                </div>
                <button 
                  onClick={() => handlePlayLiveAudio('tourist-main', lastTouristMessage.translated, lastTouristMessage.tLang, lastTouristMessage.ttsAudio)}
                  className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-98 text-white ${
                    speakingLiveId === 'tourist-main'
                      ? 'bg-amber-600 animate-pulse shadow-amber-600/40'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  }`}
                >
                  <Volume2 className={`w-4 h-4 ${speakingLiveId === 'tourist-main' ? 'animate-bounce' : ''}`} />
                  <span>{speakingLiveId === 'tourist-main' ? 'Speaking...' : `Play Translation (${currentTargetLangName})`}</span>
                </button>
              </div>
            )}

            {lastLocalMessage && !lastTouristMessage && !processingSpeaker && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl mt-4 text-left">
                <div className="text-[10px] text-indigo-400 font-bold uppercase mb-1">Local Said:</div>
                <div className="text-indigo-50 text-sm font-medium mb-3 leading-snug">{lastLocalMessage.translated}</div>
                <button 
                  onClick={() => handlePlayLiveAudio('tourist-local-said', lastLocalMessage.translated, lastLocalMessage.tLang, lastLocalMessage.ttsAudio)}
                  className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-colors ${
                    speakingLiveId === 'tourist-local-said'
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300'
                  }`}
                >
                  <Volume2 className={`w-4 h-4 ${speakingLiveId === 'tourist-local-said' ? 'animate-bounce' : ''}`} />
                  <span>{speakingLiveId === 'tourist-local-said' ? 'Speaking...' : 'Play Translation'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Local Side */}
          <div className="bg-surface-card p-6 rounded-2xl border border-surface-border text-center space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-200">Local Side</h3>
              <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400">
                <span className="shrink-0">Speaks:</span>
                <select
                  id="live-local-lang-select"
                  value={targetLanguage}
                  onChange={(e) => updateTargetLanguage(e.target.value)}
                  className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-emerald-400 cursor-pointer max-w-[210px] truncate"
                >
                  <optgroup label="Major Indian Languages" className="bg-surface text-amber-400 font-bold not-italic">
                    {MAJOR_INDIAN_LANGUAGES.map(l => (
                      <option key={l.code} value={l.code} className="bg-surface text-slate-100 not-italic font-semibold">
                        {l.name} ({l.native})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Regional Languages" className="bg-surface text-slate-400 italic">
                    {BHASHINI_LANGUAGES.filter(l => !MAJOR_INDIAN_LANGUAGES.some(m => m.code === l.code)).map(l => (
                      <option key={l.code} value={l.code} className="bg-surface text-slate-200 not-italic">
                        {l.name} {l.native && l.native !== l.name ? `• ${l.native}` : ''}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="International Languages" className="bg-surface text-slate-400 italic">
                    {INTERNATIONAL_LANGUAGES.map(l => (
                      <option key={l.code} value={l.code} className="bg-surface text-slate-200 not-italic">
                        {l.name} {l.native && l.native !== l.name ? `• ${l.native}` : ''}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleLiveConversationSpeech('local')}
              disabled={processingSpeaker !== null}
              className={`mx-auto w-24 h-24 rounded-full flex flex-col items-center justify-center space-y-2 transition-all ${
                activeSpeaker === 'local'
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/40 animate-pulse scale-110'
                  : processingSpeaker === 'local'
                  ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/40'
                  : 'bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/30 hover:bg-emerald-500/20 hover:scale-105'
              } ${processingSpeaker !== null && processingSpeaker !== 'local' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {processingSpeaker === 'local' ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {activeSpeaker === 'local' ? 'Stop & Translate' : processingSpeaker === 'local' ? 'Translating...' : 'Tap to Talk'}
              </span>
            </button>
            
            {processingSpeaker === 'local' && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center text-xs text-emerald-300 animate-pulse">
                Converting local speech to {currentSourceLangName}...
              </div>
            )}

            {lastTouristMessage && !processingSpeaker && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Tourist Said ({currentTargetLangName})</span>
                  <span className="text-[10px] text-emerald-300/70 font-mono">Ready to play</span>
                </div>
                <div className="text-emerald-50 text-sm font-semibold bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">
                  {lastTouristMessage.translated}
                </div>
                <div className="text-xs text-slate-400 italic">"{lastTouristMessage.original}"</div>
                <button 
                  onClick={() => handlePlayLiveAudio('local-tourist-said', lastTouristMessage.translated, lastTouristMessage.tLang, lastTouristMessage.ttsAudio)}
                  className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-98 text-white ${
                    speakingLiveId === 'local-tourist-said'
                      ? 'bg-amber-600 animate-pulse shadow-amber-600/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  }`}
                >
                  <Volume2 className={`w-4 h-4 ${speakingLiveId === 'local-tourist-said' ? 'animate-bounce' : ''}`} />
                  <span>{speakingLiveId === 'local-tourist-said' ? 'Speaking...' : `Play Translation (${currentTargetLangName})`}</span>
                </button>
              </div>
            )}

            {lastLocalMessage && !lastTouristMessage && !processingSpeaker && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Local Speech & {currentSourceLangName} Translation</span>
                  <span className="text-[10px] text-emerald-300/70 font-mono">Ready to play</span>
                </div>
                <div className="text-xs text-slate-300 italic">"{lastLocalMessage.original}"</div>
                <div className="text-sm font-semibold text-emerald-100 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">
                  {lastLocalMessage.translated}
                </div>
                <button 
                  onClick={() => handlePlayLiveAudio('local-main', lastLocalMessage.translated, lastLocalMessage.tLang, lastLocalMessage.ttsAudio)}
                  className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-98 text-white ${
                    speakingLiveId === 'local-main'
                      ? 'bg-amber-600 animate-pulse shadow-amber-600/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  }`}
                >
                  <Volume2 className={`w-4 h-4 ${speakingLiveId === 'local-main' ? 'animate-bounce' : ''}`} />
                  <span>{speakingLiveId === 'local-main' ? 'Speaking...' : `Play Translation (${currentSourceLangName})`}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Conversation History */}
        {liveHistory.length > 0 && (
          <div className="bg-surface p-4 rounded-xl border border-surface-border space-y-3 max-h-60 overflow-y-auto">
            {liveHistory.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] space-y-1 ${
                  msg.speaker === 'tourist' ? 'self-start items-start' : 'self-end items-end ml-auto'
                }`}
              >
                <div className="text-[10px] text-slate-500 font-bold uppercase">
                  {msg.speaker === 'tourist' ? 'Tourist' : 'Local'}
                </div>
                <div className={`p-3 rounded-2xl text-sm shadow-md ${
                  msg.speaker === 'tourist' 
                    ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-50 rounded-tl-sm' 
                    : 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-50 rounded-tr-sm'
                }`}>
                  <div className="font-medium">{msg.translated}</div>
                  <div className="text-[10px] opacity-70 mt-1 italic">"{msg.original}"</div>
                  
                  <button 
                    onClick={() => handlePlayLiveAudio(msg.id, msg.translated, msg.tLang, msg.ttsAudio)}
                    className={`mt-2 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 ${
                      speakingLiveId === msg.id
                        ? 'bg-amber-500 text-white animate-pulse shadow-amber-500/30'
                        : msg.speaker === 'tourist'
                          ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 hover:text-indigo-200 border border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 hover:text-emerald-200 border border-emerald-500/30'
                    }`}
                  >
                    <Volume2 className={`w-4 h-4 ${speakingLiveId === msg.id ? 'animate-bounce' : ''}`} />
                    <span>{speakingLiveId === msg.id ? 'Speaking...' : 'Listen'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
