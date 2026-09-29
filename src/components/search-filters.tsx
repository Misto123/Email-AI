"use client";

import { useState } from "react";
import type { Mailbox } from "@/lib/mail-types";

interface SearchFiltersProps {
  mailboxes: Mailbox[];
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

export interface SearchFilters {
  query: string;
  mailbox: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  minSpam: string;
  maxSpam: string;
}

export function SearchFilters({ mailboxes, onSearch, loading }: SearchFiltersProps) {
  const [query, setQuery] = useState("");
  const [mailbox, setMailbox] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("all");
  const [minSpam, setMinSpam] = useState("");
  const [maxSpam, setMaxSpam] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    onSearch({
      query,
      mailbox,
      dateFrom,
      dateTo,
      status,
      minSpam,
      maxSpam
    });
  };

  const handleClear = () => {
    setQuery("");
    setMailbox("all");
    setDateFrom("");
    setDateTo("");
    setStatus("all");
    setMinSpam("");
    setMaxSpam("");
    onSearch({
      query: "",
      mailbox: "all",
      dateFrom: "",
      dateTo: "",
      status: "all",
      minSpam: "",
      maxSpam: ""
    });
  };

  const handleQuickFilter = (filterStatus: string) => {
    setStatus(filterStatus);
    onSearch({
      query,
      mailbox,
      dateFrom,
      dateTo,
      status: filterStatus,
      minSpam,
      maxSpam
    });
  };

  return (
    <div style={{ 
      padding: "1rem", 
      background: "#f9fafb", 
      borderRadius: "0.5rem", 
      marginBottom: "1.5rem",
      border: "1px solid #e5e7eb"
    }}>
      {/* Search Bar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="🔍 Search emails, drafts, senders..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          style={{
            flex: 1,
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            fontSize: "1rem"
          }}
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            fontWeight: "500"
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
        <button
          onClick={handleClear}
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem"
          }}
        >
          Clear
        </button>
      </div>

      {/* Quick Filters */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <span style={{ color: "#6b7280", fontSize: "0.875rem", alignSelf: "center" }}>Quick:</span>
        <button
          onClick={() => handleQuickFilter("all")}
          style={{
            padding: "0.5rem 0.75rem",
            background: status === "all" ? "#3b82f6" : "white",
            color: status === "all" ? "white" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.875rem"
          }}
        >
          All
        </button>
        <button
          onClick={() => handleQuickFilter("pending")}
          style={{
            padding: "0.5rem 0.75rem",
            background: status === "pending" ? "#3b82f6" : "white",
            color: status === "pending" ? "white" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.875rem"
          }}
        >
          📬 Pending
        </button>
        <button
          onClick={() => handleQuickFilter("draft")}
          style={{
            padding: "0.5rem 0.75rem",
            background: status === "draft" ? "#3b82f6" : "white",
            color: status === "draft" ? "white" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.875rem"
          }}
        >
          📝 Drafts
        </button>
        <button
          onClick={() => handleQuickFilter("sent")}
          style={{
            padding: "0.5rem 0.75rem",
            background: status === "sent" ? "#3b82f6" : "white",
            color: status === "sent" ? "white" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.875rem"
          }}
        >
          ✉️ Sent
        </button>
        <button
          onClick={() => handleQuickFilter("archived")}
          style={{
            padding: "0.5rem 0.75rem",
            background: status === "archived" ? "#3b82f6" : "white",
            color: status === "archived" ? "white" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.875rem"
          }}
        >
          📁 Archived
        </button>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            padding: "0.5rem 0.75rem",
            background: "white",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.875rem",
            marginLeft: "auto"
          }}
        >
          {showAdvanced ? "▲ Hide" : "▼ More"} Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div style={{ 
          padding: "1rem", 
          background: "white", 
          borderRadius: "0.375rem",
          border: "1px solid #e5e7eb",
          marginTop: "0.75rem"
        }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "1rem" 
          }}>
            {/* Mailbox Filter */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem", color: "#374151" }}>
                📬 Mailbox
              </label>
              <select
                value={mailbox}
                onChange={(e) => setMailbox(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              >
                <option value="all">All Mailboxes</option>
                {mailboxes.map((mb) => (
                  <option key={mb.id} value={mb.id}>
                    {mb.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem", color: "#374151" }}>
                📅 From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            {/* Date To */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem", color: "#374151" }}>
                📅 To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            {/* Min Spam Score */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem", color: "#374151" }}>
                🚫 Min Spam Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={minSpam}
                onChange={(e) => setMinSpam(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            {/* Max Spam Score */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem", color: "#374151" }}>
                🚫 Max Spam Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={maxSpam}
                onChange={(e) => setMaxSpam(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
