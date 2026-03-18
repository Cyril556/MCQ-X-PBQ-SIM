import { useState, useEffect, useCallback } from 'react';

interface UseTimerProps {
  durationMinutes: number;
  startTime: number;
  onExpire: () => void;
  paused?: boolean;
}

export function useTimer({ durationMinutes, startTime, onExpire, paused }: UseTimerProps) {
  const totalSeconds = durationMinutes * 60;
  
  const getRemaining = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, totalSeconds - elapsed);
  }, [startTime, totalSeconds]);

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const r = getRemaining();
      setRemaining(r);
      if (r <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getRemaining, onExpire, paused]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = remaining <= 300 && remaining > 60;
  const isCritical = remaining <= 60;

  return { remaining, display, isWarning, isCritical };
}
