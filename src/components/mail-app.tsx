/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import type { Draft } from "@/lib/mail-types";

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Unknown date";

export function MailApp() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/drafts");
      if (!response.ok) {
        throw new Error(`Failed to load drafts: ${response.statusText}`);
      }
      const data = await response.json();
      setDrafts(data);
    } catch (err) {
      console.error("Error loading drafts:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load drafts. Please ensure the database is set up correctly."
      );
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const update = async (id: string, body: Record<string, string>) => {
    const response = await fetch(`/api/drafts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error();
  };

  const send = async (draft: Draft) => {
    if (!window.confirm("Send this reply now?")) return;
    try {
      await update(draft.id, { draft_body: draft.draft_body });
      const response = await fetch(`/api/drafts/${draft.id}/send`, {
        method: "POST",
      });
      if (!response.ok) throw new Error();
      setMessage("✅ Reply sent successfully!");
      void load();
    } catch {
      setMessage("❌ Unable to send reply.");
    }
  };

  const remove = async (id: string) => {
    try {
      await update(id, { status: "deleted" });
      setDrafts((items) => items.filter((item) => item.id !== id));
      setMessage("✅ Draft deleted");
    } catch {
      setMessage("❌ Unable to delete draft");
    }
  };

  const deleteSpam = async (emailId: string, draftId: string) => {
    if (!window.confirm("Delete this spam email from inbox and database?")) return;
    try {
      const response = await fetch(`/api/emails/${emailId}/delete-spam`, {
        method: "POST",
      });
      if (!response.ok) throw new Error();
      setDrafts((items) => items.filter((item) => item.id !== draftId));
      setMessage("✅ Spam deleted from inbox!");
    } catch {
      setMessage("❌ Unable to delete spam");
    }
  };

  const getSpamLabel = (score: number) => {
    if (score >= 80) return { emoji: "🚫", text: "Very High Spam", color: "#dc2626" };
    if (score >= 60) return { emoji: "⚠️", text: "High Spam", color: "#ea580c" };
    if (score >= 40) return { emoji: "⚡", text: "Possible Spam", color: "#f59e0b" };
    if (score >= 20) return { emoji: "⚪", text: "Low Spam", color: "#84cc16" };
    return { emoji: "✅", text: "Legitimate", color: "#10b981" };
  };

  return (
    <main className="mail-shell">
      <header className="topbar">
        <a className="brand" href="/">
          inbox<span>draft</span>
        </a>
        <nav>
          <a className="active" href="/">
            Drafts
          </a>
          <a href="/mailboxes">Mailboxes</a>
          <a href="/settings">Settings</a>
        </nav>
      </header>
      <section className="content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Human approval queue</p>
            <h1>AI drafts</h1>
            <p className="lede">
              Review every suggested reply before it leaves your inbox.
            </p>
          </div>
          <span className="count">{drafts.length} open</span>
        </div>

        {message && (
          <p
            className="notice"
            style={{
              padding: "1rem",
              borderRadius: "0.5rem",
              background: message.startsWith("✅")
                ? "#d1fae5"
                : "#fee2e2",
              color: message.startsWith("✅") ? "#065f46" : "#991b1b",
              marginBottom: "1rem",
            }}
          >
            {message}
          </p>
        )}

        {loading && (
          <div
            style={{
              padding: "4rem 2rem",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</p>
            <p style={{ fontSize: "1.2rem" }}>Loading drafts...</p>
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              padding: "3rem 2rem",
              textAlign: "center",
              background: "#fef2f2",
              borderRadius: "0.75rem",
              border: "2px solid #dc2626",
              maxWidth: "600px",
              margin: "2rem auto",
            }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</p>
            <p
              style={{
                color: "#991b1b",
                fontWeight: "bold",
                fontSize: "1.2rem",
                marginBottom: "0.5rem",
              }}
            >
              Database Connection Error
            </p>
            <p
              style={{
                color: "#991b1b",
                fontSize: "0.95rem",
                marginBottom: "1.5rem",
              }}
            >
              {error}
            </p>
            <div
              style={{
                background: "#fee2e2",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                textAlign: "left",
                fontSize: "0.95rem",
              }}
            >
              <p
                style={{
                  fontWeight: "bold",
                  marginBottom: "0.75rem",
                  color: "#991b1b",
                }}
              >
                🔧 To fix this issue:
              </p>
              <ol style={{ marginLeft: "1.5rem", color: "#7f1d1d" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  Open the{" "}
                  <a
                    href="https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#dc2626",
                      textDecoration: "underline",
                      fontWeight: "bold",
                    }}
                  >
                    Supabase SQL Editor
                  </a>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Run the database migration from{" "}
                  <code
                    style={{
                      background: "#fff",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "0.25rem",
                      color: "#dc2626",
                    }}
                  >
                    /supabase/migrations/001_email_drafts.sql
                  </code>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Click the <strong>"Run"</strong> button
                </li>
                <li>Reload this page</li>
              </ol>
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  background: "#fff",
                  borderRadius: "0.25rem",
                  fontSize: "0.85rem",
                  color: "#6b7280",
                }}
              >
                💡 Need help? Check{" "}
                <code style={{ color: "#dc2626" }}>MEMORY.md</code> for
                step-by-step instructions.
              </div>
            </div>
          </div>
        )}

        {!loading && !error && drafts.length === 0 && (
          <div className="empty">
            <strong>📭 No drafts yet</strong>
            <span>
              New messages will appear here after the next daily check at
              midnight.
            </span>
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.9rem",
                color: "#6b7280",
              }}
            >
              💡 Tip: Add mailboxes in the{" "}
              <a
                href="/mailboxes"
                style={{ color: "#3b82f6", textDecoration: "underline" }}
              >
                Mailboxes
              </a>{" "}
              page to get started.
            </p>
          </div>
        )}

        {!loading && !error && drafts.length > 0 && (
          <div className="draft-list">
            {drafts.map((draft) => {
              const spamScore = draft.emails.spam_score || 0;
              const spamLabel = getSpamLabel(spamScore);
              const isHighSpam = spamScore >= 60;
              
              return (
              <article className="draft-card" key={draft.id} style={isHighSpam ? { borderLeft: "4px solid #dc2626", background: "#fef2f2" } : {}}>
                <div className="draft-meta">
                  <span>📧 {draft.emails.mailboxes.email}</span>
                  <time>{formatDate(draft.emails.received_at)}</time>
                </div>
                
                {/* Spam Score Badge */}
                <div style={{ 
                  display: "inline-block", 
                  padding: "0.25rem 0.75rem", 
                  borderRadius: "1rem", 
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  background: spamScore >= 60 ? "#fee2e2" : spamScore >= 40 ? "#fef3c7" : "#f0fdf4",
                  color: spamLabel.color,
                  marginBottom: "0.5rem"
                }}>
                  {spamLabel.emoji} Spam Score: {spamScore}/100 - {spamLabel.text}
                </div>

                <h2>{draft.emails.subject || "(No subject)"}</h2>
                <p className="sender">
                  {draft.emails.from_name || draft.emails.from_email || "Unknown sender"}{" "}
                  <span>{draft.emails.from_email}</span>
                </p>
                <p className="original">
                  {draft.emails.body?.slice(0, 220)}
                  {(draft.emails.body?.length || 0) > 220 ? "..." : ""}
                </p>
                <textarea
                  aria-label="Draft reply"
                  defaultValue={draft.draft_body}
                  onChange={(event) => {
                    draft.draft_body = event.target.value;
                  }}
                />
                <div className="actions">
                  <button
                    className="button ghost"
                    onClick={() =>
                      update(draft.id, { draft_body: draft.draft_body }).then(
                        () => setMessage("✅ Draft saved.")
                      )
                    }
                  >
                    💾 Edit / Save
                  </button>
                  <button
                    className="button primary"
                    onClick={() => void send(draft)}
                  >
                    📤 Send
                  </button>
                  {isHighSpam && (
                    <button
                      className="button danger"
                      onClick={() => void deleteSpam(draft.emails.id, draft.id)}
                      style={{ background: "#dc2626" }}
                    >
                      🚫 Delete Spam
                    </button>
                  )}
                  <button
                    className="button danger"
                    onClick={() => void remove(draft.id)}
                  >
                    🗑️ Delete Draft
                  </button>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
