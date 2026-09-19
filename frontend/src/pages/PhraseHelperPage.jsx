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
  playAudioSpeech,
  stopAudioSpeech,
  PRELOADED_TOURIST_PHRASES,
  BHASHINI_CONFIG,
  MAJOR_INDIAN_LANGUAGES,
} from '../services/bhashiniService';
import StatusBadge from '../components/common/StatusBadge';
import { useTraveler } from '../context/TravelerContext';

export default function PhraseHelperPage() {
  const { traveler } = useTraveler();

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

  // Filter & Search
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize Speech Recognition on Mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = sourceLang === 'en' ? 'en-IN' : 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Automatically perform speech-to-speech translation
        await handleSpeechToSpeechTranslation(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      stopAudioSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [sourceLang]);

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

  // Toggle Voice Input
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopAudioSpeech();
      recognitionRef.current.lang = sourceLang === 'en' ? 'en-IN' : 'hi-IN';
      recognitionRef.current.start();
    }
  };

  // Play Audio Output
  const handlePlayAudio = (text, lang = targetLang) => {
    setIsPlayingAudio(true);
    playAudioSpeech(text, lang);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2800);
  };

  // Language Swap
  const handleSwapLanguages = () => {
    const tempSource = sourceLang;
    setSourceLang(targetLanguage);
    updateTargetLanguage(tempSource);
    setInputText('');
    setTranslationResult(null);
  };

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
              {fullscreenPhrase.hindi || fullscreenPhrase.translated}
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
                English: <strong>{fullscreenPhrase.english || fullscreenPhrase.original}</strong>
              </span>

              <button
                onClick={() => handlePlayAudio(fullscreenPhrase.hindi || fullscreenPhrase.translated, 'hi')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30"
              >
                <Volume2 className="w-5 h-5" />
                <span>Play Loud Hindi Audio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner with Bhashini Accreditation */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Globe className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                Phrase Helper & Multilingual Voice
              </h1>
              <span className="px-2.5 py-1 text-[11px] font-bold bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30 uppercase tracking-wide flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Digital India Bhashini</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Official Indian Language AI Translation Mission by MeitY. Translate tourist instructions, verify meter requests, and communicate via Speech-to-Speech with drivers and locals.
            </p>
          </div>

          {/* Bhashini Live / Mock Status Badge */}
          <div className="flex items-center space-x-2 bg-surface-card px-3.5 py-2 rounded-2xl border border-surface-border shrink-0 self-start md:self-auto">
            <div className={`w-2.5 h-2.5 rounded-full ${BHASHINI_CONFIG.USE_MOCK ? 'bg-emerald-400' : 'bg-indigo-400'} animate-pulse`} />
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
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                Interactive Text & Speech-to-Speech Translator
              </h2>
              <p className="text-xs text-slate-400">
                Type or speak aloud. Voice inputs are automatically transcribed, translated, and spoken back.
              </p>
            </div>
          </div>

          {/* Language Switcher Bar */}
          <div className="flex items-center space-x-2 bg-surface-card p-1.5 rounded-2xl border border-surface-border self-start sm:self-auto">
            <span className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              {sourceLang === 'en' ? 'English (EN)' : `${targetLanguage.toUpperCase()}`}
            </span>
            <button
              onClick={handleSwapLanguages}
              title="Swap Languages"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
            <select
              id="phrase-target-language-select"
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
              {MAJOR_INDIAN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-surface text-slate-100 font-semibold">
                  {lang.name} ({lang.native})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Two-Column Translation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Input (Text + Speech Voice Recorder) */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>{sourceLang === 'en' ? 'English Input' : 'Hindi Input'}</span>
              <span className="text-[10px] text-slate-500 lowercase">
                {speechSupported ? 'mic ready' : 'speech input not supported'}
              </span>
            </label>

            <div className="relative">
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  sourceLang === 'en'
                    ? "Type any tourist request e.g. 'Can you drop me at Connaught Place inner circle by meter?' or tap the microphone to speak..."
                    : "यहाँ हिंदी में बोलें या लिखें (उदा. क्या आप मीटर से चलेंगे?)..."
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
              <span>{targetLang === 'hi' ? 'Hindi Translation' : 'English Translation'}</span>
              {translationResult && (
                <span className="text-[10px] text-emerald-400 font-mono">
                  {Math.round(translationResult.confidence * 100)}% Confidence
                </span>
              )}
            </label>

            {translationResult ? (
              <div className="p-5 bg-surface border border-emerald-500/40 rounded-2xl space-y-4 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wide bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                    {translationResult.source}
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

                {/* Quick Show to Driver Button */}
                <button
                  onClick={() => setFullscreenPhrase(translationResult)}
                  className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-surface-card hover:bg-surface border border-surface-border text-emerald-400 hover:text-emerald-300 font-bold text-xs rounded-xl transition-all"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Show Large Screen to Driver / Auto-rickshaw</span>
                </button>
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
    </div>
  );
}
