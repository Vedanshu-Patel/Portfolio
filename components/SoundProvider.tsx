'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { playSound, type SoundType } from '@/lib/sound';

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
  play: (type: SoundType) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);
const STORAGE_KEY = 'vp-sound-enabled';

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'true') setEnabled(true);
    } catch {
      // ignore — privacy mode or quota issues
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      playSound('toggle');
      return next;
    });
  }, []);

  const play = useCallback(
    (type: SoundType) => {
      if (enabled) playSound(type);
    },
    [enabled],
  );

  return (
    <SoundContext.Provider value={{ enabled, toggle, play }}>{children}</SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    return {
      enabled: false,
      toggle: () => {},
      play: () => {},
    } satisfies SoundContextValue;
  }
  return ctx;
}
