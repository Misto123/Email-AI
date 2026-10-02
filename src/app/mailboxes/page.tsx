/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import type { Mailbox } from "@/lib/mail-types";
import { AppHeader } from "@/components/app-header";

export default function MailboxesPage() {
  const [items, setItems] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMailbox, setExpandedMailbox] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<{
    imap_host: string;
    imap_port: number;
    smtp_host: string;
    smtp_port: number;
    password: string;
  }>({
    imap_host: "",
    imap_port: 993,
    smtp_host: "",
    smtp_port: 465,
    password: ""
  });

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
    if (status === "online") return "✅";
    if (status === "offline") return "❌";
    return "⚪";
  };
  
  const getStatusText = (status?: "online" | "offline" | "unknown") => {
    if (status === "online") return "YES";
    if (status === "offline") return "NO";
    return "Not checked";
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
  
  const formatFullDate = (time?: string | null) => {
    if (!time) return "Never";
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(time));
  };

  return (
    <main className="mail-shell">
      <AppHeader activePage="mailboxes" />
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
                      flexDirection: "column",
                      gap: "0.5rem", 
                      marginTop: "0.75rem",
                      padding: "0.75rem",
                      background: "#f9fafb",
                      borderRadius: "0.5rem",
                      border: "1px solid #e5e7eb"
                    }}>
                      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                        <div style={{ flex: "1", minWidth: "200px" }}>
                          <div 
                            style={{ 
                              color: mailbox.imap_status === "online" ? "#059669" : mailbox.imap_status === "offline" ? "#dc2626" : "#6b7280",
                              fontWeight: "600",
                              fontSize: "0.9rem"
                            }}
                            title={mailbox.last_imap_error || `Last checked: ${formatFullDate(mailbox.last_imap_check)}`}
                          >
                            {getStatusIcon(mailbox.imap_status)} IMAP Connected: {getStatusText(mailbox.imap_status)}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                            Last check: {formatCheckTime(mailbox.last_imap_check)}
                          </div>
                        </div>
                        
                        <div style={{ flex: "1", minWidth: "200px" }}>
                          <div 
                            style={{ 
                              color: mailbox.smtp_status === "online" ? "#059669" : mailbox.smtp_status === "offline" ? "#dc2626" : "#6b7280",
                              fontWeight: "600",
                              fontSize: "0.9rem"
                            }}
                            title={mailbox.last_smtp_error || `Last checked: ${formatFullDate(mailbox.last_smtp_check)}`}
                          >
                            {getStatusIcon(mailbox.smtp_status)} SMTP Connected: {getStatusText(mailbox.smtp_status)}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                            Last check: {formatCheckTime(mailbox.last_smtp_check)}
                          </div>
                        </div>
                      </div>
                      
                      {(mailbox.last_imap_error || mailbox.last_smtp_error) && (
                        <div style={{ 
                          fontSize: "0.8rem", 
                          color: "#dc2626", 
                          background: "#fef2f2",
                          padding: "0.5rem",
                          borderRadius: "0.25rem",
                          marginTop: "0.25rem"
                        }}>
                          ⚠️ {mailbox.last_imap_error || mailbox.last_smtp_error}
                        </div>
                      )}
                    </div>

                    {mailbox.prompt && (
                      <small style={{ display: "block", color: "#6b7280", marginTop: "0.5rem" }}>
                        📝 Custom instructions: {mailbox.prompt.substring(0, 80)}
                        {mailbox.prompt.length > 80 ? "..." : ""}
                      </small>
                    )}
                    
                    {/* Language Settings */}
                    <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "#f9fafb", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
                      <div style={{ marginBottom: "0.5rem" }}>
                        <label style={{ fontSize: "0.85rem", color: "#374151", fontWeight: "500", display: "block", marginBottom: "0.25rem" }}>
                          🌍 Display Language (for you)
                        </label>
                        <select
                          value={mailbox.default_language || "en"}
                          onChange={async (e) => {
                            const response = await fetch(`/api/mailboxes/${mailbox.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ default_language: e.target.value }),
                            });
                            if (response.ok) await load();
                          }}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            fontSize: "0.9rem"
                          }}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="it">Italian</option>
                          <option value="pt">Portuguese</option>
                          <option value="nl">Dutch</option>
                          <option value="pl">Polish</option>
                          <option value="ru">Russian</option>
                          <option value="zh">Chinese</option>
                          <option value="ja">Japanese</option>
                          <option value="ko">Korean</option>
                        </select>
                        <small style={{ display: "block", color: "#6b7280", marginTop: "0.25rem", fontSize: "0.8rem" }}>
                          Incoming emails will be auto-translated to this language
                        </small>
                      </div>
                    </div>
                    
                    {/* Knowledge Base Link */}
                    <div style={{ marginTop: "0.75rem" }}>
                      <a 
                        href={`/mailboxes/${mailbox.id}/knowledge-base`}
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          background: "#f0f9ff",
                          color: "#0284c7",
                          border: "1px solid #bae6fd",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          textDecoration: "none",
                          fontWeight: "500",
                        }}
                      >
                        🧠 Edit Knowledge Base
                      </a>
                    </div>

                    {/* IMAP/SMTP Configuration */}
                    <div style={{ marginTop: "0.75rem", borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem" }}>
                      <button
                        onClick={() => {
                          if (expandedMailbox === mailbox.id) {
                            setExpandedMailbox(null);
                          } else {
                            setExpandedMailbox(mailbox.id);
                            setEditingConfig({
                              imap_host: mailbox.imap_host || "imap.purelymail.com",
                              imap_port: mailbox.imap_port || 993,
                              smtp_host: mailbox.smtp_host || "smtp.purelymail.com",
                              smtp_port: mailbox.smtp_port || 465,
                              password: ""
                            });
                          }
                        }}
                        style={{
                          padding: "0.5rem 1rem",
                          background: expandedMailbox === mailbox.id ? "#3b82f6" : "#f3f4f6",
                          color: expandedMailbox === mailbox.id ? "white" : "#374151",
                          border: "1px solid " + (expandedMailbox === mailbox.id ? "#3b82f6" : "#d1d5db"),
                          borderRadius: "0.375rem",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          cursor: "pointer"
                        }}
                      >
                        ⚙️ {expandedMailbox === mailbox.id ? "Hide" : "Configure"} IMAP/SMTP
                      </button>

                      {expandedMailbox === mailbox.id && (
                        <div style={{ 
                          marginTop: "1rem", 
                          padding: "1rem", 
                          background: "#f9fafb", 
                          borderRadius: "0.5rem",
                          border: "1px solid #e5e7eb"
                        }}>
                          <h4 style={{ marginBottom: "1rem", fontSize: "0.95rem", fontWeight: "600", color: "#111827" }}>
                            📧 Email Server Configuration
                          </h4>
                          
                          <div style={{ display: "grid", gap: "1rem" }}>
                            {/* IMAP Settings */}
                            <div style={{ padding: "0.75rem", background: "white", borderRadius: "0.375rem", border: "1px solid #e5e7eb" }}>
                              <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", marginBottom: "0.75rem" }}>
                                📥 IMAP (Incoming Mail)
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.5rem" }}>
                                <div>
                                  <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>
                                    Host
                                  </label>
                                  <input
                                    type="text"
                                    value={editingConfig.imap_host}
                                    onChange={(e) => setEditingConfig({...editingConfig, imap_host: e.target.value})}
                                    placeholder="imap.purelymail.com"
                                    style={{ width: "100%", padding: "0.5rem", fontSize: "0.875rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>
                                    Port
                                  </label>
                                  <input
                                    type="number"
                                    value={editingConfig.imap_port}
                                    onChange={(e) => setEditingConfig({...editingConfig, imap_port: parseInt(e.target.value)})}
                                    style={{ width: "100%", padding: "0.5rem", fontSize: "0.875rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* SMTP Settings */}
                            <div style={{ padding: "0.75rem", background: "white", borderRadius: "0.375rem", border: "1px solid #e5e7eb" }}>
                              <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", marginBottom: "0.75rem" }}>
                                📤 SMTP (Outgoing Mail)
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.5rem" }}>
                                <div>
                                  <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>
                                    Host
                                  </label>
                                  <input
                                    type="text"
                                    value={editingConfig.smtp_host}
                                    onChange={(e) => setEditingConfig({...editingConfig, smtp_host: e.target.value})}
                                    placeholder="smtp.purelymail.com"
                                    style={{ width: "100%", padding: "0.5rem", fontSize: "0.875rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: "0.8rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>
                                    Port
                                  </label>
                                  <input
                                    type="number"
                                    value={editingConfig.smtp_port}
                                    onChange={(e) => setEditingConfig({...editingConfig, smtp_port: parseInt(e.target.value)})}
                                    style={{ width: "100%", padding: "0.5rem", fontSize: "0.875rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Password */}
                            <div style={{ padding: "0.75rem", background: "white", borderRadius: "0.375rem", border: "1px solid #e5e7eb" }}>
                              <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151", marginBottom: "0.75rem" }}>
                                🔑 Password
                              </div>
                              <input
                                type="password"
                                value={editingConfig.password}
                                onChange={(e) => setEditingConfig({...editingConfig, password: e.target.value})}
                                placeholder="Enter your email password"
                                style={{ width: "100%", padding: "0.5rem", fontSize: "0.875rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
                              />
                              <small style={{ display: "block", color: "#6b7280", marginTop: "0.25rem", fontSize: "0.75rem" }}>
                                Your password is encrypted and stored securely
                              </small>
                            </div>

                            {/* Save Button */}
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/mailboxes/${mailbox.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      imap_host: editingConfig.imap_host,
                                      imap_port: editingConfig.imap_port,
                                      smtp_host: editingConfig.smtp_host,
                                      smtp_port: editingConfig.smtp_port,
                                      ...(editingConfig.password && { encrypted_password: editingConfig.password })
                                    })
                                  });

                                  if (response.ok) {
                                    alert("✅ Configuration saved! Testing connection...");
                                    await load();
                                    setExpandedMailbox(null);
                                    
                                    // Test connection
                                    const testResponse = await fetch(`/api/mailboxes/${mailbox.id}/test`);
                                    const testResult = await testResponse.json();
                                    
                                    if (testResult.imap === "online" && testResult.smtp === "online") {
                                      alert("✅ Connection successful! IMAP and SMTP are working.");
                                    } else {
                                      alert(`⚠️ Configuration saved but connection failed:\nIMAP: ${testResult.imap}\nSMTP: ${testResult.smtp}`);
                                    }
                                  } else {
                                    const error = await response.json();
                                    alert("❌ Failed to save: " + (error.error || "Unknown error"));
                                  }
                                } catch (err) {
                                  alert("❌ Error: " + (err instanceof Error ? err.message : "Unknown error"));
                                }
                              }}
                              style={{
                                padding: "0.75rem",
                                background: "#10b981",
                                color: "white",
                                border: "none",
                                borderRadius: "0.375rem",
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                cursor: "pointer"
                              }}
                            >
                              💾 Save & Test Connection
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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
