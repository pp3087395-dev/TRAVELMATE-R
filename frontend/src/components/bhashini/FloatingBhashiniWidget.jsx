import React, { useState, useEffect, useRef } from 'react';
import {
  Languages,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  ArrowRightLeft,
  ChevronDown
} from 'lucide-react';
import {
  translateText,
  playAudioSpeech,
  stopAudioSpeech,
  BHASHINI_LANGUAGES,
  MAJOR_INDIAN_LANGUAGES,
  PRELOADED_TOURIST_PHRASES
} from '../../services/bhashiniService';
import { useToast } from '../../context/ToastContext';

export default function FloatingBhashiniWidget({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  hideLauncher = false,
  targetLanguage: externalTargetLanguage,
  onTargetLanguageChange
} = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (val) => {
    if (typeof val === 'function') {
      const nextVal = val(isOpen);
      if (!nextVal && externalOnClose) externalOnClose();
      else setInternalIsOpen(nextVal);
    } else {
      if (!val && externalOnClose) externalOnClose();
      else setInternalIsOpen(val);
    }
  };
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  
  // Dynamic targetLanguage state (supports both controlled and uncontrolled usage)
  const [internalTargetLanguage, setInternalTargetLanguage] = useState('hi');
  const targetLanguage = externalTargetLanguage !== undefined ? externalTargetLanguage : internalTargetLanguage;
  const targetLang = targetLanguage; // backward compatibility alias

  const updateTargetLanguage = (code) => {
    if (onTargetLanguageChange) {
      onTargetLanguageChange(code);
    }
    setInternalTargetLanguage(code);
  };
  const [translationResult, setTranslationResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { showToast } = useToast();
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = sourceLang === 'en' ? 'en-IN' : sourceLang;

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          triggerTranslation(transcript);
        };

        recognition.onerror = (e) => {
          console.warn('[Bhashini Speech] Recognition error:', e.error);
          setIsListening(false);
          showToast('Speech input paused. Please type your phrase.', 'info');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [sourceLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      showToast('Voice input is not supported in this browser. Please use Chrome/Edge or type below.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        showToast('Listening... speak your destination or query now.', 'info', 2000);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const triggerTranslation = async (textToTranslate, langOverride) => {
    const text = textToTranslate || inputText;
    if (!text.trim()) return;
    const resolvedTarget = langOverride || targetLanguage;

    setIsTranslating(true);
    try {
      const result = await translateText({
        text,
        sourceLang,
        targetLanguage: resolvedTarget,
        targetLang: resolvedTarget
      });
      setTranslationResult(result);
    } catch (e) {
      console.error(e);
      showToast('Translation error. Engaging offline vernacular fallback.', 'warning');
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePlayAudio = (text) => {
    if (isPlayingAudio) {
      stopAudioSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      playAudioSpeech(text, targetLanguage);
      setTimeout(() => setIsPlayingAudio(false), 3000);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard!', 'info', 1500);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectPreset = (phrase) => {
    setInputText(phrase.english);
    triggerTranslation(phrase.english);
  };

  const activeTargetLangObj =
    MAJOR_INDIAN_LANGUAGES.find((l) => l.code === targetLanguage) ||
    BHASHINI_LANGUAGES.find((l) => l.code === targetLanguage) ||
    MAJOR_INDIAN_LANGUAGES[0];

  return (
    <>
      {/* Floating Launcher Button */}
      {!hideLauncher && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
          <button
            id="btn-floating-bhashini-widget"
            onClick={() => setIsOpen(!isOpen)}
            className="group relative flex items-center justify-center space-x-2 h-11 sm:h-12 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 border border-amber-300/50 hover:ring-2 hover:ring-amber-400/60 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
            aria-label="Open Bhashini AI Multilingual Translator"
            title="Digital India Bhashini Multilingual AI Voice Translator"
          >
            <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 stroke-[2.2] group-hover:rotate-12 transition-transform shrink-0" />
            <span className="font-display tracking-tight font-extrabold hidden sm:inline whitespace-nowrap">
              Bhashini AI
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-950/20 text-[10px] font-mono font-black text-slate-950 shrink-0 uppercase">
              {targetLanguage}
            </span>
          </button>
        </div>
      )}

      {/* Expandable Translation Console */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className={`fixed z-50 transition-all duration-300 ${
            isFullscreen
              ? 'inset-0 p-4 sm:p-8 bg-black/85 backdrop-blur-xl flex items-center justify-center'
              : 'bottom-24 right-4 sm:bottom-20 sm:right-6 w-[calc(100vw-2rem)] sm:w-96'
          }`}
        >
          <div
            className={`glass-card rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col ${
              isFullscreen ? 'w-full max-w-3xl max-h-[90vh]' : 'max-h-[600px]'
            }`}
          >
            {/* Top Bar */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <Languages className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black font-display text-white tracking-wide flex items-center space-x-1.5">
                    <span>BHASHINI TRANSLATOR</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      {targetLanguage}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                      MeitY
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Target: <span className="text-amber-300 font-semibold">{activeTargetLangObj.name} ({activeTargetLangObj.native})</span> Vernacular Layer
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Flashcard'}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (externalOnClose) externalOnClose();
                    setIsFullscreen(false);
                    stopAudioSpeech();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-1">
              
              {/* Language Switcher */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-white/[0.03] border border-white/5 text-xs">
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="en" className="bg-slate-900 text-white">English (EN)</option>
                  <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
                  <option value="fr" className="bg-slate-900 text-white">Français (FR)</option>
                  <option value="de" className="bg-slate-900 text-white">Deutsch (DE)</option>
                  <option value="es" className="bg-slate-900 text-white">Español (ES)</option>
                  <option value="ja" className="bg-slate-900 text-white">日本語 (JA)</option>
                </select>

                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />

                <select
                  id="select-target-language"
                  value={targetLanguage}
                  onChange={(e) => {
                    const newTarget = e.target.value;
                    updateTargetLanguage(newTarget);
                    if (inputText.trim()) triggerTranslation(inputText, newTarget);
                  }}
                  className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer text-xs"
                >
                  <optgroup label="Major Indian Languages" className="bg-slate-900 text-amber-400 font-bold">
                    {MAJOR_INDIAN_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-slate-900 text-white font-medium">
                        {lang.name} ({lang.native})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Regional Languages" className="bg-slate-900 text-slate-400 font-normal italic">
                    {BHASHINI_LANGUAGES.filter(l => !MAJOR_INDIAN_LANGUAGES.some(m => m.code === l.code)).map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-300 not-italic">
                        {lang.name} ({lang.native})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Text Input with Microphone */}
              <div className="relative">
                <textarea
                  rows={isFullscreen ? 3 : 2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      triggerTranslation();
                    }
                  }}
                  placeholder="Type or speak a message for your driver..."
                  className="w-full p-3 pr-10 rounded-2xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
                />
                
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-2.5 top-2.5 p-1.5 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-slate-400 hover:text-amber-400 hover:bg-white/10'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Speak Voice Input'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              {/* Translate Action Button */}
              <button
                type="button"
                onClick={() => triggerTranslation()}
                disabled={isTranslating || !inputText.trim()}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
              >
                {isTranslating ? 'Translating via Bhashini...' : `Translate to ${activeTargetLangObj.name} (${targetLanguage.toUpperCase()})`}
              </button>

              {/* Translation Result Card */}
              {translationResult && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-400 font-bold uppercase tracking-wider">
                      {activeTargetLangObj.name} ({activeTargetLangObj.native})
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handlePlayAudio(translationResult.translated)}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                          isPlayingAudio
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-white/10 text-slate-300 hover:text-white'
                        }`}
                        title="Play Native Pronunciation"
                      >
                        {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isPlayingAudio ? 'Stop' : 'Listen'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(translationResult.translated)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Copy Translation"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Main Vernacular Output (Giant in Fullscreen) */}
                  <div className={`font-bold text-white leading-relaxed ${
                    isFullscreen ? 'text-2xl sm:text-3xl py-4 text-center text-amber-200' : 'text-base sm:text-lg'
                  }`}>
                    {translationResult.translated}
                  </div>

                  {/* Transliteration & Phonetic */}
                  <div className="space-y-1 text-xs pt-2 border-t border-amber-500/20 text-slate-300">
                    <div className="font-mono text-[11px] text-amber-300">
                      Pronounce: <span className="text-white italic">{translationResult.transliteration}</span>
                    </div>
                    {translationResult.phonetic && (
                      <div className="text-[10px] text-slate-400">
                        Hint: {translationResult.phonetic}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Driver Phrase Presets */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Driver & Transit Phrases
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRELOADED_TOURIST_PHRASES.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-white text-left transition-colors"
                    >
                      {p.english}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Disclaimer */}
            <div className="p-3 bg-black/40 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
              <span>National Language Translation Mission (Bhashini)</span>
              <span className="text-emerald-400">Official MeitY Ready</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
