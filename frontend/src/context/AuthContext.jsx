import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('tm_auth_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tm_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [journey, setJourney] = useState(() => {
    const saved = localStorage.getItem('tm_journey');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Validate active token on initial app mount
  useEffect(() => {
    async function validateSession() {
      const savedToken = localStorage.getItem('tm_auth_token');
      if (savedToken) {
        try {
          const res = await api.getMe(savedToken);
          if (res.success && res.traveler) {
            setUser(res.traveler);
            if (res.journey) {
              setJourney(res.journey);
              localStorage.setItem('tm_journey', JSON.stringify(res.journey));
            }
            localStorage.setItem('tm_auth_user', JSON.stringify(res.traveler));
          } else {
            // Token is invalid/expired on server
            console.warn('[Auth] Server rejected token, clearing local session');
            handleLogoutLocally();
          }
        } catch (err) {
          console.warn('[Auth] Network error during session validation, preserving offline token:', err.message);
        }
      }
      setIsLoading(false);
    }

    validateSession();
  }, []);

  const handleLogoutLocally = () => {
    localStorage.removeItem('tm_auth_token');
    localStorage.removeItem('tm_auth_user');
    localStorage.removeItem('tm_traveler');
    localStorage.removeItem('tm_journey');
    setToken(null);
    setUser(null);
    setJourney(null);
  };

  /**
   * Request OTP code to email or mobile phone
   */
  const sendOtp = async (identifier, type = 'email', name = '') => {
    return await api.sendOtp({ identifier, type, name });
  };

  /**
   * Verify entered 6-digit OTP and establish authenticated session
   */
  const verifyOtp = async (identifier, otp) => {
    const res = await api.verifyOtp({ identifier, otp });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.traveler);
      localStorage.setItem('tm_auth_token', res.token);
      localStorage.setItem('tm_auth_user', JSON.stringify(res.traveler));
      
      // Synchronize traveler context storage
      localStorage.setItem('tm_traveler', JSON.stringify(res.traveler));
      if (res.journey) {
        setJourney(res.journey);
        localStorage.setItem('tm_journey', JSON.stringify(res.journey));
      }
      return { success: true, user: res.traveler, journey: res.journey };
    }
    return { success: false, error: res.error || 'Verification failed.' };
  };

  /**
   * Logout user, terminate server session, and clear credentials
   */
  const logout = async () => {
    if (token) {
      try {
        await api.logout(token);
      } catch (e) {
        console.warn('[Auth] Server logout notification error:', e.message);
      }
    }
    handleLogoutLocally();
    return { success: true };
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        journey,
        token,
        isAuthenticated,
        isLoading,
        sendOtp,
        verifyOtp,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
