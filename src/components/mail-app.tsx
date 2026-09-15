/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import type { Draft, PendingEmail } from "@/lib/mail-types";
import { StickyNotification } from "./sticky-notification";

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Unknown date";

export function MailApp() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [pendingEmails, setPendingEmails] = useState<PendingEmail[]>([]);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | "warning">("info");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spamCount, setSpamCount] = useState(0);

  const showNotification = (msg: string, type: "success" | "error" | "info" | "warning" = "info") => {
    setMessage(msg);
    setMessageType(type);
  };

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load drafts
      const draftsResponse = await fetch("/api/drafts");
      if (!draftsResponse.ok) {
        throw new Error(`Failed to load drafts: ${draftsResponse.statusText}`);
      }
      const draftsData = await draftsResponse.json();
      setDrafts(draftsData);
      
      // Load pending emails (no drafts yet)
      const pendingResponse = await fetch("/api/emails/pending");
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingEmails(pendingData);
      }
      
      // Load spam count
      setSpamCount(0);
    } catch (err) {
      console.error("Error loading drafts:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load drafts. Please ensure the database is set up correctly."
      );
      setDrafts([]);
      setPendingEmails([]);
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
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to update");
    }
  };

  const send = async (draft: Draft) => {
    if (!window.confirm("Send this reply now?")) return;
    try {
      await update(draft.id, { draft_body: draft.draft_body });
      const response = await fetch(`/api/drafts/${draft.id}/send`, {
        method: "POST",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send");
      }
      showNotification("Reply sent successfully!", "success");
      void load();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Unable to send reply", "error");
    }
  };

  const remove = async (id: string) => {
    try {
      await update(id, { status: "deleted" });
      setDrafts((items) => items.filter((item) => item.id !== id));
      showNotification("Draft deleted", "success");
    } catch {
      showNotification("Unable to delete draft", "error");
    }
  };

  const deleteSpam = async (emailId: string, draftId: string) => {
    if (!window.confirm("Delete this spam email from inbox and database?")) return;
    try {
      const response = await fetch(`/api/emails/${emailId}/delete-spam`, {
        method: "POST",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }
      setDrafts((items) => items.filter((item) => item.id !== draftId));
      showNotification("Spam deleted from inbox!", "success");
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Unable to delete spam", "error");
    }
  };

  const getSpamLabel = (score: number) => {
    if (score >= 80) return { emoji: "🚫", text: "Very High Spam", color: "#dc2626" };
    if (score >= 60) return { emoji: "⚠️", text: "High Spam", color: "#ea580c" };
    if (score >= 40) return { emoji: "⚡", text: "Possible Spam", color: "#f59e0b" };
    if (score >= 20) return { emoji: "⚪", text: "Low Spam", color: "#84cc16" };
    return { emoji: "✅", text: "Legitimate", color: "#10b981" };
  };

  const markAsSpam = async (emailId: string, draftId: string) => {
    if (!window.confirm("Mark this as spam? This will help improve spam detection.")) return;
    try {
      const response = await fetch(`/api/emails/${emailId}/mark-spam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_spam: true }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to mark as spam");
      }
      // Remove from drafts if it has a draft
      if (draftId) {
        setDrafts((items) => items.filter((item) => item.id !== draftId));
      }
      // Remove from pending emails
      setPendingEmails((items) => items.filter((item) => item.id !== emailId));
      showNotification("Marked as spam! System is learning...", "success");
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Unable to mark as spam. Migration may be required.", "error");
    }
  };

  const archiveEmail = async (emailId: string, draftId: string) => {
    try {
      const response = await fetch(`/api/emails/${emailId}/archive`, {
        method: "POST",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to archive");
      }
      setDrafts((items) => items.filter((item) => item.id !== draftId));
      showNotification("Email archived", "success");
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Unable to archive", "error");
    }
  };

  const generateReply = async (emailId: string) => {
    try {
      setGeneratingFor(emailId);
      showNotification("Generating AI reply...", "info");
      
      const response = await fetch(`/api/emails/${emailId}/generate-reply`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate reply");
      }
      
      showNotification("AI reply generated successfully!", "success");
      // Reload to show the new draft
      void load();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Unable to generate reply", "error");
    } finally {
      setGeneratingFor(null);
    }
  };

  const isSelfSent = (draft: Draft) => {
    const fromEmail = draft.emails.from_email?.toLowerCase();
    const toEmail = draft.emails.mailboxes.email.toLowerCase();
    return fromEmail === toEmail;
  };

  return (
    <main className="mail-shell">
      <header className="topbar">
        <a className="brand" href="/">
          inbox<span>draft</span>
        </a>
        <nav>
          <a className="active" href="/drafts">
            Drafts
          </a>
          <a href="/mailboxes">Mailboxes</a>
          <a href="/settings">Settings</a>
          <a href="/spam" style={{ color: spamCount > 0 ? "#dc2626" : undefined }}>
            🚫 Spam {spamCount > 0 && <span style={{ 
              background: "#dc2626", 
              color: "white", 
              padding: "0.2rem 0.5rem", 
              borderRadius: "1rem", 
              fontSize: "0.75rem",
              marginLeft: "0.25rem"
            }}>{spamCount}</span>}
          </a>
        </nav>
      </header>
      <section className="content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Human approval queue</p>
            <h1>Email Inbox</h1>
            <p className="lede">
              Generate AI replies on-demand, review every reply before sending.
            </p>
          </div>
          <span className="count">
            {drafts.length} drafts · {pendingEmails.length} pending
          </span>
        </div>

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

        {!loading && !error && drafts.length === 0 && pendingEmails.length === 0 && (
          <div className="empty">
            <strong>📭 No emails yet</strong>
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

        {!loading && !error && pendingEmails.length > 0 && (
          <>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "#374151" }}>
              📬 Pending Emails ({pendingEmails.length})
            </h2>
            <div className="draft-list">
              {pendingEmails.map((email) => {
                const spamScore = email.spam_score || 0;
                const spamLabel = getSpamLabel(spamScore);
                const isHighSpam = spamScore >= 60;
                const isGenerating = generatingFor === email.id;
                
                return (
                  <article 
                    className="draft-card" 
                    key={email.id} 
                    style={isHighSpam ? { borderLeft: "4px solid #f59e0b", background: "#fffbeb" } : { borderLeft: "4px solid #d1d5db" }}
                  >
                    <div className="draft-meta">
                      <span>📧 {email.mailboxes.email}</span>
                      <time>{formatDate(email.received_at)}</time>
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

                    <h2>{email.subject || "(No subject)"}</h2>
                    <p className="sender">
                      {email.from_name || email.from_email || "Unknown sender"}{" "}
                      <span>{email.from_email}</span>
                    </p>
                    <p className="original">
                      {email.body?.slice(0, 220)}
                      {(email.body?.length || 0) > 220 ? "..." : ""}
                    </p>
                    
                    <div className="actions" style={{ marginTop: "1rem" }}>
                      <button
                        className="button primary"
                        onClick={() => void generateReply(email.id)}
                        disabled={isGenerating}
                        style={{ 
                          background: isGenerating ? "#9ca3af" : "#10b981",
                          cursor: isGenerating ? "not-allowed" : "pointer"
                        }}
                      >
                        {isGenerating ? "⏳ Generating..." : "✨ Generate AI Reply"}
                      </button>
                      <button
                        className="button"
                        onClick={() => void markAsSpam(email.id, "")}
                        style={{ background: "#f59e0b", color: "white" }}
                        disabled={isGenerating}
                      >
                        🚩 Mark as Spam
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {!loading && !error && drafts.length > 0 && (
          <>
            <h2 style={{ fontSize: "1.25rem", marginTop: "2rem", marginBottom: "1rem", color: "#374151" }}>
              📝 AI Drafts ({drafts.length})
            </h2>
            <div className="draft-list">
            {drafts.map((draft) => {
              const spamScore = draft.emails.spam_score || 0;
              const spamLabel = getSpamLabel(spamScore);
              const isHighSpam = spamScore >= 60;
              const selfSent = isSelfSent(draft);
              
              return (
              <article className="draft-card" key={draft.id} style={isHighSpam ? { borderLeft: "4px solid #dc2626", background: "#fef2f2" } : selfSent ? { borderLeft: "4px solid #3b82f6", background: "#eff6ff" } : {}}>
                <div className="draft-meta">
                  <span>📧 {draft.emails.mailboxes.email}</span>
                  <time>{formatDate(draft.emails.received_at)}</time>
                </div>
                
                {/* Self-sent warning */}
                {selfSent && (
                  <div style={{ 
                    padding: "0.75rem", 
                    borderRadius: "0.5rem", 
                    background: "#dbeafe",
                    border: "1px solid #3b82f6",
                    color: "#1e40af",
                    marginBottom: "0.75rem",
                    fontSize: "0.9rem"
                  }}>
                    ℹ️ <strong>Self-sent email:</strong> This email was sent from your own mailbox ({draft.emails.mailboxes.email})
                  </div>
                )}
                
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
                  {selfSent ? (
                    <button
                      className="button primary"
                      onClick={() => void archiveEmail(draft.emails.id, draft.id)}
                      style={{ background: "#3b82f6" }}
                    >
                      📁 Archive
                    </button>
                  ) : (
                    <>
                      <button
                        className="button ghost"
                        onClick={async () => {
                          try {
                            await update(draft.id, { draft_body: draft.draft_body });
                            showNotification("Draft saved", "success");
                          } catch (err) {
                            showNotification(err instanceof Error ? err.message : "Failed to save draft", "error");
                          }
                        }}
                      >
                        💾 Edit / Save
                      </button>
                      <button
                        className="button primary"
                        onClick={() => void send(draft)}
                      >
                        ���� Send
                      </button>
                    </>
                  )}
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
                    className="button"
                    onClick={() => void markAsSpam(draft.emails.id, draft.id)}
                    style={{ background: "#f59e0b", color: "white" }}
                  >
                    🚩 Mark as Spam
                  </button>
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
          </>
        )}
      </section>
      <StickyNotification 
        message={message} 
        type={messageType} 
        onClose={() => setMessage("")} 
      />
    </main>
  );
}
