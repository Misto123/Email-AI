/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import type { PendingEmail, Mailbox } from "@/lib/mail-types";

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Unknown date";

export default function ArchivePage() {
  const [archivedEmails, setArchivedEmails] = useState<PendingEmail[]>([]);
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [selectedMailbox, setSelectedMailbox] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [emailsRes, mailboxesRes] = await Promise.all([
        fetch("/api/emails?status=archived"),
        fetch("/api/mailboxes")
      ]);
      
      if (!emailsRes.ok) throw new Error("Failed to load archived emails");
      if (!mailboxesRes.ok) throw new Error("Failed to load mailboxes");
      
      const emails = await emailsRes.json();
      const mailboxesList = await mailboxesRes.json();
      
      setArchivedEmails(emails);
      setMailboxes(mailboxesList);
    } catch (err) {
      console.error("Error loading archived emails:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const unarchiveEmail = async (emailId: string) => {
    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" }),
      });
      
      if (!response.ok) throw new Error("Failed to unarchive email");
      
      await load();
    } catch (err) {
      console.error("Error unarchiving email:", err);
      alert("Failed to unarchive email");
    }
  };

  const filteredEmails = selectedMailbox === "all"
    ? archivedEmails
    : archivedEmails.filter(e => e.mailboxes.id === selectedMailbox);

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
          <a className="active" href="/archive">Archive</a>
        </nav>
      </header>
      
      <section className="content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Archived emails</p>
            <h1>Archive</h1>
            <p className="lede">
              View all archived emails. Unarchive to move them back to your inbox.
            </p>
          </div>
          <span className="count">{filteredEmails.length} archived</span>
        </div>

        {/* Mailbox Filter */}
        {mailboxes.length > 1 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <label 
              htmlFor="mailbox-filter" 
              style={{ 
                display: "block", 
                marginBottom: "0.5rem", 
                fontSize: "0.9rem", 
                fontWeight: "600",
                color: "#374151"
              }}
            >
              Filter by mailbox:
            </label>
            <select
              id="mailbox-filter"
              value={selectedMailbox}
              onChange={(e) => setSelectedMailbox(e.target.value)}
              style={{
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                fontSize: "0.95rem",
                minWidth: "250px"
              }}
            >
              <option value="all">All Mailboxes ({archivedEmails.length})</option>
              {mailboxes.map((mailbox) => (
                <option key={mailbox.id} value={mailbox.id}>
                  {mailbox.email} ({archivedEmails.filter(e => e.mailboxes.id === mailbox.id).length})
                </option>
              ))}
            </select>
          </div>
        )}

        {loading && (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</p>
            <p>Loading archived emails...</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: "2rem", textAlign: "center", background: "#fef2f2", borderRadius: "0.5rem" }}>
            <p style={{ color: "#dc2626" }}>{error}</p>
          </div>
        )}

        {!loading && !error && filteredEmails.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>📁</p>
            <p>No archived emails</p>
          </div>
        )}

        {!loading && !error && filteredEmails.length > 0 && (
          <div className="draft-list">
            {filteredEmails.map((email) => (
              <article className="draft-card" key={email.id} style={{ borderLeft: "4px solid #9ca3af" }}>
                <div className="draft-meta">
                  <span>📧 {email.mailboxes.email}</span>
                  <time>{formatDate(email.received_at)}</time>
                </div>

                <h2>{email.subject || "(No subject)"}</h2>
                <p className="sender">
                  {email.from_name || email.from_email || "Unknown sender"}{" "}
                  <span>{email.from_email}</span>
                </p>
                <p className="original">
                  {email.body?.slice(0, 400)}
                  {(email.body?.length || 0) > 400 ? "..." : ""}
                </p>

                <div className="actions" style={{ marginTop: "1rem" }}>
                  <button
                    className="button primary"
                    onClick={() => void unarchiveEmail(email.id)}
                    style={{ padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
                  >
                    📤 Unarchive
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
