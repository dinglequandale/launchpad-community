import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSubdomain } from '../utils/subdomainUtils';

const SocietyContext = createContext();

// Map of valid society subdomains to society IDs
const SOCIETY_SUBDOMAINS = {
  hsfs: 'hsfs',
};

export function SocietyProvider({ children }) {
  const [currentSociety, setCurrentSociety] = useState(() => {
    // 1. Check subdomain
    const subdomain = getSubdomain();
    if (SOCIETY_SUBDOMAINS[subdomain]) {
      return SOCIETY_SUBDOMAINS[subdomain];
    }

    // 2. Check localStorage
    const stored = localStorage.getItem('activeSociety');
    if (stored && SOCIETY_SUBDOMAINS[stored]) {
      return stored;
    }

    return null;
  });

  const isSociety = currentSociety !== null;

  const setSociety = useCallback((societyId) => {
    localStorage.setItem('activeSociety', societyId);
    setCurrentSociety(societyId);
  }, []);

  const clearSociety = useCallback(() => {
    localStorage.removeItem('activeSociety');
    setCurrentSociety(null);
  }, []);

  // Keep localStorage in sync
  useEffect(() => {
    if (currentSociety) {
      localStorage.setItem('activeSociety', currentSociety);
    }
  }, [currentSociety]);

  const value = {
    currentSociety,
    isSociety,
    setSociety,
    clearSociety,
  };

  return (
    <SocietyContext.Provider value={value}>
      {children}
    </SocietyContext.Provider>
  );
}

export function useSociety() {
  const context = useContext(SocietyContext);
  if (context === undefined) {
    throw new Error('useSociety must be used within a SocietyProvider');
  }
  return context;
}
