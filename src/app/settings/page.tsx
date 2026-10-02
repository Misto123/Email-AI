/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import { StickyNotification } from "@/components/sticky-notification";
import { AppHeader } from "@/components/app-header";

export default function SettingsPage() {
  const [model, setModel] = useState("openai/gpt-5.6-luna");
  const [spamThreshold, setSpamThreshold] = useState(80);
  const [spamKeywords, setSpamKeywords] = useState("");
  const [emailSignature, setEmailSignature] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | "warning">("info");

  useEffect(() => {
    fetch("/api/settings")
      .then((response) => response.json())
      .then((data: { 
        openrouter_model?: string;
        spam_threshold?: number;
        spam_keywords?: string;
        email_signature?: string;
      }) => {
        if (data.openrouter_model) setModel(data.openrouter_model);
        if (data.spam_threshold) setSpamThreshold(data.spam_threshold);
        if (data.spam_keywords) setSpamKeywords(data.spam_keywords);
        if (data.email_signature) setEmailSignature(data.email_signature);
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
          email_signature: emailSignature,
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
      <AppHeader activePage="settings" />
      <section className="content narrow">
        <p className="eyebrow">Configuration</p>
        <h1>Settings</h1>

        {/* Quick Links */}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          marginBottom: "2rem",
          padding: "1rem",
          background: "#f9fafb",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb"
        }}>
          <a href="/mailboxes" style={{ 
            flex: 1,
            padding: "1rem",
            background: "white",
            border: "1px solid #d1d5db",
            borderRadius: "0.5rem",
            textDecoration: "none",
            color: "#111827",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1rem",
            fontWeight: "500",
            transition: "all 0.2s"
          }} onMouseOver={(e) => e.currentTarget.style.borderColor = "#3b82f6"} onMouseOut={(e) => e.currentTarget.style.borderColor = "#d1d5db"}>
            <span style={{ fontSize: "1.5rem" }}>📫</span>
            Mailboxes
          </a>
          <a href="/bram-forward" style={{ 
            flex: 1,
            padding: "1rem",
            background: "white",
            border: "1px solid #d1d5db",
            borderRadius: "0.5rem",
            textDecoration: "none",
            color: "#111827",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1rem",
            fontWeight: "500",
            transition: "all 0.2s"
          }} onMouseOver={(e) => e.currentTarget.style.borderColor = "#3b82f6"} onMouseOut={(e) => e.currentTarget.style.borderColor = "#d1d5db"}>
            <span style={{ fontSize: "1.5rem" }}>📨</span>
            Forward Rules
          </a>
        </div>

        {/* AI Model Settings */}
        <div className="settings-card" style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>AI Model</h2>
          
          <div style={{ 
            padding: "1rem", 
            background: "#eff6ff", 
            border: "1px solid #3b82f6",
            borderRadius: "0.5rem",
            marginBottom: "1rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🤖</span>
              <strong style={{ color: "#1e40af" }}>Currently Using:</strong>
            </div>
            <div style={{ fontSize: "1.1rem", color: "#1e40af", fontWeight: "600" }}>
              {model === "deepseek/deepseek-r1" ? "DeepSeek R1 (via OpenRouter)" : model}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.25rem" }}>
              {model === "deepseek/deepseek-r1" && "✅ Cost-efficient reasoning model with automatic fallback to DeepSeek API"}
            </div>
          </div>
          
          <label htmlFor="model">OpenRouter model ID</label>
          <input
            id="model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
          />
          <p className="help" style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280" }}>
            Popular models: <code style={{ background: "#f3f4f6", padding: "0.2rem 0.4rem", borderRadius: "0.25rem" }}>deepseek/deepseek-r1</code>, <code style={{ background: "#f3f4f6", padding: "0.2rem 0.4rem", borderRadius: "0.25rem" }}>anthropic/claude-3.5-sonnet</code>, <code style={{ background: "#f3f4f6", padding: "0.2rem 0.4rem", borderRadius: "0.25rem" }}>openai/gpt-4o</code>
          </p>
          <p className="help" style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280" }}>
            🔑 API keys are configured on the server (OPENROUTER_API_KEY, DEEPSEEK_API_KEY) and never shown here.
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

        {/* Email Signature Settings */}
        <div className="settings-card" style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Email Signature</h2>
          
          <label htmlFor="signature">
            Signature (automatically added to all sent emails)
          </label>
          <textarea
            id="signature"
            value={emailSignature}
            onChange={(event) => setEmailSignature(event.target.value)}
            placeholder="Best regards,&#10;Your Name&#10;Your Company&#10;email@example.com"
            rows={6}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              resize: "vertical"
            }}
          />
          <p className="help" style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280" }}>
            This signature will be automatically appended to all AI-generated email replies. Leave blank if you don't want a signature.
          </p>
          <p className="help" style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#6b7280" }}>
            💡 Tip: Keep it simple and text-only (no HTML or formatting).
          </p>
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
