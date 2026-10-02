"use client";

import { useEffect, useState } from "react";
import { EmailCheckCountdown } from "@/components/email-check-countdown";

interface AppHeaderProps {
  activePage?: "inbox" | "mailboxes" | "settings" | "spam" | "archive";
  onCheckNow?: () => Promise<void>;
}

export function AppHeader({ activePage = "inbox", onCheckNow }: AppHeaderProps) {
  const [spamCount, setSpamCount] = useState(0);

  useEffect(() => {
    const loadSpamCount = async () => {
      try {
        const res = await fetch("/api/emails/spam-count");
        if (res.ok) {
          const data = await res.json();
          setSpamCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to load spam count:", error);
      }
    };
    loadSpamCount();
    const interval = setInterval(loadSpamCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const defaultCheckNow = async () => {
    try {
      const response = await fetch("/api/emails/check-now", { method: "POST" });
      if (!response.ok) throw new Error("Check failed");
      window.location.reload();
    } catch (error) {
      console.error("Check failed:", error);
      throw error;
    }
  };

  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <a className="brand" href="/">
          inbox<span>draft</span>
        </a>
        <span style={{ 
          fontSize: "0.7rem", 
          color: "#9ca3af",
          fontWeight: "500"
        }}>
          v1.0.16
        </span>
      </div>
      <nav>
        <a className={activePage === "inbox" ? "active" : ""} href="/drafts">
          Inbox
        </a>
        <a className={activePage === "mailboxes" ? "active" : ""} href="/mailboxes">
          Mailboxes
        </a>
        <a className={activePage === "settings" ? "active" : ""} href="/settings">
          Settings
        </a>
        <a className={activePage === "spam" ? "active" : ""} href="/spam">
          Spam {spamCount > 0 && <span style={{ 
            background: "#dc2626", 
            color: "white", 
            padding: "0.2rem 0.5rem", 
            borderRadius: "1rem", 
            fontSize: "0.75rem",
            marginLeft: "0.25rem"
          }}>{spamCount}</span>}
        </a>
        <a className={activePage === "archive" ? "active" : ""} href="/archive">
          Archive
        </a>
      </nav>
      <EmailCheckCountdown onCheckNow={onCheckNow || defaultCheckNow} />
    </header>
  );
}
