import React, { useState } from 'react';
import HeroSection from '../components/landing/HeroSection';
import QuickStats from '../components/landing/QuickStats';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import Footer from '../components/landing/Footer';
import AuthModal from '../components/auth/AuthModal';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Hero Section */}
      <HeroSection onOpenSafePassModal={() => setIsModalOpen(true)} />

      {/* 2. Quick Key Stats Bar */}
      <QuickStats />

      {/* 3. Core Features Grid */}
      <FeaturesGrid />

      {/* 4. Testimonials Section */}
      <TestimonialsSection />

      {/* 5. Footer */}
      <Footer />

      {/* Real OTP SafePass Authentication Modal */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => navigate('/portal')}
      />
    </div>
  );
}
