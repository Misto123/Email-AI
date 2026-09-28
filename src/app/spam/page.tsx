/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import type { Draft } from "@/lib/mail-types";
import { EmailCheckCountdown } from "@/components/email-check-countdown";

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Unknown date";

export default function SpamPage() {
  const [spamEmails, setSpamEmails] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  const checkNow = async () => {
    try {
      const response = await fetch("/api/emails/check-now", {
        method: "POST"
      });
      if (!response.ok) throw new Error("Check failed");
      await load();
    } catch (error) {
      console.error("Check failed:", error);
      throw error;
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      // Load both drafts and pending emails with spam score >= 50
      const [draftsRes, pendingRes] = await Promise.all([
        fetch("/api/drafts"),
        fetch("/api/emails/pending")
      ]);
      
      if (!draftsRes.ok) throw new Error("Failed to load drafts");
      if (!pendingRes.ok) throw new Error("Failed to load pending emails");
      
      const drafts = await draftsRes.json();
      const pending = await pendingRes.json();
      
      // Filter spam emails (manually marked OR score >= 50) from both
      const spamDrafts = drafts.filter((d: Draft) => 
        d.emails.is_spam || (d.emails.spam_score || 0) >= 50
      );
      
      // Convert pending emails to draft-like format for display
      const spamPending = pending
        .filter((e: any) => e.is_spam || (e.spam_score || 0) >= 50)
        .map((e: any) => ({
          id: `pending-${e.id}`,
          email_id: e.id,
          emails: e,
          draft_body: null,
          status: "pending"
        }));
      
      setSpamEmails([...spamDrafts, ...spamPending]);
    } catch (err) {
      console.error("Error loading spam:", err);
      setSpamEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const unmarkSpam = async (emailId: string) => {
    try {
      const response = await fetch(`/api/emails/${emailId}/mark-spam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_spam: false }),
      });
      if (!response.ok) throw new Error();
      void load();
    } catch {
      alert("Failed to unmark spam");
    }
  };

  const deleteSpam = async (emailId: string) => {
    if (!window.confirm("Permanently delete this email from inbox?")) return;
    try {
      const response = await fetch(`/api/emails/${emailId}/delete-spam`, {
        method: "POST",
      });
      if (!response.ok) throw new Error();
      void load();
    } catch {
      alert("Failed to delete spam");
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
          <a className="active" href="/spam">
            Spam
          </a>
        </nav>
        <EmailCheckCountdown onCheckNow={checkNow} />
      </header>
      <section className="content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Spam folder</p>
            <h1>Spam Emails</h1>
            <p className="lede">
              Emails with spam score ≥50 are automatically hidden from inbox. Auto-deleted after 7 days.
            </p>
          </div>
          <span className="count">{spamEmails.length} spam</span>
        </div>

        {loading && (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#6b7280" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</p>
            <p style={{ fontSize: "1.2rem" }}>Loading spam...</p>
          </div>
        )}

        {!loading && spamEmails.length === 0 && (
          <div className="empty">
            <strong>✅ No spam emails</strong>
            <span>All clear! Your spam folder is empty.</span>
          </div>
        )}

        {!loading && spamEmails.length > 0 && (
          <div className="draft-list">
            {spamEmails.map((draft) => (
              <article
                className="draft-card"
                key={draft.id}
                style={{ borderLeft: "4px solid #dc2626", background: "#fef2f2" }}
              >
                <div className="draft-meta">
                  <span>📧 {draft.emails.mailboxes.email}</span>
                  <time>{formatDate(draft.emails.received_at)}</time>
                </div>

                <div
                  style={{
                    display: "inline-block",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "1rem",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    background: "#fee2e2",
                    color: "#dc2626",
                    marginBottom: "0.5rem",
                  }}
                >
                  🚫 Spam Score: {draft.emails.spam_score || 0}/100
                </div>

                <h2>{draft.emails.subject || "(No subject)"}</h2>
                <p className="sender">
                  {draft.emails.from_name || draft.emails.from_email || "Unknown sender"}{" "}
                  <span>{draft.emails.from_email}</span>
                </p>
                <p className="original">
                  {draft.emails.body?.slice(0, 300)}
                  {(draft.emails.body?.length || 0) > 300 ? "..." : ""}
                </p>

                <div className="actions">
                  <button
                    className="button"
                    onClick={() => void unmarkSpam(draft.emails.id)}
                    style={{ background: "#10b981", color: "white" }}
                  >
                    ✅ Not Spam
                  </button>
                  <button
                    className="button danger"
                    onClick={() => void deleteSpam(draft.emails.id)}
                  >
                    🗑️ Delete Forever
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
