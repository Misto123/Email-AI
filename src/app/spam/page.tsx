/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import type { Draft } from "@/lib/mail-types";
import { AppHeader } from "@/components/app-header";

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

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
      
      const draftsData = await draftsRes.json();
      const pendingData = await pendingRes.json();
      
      // Handle {data: [...]} format
      const drafts = Array.isArray(draftsData) ? draftsData : (draftsData.data || []);
      const pending = Array.isArray(pendingData) ? pendingData : (pendingData.data || []);
      
      console.log('[SPAM] Loaded drafts:', drafts.length, 'pending:', pending.length);
      
      // Filter spam emails (manually marked OR score >= 50) from both
      const spamDrafts = drafts.filter((d: Draft) => 
        d.emails.is_spam || (d.emails.spam_score || 0) >= 50
      );
      
      console.log('[SPAM] Spam drafts found:', spamDrafts.length);
      
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
      
      console.log('[SPAM] Spam pending found:', spamPending.length);
      
      const allSpam = [...spamDrafts, ...spamPending];
      console.log('[SPAM] Total spam emails:', allSpam.length);
      
      setSpamEmails(allSpam);
      setSelected(new Set()); // Clear selection on reload
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

  const toggleSelect = (emailId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelected(newSelected);
  };

  const selectAll = () => {
    if (selected.size === spamEmails.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(spamEmails.map(e => e.email_id)));
    }
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Permanently delete ${selected.size} spam email(s)?`)) return;
    
    try {
      setDeleting(true);
      const promises = Array.from(selected).map(emailId =>
        fetch(`/api/emails/${emailId}/delete-spam`, { method: "POST" })
      );
      
      await Promise.all(promises);
      await load();
      alert(`Deleted ${selected.size} spam email(s)`);
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Failed to delete some emails");
    } finally {
      setDeleting(false);
    }
  };

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
      <AppHeader activePage="spam" onCheckNow={checkNow} />
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

        {!loading && spamEmails.length > 0 && (
          <div style={{ 
            display: "flex", 
            gap: "1rem", 
            alignItems: "center",
            padding: "1rem 0",
            borderBottom: "1px solid #e5e7eb",
            marginBottom: "1.5rem"
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={selected.size === spamEmails.length && spamEmails.length > 0}
                onChange={selectAll}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                {selected.size === 0 ? "Select All" : `${selected.size} selected`}
              </span>
            </label>
            {selected.size > 0 && (
              <button
                onClick={bulkDelete}
                disabled={deleting}
                className="button danger"
                style={{ marginLeft: "auto" }}
              >
                {deleting ? "🗑️ Deleting..." : `🗑️ Delete ${selected.size} Email${selected.size > 1 ? "s" : ""}`}
              </button>
            )}
          </div>
        )}

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
                <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                  <input
                    type="checkbox"
                    checked={selected.has(draft.emails.id)}
                    onChange={() => toggleSelect(draft.emails.id)}
                    style={{ width: "20px", height: "20px", marginTop: "0.5rem", cursor: "pointer" }}
                  />
                  <div style={{ flex: 1 }}>
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
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
