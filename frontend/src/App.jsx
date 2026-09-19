import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TravelerProvider } from './context/TravelerContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';

// Navigation & Layout Components
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import ClaudeSidebar from './components/navigation/ClaudeSidebar';
import FloatingBhashiniWidget from './components/bhashini/FloatingBhashiniWidget';
import ToastContainer from './components/common/ToastContainer';
import HelplineFloatingBadge from './components/common/HelplineFloatingBadge';
import QRModal from './components/common/QRModal';
import TMChatbotModal from './components/chat/TMChatbotModal';
import LanguageSupportModal from './components/common/LanguageSupportModal';

// Pages
import LandingPage from './pages/LandingPage';
import UserPortalPage from './pages/UserPortalPage';
import JourneyChainPage from './pages/JourneyChainPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';
import DiscoverPage from './pages/DiscoverPage';
import FareMeterPage from './pages/FareMeterPage';
import SafeJourneyPage from './pages/SafeJourneyPage';
import EvidenceVaultPage from './pages/EvidenceVaultPage';
import IncidentReportPage from './pages/IncidentReportPage';
import TripPlannerPage from './pages/TripPlannerPage';
import PhraseHelperPage from './pages/PhraseHelperPage';
import BhashiniTranslatorPage from './pages/BhashiniTranslatorPage';

import { Sparkles, Mic, Languages } from 'lucide-react';

// Inner App Layout Container that dynamically adjusts to sidebar state
function AppLayout() {
  const [isQROpen, setIsQROpen] = useState(false);
  const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isBhashiniOpen, setIsBhashiniOpen] = useState(false);
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);
  const [bhashiniTargetLanguage, setBhashiniTargetLanguage] = useState('hi');
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Claude-Style Collapsible Sidebar Rail & Drawer */}
      <ClaudeSidebar onOpenQR={() => setIsQROpen(true)} />

      {/* 2. Main Content Wrapper (Adjusts margin based on sidebar state on desktop) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        } pb-28 md:pb-16`}
      >
        <Header 
          onOpenQR={() => setIsQROpen(true)}
          onOpenLang={() => setIsLangOpen(true)}
        />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/portal" element={<UserPortalPage />} />
            <Route path="/journey-chain" element={<JourneyChainPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/planner" element={<TripPlannerPage />} />
            <Route path="/trip-planner" element={<TripPlannerPage />} />
            <Route path="/phrase-helper" element={<PhraseHelperPage />} />
            <Route path="/bhashini-translator" element={<BhashiniTranslatorPage />} />
            <Route path="/language" element={<PhraseHelperPage />} />
            <Route path="/fare-meter" element={<FareMeterPage />} />
            <Route path="/safe-journey" element={<SafeJourneyPage />} />
            <Route path="/vault" element={<EvidenceVaultPage />} />
            <Route path="/incident" element={<IncidentReportPage />} />
            <Route path="/emergency" element={<IncidentReportPage />} />
            <Route path="/admin" element={<UserPortalPage />} />
          </Routes>
        </main>
      </div>

      {/* Floating Chatbot Launcher (TravelMate AI - cleanly aligned in bottom-left) */}
      <div className="fixed bottom-4 left-4 z-30 md:bottom-6 md:left-6 flex items-center">
        <button
          id="btn-floating-gemini-chat"
          onClick={() => setIsGeminiChatOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white px-3.5 py-2.5 rounded-full shadow-xl shadow-teal-600/30 border border-teal-400/40 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none"
          title="Ask TravelMate AI Assistant"
          aria-label="Open TravelMate AI Assistant"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide font-display hidden sm:inline">
            TravelMate AI
          </span>
        </button>
      </div>

      {/* Unified Floating Action Buttons Group (Bottom-Right: Voice Interaction & Bhashini AI) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2.5 sm:gap-3">
        {/* Red Voice Interaction Button */}
        <button
          id="btn-floating-helplines"
          onClick={() => setIsHelplineOpen(true)}
          className="group relative flex items-center justify-center space-x-2 h-11 sm:h-12 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 border border-rose-400/50 hover:ring-2 hover:ring-rose-400/60 hover:shadow-rose-500/40 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
          title="Voice Interaction & Emergency Helpline 1363 / 112"
          aria-label="Voice Interaction and Helpline"
        >
          <div className="relative flex items-center justify-center">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.2] animate-pulse shrink-0" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-red-600 animate-ping" />
          </div>
          <span className="text-xs font-bold font-display tracking-tight text-white hidden sm:inline whitespace-nowrap">
            Voice Interaction
          </span>
        </button>

        {/* Orange Bhashini AI Button */}
        <button
          id="btn-floating-bhashini-widget"
          onClick={() => setIsBhashiniOpen((prev) => !prev)}
          className="group relative flex items-center justify-center space-x-2 h-11 sm:h-12 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 border border-amber-300/50 hover:ring-2 hover:ring-amber-400/60 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
          title="Digital India Bhashini Multilingual AI Voice Translator"
          aria-label="Open Bhashini AI Multilingual Translator"
        >
          <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 stroke-[2.2] group-hover:rotate-12 transition-transform shrink-0" />
          <span className="text-xs font-extrabold font-display tracking-tight text-slate-950 hidden sm:inline whitespace-nowrap">
            Bhashini AI
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-950/20 text-[10px] font-mono font-black text-slate-950 shrink-0 uppercase">
            {bhashiniTargetLanguage}
          </span>
        </button>
      </div>

      {/* Floating Modals & Consoles */}
      <FloatingBhashiniWidget 
        isOpen={isBhashiniOpen} 
        onClose={() => setIsBhashiniOpen(false)} 
        hideLauncher={true}
        targetLanguage={bhashiniTargetLanguage}
        onTargetLanguageChange={setBhashiniTargetLanguage}
      />
      <HelplineFloatingBadge 
        isOpen={isHelplineOpen} 
        onClose={() => setIsHelplineOpen(false)} 
        hideLauncher={true}
      />

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Modals */}
      <QRModal isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
      <TMChatbotModal isOpen={isGeminiChatOpen} onClose={() => setIsGeminiChatOpen(false)} />
      <LanguageSupportModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TravelerProvider>
        <ToastProvider>
          <SidebarProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </SidebarProvider>
        </ToastProvider>
      </TravelerProvider>
    </ThemeProvider>
  );
}
