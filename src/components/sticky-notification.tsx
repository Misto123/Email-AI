"use client";

import { useEffect, useState } from "react";

export function StickyNotification({ 
  message, 
  type = "info", 
  onClose 
}: { 
  message: string; 
  type?: "success" | "error" | "info" | "warning"; 
  onClose: () => void;
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for fade out
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message || !show) return null;

  const colors = {
    success: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
    error: { bg: "#fee2e2", border: "#dc2626", text: "#991b1b" },
    warning: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    info: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  };

  const color = colors[type];

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        maxWidth: "400px",
        padding: "1rem 1.5rem",
        background: color.bg,
        border: `2px solid ${color.border}`,
        borderRadius: "0.5rem",
        color: color.text,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        zIndex: 9999,
        animation: show ? "slideIn 0.3s ease-out" : "slideOut 0.3s ease-in",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => {
          setShow(false);
          setTimeout(onClose, 300);
        }}
        style={{
          background: "none",
          border: "none",
          color: color.text,
          cursor: "pointer",
          fontSize: "1.5rem",
          padding: "0",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}
