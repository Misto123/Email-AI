"use client";

import { useState } from "react";

interface EmailCheckCountdownProps {
  onCheckNow?: () => Promise<void>;
}

export function EmailCheckCountdown({ onCheckNow }: EmailCheckCountdownProps) {
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const handleCheckNow = async () => {
    if (!onCheckNow || checking) return;
    
    setChecking(true);
    try {
      await onCheckNow();
      setLastCheck(new Date());
      localStorage.setItem('lastEmailCheck', new Date().toISOString());
    } catch (error) {
      console.error('Check failed:', error);
    } finally {
      setChecking(false);
    }
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
          Just checked
        </span>
      )}
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
