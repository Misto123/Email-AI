"use client";

import { useState } from "react";
import type { KnowledgeBase, FAQItem } from "@/types/knowledge-base";

interface KnowledgeBaseEditorProps {
  mailboxId: string;
  initialData: KnowledgeBase;
  websiteUrl?: string;
  onSave?: () => void;
}

export default function KnowledgeBaseEditor({
  mailboxId,
  initialData,
  websiteUrl: initialWebsiteUrl,
  onSave,
}: KnowledgeBaseEditorProps) {
  const [websiteUrl, setWebsiteUrl] = useState(initialWebsiteUrl || "");
  const [kb, setKb] = useState<KnowledgeBase>(initialData);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddFAQ = () => {
    setKb({
      ...kb,
      faq: [...(kb.faq || []), { q: "", a: "" }],
    });
  };

  const handleUpdateFAQ = (index: number, field: "q" | "a", value: string) => {
    const newFAQ = [...(kb.faq || [])];
    newFAQ[index][field] = value;
    setKb({ ...kb, faq: newFAQ });
  };

  const handleRemoveFAQ = (index: number) => {
    const newFAQ = (kb.faq || []).filter((_, i) => i !== index);
    setKb({ ...kb, faq: newFAQ });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(`/api/mailboxes/${mailboxId}/knowledge-base`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website_url: websiteUrl,
          knowledge_base: kb,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setMessage("✅ Saved successfully!");
      setTimeout(() => setMessage(""), 3000);
      onSave?.();
    } catch (err) {
      setMessage("❌ Failed to save");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h2 style={{ marginBottom: "20px" }}>AI Knowledge Base</h2>
      
      {message && (
        <div style={{ 
          padding: "10px", 
          marginBottom: "20px", 
          background: message.includes("✅") ? "#d4edda" : "#f8d7da",
          border: `1px solid ${message.includes("✅") ? "#c3e6cb" : "#f5c6cb"}`,
          borderRadius: "4px"
        }}>
          {message}
        </div>
      )}

      {/* Website URL */}
      <div style={{ marginBottom: "30px" }}>
        <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
          Website URL
        </label>
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://example.com"
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Website Context */}
      <div style={{ marginBottom: "30px" }}>
        <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
          About Us / Website Context
        </label>
        <textarea
          value={kb.website_context || ""}
          onChange={(e) => setKb({ ...kb, website_context: e.target.value })}
          placeholder="Describe your business, services, and what makes you unique..."
          rows={4}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            resize: "vertical",
          }}
        />
      </div>

      {/* Services */}
      <div style={{ marginBottom: "30px" }}>
        <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
          Services (comma-separated)
        </label>
        <input
          type="text"
          value={(kb.services || []).join(", ")}
          onChange={(e) => setKb({ ...kb, services: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
          placeholder="SEO optimization, Content writing, Social media management"
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Pricing Info */}
      <div style={{ marginBottom: "30px" }}>
        <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
          Pricing Information
        </label>
        <textarea
          value={kb.pricing_info || ""}
          onChange={(e) => setKb({ ...kb, pricing_info: e.target.value })}
          placeholder="Our pricing starts at $X/month. Custom packages available..."
          rows={3}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            resize: "vertical",
          }}
        />
      </div>

      {/* Brand Voice */}
      <div style={{ marginBottom: "30px" }}>
        <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
          Brand Voice & Tone
        </label>
        <textarea
          value={kb.brand_voice || ""}
          onChange={(e) => setKb({ ...kb, brand_voice: e.target.value })}
          placeholder="Professional yet friendly. Use clear language. Avoid jargon..."
          rows={3}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            resize: "vertical",
          }}
        />
      </div>

      {/* FAQ Section */}
      <div style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <label style={{ fontWeight: "600" }}>
            Frequently Asked Questions
          </label>
          <button
            onClick={handleAddFAQ}
            style={{
              padding: "6px 12px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            + Add FAQ
          </button>
        </div>

        {(kb.faq || []).map((faq, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "16px",
              padding: "16px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "#f9fafb",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <strong>FAQ #{idx + 1}</strong>
              <button
                onClick={() => handleRemoveFAQ(idx)}
                style={{
                  padding: "2px 8px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              value={faq.q}
              onChange={(e) => handleUpdateFAQ(idx, "q", e.target.value)}
              placeholder="Question"
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <textarea
              value={faq.a}
              onChange={(e) => handleUpdateFAQ(idx, "a", e.target.value)}
              placeholder="Answer"
              rows={3}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                resize: "vertical",
              }}
            />
          </div>
        ))}

        {(!kb.faq || kb.faq.length === 0) && (
          <p style={{ color: "#6b7280", fontStyle: "italic" }}>
            No FAQs added yet. Click &quot;Add FAQ&quot; to get started.
          </p>
        )}
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "12px 24px",
            background: saving ? "#9ca3af" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: saving ? "not-allowed" : "pointer",
            fontWeight: "600",
          }}
        >
          {saving ? "Saving..." : "💾 Save Knowledge Base"}
        </button>
      </div>

      <div style={{ marginTop: "30px", padding: "16px", background: "#f0f9ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
        <h3 style={{ marginTop: 0, marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>
          ℹ️ How it works
        </h3>
        <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", lineHeight: "1.6" }}>
          <li>AI will use this info when generating replies</li>
          <li>FAQs are matched to relevant questions automatically</li>
          <li>Past conversations are also used as examples</li>
          <li>Brand voice ensures consistent tone across all replies</li>
        </ul>
      </div>
    </div>
  );
}
