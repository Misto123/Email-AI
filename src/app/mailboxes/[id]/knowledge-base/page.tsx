"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import KnowledgeBaseEditor from "@/components/KnowledgeBaseEditor";
import type { KnowledgeBase } from "@/types/knowledge-base";

interface Mailbox {
  id: string;
  email: string;
  website_url?: string;
  knowledge_base?: KnowledgeBase;
}

export default function MailboxKnowledgeBasePage() {
  const params = useParams();
  const router = useRouter();
  const mailboxId = params.id as string;
  
  const [mailbox, setMailbox] = useState<Mailbox | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMailbox();
  }, [mailboxId]);

  const loadMailbox = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/mailboxes");
      if (!response.ok) throw new Error("Failed to load mailboxes");
      
      const mailboxes = await response.json();
      const found = mailboxes.find((m: Mailbox) => m.id === mailboxId);
      
      if (!found) throw new Error("Mailbox not found");
      
      setMailbox(found);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load mailbox");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="mail-shell">
        <header className="topbar">
          <a className="brand" href="/">
            inbox<span>draft</span>
          </a>
          <nav>
            <a href="/drafts">Inbox</a>
            <a className="active" href="/mailboxes">Mailboxes</a>
            <a href="/settings">Settings</a>
            <a href="/spam">Spam</a>
          </nav>
        </header>
        <section className="content">
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p>Loading...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !mailbox) {
    return (
      <main className="mail-shell">
        <header className="topbar">
          <a className="brand" href="/">
            inbox<span>draft</span>
          </a>
          <nav>
            <a href="/drafts">Inbox</a>
            <a className="active" href="/mailboxes">Mailboxes</a>
            <a href="/settings">Settings</a>
            <a href="/spam">Spam</a>
          </nav>
        </header>
        <section className="content">
          <div style={{ padding: "40px" }}>
            <h1>Error</h1>
            <p style={{ color: "#ef4444" }}>{error || "Mailbox not found"}</p>
            <button
              onClick={() => router.push("/mailboxes")}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ← Back to Mailboxes
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mail-shell">
      <header className="topbar">
        <a className="brand" href="/">
          inbox<span>draft</span>
        </a>
        <nav>
          <a href="/drafts">Inbox</a>
          <a className="active" href="/mailboxes">Mailboxes</a>
          <a href="/settings">Settings</a>
          <a href="/spam">Spam</a>
        </nav>
      </header>
      <section className="content">
        <div style={{ padding: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => router.push("/mailboxes")}
              style={{
                padding: "8px 16px",
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                cursor: "pointer",
                marginBottom: "12px",
              }}
            >
              ← Back to Mailboxes
            </button>
            <h1 style={{ margin: 0, fontSize: "24px" }}>
              {mailbox.email}
            </h1>
            <p style={{ color: "#6b7280", marginTop: "4px" }}>
              Configure AI knowledge base and context
            </p>
          </div>

          <KnowledgeBaseEditor
            mailboxId={mailbox.id}
            initialData={mailbox.knowledge_base || {}}
            websiteUrl={mailbox.website_url}
            onSave={loadMailbox}
          />
        </div>
      </section>
    </main>
  );
}
