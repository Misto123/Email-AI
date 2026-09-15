/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useState } from "react";
import { StickyNotification } from "@/components/sticky-notification";

export default function AddMailboxPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prompt, setPrompt] = useState("");
  const [ai, setAi] = useState(true);
  const [language, setLanguage] = useState("en");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | "warning">("info");
  const [showInstructions, setShowInstructions] = useState(false);

  const showNotification = (msg: string, type: "success" | "error" | "info" | "warning" = "info") => {
    setMessage(msg);
    setMessageType(type);
  };

  const save = async () => {
    if (!email.trim() || !password.trim()) {
      showNotification("Email and password are required", "error");
      return;
    }

    try {
      const response = await fetch("/api/mailboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          prompt: prompt.trim(),
          ai_enabled: ai,
          reply_language: language,
        }),
      });

      if (response.ok) {
        showNotification("Mailbox added successfully! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = "/mailboxes";
        }, 1500);
      } else {
        const data = await response.json();
        showNotification(data.error || "Unable to add mailbox", "error");
      }
    } catch {
      showNotification("Failed to add mailbox", "error");
    }
  };

  return (
    <main className="mail-shell">
      <header className="topbar">
        <a className="brand" href="/">
          inbox<span>draft</span>
        </a>
        <nav>
          <a href="/drafts">Inbox</a>
          <a href="/mailboxes">Mailboxes</a>
          <a href="/settings">Settings</a>
          <a href="/spam">Spam</a>
        </nav>
      </header>
      <section className="content narrow">
        <p className="eyebrow">Add new mailbox</p>
        <h1>Connect Purelymail Account</h1>
        <p className="lede" style={{ marginBottom: "2rem" }}>
          Add a new Purelymail mailbox to start receiving and replying to emails.
        </p>

        {/* Instructions Panel */}
        <div className="settings-card" style={{ marginBottom: "2rem", background: "#f0f9ff", borderLeft: "4px solid #3b82f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, color: "#1e40af" }}>📖 How to Add Purelymail Mailboxes</h3>
            <button 
              onClick={() => setShowInstructions(!showInstructions)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}
            >
              {showInstructions ? "−" : "+"}
            </button>
          </div>
          
          {showInstructions && (
            <div style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
              <h4 style={{ marginTop: "1rem", color: "#1e40af" }}>🔐 Step 1: Get Your Credentials</h4>
              <ol style={{ marginLeft: "1.5rem" }}>
                <li>Log in to <a href="https://purelymail.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>purelymail.com</a></li>
                <li>Copy your email address and password</li>
              </ol>

              <h4 style={{ marginTop: "1.5rem", color: "#1e40af" }}>⚙️ Server Configuration (Automatic)</h4>
              <div style={{ background: "#e0f2fe", padding: "1rem", borderRadius: "0.5rem", fontFamily: "monospace", fontSize: "0.9rem" }}>
                <strong>IMAP:</strong> imap.purelymail.com:993 (SSL/TLS)<br />
                <strong>SMTP:</strong> smtp.purelymail.com:465 (SSL/TLS)
              </div>

              <h4 style={{ marginTop: "1.5rem", color: "#dc2626" }}>🔒 Security</h4>
              <ul style={{ marginLeft: "1.5rem", color: "#991b1b" }}>
                <li>Passwords encrypted with AES-256-GCM</li>
                <li>Never returned to browser</li>
                <li>All connections use SSL/TLS</li>
              </ul>
            </div>
          )}
        </div>

        <div className="settings-card">
          <h2>Mailbox Details</h2>

          <label htmlFor="email">Email address *</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="sales@example.com"
          />

          <label htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your Purelymail password"
          />

          <label className="check">
            <input
              type="checkbox"
              checked={ai}
              onChange={(event) => setAi(event.target.checked)}
            />{" "}
            AI drafting enabled
          </label>

          <label htmlFor="language">
            Reply Language{" "}
            <small style={{ color: "#6b7280" }}>(AI will respond in this language)</small>
          </label>
          <select
            id="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
          >
            <option value="en">English</option>
            <option value="es">Spanish (Español)</option>
            <option value="fr">French (Français)</option>
            <option value="de">German (Deutsch)</option>
            <option value="it">Italian (Italiano)</option>
            <option value="pt">Portuguese (Português)</option>
            <option value="nl">Dutch (Nederlands)</option>
            <option value="pl">Polish (Polski)</option>
            <option value="ru">Russian (Русский)</option>
            <option value="zh">Chinese (中文)</option>
            <option value="ja">Japanese (日本語)</option>
            <option value="ko">Korean (한국어)</option>
            <option value="ar">Arabic (العربية)</option>
          </select>

          <label htmlFor="prompt">
            AI instructions{" "}
            <small style={{ color: "#6b7280" }}>(optional, mailbox-specific)</small>
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="E.g., Reply professionally and concisely. Always mention our 30-day money-back guarantee..."
            rows={4}
          />

          <div className="actions" style={{ marginTop: "2rem" }}>
            <button className="button primary" onClick={() => void save()}>
              ➕ Add Mailbox
            </button>
            <a href="/mailboxes" className="button ghost">
              Cancel
            </a>
          </div>
        </div>
      </section>
      <StickyNotification
        message={message}
        type={messageType}
        onClose={() => setMessage("")}
      />
    </main>
  );
}
