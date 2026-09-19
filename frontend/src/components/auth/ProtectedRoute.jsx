import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Sparkles } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center p-3 shadow-xl shadow-emerald-500/20 animate-pulse">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold font-display text-white">
            Verifying TravelMate Session
          </h2>
          <p className="text-xs text-slate-400">
            Checking encrypted SafePass token &amp; permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated user to login with original destination saved
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
