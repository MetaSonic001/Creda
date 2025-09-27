// src/components/AlwaysOnVoice.tsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReliableVoice } from '@/hooks/useReliableVoice';

export const AlwaysOnVoice = () => {
  const nav = useNavigate();
  const lastCommandRef = useRef<string>(''); // prevent double fire

  const { isActive, currentTranscript, permissionGranted } = useReliableVoice({
    enableAudioResponse: false,
  });

  /* ----------  ROUTING TABLE  ---------- */
  const pageMap: Record<string, string> = {
    dashboard: '/dashboard',
    portfolio: '/portfolio',
    budget: '/budget',
    goals: '/goals',
    settings: '/settings',
    voice: '/voice',
    health: '/health',
    advisory: '/advisory',
    expense: '/expense-analytics',
    help: '/help',
  };

  /* ---- react to every final transcript ---- */
  useEffect(() => {
    if (!currentTranscript || isActive) return; // wait until listening ends
    
    if (currentTranscript === lastCommandRef.current) return; // debounce
    lastCommandRef.current = currentTranscript;

    const cmd = currentTranscript.toLowerCase().replace(/hey creda|ok creda|hello creda/g, '').trim();
    const route = Object.keys(pageMap).find((k) => cmd.includes(k));
    if (route) {
      nav(pageMap[route]);
      console.log('🎯 Navigated to', pageMap[route]);
    }
  }, [currentTranscript, isActive, nav]);

  /* ---- auto-start wake-word listener ---- */
  useEffect(() => {
    if (permissionGranted && !isActive) {
      // ReliableVoice auto-restarts; we just ensure first start
    }
  }, [permissionGranted, isActive]);

  return null; // no UI
};