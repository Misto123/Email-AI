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

          {/* Explanation Box */}
          <div style={{
            padding: "1.25rem",
            background: "#eff6ff",
            border: "2px solid #3b82f6",
            borderRadius: "0.75rem",
            marginBottom: "1.5rem"
          }}>
            <h3 style={{ margin: "0 0 0.75rem 0", color: "#1e40af", fontSize: "1.1rem" }}>
              💡 How Knowledge Base Works
            </h3>
            <p style={{ margin: "0 0 0.5rem 0", color: "#374151", lineHeight: "1.6" }}>
              The knowledge base provides context to the AI when generating email replies. Information you add here will be used to:
            </p>
            <ul style={{ margin: "0.5rem 0 0 1.5rem", color: "#374151", lineHeight: "1.6" }}>
              <li><strong>Answer questions</strong> about your business, products, or services</li>
              <li><strong>Provide accurate information</strong> like pricing, features, availability</li>
              <li><strong>Maintain consistency</strong> in responses across all emails</li>
              <li><strong>Reduce hallucinations</strong> by giving the AI factual data to reference</li>
            </ul>
            <p style={{ margin: "0.75rem 0 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
              💡 <strong>Tip:</strong> Include FAQs, product details, pricing, policies, and any information customers commonly ask about.
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
