"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../globals.css";

interface ForwardRule {
  id: string;
  subject_contains: string;
  forward_to: string;
  enabled: boolean;
  created_at: string;
}

export default function BramForwardPage() {
  const router = useRouter();
  const [rules, setRules] = useState<ForwardRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [forwardEmail, setForwardEmail] = useState("bram@rebelinternet.nl");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const response = await fetch("/api/forward-rules");
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (err) {
      console.error("Failed to load rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const addRule = async () => {
    if (!newSubject.trim()) {
      showNotification("Please enter a subject keyword", "error");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/forward-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_contains: newSubject.trim(),
          forward_to: forwardEmail,
        }),
      });

      if (!response.ok) throw new Error("Failed to add rule");

      showNotification("Rule added successfully!", "success");
      setNewSubject("");
      await loadRules();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Failed to add rule", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleRule = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/forward-rules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });

      if (!response.ok) throw new Error("Failed to update rule");

      showNotification(`Rule ${!enabled ? "enabled" : "disabled"}`, "success");
      await loadRules();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Failed to update rule", "error");
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Delete this forwarding rule?")) return;

    try {
      const response = await fetch(`/api/forward-rules/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete rule");

      showNotification("Rule deleted", "success");
      await loadRules();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Failed to delete rule", "error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <header style={{
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              cursor: "pointer"
            }}
          >
            ← Back to Inbox
          </button>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600", margin: 0 }}>
            📨 Bram Forward Rules
          </h1>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 2rem" }}>
        {notification && (
          <div style={{
            padding: "1rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            background: notification.type === "success" ? "#d1fae5" : "#fee2e2",
            color: notification.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${notification.type === "success" ? "#6ee7b7" : "#fecaca"}`
          }}>
            {notification.message}
          </div>
        )}

        <div style={{
          background: "white",
          borderRadius: "0.75rem",
          padding: "2rem",
          marginBottom: "2rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", fontWeight: "600" }}>
            Add New Forward Rule
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            Emails containing this subject will be auto-forwarded (BCC) to the specified address.
          </p>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                Subject Contains
              </label>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. New Order"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                Forward To (BCC)
              </label>
              <input
                type="email"
                value={forwardEmail}
                onChange={(e) => setForwardEmail(e.target.value)}
                placeholder="bram@rebelinternet.nl"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "1rem"
                }}
              />
            </div>
          </div>

          <button
            onClick={addRule}
            disabled={saving}
            style={{
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: "500",
              fontSize: "1rem"
            }}
          >
            {saving ? "Adding..." : "➕ Add Rule"}
          </button>
        </div>

        <div style={{
          background: "white",
          borderRadius: "0.75rem",
          padding: "2rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", fontWeight: "600" }}>
            Active Forward Rules ({rules.length})
          </h2>

          {loading ? (
            <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>
              Loading rules...
            </p>
          ) : rules.length === 0 ? (
            <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>
              No forwarding rules configured yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: rule.enabled ? "white" : "#f9fafb"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      marginBottom: "0.25rem"
                    }}>
                      Subject contains: <span style={{ color: "#3b82f6" }}>"{rule.subject_contains}"</span>
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      Forward to: {rule.forward_to}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                      Created: {new Date(rule.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleRule(rule.id, rule.enabled)}
                        style={{ width: "1.25rem", height: "1.25rem", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
                        {rule.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </label>

                    <button
                      onClick={() => deleteRule(rule.id)}
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "0.375rem",
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                        fontSize: "0.875rem"
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          background: "#fef3c7",
          border: "1px solid #fbbf24",
          borderRadius: "0.5rem",
          padding: "1rem",
          marginTop: "2rem"
        }}>
          <p style={{ margin: 0, color: "#92400e" }}>
            <strong>ℹ️ How it works:</strong> When an email is received and contains any of the subject keywords above,
            it will be automatically forwarded (BCC) to the specified email address. The original recipient still receives
            the email normally.
          </p>
        </div>
      </main>
    </div>
  );
}
