"use client";

import { useEffect, useState } from "react";

export function EmailCheckCountdown() {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Calculate next check time (rounds to next 10-minute mark)
  const getNextCheckTime = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const nextCheckMinute = Math.ceil(minutes / 10) * 10;
    const nextCheck = new Date(now);
    
    if (nextCheckMinute >= 60) {
      nextCheck.setHours(nextCheck.getHours() + 1);
      nextCheck.setMinutes(0);
    } else {
      nextCheck.setMinutes(nextCheckMinute);
    }
    nextCheck.setSeconds(0);
    nextCheck.setMilliseconds(0);
    
    return nextCheck;
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextCheck = getNextCheckTime();
      const diff = nextCheck.getTime() - now.getTime();
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
    };

    // Check for new emails indicator in localStorage
    const checkLastEmailCheck = () => {
      const stored = localStorage.getItem('lastEmailCheck');
      if (stored) {
        setLastCheck(new Date(stored));
      }
    };

    updateCountdown();
    checkLastEmailCheck();
    
    const interval = setInterval(() => {
      updateCountdown();
      checkLastEmailCheck();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeSinceLastCheck = lastCheck 
    ? Math.floor((Date.now() - lastCheck.getTime()) / 1000)
    : null;

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.9rem',
        color: '#6b7280'
      }}
    >
      {timeSinceLastCheck !== null && timeSinceLastCheck < 60 && (
        <span 
          style={{
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>✓</span>
          Checked {timeSinceLastCheck}s ago
        </span>
      )}
      <span 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <span>📬</span>
        Next check in{' '}
        <strong style={{ 
          color: timeLeft < 60 ? '#ef4444' : '#3b82f6',
          fontVariant: 'tabular-nums'
        }}>
          {formatTime(timeLeft)}
        </strong>
      </span>
    </div>
  );
}
