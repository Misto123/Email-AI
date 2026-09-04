/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [model, setModel] = useState("openai/gpt-5.6-luna");
  const [message, setMessage] = useState("");
  useEffect(() => { fetch("/api/settings").then((response) => response.json()).then((data: { openrouter_model?: string }) => { if (data.openrouter_model) setModel(data.openrouter_model); }); }, []);
  const save = async () => { const response = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ openrouter_model: model }) }); setMessage(response.ok ? "Settings saved." : "Unable to save settings."); };
  return <main className="mail-shell"><header className="topbar"><a className="brand" href="/">inbox<span>draft</span></a><nav><a href="/">Drafts</a><a href="/mailboxes">Mailboxes</a><a className="active" href="/settings">Settings</a></nav></header><section className="content narrow"><p className="eyebrow">Configuration</p><h1>Settings</h1><div className="settings-card"><label htmlFor="model">OpenRouter model</label><input id="model" value={model} onChange={(event) => setModel(event.target.value)} /><p className="help">The API key is configured only on the server and is never shown here.</p><button className="button primary" onClick={() => void save()}>Save settings</button>{message && <p className="notice">{message}</p>}</div></section></main>;
}
