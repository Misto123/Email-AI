/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import type { Draft } from "@/lib/mail-types";

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Unknown date";

export function MailApp() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [message, setMessage] = useState("");
  const load = () => fetch("/api/drafts").then((response) => response.json()).then(setDrafts).catch(() => setMessage("Unable to load drafts."));
  useEffect(() => { void load(); }, []);
  const update = async (id: string, body: Record<string, string>) => { const response = await fetch(`/api/drafts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); if (!response.ok) throw new Error(); };
  const send = async (draft: Draft) => { if (!window.confirm("Send this reply now?")) return; try { await update(draft.id, { draft_body: draft.draft_body }); const response = await fetch(`/api/drafts/${draft.id}/send`, { method: "POST" }); if (!response.ok) throw new Error(); setMessage("Reply sent."); void load(); } catch { setMessage("Unable to send reply."); } };
  const remove = async (id: string) => { await update(id, { status: "deleted" }); setDrafts((items) => items.filter((item) => item.id !== id)); };
  return <main className="mail-shell"><header className="topbar"><a className="brand" href="/">inbox<span>draft</span></a><nav><a className="active" href="/">Drafts</a><a href="/mailboxes">Mailboxes</a><a href="/settings">Settings</a></nav></header><section className="content"><div className="page-heading"><div><p className="eyebrow">Human approval queue</p><h1>AI drafts</h1><p className="lede">Review every suggested reply before it leaves your inbox.</p></div><span className="count">{drafts.length} open</span></div>{message && <p className="notice">{message}</p>}{drafts.length === 0 ? <div className="empty"><strong>No drafts yet</strong><span>New messages will appear here after the next five-minute check.</span></div> : <div className="draft-list">{drafts.map((draft) => <article className="draft-card" key={draft.id}><div className="draft-meta"><span>{draft.emails.mailboxes.email}</span><time>{formatDate(draft.emails.received_at)}</time></div><h2>{draft.emails.subject || "(No subject)"}</h2><p className="sender">{draft.emails.from_name || draft.emails.from_email || "Unknown sender"} <span>{draft.emails.from_email}</span></p><p className="original">{draft.emails.body?.slice(0, 220)}{(draft.emails.body?.length || 0) > 220 ? "..." : ""}</p><textarea aria-label="Draft reply" defaultValue={draft.draft_body} onChange={(event) => { draft.draft_body = event.target.value; }} /><div className="actions"><button className="button ghost" onClick={() => update(draft.id, { draft_body: draft.draft_body }).then(() => setMessage("Draft saved."))}>Edit / Save</button><button className="button primary" onClick={() => void send(draft)}>Send</button><button className="button danger" onClick={() => void remove(draft.id)}>Delete</button></div></article>)}</div>}</section></main>;
}
