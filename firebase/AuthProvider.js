// AuthProvider.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './config';
import * as authService from './auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Uygulama başlangıcında kullanıcıyı kontrol et
    checkUser();
    
    // Auth durumu değişikliklerini dinle
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error("Check user error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    try {
      const user = await authService.signIn(email, password);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function signUp(email, password, displayName) {
    try {
      const user = await authService.signUp(email, password, displayName);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      throw error;
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Auth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};