import React, { createContext, useContext, useState, useEffect } from 'react';
import { getHapticsPreferences, setHapticsPreferences, isHapticsSupported } from '@/lib/haptics';

interface HapticsContextType {
  enabled: boolean;
  intensity: number;
  supported: boolean;
  setEnabled: (enabled: boolean) => void;
  setIntensity: (intensity: number) => void;
}

const HapticsContext = createContext<HapticsContextType | undefined>(undefined);

export const HapticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabledState] = useState(true);
  const [intensity, setIntensityState] = useState(100);
  const [supported] = useState(isHapticsSupported());

  // Load preferences on mount
  useEffect(() => {
    const prefs = getHapticsPreferences();
    setEnabledState(prefs.enabled);
    setIntensityState(prefs.intensity);
  }, []);

  const setEnabled = (value: boolean) => {
    setEnabledState(value);
    setHapticsPreferences(value, intensity);
  };

  const setIntensity = (value: number) => {
    setIntensityState(value);
    setHapticsPreferences(enabled, value);
  };

  return (
    <HapticsContext.Provider
      value={{
        enabled,
        intensity,
        supported,
        setEnabled,
        setIntensity,
      }}
    >
      {children}
    </HapticsContext.Provider>
  );
};

export const useHapticsContext = () => {
  const context = useContext(HapticsContext);
  if (!context) {
    throw new Error('useHapticsContext must be used within HapticsProvider');
  }
  return context;
};
