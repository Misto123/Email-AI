/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import type { Mailbox } from "@/lib/mail-types";

export default function MailboxesPage() {
  const [items, setItems] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/mailboxes");
      if (!response.ok) {
        throw new Error(`Failed to load mailboxes: ${response.statusText}`);
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error("Error loading mailboxes:", err);
      setError(err instanceof Error ? err.message : "Failed to load mailboxes");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const getStatusIcon = (status?: "online" | "offline" | "unknown") => {
    if (status === "online") return "🟢";
    if (status === "offline") return "🔴";
    return "⚪";
  };
  
  const getStatusText = (status?: "online" | "offline" | "unknown") => {
    if (status === "online") return "Online";
    if (status === "offline") return "Offline";
    return "Unknown";
  };

  const formatCheckTime = (time?: string | null) => {
    if (!time) return "Never checked";
    const date = new Date(time);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <main className="mail-shell">
      <header className="topbar">
        <a className="brand" href="/">
          inbox<span>draft</span>
        </a>
        <nav>
          <a href="/drafts">Inbox</a>
          <a className="active" href="/mailboxes">
            Mailboxes
          </a>
          <a href="/settings">Settings</a>
          <a href="/spam">Spam</a>
        </nav>
      </header>
      <section className="content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Connected accounts</p>
            <h1>Your Mailboxes</h1>
            <p className="lede">
              View all connected Purelymail accounts and their connection status.
            </p>
          </div>
          <span className="count">{items.length} / 20</span>
        </div>

        {loading && (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</p>
            <p>Loading mailboxes...</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: "2rem", textAlign: "center", background: "#fef2f2", borderRadius: "0.5rem", border: "2px solid #dc2626" }}>
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</p>
            <p style={{ color: "#991b1b", fontWeight: "bold", marginBottom: "0.5rem" }}>Error Loading Mailboxes</p>
            <p style={{ color: "#991b1b", fontSize: "0.9rem" }}>{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ padding: "3rem", textAlign: "center", background: "#f9fafb", borderRadius: "0.5rem", border: "2px dashed #d1d5db" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</p>
            <h2 style={{ marginBottom: "1rem", color: "#111827" }}>No mailboxes yet</h2>
            <p style={{ fontSize: "1rem", color: "#6b7280", marginBottom: "2rem" }}>
              Add your first Purelymail mailbox to start managing emails with AI assistance.
            </p>
            <a href="/mailboxes/add" className="button primary" style={{ display: "inline-block" }}>
              ➕ Add Your First Mailbox
            </a>
          </div>
        )}
        
        {!loading && !error && items.length > 0 && (
          <>
            <div style={{ marginBottom: "2rem" }}>
              <a href="/mailboxes/add" className="button primary">
                ➕ Add New Mailbox
              </a>
            </div>

            <div className="mailbox-list">
              {items.map((mailbox) => (
                <article className="mailbox-row" key={mailbox.id}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <strong style={{ fontSize: "1.1rem" }}>{mailbox.email}</strong>
                      <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                        {mailbox.ai_enabled ? "🤖 AI enabled" : "⏸️ AI paused"}
                      </span>
                    </div>
                    
                    {/* Connection Status */}
                    <div style={{ 
                      display: "flex", 
                      gap: "1rem", 
                      fontSize: "0.85rem",
                      marginTop: "0.5rem"
                    }}>
                      <span 
                        style={{ 
                          color: mailbox.imap_status === "online" ? "#059669" : mailbox.imap_status === "offline" ? "#dc2626" : "#6b7280"
                        }}
                        title={mailbox.last_imap_error || formatCheckTime(mailbox.last_imap_check)}
                      >
                        {getStatusIcon(mailbox.imap_status)} IMAP: {getStatusText(mailbox.imap_status)}
                      </span>
                      <span 
                        style={{ 
                          color: mailbox.smtp_status === "online" ? "#059669" : mailbox.smtp_status === "offline" ? "#dc2626" : "#6b7280"
                        }}
                        title={mailbox.last_smtp_error || formatCheckTime(mailbox.last_smtp_check)}
                      >
                        {getStatusIcon(mailbox.smtp_status)} SMTP: {getStatusText(mailbox.smtp_status)}
                      </span>
                      <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                        {formatCheckTime(mailbox.last_imap_check || mailbox.last_smtp_check)}
                      </span>
                    </div>

                    {mailbox.prompt && (
                      <small style={{ display: "block", color: "#6b7280", marginTop: "0.5rem" }}>
                        📝 Custom instructions: {mailbox.prompt.substring(0, 80)}
                        {mailbox.prompt.length > 80 ? "..." : ""}
                      </small>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
