"use client";

import { useState, useEffect } from "react";

interface EmailCheckCountdownProps {
  onCheckNow?: () => Promise<void>;
}

export function EmailCheckCountdown({ onCheckNow }: EmailCheckCountdownProps) {
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Load last check time from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('lastEmailCheck');
    if (stored) {
      setLastCheck(new Date(stored));
    }
  }, []);

  const handleCheckNow = async () => {
    if (!onCheckNow || checking) return;
    
    setChecking(true);
    try {
      await onCheckNow();
      const now = new Date();
      setLastCheck(now);
      localStorage.setItem('lastEmailCheck', now.toISOString());
    } catch (error) {
      console.error('Check failed:', error);
    } finally {
      setChecking(false);
    }
  };

  const formatLastCheck = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

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
      <button
        onClick={handleCheckNow}
        disabled={checking}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: checking ? '#e5e7eb' : '#3b82f6',
          color: checking ? '#9ca3af' : 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          cursor: checking ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          fontWeight: 500,
          transition: 'all 0.2s'
        }}
      >
        {checking ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
            Checking...
          </>
        ) : (
          <>
            📬 Check Now
          </>
        )}
      </button>
      
      {lastCheck && (
        <span 
          style={{
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.85rem'
          }}
        >
          <span>✓</span>
          Last check: {formatLastCheck(lastCheck)}
        </span>
      )}
      
      <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
        (Auto-check: every 1 hour)
      </span>
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
