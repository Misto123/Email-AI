/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import type { Mailbox } from "@/lib/mail-types";

export default function MailboxesPage() {
  const [items, setItems] = useState<Mailbox[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prompt, setPrompt] = useState("");
  const [ai, setAi] = useState(true);
  const [message, setMessage] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  const load = () =>
    fetch("/api/mailboxes")
      .then((response) => response.json())
      .then(setItems);

  useEffect(() => {
    void load();
  }, []);

  const reset = () => {
    setEditing(null);
    setEmail("");
    setPassword("");
    setPrompt("");
    setAi(true);
  };

  const save = async () => {
    const payload = { email, password, prompt, ai_enabled: ai };
    const url = editing ? `/api/mailboxes/${editing}` : "/api/mailboxes";
    const response = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      reset();
      void load();
      setMessage("✅ Mailbox saved successfully!");
    } else {
      const data = await response.json();
      setMessage(`❌ ${data.error || "Unable to save mailbox."}`);
    }
  };

  const edit = (mailbox: Mailbox) => {
    setEditing(mailbox.id);
    setEmail(mailbox.email);
    setPrompt(mailbox.prompt || "");
    setAi(mailbox.ai_enabled);
    setPassword("");
  };

  const test = async (id: string, type: "imap" | "smtp") => {
    setMessage("🔄 Testing connection...");
    const response = await fetch(`/api/mailboxes/${id}/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const data = await response.json();
    setMessage(data.message || data.error);
  };

  return (
    <main className="mail-shell">
      <header className="topbar">
        <a className="brand" href="/">
          inbox<span>draft</span>
        </a>
        <nav>
          <a href="/">Drafts</a>
          <a className="active" href="/mailboxes">
            Mailboxes
          </a>
          <a href="/settings">Settings</a>
        </nav>
      </header>
      <section className="content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Purelymail connections</p>
            <h1>Mailboxes</h1>
            <p className="lede">
              Connect up to 20 inboxes. Passwords are encrypted and never
              returned to the browser.
            </p>
          </div>
          <span className="count">{items.length} / 20</span>
        </div>

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
              <h4 style={{ marginTop: "1rem", color: "#1e40af" }}>🔐 Step 1: Get Your Purelymail Credentials</h4>
              <ol style={{ marginLeft: "1.5rem" }}>
                <li>Log in to your Purelymail account at <a href="https://purelymail.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>purelymail.com</a></li>
                <li>Go to your email settings/mailbox configuration</li>
                <li>Copy your email address and password</li>
              </ol>

              <h4 style={{ marginTop: "1.5rem", color: "#1e40af" }}>📧 Step 2: Enter Connection Details</h4>
              <ul style={{ marginLeft: "1.5rem" }}>
                <li><strong>Email Address:</strong> Your full Purelymail email (e.g., sales@yourdomain.com)</li>
                <li><strong>Password:</strong> Your mailbox password (encrypted with AES-256-GCM)</li>
                <li><strong>AI Instructions:</strong> Optional custom prompt for this specific mailbox</li>
              </ul>

              <h4 style={{ marginTop: "1.5rem", color: "#1e40af" }}>⚙️ Server Configuration (Automatic)</h4>
              <div style={{ background: "#e0f2fe", padding: "1rem", borderRadius: "0.5rem", fontFamily: "monospace", fontSize: "0.9rem" }}>
                <strong>IMAP:</strong> imap.purelymail.com:993 (SSL/TLS)<br />
                <strong>SMTP:</strong> smtp.purelymail.com:465 (SSL/TLS)
              </div>

              <h4 style={{ marginTop: "1.5rem", color: "#1e40af" }}>✅ Step 3: Test & Save</h4>
              <ol style={{ marginLeft: "1.5rem" }}>
                <li>Click "Add mailbox" to save your configuration</li>
                <li>Click "Test IMAP" to verify incoming mail connection</li>
                <li>Click "Test SMTP" to verify outgoing mail connection</li>
                <li>Both tests should return success messages</li>
              </ol>

              <h4 style={{ marginTop: "1.5rem", color: "#dc2626" }}>🔒 Security Notes</h4>
              <ul style={{ marginLeft: "1.5rem", color: "#991b1b" }}>
                <li>Passwords are encrypted before storage using AES-256-GCM</li>
                <li>Encrypted passwords are NEVER returned to the browser</li>
                <li>All IMAP/SMTP connections use SSL/TLS encryption</li>
                <li>Server-side code handles all email operations</li>
              </ul>
            </div>
          )}
        </div>

        <div className="mailbox-layout">
          <div className="settings-card">
            <h2>{editing ? "Edit mailbox" : "Add mailbox"}</h2>

            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="sales@example.com"
            />

            <label htmlFor="password">
              Password{" "}
              {editing && (
                <small style={{ color: "#6b7280" }}>
                  (leave blank to keep current)
                </small>
              )}
            </label>
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

            <div className="actions">
              <button className="button primary" onClick={() => void save()}>
                {editing ? "💾 Save changes" : "➕ Add mailbox"}
              </button>
              {editing && (
                <button className="button ghost" onClick={reset}>
                  Cancel
                </button>
              )}
            </div>

            {message && (
              <p
                className="notice"
                style={{
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  background: message.startsWith("✅") ? "#d1fae5" : message.startsWith("🔄") ? "#dbeafe" : "#fee2e2",
                  color: message.startsWith("✅") ? "#065f46" : message.startsWith("🔄") ? "#1e40af" : "#991b1b",
                  marginTop: "1rem",
                }}
              >
                {message}
              </p>
            )}
          </div>

          <div className="mailbox-list">
            {items.length === 0 && (
              <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>📭</p>
                <p>No mailboxes configured yet.</p>
                <p style={{ fontSize: "0.9rem" }}>Add your first Purelymail mailbox to get started!</p>
              </div>
            )}
            
            {items.map((mailbox) => (
              <article className="mailbox-row" key={mailbox.id}>
                <div>
                  <strong>{mailbox.email}</strong>
                  <span>
                    {mailbox.ai_enabled ? "🤖 AI enabled" : "⏸️ AI paused"}
                  </span>
                  {mailbox.prompt && (
                    <small style={{ display: "block", color: "#6b7280", marginTop: "0.25rem" }}>
                      Custom instructions: {mailbox.prompt.substring(0, 60)}
                      {mailbox.prompt.length > 60 ? "..." : ""}
                    </small>
                  )}
                </div>
                <div className="row-actions">
                  <button onClick={() => edit(mailbox)}>✏️ Edit</button>
                  <button onClick={() => void test(mailbox.id, "imap")}>
                    📥 Test IMAP
                  </button>
                  <button onClick={() => void test(mailbox.id, "smtp")}>
                    📤 Test SMTP
                  </button>
                  <button
                    className="delete-link"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete ${mailbox.email}? This cannot be undone.`
                        )
                      ) {
                        fetch(`/api/mailboxes/${mailbox.id}`, {
                          method: "DELETE",
                        }).then(() => {
                          setMessage("✅ Mailbox deleted");
                          void load();
                        });
                      }
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
