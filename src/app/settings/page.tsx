/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import { StickyNotification } from "@/components/sticky-notification";

export default function SettingsPage() {
  const [model, setModel] = useState("openai/gpt-5.6-luna");
  const [spamThreshold, setSpamThreshold] = useState(80);
  const [spamKeywords, setSpamKeywords] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | "warning">("info");

  useEffect(() => {
    fetch("/api/settings")
      .then((response) => response.json())
      .then((data: { 
        openrouter_model?: string;
        spam_threshold?: number;
        spam_keywords?: string;
      }) => {
        if (data.openrouter_model) setModel(data.openrouter_model);
        if (data.spam_threshold) setSpamThreshold(data.spam_threshold);
        if (data.spam_keywords) setSpamKeywords(data.spam_keywords);
      });
  }, []);

  const showNotification = (msg: string, type: "success" | "error" | "info" | "warning" = "info") => {
    setMessage(msg);
    setMessageType(type);
  };

  const save = async () => {
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openrouter_model: model,
          spam_threshold: spamThreshold,
          spam_keywords: spamKeywords,
        }),
      });
      if (response.ok) {
        showNotification("Settings saved successfully!", "success");
      } else {
        showNotification("Unable to save settings", "error");
      }
    } catch {
      showNotification("Failed to save settings", "error");
    }
  };

  const defaultKeywords = [
    "Boost Your Google Rankings",
    "Backlinks",
    "Guest post",
    "Opportunity",
    "Permanent Reviews",
    "SEO",
    "Premium guest posting",
    "High authority",
    "Do-follow",
    "Niche relevant"
  ];

  return (
    <main className="mail-shell">
      <header className="topbar">
        <a className="brand" href="/">
          inbox<span>draft</span>
        </a>
        <nav>
          <a href="/drafts">Inbox</a>
          <a href="/mailboxes">Mailboxes</a>
          <a className="active" href="/settings">
            Settings
          </a>
          <a href="/spam">Spam</a>
        </nav>
      </header>
      <section className="content narrow">
        <p className="eyebrow">Configuration</p>
        <h1>Settings</h1>

        {/* AI Model Settings */}
        <div className="settings-card" style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>AI Model</h2>
          <label htmlFor="model">OpenRouter model</label>
          <input
            id="model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
          />
          <p className="help" style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280" }}>
            The API key is configured only on the server and is never shown here.
          </p>
        </div>

        {/* Spam Detection Settings */}
        <div className="settings-card" style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Spam Detection</h2>
          
          <label htmlFor="threshold">
            Auto-hide spam threshold (0-100)
          </label>
          <input
            id="threshold"
            type="number"
            min="0"
            max="100"
            value={spamThreshold}
            onChange={(event) => setSpamThreshold(Number(event.target.value))}
            style={{ marginBottom: "0.5rem" }}
          />
          <p className="help" style={{ marginBottom: "1.5rem", fontSize: "0.9rem", color: "#6b7280" }}>
            Emails with spam score ≥ {spamThreshold} will be automatically hidden from inbox. Default: 80
          </p>

          <label htmlFor="keywords">
            Spam keywords (one per line)
          </label>
          <textarea
            id="keywords"
            value={spamKeywords}
            onChange={(event) => setSpamKeywords(event.target.value)}
            placeholder={defaultKeywords.join("\n")}
            rows={10}
            style={{ fontFamily: "monospace", fontSize: "0.9rem" }}
          />
          <p className="help" style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280" }}>
            Emails containing these keywords in subject or body will receive higher spam scores.
          </p>
          
          <details style={{ marginTop: "1rem" }}>
            <summary style={{ cursor: "pointer", color: "#3b82f6", fontSize: "0.9rem" }}>
              📋 Default spam indicators
            </summary>
            <ul style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#6b7280", paddingLeft: "1.5rem" }}>
              {defaultKeywords.map((kw) => (
                <li key={kw}>{kw}</li>
              ))}
            </ul>
          </details>
        </div>

        <button
          className="button primary"
          onClick={() => void save()}
          style={{ width: "100%" }}
        >
          💾 Save Settings
        </button>
      </section>
      <StickyNotification
        message={message}
        type={messageType}
        onClose={() => setMessage("")}
      />
    </main>
  );
}
