/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import type { Draft, PendingEmail, Mailbox } from "@/lib/mail-types";
import { StickyNotification } from "./sticky-notification";
import { EmailCheckCountdown } from "./email-check-countdown";
import { parseContactFormEmail } from "@/lib/email-parser";
import { SearchFilters, type SearchFilters as SearchFiltersType } from "./search-filters";
import { Pagination } from "./pagination";
import { BulkActions } from "./bulk-actions";

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Unknown date";

export function MailApp() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [pendingEmails, setPendingEmails] = useState<PendingEmail[]>([]);
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [selectedMailbox, setSelectedMailbox] = useState<string>("all");
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarEmailId, setSidebarEmailId] = useState<string | null>(null);
  const [emailHistory, setEmailHistory] = useState<Array<{
    id: string;
    from_email: string | null;
    from_name: string | null;
    subject: string | null;
    body: string | null;
    received_at: string | null;
    spam_score?: number;
  }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | "warning">("info");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spamCount, setSpamCount] = useState(0);
  const [openrouterCreditsLow, setOpenrouterCreditsLow] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "sender" | "subject" | "spam">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [detailViewEmail, setDetailViewEmail] = useState<PendingEmail | null>(null);
  const [detailViewDraft, setDetailViewDraft] = useState<string | null>(null);
  
  // New state for search, pagination, and bulk actions
  const [searchMode, setSearchMode] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFiltersType>({
    query: "",
    mailbox: "all",
    dateFrom: "",
    dateTo: "",
    status: "all",
    minSpam: "",
    maxSpam: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(50);
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [archivingEmailId, setArchivingEmailId] = useState<string | null>(null);

  const showNotification = (msg: string, type: "success" | "error" | "info" | "warning" = "info") => {
    setMessage(msg);
    setMessageType(type);
  };

  const checkNow = async () => {
    try {
      showNotification("Checking for new emails...", "info");
      const response = await fetch("/api/emails/check-now", {
        method: "POST"
      });
      if (!response.ok) throw new Error("Check failed");
      const data = await response.json();
      const total = data.results?.reduce((sum: number, r: { imported: number }) => sum + r.imported, 0) || 0;
      showNotification(`Email check complete! Found ${total} new emails.`, "success");
      await load();
    } catch (err) {
      showNotification("Unable to check emails", "error");
    }
  };

  const load = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load mailboxes (no pagination needed)
      const mailboxesResponse = await fetch("/api/mailboxes");
      if (mailboxesResponse.ok) {
        const mailboxesData = await mailboxesResponse.json();
        setMailboxes(mailboxesData);
      }
      
      // Load drafts with pagination
      const draftsResponse = await fetch(`/api/drafts?page=${page}&limit=${itemsPerPage}`);
      if (!draftsResponse.ok) {
        throw new Error(`Failed to load drafts: ${draftsResponse.statusText}`);
      }
      const draftsResult = await draftsResponse.json();
      setDrafts(draftsResult.data || []);
      
      // Load pending emails with pagination
      const pendingResponse = await fetch(`/api/emails/pending?page=${page}&limit=${itemsPerPage}`);
      if (pendingResponse.ok) {
        const pendingResult = await pendingResponse.json();
        setPendingEmails(pendingResult.data || []);
        
        // Update pagination info from pending emails
        if (pendingResult.pagination) {
          setTotalPages(pendingResult.pagination.pages);
          setTotalItems(pendingResult.pagination.total);
        }
      }
      
      // Load spam count
      setSpamCount(0);
    } catch (err) {
      console.error("Error loading drafts:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load drafts. Please ensure the database is set up correctly."
      );
      setDrafts([]);
      setPendingEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    
    // Auto-check emails every hour (client-side)
    // Vercel Hobby plan only allows daily cron, so we check hourly when page is open
    const autoCheckInterval = setInterval(async () => {
      console.log('[AUTO-CHECK] Running hourly email check...');
      try {
        const response = await fetch('/api/emails/check-now', { method: 'POST' });
        if (response.ok) {
          console.log('[AUTO-CHECK] Email check completed');
          await load(); // Reload emails
        }
      } catch (err) {
        console.error('[AUTO-CHECK] Failed:', err);
      }
    }, 60 * 60 * 1000); // 1 hour in milliseconds
    
    return () => clearInterval(autoCheckInterval);
  }, []);

  // Search handler
  const handleSearch = async (filters: SearchFiltersType) => {
    try {
      setLoading(true);
      setSearchFilters(filters);
      setSearchMode(true);
      setCurrentPage(1);
      setSelectedEmailIds([]);
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.query) params.set('q', filters.query);
      if (filters.mailbox && filters.mailbox !== 'all') params.set('mailbox', filters.mailbox);
      if (filters.dateFrom) params.set('from', filters.dateFrom);
      if (filters.dateTo) params.set('to', filters.dateTo);
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.minSpam) params.set('minSpam', filters.minSpam);
      if (filters.maxSpam) params.set('maxSpam', filters.maxSpam);
      params.set('page', '1');
      params.set('limit', itemsPerPage.toString());
      
      const response = await fetch(`/api/emails/search?${params.toString()}`);
      if (!response.ok) throw new Error('Search failed');
      
      const result = await response.json();
      setPendingEmails(result.data.emails || []);
      setDrafts(result.data.drafts || []);
      
      if (result.pagination) {
        setTotalPages(result.pagination.pages);
        setTotalItems(result.pagination.total);
      }
      
      showNotification(`Found ${result.pagination?.total || 0} results`, 'success');
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Clear search and return to normal view
  const handleClearSearch = () => {
    setSearchMode(false);
    setSearchFilters({
      query: "",
      mailbox: "all",
      dateFrom: "",
      dateTo: "",
      status: "all",
      minSpam: "",
      maxSpam: ""
    });
    setCurrentPage(1);
    setSelectedEmailIds([]);
    void load(1);
  };

  // Page change handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedEmailIds([]);
    if (searchMode) {
      void handleSearch({ ...searchFilters });
    } else {
      void load(page);
    }
  };

  // Bulk action handlers
  const handleSelectAll = () => {
    const allIds = pendingEmails.map(e => e.id);
    setSelectedEmailIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedEmailIds([]);
  };

  const handleBulkAction = async (action: 'archive' | 'delete' | 'mark-spam') => {
    if (selectedEmailIds.length === 0) return;
    
    const actionLabels = {
      'archive': 'archived',
      'delete': 'deleted',
      'mark-spam': 'marked as spam'
    };
    
    try {
      setBulkActionLoading(true);
      const response = await fetch('/api/emails/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailIds: selectedEmailIds,
          action
        })
      });
      
      if (!response.ok) throw new Error('Bulk action failed');
      
      const result = await response.json();
      showNotification(`${result.affected} emails ${actionLabels[action]}`, 'success');
      
      // Refresh data
      setSelectedEmailIds([]);
      if (searchMode) {
        await handleSearch(searchFilters);
      } else {
        await load(currentPage);
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Bulk action failed', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const update = async (id: string, body: Record<string, string>) => {
    const response = await fetch(`/api/drafts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to update");
    }
  };

  const send = async (draft: Draft) => {
    if (!window.confirm("Send this reply now?")) return;
    try {
      console.log('[SEND] Starting send for draft:', draft.id);
      
      // Save any edits first
      await update(draft.id, { draft_body: draft.draft_body });
      console.log('[SEND] Draft saved, now sending...');
      
      const response = await fetch(`/api/drafts/${draft.id}/send`, {
        method: "POST",
      });
      
      console.log('[SEND] Response status:', response.status);
      
      if (!response.ok) {
        const data = await response.json();
        console.error('[SEND] Send failed:', data);
        throw new Error(data.error || "Failed to send");
      }
      
      const result = await response.json();
      console.log('[SEND] Send successful:', result);
      
      showNotification("Reply sent successfully! ✅", "success");
      void load();
    } catch (err) {
      console.error('[SEND] Send error:', err);
      showNotification(err instanceof Error ? err.message : "Unable to send reply", "error");
    }
  };

  const remove = async (id: string) => {
    // Only deletes the draft reply, NOT the original email
    try {
      await update(id, { status: "deleted" });
      setDrafts((items) => items.filter((item) => item.id !== id));
      showNotification("Draft deleted (email kept)", "success");
      
      // Reload to show the email in pending again
      console.log('[DELETE-DRAFT] Reloading to show email in pending...');
      await load();
    } catch {
      showNotification("Unable to delete draft", "error");
    }
  };

  const deleteSpam = async (emailId: string, draftId: string) => {
    if (!window.confirm("Delete this spam email from inbox and database?")) return;
    try {
      const response = await fetch(`/api/emails/${emailId}/delete-spam`, {
        method: "POST",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }
      setDrafts((items) => items.filter((item) => item.id !== draftId));
      showNotification("Spam deleted from inbox!", "success");
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Unable to delete spam", "error");
    }
  };

  const getSpamLabel = (score: number) => {
    if (score >= 80) return { emoji: "🚫", text: "Very High Spam", color: "#dc2626" };
    if (score >= 60) return { emoji: "⚠️", text: "High Spam", color: "#ea580c" };
    if (score >= 40) return { emoji: "⚡", text: "Possible Spam", color: "#f59e0b" };
    if (score >= 20) return { emoji: "⚪", text: "Low Spam", color: "#84cc16" };
    return { emoji: "✅", text: "Legitimate", color: "#10b981" };
  };

  const markAsSpam = async (emailId: string, draftId: string) => {
    try {
      console.log('[markAsSpam] Starting for emailId:', emailId, 'draftId:', draftId);
      const response = await fetch(`/api/emails/${emailId}/mark-spam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_spam: true }),
      });
      console.log('[markAsSpam] Response status:', response.status, response.statusText);
      if (!response.ok) {
        const data = await response.json();
        console.error('[markAsSpam] API error:', data);
        throw new Error(data.error || "Failed to mark as spam");
      }
      const result = await response.json();
      console.log('[markAsSpam] Success:', result);
      // Remove from drafts if it has a draft
      if (draftId) {
        setDrafts((items) => items.filter((item) => item.id !== draftId));
      }
      // Remove from pending emails
      setPendingEmails((items) => items.filter((item) => item.id !== emailId));
      showNotification("Marked as spam! System is learning...", "success");
    } catch (err) {
      console.error('[markAsSpam] Error:', err);
      showNotification(err instanceof Error ? err.message : "Unable to mark as spam. Migration may be required.", "error");
    }
  };

  const archiveEmail = async (emailId: string, draftId: string) => {
    setArchivingEmailId(emailId);
    try {
      const response = await fetch(`/api/emails/${emailId}/archive`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to archive email");
      }
      
      // Remove from drafts if it has a draft
      if (draftId) {
        setDrafts((items) => items.filter((item) => item.id !== draftId));
      }
      // Remove from pending emails
      setPendingEmails((items) => items.filter((item) => item.id !== emailId));
      showNotification("Email archived successfully!", "success");
    } catch (err) {
      console.error("Archive error:", err);
      showNotification(err instanceof Error ? err.message : "Unable to archive email", "error");
    } finally {
      setArchivingEmailId(null);
    }
  };

  const generateReply = async (emailId: string) => {
    try {
      setGeneratingFor(emailId);
      showNotification("Generating AI reply...", "info");
      
      console.log('[GENERATE] Starting for emailId:', emailId);
      
      const response = await fetch(`/api/emails/${emailId}/generate-reply`, {
        method: "POST",
      });
      
      console.log('[GENERATE] Response status:', response.status);
      
      if (!response.ok) {
        const data = await response.json();
        console.error('[GENERATE] Generation failed:', data);
        
        // Check for OpenRouter credit error
        if (data.error && (data.error.includes("Insufficient credits") || data.error.includes("402"))) {
          setOpenrouterCreditsLow(true);
          showNotification("Using DeepSeek fallback (OpenRouter credits low)", "warning");
          // Still reload to show the draft if it was generated via fallback
          void load();
          return;
        }
        
        throw new Error(data.error || "Failed to generate reply");
      }
      
      const result = await response.json();
      console.log('[GENERATE] Result:', result);
      
      showNotification("✅ AI reply generated!", "success");
      
      // Reload to show the draft
      await load();
      
      // Auto-scroll to drafts section after a short delay
      setTimeout(() => {
        const allH2 = Array.from(document.querySelectorAll('h2'));
        const draftsHeading = allH2.find(h => h.textContent?.includes('AI Drafts'));
        if (draftsHeading) {
          draftsHeading.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // Fallback: scroll to first draft card
          const firstDraft = document.querySelector('.draft-card');
          if (firstDraft) {
            firstDraft.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }, 500);
    } catch (err) {
      console.error('[GENERATE] Error:', err);
      showNotification(err instanceof Error ? err.message : "Unable to generate reply", "error");
    } finally {
      setGeneratingFor(null);
    }
  };

  const createManualDraft = async (emailId: string) => {
    try {
      console.log('[MANUAL] Creating manual draft for emailId:', emailId);
      
      // Create empty draft
      const response = await fetch(`/api/drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_id: emailId,
          draft_body: "Write your reply here..."
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create manual draft");
      }
      
      const result = await response.json();
      const draftId = result.draft_id;
      
      showNotification("✅ Manual draft created!", "success");
      await load();
      
      // Auto-scroll to the new draft AND focus the textarea
      setTimeout(() => {
        const allDrafts = document.querySelectorAll('.draft-card');
        const draftCards = Array.from(allDrafts);
        
        // Find the draft card (last one added)
        if (draftCards.length > 0) {
          const lastDraft = draftCards[0]; // Newest draft is first (sorted by updated_at desc)
          lastDraft.scrollIntoView({ behavior: "smooth", block: "center" });
          
          // Focus the textarea inside this draft
          setTimeout(() => {
            const textarea = lastDraft.querySelector('textarea') as HTMLTextAreaElement;
            if (textarea) {
              textarea.focus();
              textarea.select(); // Select all text so user can start typing immediately
              console.log('[MANUAL] Textarea focused and text selected');
            }
          }, 300);
        }
      }, 500);
    } catch (err) {
      console.error('[MANUAL] Error:', err);
      showNotification(err instanceof Error ? err.message : "Unable to create manual draft", "error");
    }
  };

  const loadHistory = async (emailId: string) => {
    try {
      setLoadingHistory(true);
      const response = await fetch(`/api/emails/${emailId}/history`);
      if (response.ok) {
        const data = await response.json();
        setEmailHistory(data);
      } else {
        setEmailHistory([]);
      }
    } catch (err) {
      console.error("Error loading history:", err);
      setEmailHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const openSidebar = (emailId: string) => {
    setSidebarEmailId(emailId);
    setSidebarOpen(true);
    void loadHistory(emailId);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSidebarEmailId(null);
    setEmailHistory([]);
  };

  const isSelfSent = (draft: Draft) => {
    const fromEmail = draft.emails.from_email?.toLowerCase();
    const toEmail = draft.emails.mailboxes.email.toLowerCase();
    return fromEmail === toEmail;
  };

  // Filter drafts and pending emails by selected mailbox
  const filteredDrafts = selectedMailbox === "all" 
    ? drafts 
    : drafts.filter(d => d.mailbox_id === selectedMailbox);
  
  // Auto-hide spam emails (manually marked OR score >= 50) from pending list
  let filteredPendingEmails = (selectedMailbox === "all"
    ? pendingEmails
    : pendingEmails.filter(e => e.mailbox_id === selectedMailbox))
    .filter(e => !e.is_spam && (e.spam_score || 0) < 50); // Hide spam
  
  // Sort pending emails
  filteredPendingEmails = [...filteredPendingEmails].sort((a, b) => {
    let compareValue = 0;
    
    if (sortBy === "date") {
      const dateA = new Date(a.received_at || 0).getTime();
      const dateB = new Date(b.received_at || 0).getTime();
      compareValue = dateA - dateB; // Older first (asc default), will be flipped for desc
    } else if (sortBy === "sender") {
      compareValue = (a.from_email || "").localeCompare(b.from_email || ""); // A->Z (asc default)
    } else if (sortBy === "subject") {
      compareValue = (a.subject || "").localeCompare(b.subject || ""); // A->Z (asc default)
    } else if (sortBy === "spam") {
      compareValue = (a.spam_score || 0) - (b.spam_score || 0); // Lower spam first (asc default)
    }
    
    return sortOrder === "desc" ? -compareValue : compareValue;
  });

  return (
    <main className="mail-shell">
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <a className="brand" href="/">
            inbox<span>draft</span>
          </a>
          <span style={{ 
            fontSize: "0.7rem", 
            color: "#9ca3af",
            fontWeight: "500"
          }}>
            v1.0.17
          </span>
        </div>
        <nav>
          <a className="active" href="/drafts">
            Inbox
          </a>
          <a href="/mailboxes">Mailboxes</a>
          <a href="/bram-forward">📨 Forward</a>
          <a href="/settings">Settings</a>
          <a href="/spam">
            Spam {spamCount > 0 && <span style={{ 
              background: "#dc2626", 
              color: "white", 
              padding: "0.2rem 0.5rem", 
              borderRadius: "1rem", 
              fontSize: "0.75rem",
              marginLeft: "0.25rem"
            }}>{spamCount}</span>}
          </a>
          <a href="/archive">Archive</a>
        </nav>
        <EmailCheckCountdown onCheckNow={checkNow} />
      </header>
      
      {/* OpenRouter Credits Warning Banner */}
      {openrouterCreditsLow && (
        <div style={{
          background: "#fef3c7",
          borderBottom: "1px solid #f59e0b",
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.5rem" }}>⚠️</span>
            <div>
              <strong style={{ color: "#92400e" }}>OpenRouter credits low</strong>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#78350f" }}>
                Using DeepSeek as fallback. Add credits at{" "}
                <a 
                  href="https://openrouter.ai/settings/credits" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "#92400e", textDecoration: "underline" }}
                >
                  openrouter.ai/settings/credits
                </a>
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpenrouterCreditsLow(false)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1.25rem",
              color: "#92400e",
              padding: "0.25rem"
            }}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      
      <section className="content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Manage your emails</p>
            <h1>Inbox</h1>
            <p className="lede">
              Generate AI replies on-demand, review every reply before sending.
            </p>
          </div>
          <span className="count">
            {drafts.length} drafts · {pendingEmails.length} pending
          </span>
        </div>

        {/* Connection Status Summary - Compact */}
        {mailboxes.length > 0 && (
          <div style={{ 
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            background: "#fafafa",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
            fontSize: "0.85rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              <span style={{ fontWeight: "500", color: "#6b7280" }}>📡 Mailboxes:</span>
              {mailboxes.map((mailbox) => {
                const imapOk = mailbox.imap_status === "online";
                const smtpOk = mailbox.smtp_status === "online";
                const imapUnknown = !mailbox.imap_status || mailbox.imap_status === "unknown";
                const smtpUnknown = !mailbox.smtp_status || mailbox.smtp_status === "unknown";
                
                const getStatusIcon = () => {
                  if (imapOk && smtpOk) return "🟢";
                  if ((!imapOk && !imapUnknown) || (!smtpOk && !smtpUnknown)) return "🔴";
                  return "⚪";
                };
                
                const getStatusColor = () => {
                  if (imapOk && smtpOk) return "#059669";
                  if ((!imapOk && !imapUnknown) || (!smtpOk && !smtpUnknown)) return "#dc2626";
                  return "#9ca3af";
                };
                
                return (
                  <a
                    key={mailbox.id}
                    href="/mailboxes"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      textDecoration: "none",
                      color: getStatusColor(),
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    title={`${mailbox.email}\nIMAP: ${mailbox.imap_status || 'unknown'}\nSMTP: ${mailbox.smtp_status || 'unknown'}${mailbox.last_imap_check ? '\nLast check: ' + new Date(mailbox.last_imap_check).toLocaleString() : ''}${mailbox.first_import_date ? '\nImporting since: ' + new Date(mailbox.first_import_date).toLocaleDateString() : ''}`}
                  >
                    <span>{getStatusIcon()}</span>
                    <span style={{ fontWeight: "500" }}>{mailbox.email.split('@')[0]}</span>
                  </a>
                );
              })}
            </div>
            
            {/* Compact status message */}
            {(() => {
              const hasUnknown = mailboxes.some(m => !m.imap_status || m.imap_status === "unknown");
              const hasFailed = mailboxes.some(m => m.imap_status === "offline" || m.smtp_status === "offline");
              
              if (hasFailed) {
                return (
                  <div style={{ marginTop: "0.5rem", color: "#dc2626", fontSize: "0.8rem" }}>
                    ⚠️ Some connections failed. <a href="/mailboxes" style={{ textDecoration: "underline", color: "#dc2626" }}>Check credentials →</a>
                  </div>
                );
              }
              
              if (hasUnknown) {
                return (
                  <div style={{ marginTop: "0.5rem", color: "#6b7280", fontSize: "0.8rem" }}>
                    ℹ️ Connections auto-check every 1 hour
                  </div>
                );
              }
              
              return null;
            })()}
          </div>
        )}

        {/* Mailbox Filter Dropdown */}
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
                fontSize: "1rem",
                width: "100%",
                maxWidth: "400px",
                cursor: "pointer"
              }}
            >
              <option value="all">All Mailboxes ({drafts.length + pendingEmails.length})</option>
              {mailboxes.map((mailbox) => {
                const mailboxDrafts = drafts.filter(d => d.mailbox_id === mailbox.id).length;
                const mailboxPending = pendingEmails.filter(e => e.mailbox_id === mailbox.id).length;
                const total = mailboxDrafts + mailboxPending;
                return (
                  <option key={mailbox.id} value={mailbox.id}>
                    {mailbox.email} ({total})
                  </option>
                );
              })}
            </select>
          </div>
        )}
        
        {/* Sort Controls */}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          alignItems: "flex-end"
        }}>
          <div style={{ flex: "1" }}>
            <label 
              style={{ 
                display: "block", 
                marginBottom: "0.5rem", 
                fontSize: "0.9rem", 
                fontWeight: "600",
                color: "#374151"
              }}
            >
              Sort by:
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={() => setSortBy("date")}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: sortBy === "date" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                  background: sortBy === "date" ? "#eff6ff" : "white",
                  color: sortBy === "date" ? "#1e40af" : "#374151",
                  fontSize: "0.9rem",
                  fontWeight: sortBy === "date" ? "600" : "400",
                  cursor: "pointer"
                }}
              >
                📅 Date
              </button>
              <button
                onClick={() => setSortBy("sender")}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: sortBy === "sender" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                  background: sortBy === "sender" ? "#eff6ff" : "white",
                  color: sortBy === "sender" ? "#1e40af" : "#374151",
                  fontSize: "0.9rem",
                  fontWeight: sortBy === "sender" ? "600" : "400",
                  cursor: "pointer"
                }}
              >
                👤 Sender
              </button>
              <button
                onClick={() => setSortBy("subject")}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: sortBy === "subject" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                  background: sortBy === "subject" ? "#eff6ff" : "white",
                  color: sortBy === "subject" ? "#1e40af" : "#374151",
                  fontSize: "0.9rem",
                  fontWeight: sortBy === "subject" ? "600" : "400",
                  cursor: "pointer"
                }}
              >
                📝 Subject
              </button>
              <button
                onClick={() => setSortBy("spam")}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: sortBy === "spam" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                  background: sortBy === "spam" ? "#eff6ff" : "white",
                  color: sortBy === "spam" ? "#1e40af" : "#374151",
                  fontSize: "0.9rem",
                  fontWeight: sortBy === "spam" ? "600" : "400",
                  cursor: "pointer"
                }}
              >
                🚫 Spam Score
              </button>
            </div>
          </div>
          
          <div style={{ flex: "1" }}>
            <label 
              style={{ 
                display: "block", 
                marginBottom: "0.5rem", 
                fontSize: "0.9rem", 
                fontWeight: "600",
                color: "#374151"
              }}
            >
              Order:
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={() => setSortOrder("desc")}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: sortOrder === "desc" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                  background: sortOrder === "desc" ? "#eff6ff" : "white",
                  color: sortOrder === "desc" ? "#1e40af" : "#374151",
                  fontSize: "0.9rem",
                  fontWeight: sortOrder === "desc" ? "600" : "400",
                  cursor: "pointer"
                }}
              >
                {sortBy === "date" ? "⬇️ Newest First" : sortBy === "spam" ? "⬇️ Highest First" : "⬇️ Z → A"}
              </button>
              <button
                onClick={() => setSortOrder("asc")}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: sortOrder === "asc" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                  background: sortOrder === "asc" ? "#eff6ff" : "white",
                  color: sortOrder === "asc" ? "#1e40af" : "#374151",
                  fontSize: "0.9rem",
                  fontWeight: sortOrder === "asc" ? "600" : "400",
                  cursor: "pointer"
                }}
              >
                {sortBy === "date" ? "⬆️ Oldest First" : sortBy === "spam" ? "⬆️ Lowest First" : "⬆️ A → Z"}
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div
            style={{
              padding: "4rem 2rem",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</p>
            <p style={{ fontSize: "1.2rem" }}>Loading drafts...</p>
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              padding: "3rem 2rem",
              textAlign: "center",
              background: "#fef2f2",
              borderRadius: "0.75rem",
              border: "2px solid #dc2626",
              maxWidth: "600px",
              margin: "2rem auto",
            }}
          >
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</p>
            <p
              style={{
                color: "#991b1b",
                fontWeight: "bold",
                fontSize: "1.2rem",
                marginBottom: "0.5rem",
              }}
            >
              Database Connection Error
            </p>
            <p
              style={{
                color: "#991b1b",
                fontSize: "0.95rem",
                marginBottom: "1.5rem",
              }}
            >
              {error}
            </p>
            <div
              style={{
                background: "#fee2e2",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                textAlign: "left",
                fontSize: "0.95rem",
              }}
            >
              <p
                style={{
                  fontWeight: "bold",
                  marginBottom: "0.75rem",
                  color: "#991b1b",
                }}
              >
                🔧 To fix this issue:
              </p>
              <ol style={{ marginLeft: "1.5rem", color: "#7f1d1d" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  Open the{" "}
                  <a
                    href="https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#dc2626",
                      textDecoration: "underline",
                      fontWeight: "bold",
                    }}
                  >
                    Supabase SQL Editor
                  </a>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Run the database migration from{" "}
                  <code
                    style={{
                      background: "#fff",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "0.25rem",
                      color: "#dc2626",
                    }}
                  >
                    /supabase/migrations/001_email_drafts.sql
                  </code>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Click the <strong>"Run"</strong> button
                </li>
                <li>Reload this page</li>
              </ol>
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  background: "#fff",
                  borderRadius: "0.25rem",
                  fontSize: "0.85rem",
                  color: "#6b7280",
                }}
              >
                💡 Need help? Check{" "}
                <code style={{ color: "#dc2626" }}>MEMORY.md</code> for
                step-by-step instructions.
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        {!loading && !error && (
          <SearchFilters
            mailboxes={mailboxes}
            onSearch={handleSearch}
            loading={loading}
          />
        )}

        {/* Bulk Actions - Sticky when items selected */}
        {!loading && !error && pendingEmails.length > 0 && selectedEmailIds.length > 0 && (
          <div style={{
            position: "sticky",
            bottom: 0,
            zIndex: 100,
            background: "white",
            borderTop: "2px solid #3b82f6",
            boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.1)",
            padding: "1rem",
            marginTop: "2rem"
          }}>
            <BulkActions
              selectedIds={selectedEmailIds}
              totalItems={pendingEmails.length}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onArchive={() => void handleBulkAction('archive')}
              onDelete={() => void handleBulkAction('delete')}
              onMarkSpam={() => void handleBulkAction('mark-spam')}
              loading={bulkActionLoading}
            />
          </div>
        )}

        {!loading && !error && filteredDrafts.length === 0 && filteredPendingEmails.length === 0 && (
          <div className="empty">
            <strong>📭 No emails yet</strong>
            <span>
              New messages will appear here after the next daily check at
              midnight.
            </span>
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.9rem",
                color: "#6b7280",
              }}
            >
              💡 Tip: Add mailboxes in the{" "}
              <a
                href="/mailboxes"
                style={{ color: "#3b82f6", textDecoration: "underline" }}
              >
                Mailboxes
              </a>{" "}
              page to get started.
            </p>
          </div>
        )}

        {!loading && !error && filteredPendingEmails.length > 0 && (
          <>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "#374151" }}>
              📬 Pending Emails ({filteredPendingEmails.length})
            </h2>
            <div className="draft-list">
              {filteredPendingEmails.map((email) => {
                const spamScore = email.spam_score || 0;
                const spamLabel = getSpamLabel(spamScore);
                const isHighSpam = spamScore >= 60;
                const isGenerating = generatingFor === email.id;
                
                return (
                  <article 
                    className="draft-card" 
                    key={email.id} 
                    style={isHighSpam ? { borderLeft: "4px solid #f59e0b", background: "#fffbeb" } : { borderLeft: "4px solid #d1d5db" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                      {/* Selection checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedEmailIds.includes(email.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmailIds([...selectedEmailIds, email.id]);
                          } else {
                            setSelectedEmailIds(selectedEmailIds.filter(id => id !== email.id));
                          }
                        }}
                        style={{
                          width: "18px",
                          height: "18px",
                          marginTop: "0.25rem",
                          cursor: "pointer"
                        }}
                      />
                      
                      <div style={{ flex: 1 }}>
                        <div className="draft-meta">
                          <span>
                            📧 {email.mailboxes.email}
                            {email.archived && <span style={{ marginLeft: "0.5rem", color: "#6b7280" }} title="Archived">📁</span>}
                            {email.is_spam && <span style={{ marginLeft: "0.5rem", color: "#ef4444" }} title="Spam">🚫</span>}
                            {!email.processed && <span style={{ marginLeft: "0.5rem", color: "#3b82f6" }} title="New">🆕</span>}
                          </span>
                          <time>{formatDate(email.received_at)}</time>
                        </div>
                        
                        {/* Spam Score Badge */}
                        <div style={{ 
                          display: "inline-block", 
                          padding: "0.25rem 0.75rem", 
                          borderRadius: "1rem", 
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          background: spamScore >= 60 ? "#fee2e2" : spamScore >= 40 ? "#fef3c7" : "#f0fdf4",
                          color: spamLabel.color,
                          marginBottom: "0.5rem"
                        }}>
                          {spamLabel.emoji} Spam Score: {spamScore}/100 - {spamLabel.text}
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
                        onClick={() => void generateReply(email.id)}
                        disabled={isGenerating}
                        style={{ 
                          background: isGenerating ? "#9ca3af" : "#10b981",
                          cursor: isGenerating ? "not-allowed" : "pointer",
                          padding: "0.75rem 1.25rem",
                          fontSize: "0.95rem"
                        }}
                      >
                        {isGenerating ? "⏳ Generating..." : "✨ Generate AI Reply"}
                      </button>
                      <button
                        className="button"
                        onClick={() => void createManualDraft(email.id)}
                        style={{ background: "#8b5cf6", color: "white", padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
                      >
                        ✍️ Manual Reply
                      </button>
                      <button
                        className="button"
                        onClick={() => setDetailViewEmail(email)}
                        style={{ background: "#3b82f6", color: "white", padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
                      >
                        📋 Details
                      </button>
                      <button
                        className="button"
                        onClick={() => void archiveEmail(email.id, "")}
                        style={{ background: "#3b82f6", color: "white", padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
                        disabled={archivingEmailId === email.id}
                      >
                        {archivingEmailId === email.id ? "⏳ Archiving..." : "📁 Archive"}
                      </button>
                      <button
                        className="button"
                        onClick={() => void markAsSpam(email.id, "")}
                        style={{ background: "#f59e0b", color: "white", padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
                        disabled={isGenerating}
                      >
                        🚩 Mark as Spam
                      </button>
                    </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            
            {/* Pagination for pending emails */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                loading={loading}
              />
            )}
          </>
        )}

        {!loading && !error && filteredDrafts.length > 0 && (
          <>
            <h2 style={{ fontSize: "1.25rem", marginTop: "2rem", marginBottom: "1rem", color: "#374151" }}>
              📝 AI Drafts ({filteredDrafts.length})
            </h2>
            <div className="draft-list">
            {filteredDrafts.map((draft) => {
              const spamScore = draft.emails.spam_score || 0;
              const spamLabel = getSpamLabel(spamScore);
              const isHighSpam = spamScore >= 60;
              const selfSent = isSelfSent(draft);
              
              return (
              <article className="draft-card" key={draft.id} style={isHighSpam ? { borderLeft: "4px solid #dc2626", background: "#fef2f2" } : selfSent ? { borderLeft: "4px solid #3b82f6", background: "#eff6ff" } : {}}>
                <div className="draft-meta">
                  <span>
                    📧 {draft.emails.mailboxes.email}
                    {draft.emails.is_archived && <span style={{ marginLeft: "0.5rem", color: "#6b7280" }} title="Archived">📁</span>}
                    {draft.emails.is_spam && <span style={{ marginLeft: "0.5rem", color: "#ef4444" }} title="Spam">🚫</span>}
                    {draft.status === "sent" && <span style={{ marginLeft: "0.5rem", color: "#10b981" }} title="Sent">✅</span>}
                  </span>
                  <time>{formatDate(draft.emails.received_at)}</time>
                </div>
                
                {/* Self-sent warning */}
                {selfSent && (
                  <div style={{ 
                    padding: "0.75rem", 
                    borderRadius: "0.5rem", 
                    background: "#dbeafe",
                    border: "1px solid #3b82f6",
                    color: "#1e40af",
                    marginBottom: "0.75rem",
                    fontSize: "0.9rem"
                  }}>
                    ℹ️ <strong>Self-sent email:</strong> This email was sent from your own mailbox ({draft.emails.mailboxes.email})
                  </div>
                )}
                
                {/* Spam Score Badge */}
                <div style={{ 
                  display: "inline-block", 
                  padding: "0.25rem 0.75rem", 
                  borderRadius: "1rem", 
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  background: spamScore >= 60 ? "#fee2e2" : spamScore >= 40 ? "#fef3c7" : "#f0fdf4",
                  color: spamLabel.color,
                  marginBottom: "0.5rem"
                }}>
                  {spamLabel.emoji} Spam Score: {spamScore}/100 - {spamLabel.text}
                </div>

                <h2>{draft.emails.subject || "(No subject)"}</h2>
                <p className="sender">
                  {draft.emails.from_name || draft.emails.from_email || "Unknown sender"}{" "}
                  <span>{draft.emails.from_email}</span>
                </p>
                <p className="original">
                  {draft.emails.body?.slice(0, 400)}
                  {(draft.emails.body?.length || 0) > 400 ? "..." : ""}
                </p>
                <textarea
                  aria-label="Draft reply"
                  defaultValue={draft.draft_body}
                  onChange={(event) => {
                    draft.draft_body = event.target.value;
                  }}
                />
                <div className="actions">
                  {selfSent ? (
                    <>
                      <button
                        className="button primary"
                        onClick={() => void archiveEmail(draft.emails.id, draft.id)}
                        style={{ background: "#3b82f6" }}
                        disabled={archivingEmailId === draft.emails.id}
                      >
                        {archivingEmailId === draft.emails.id ? "⏳ Archiving..." : "📁 Archive"}
                      </button>
                      <button
                        className="button"
                        onClick={() => openSidebar(draft.emails.id)}
                        style={{ background: "#3b82f6", color: "white" }}
                      >
                        📋 Details
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="button ghost"
                        onClick={async () => {
                          try {
                            await update(draft.id, { draft_body: draft.draft_body });
                            showNotification("Draft saved", "success");
                          } catch (err) {
                            showNotification(err instanceof Error ? err.message : "Failed to save draft", "error");
                          }
                        }}
                        style={{ padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
                      >
                        💾 Edit / Save
                      </button>
                      <button
                        className="button primary"
                        onClick={() => void send(draft)}
                        style={{ padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
                      >
                        ✉️ Send
                      </button>
                      <button
                        className="button"
                        onClick={() => openSidebar(draft.emails.id)}
                        style={{ background: "#3b82f6", color: "white", padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
                      >
                        📋 Details
                      </button>
                    </>
                  )}
                  {isHighSpam && (
                    <button
                      className="button danger"
                      onClick={() => void deleteSpam(draft.emails.id, draft.id)}
                      style={{ background: "#dc2626", padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
                    >
                      🚫 Delete Spam
                    </button>
                  )}
                  <button
                    className="button"
                    onClick={() => void markAsSpam(draft.emails.id, draft.id)}
                    style={{ background: "#f59e0b", color: "white", padding: "0.75rem 1.25rem", fontSize: "0.95rem" }}
                  >
                    🚩 Mark as Spam
                  </button>
                  <button
                    className="button danger"
                    onClick={() => void remove(draft.id)}
                  >
                    🗑️ Delete Draft
                  </button>
                </div>
              </article>
              );
            })}
          </div>
          </>
        )}
      </section>

      {/* Right Sidebar - Email History */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <aside
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "450px",
              maxWidth: "90vw",
              background: "white",
              boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              overflowY: "auto",
              padding: "2rem",
            }}
          >
            {/* Header */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "1.5rem",
              paddingBottom: "1rem",
              borderBottom: "2px solid #e5e7eb"
            }}>
              <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#111827" }}>
                📧 Email History
              </h2>
              <button
                onClick={closeSidebar}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "0.25rem",
                  lineHeight: 1,
                }}
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>

            {/* Loading State */}
            {loadingHistory && (
              <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</p>
                <p>Loading history...</p>
              </div>
            )}

            {/* Empty State */}
            {!loadingHistory && emailHistory.length === 0 && (
              <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</p>
                <p>No previous emails from this sender</p>
              </div>
            )}

            {/* History List */}
            {!loadingHistory && emailHistory.length > 0 && (
              <>
                <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Found {emailHistory.length} previous email{emailHistory.length !== 1 ? "s" : ""} from this sender
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {emailHistory.map((email) => (
                    <article
                      key={email.id}
                      style={{
                        padding: "1rem",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        background: "#f9fafb",
                      }}
                    >
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        marginBottom: "0.5rem"
                      }}>
                        <time style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                          {formatDate(email.received_at)}
                        </time>
                        {email.spam_score !== undefined && (
                          <span style={{
                            fontSize: "0.75rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "0.25rem",
                            background: email.spam_score >= 60 ? "#fee2e2" : email.spam_score >= 40 ? "#fef3c7" : "#f0fdf4",
                            color: email.spam_score >= 60 ? "#dc2626" : email.spam_score >= 40 ? "#f59e0b" : "#059669",
                          }}>
                            Spam: {email.spam_score}
                          </span>
                        )}
                      </div>
                      <h3 style={{ 
                        margin: "0 0 0.5rem 0", 
                        fontSize: "1rem",
                        color: "#111827"
                      }}>
                        {email.subject || "(No subject)"}
                      </h3>
                      <p style={{ 
                        fontSize: "0.9rem", 
                        color: "#4b5563",
                        margin: 0,
                        lineHeight: "1.5"
                      }}>
                        {email.body?.slice(0, 150)}
                        {(email.body?.length || 0) > 150 ? "..." : ""}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </aside>
        </>
      )}

      {/* Email Detail View Modal */}
      {detailViewEmail && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div style={{
            background: "white",
            borderRadius: "0.75rem",
            maxWidth: "800px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            {/* Header */}
            <div style={{
              padding: "1.5rem",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Email Details</h2>
              <button
                onClick={() => {
                  setDetailViewEmail(null);
                  setDetailViewDraft(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: "0.25rem"
                }}
              >
                ✕
              </button>
            </div>

            {/* Email Content */}
            <div style={{ padding: "1.5rem" }}>
              {/* Draft Preview - MOVED TO TOP */}
              {detailViewDraft && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <strong style={{ display: "block", color: "#059669", fontSize: "1.1rem", marginBottom: "0.75rem" }}>
                    ✅ AI Generated Reply:
                  </strong>
                  <div style={{
                    padding: "1.25rem",
                    background: "#f0fdf4",
                    border: "2px solid #86efac",
                    borderRadius: "0.5rem",
                    whiteSpace: "pre-wrap",
                    fontSize: "0.95rem",
                    lineHeight: "1.6"
                  }}>
                    {detailViewDraft}
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "#6b7280", marginTop: "0.75rem", fontStyle: "italic" }}>
                    💡 Close this dialog to edit and send from the main inbox view.
                  </p>
                </div>
              )}

              {(() => {
                const parsed = parseContactFormEmail(detailViewEmail.body || "");
                
                return (
                  <>
                    {/* Compact Header - All info in one row */}
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                      padding: "1rem",
                      background: "#f9fafb",
                      borderRadius: "0.5rem",
                      marginBottom: "1.5rem",
                      fontSize: "0.85rem"
                    }}>
                      <div>
                        <strong style={{ color: "#6b7280" }}>From:</strong>
                        <div style={{ marginTop: "0.25rem" }}>{detailViewEmail.from_name || detailViewEmail.from_email || "Unknown"}</div>
                      </div>
                      <div>
                        <strong style={{ color: "#6b7280" }}>To:</strong>
                        <div style={{ marginTop: "0.25rem" }}>{detailViewEmail.mailboxes.email}</div>
                      </div>
                      <div>
                        <strong style={{ color: "#6b7280" }}>Date:</strong>
                        <div style={{ marginTop: "0.25rem" }}>{formatDate(detailViewEmail.received_at)}</div>
                      </div>
                      <div>
                        <strong style={{ color: "#6b7280" }}>Spam:</strong>
                        <div style={{ 
                          marginTop: "0.25rem",
                          color: (detailViewEmail.spam_score || 0) >= 60 ? "#dc2626" : (detailViewEmail.spam_score || 0) >= 40 ? "#f59e0b" : "#059669",
                          fontWeight: "600"
                        }}>
                          {detailViewEmail.spam_score || 0}/100
                        </div>
                      </div>
                    </div>

                    {/* Subject */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <strong style={{ fontSize: "1.1rem", color: "#111827" }}>{detailViewEmail.subject || "(No subject)"}</strong>
                    </div>

                    {/* Message - Contact Form or Plain */}
                    {parsed.isContactForm ? (
                      <div style={{ marginBottom: "1.5rem" }}>
                        <div style={{
                          padding: "1.5rem",
                          background: "#f0f9ff",
                          border: "2px solid #3b82f6",
                          borderRadius: "0.75rem"
                        }}>
                          <h3 style={{ margin: "0 0 1rem 0", color: "#1e40af", fontSize: "1rem" }}>
                            📬 Contact Form Submission
                          </h3>
                          
                          {parsed.name && (
                            <div style={{ marginBottom: "0.75rem" }}>
                              <strong style={{ color: "#374151" }}>Name:</strong>
                              <div style={{ marginTop: "0.25rem", fontSize: "1rem" }}>{parsed.name}</div>
                            </div>
                          )}
                          
                          {parsed.email && (
                            <div style={{ marginBottom: "0.75rem" }}>
                              <strong style={{ color: "#374151" }}>Email:</strong>
                              <div style={{ marginTop: "0.25rem" }}>
                                <a href={`mailto:${parsed.email}`} style={{ color: "#3b82f6" }}>{parsed.email}</a>
                              </div>
                            </div>
                          )}
                          
                          {parsed.message && (
                            <div>
                              <strong style={{ color: "#374151" }}>Message:</strong>
                              <div style={{
                                marginTop: "0.5rem",
                                padding: "1rem",
                                background: "white",
                                borderRadius: "0.5rem",
                                whiteSpace: "pre-wrap",
                                lineHeight: "1.6"
                              }}>
                                {parsed.message}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Show raw toggle */}
                        <details style={{ marginTop: "1rem" }}>
                          <summary style={{ cursor: "pointer", color: "#6b7280", fontSize: "0.85rem" }}>
                            📄 View raw email
                          </summary>
                          <div style={{
                            marginTop: "0.5rem",
                            padding: "1rem",
                            background: "#f9fafb",
                            borderRadius: "0.5rem",
                            whiteSpace: "pre-wrap",
                            fontSize: "0.85rem",
                            lineHeight: "1.6",
                            maxHeight: "300px",
                            overflow: "auto",
                            border: "1px solid #e5e7eb"
                          }}>
                            {detailViewEmail.body}
                          </div>
                        </details>
                      </div>
                    ) : (
                      <div style={{ marginBottom: "1.5rem" }}>
                        <strong style={{ display: "block", color: "#6b7280", fontSize: "0.9rem", marginBottom: "0.5rem" }}>Message:</strong>
                        <div style={{
                          padding: "1rem",
                          background: "#f9fafb",
                          borderRadius: "0.5rem",
                          whiteSpace: "pre-wrap",
                          fontSize: "0.95rem",
                          lineHeight: "1.6",
                          maxHeight: "500px",
                          overflow: "auto",
                          border: "1px solid #e5e7eb"
                        }}>
                          {detailViewEmail.body || "(No content)"}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.5rem" }}>
                          {detailViewEmail.body ? `${detailViewEmail.body.length} characters` : "Empty email body"}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <button
                  className="button primary"
                  onClick={async () => {
                    await generateReply(detailViewEmail.id);
                    // Fetch the generated draft
                    const draftResponse = await fetch("/api/drafts");
                    if (draftResponse.ok) {
                      const drafts = await draftResponse.json();
                      const draft = drafts.find((d: Draft) => d.email_id === detailViewEmail.id);
                      if (draft) {
                        setDetailViewDraft(draft.draft_body);
                      }
                    }
                  }}
                  disabled={generatingFor === detailViewEmail.id}
                  style={{
                    background: generatingFor === detailViewEmail.id ? "#9ca3af" : "#10b981",
                    cursor: generatingFor === detailViewEmail.id ? "not-allowed" : "pointer",
                    padding: "0.75rem 1.5rem",
                    fontSize: "1rem"
                  }}
                >
                  {generatingFor === detailViewEmail.id ? "⏳ Generating..." : "✨ Generate AI Reply"}
                </button>
                <button
                  className="button"
                  onClick={() => void markAsSpam(detailViewEmail.id, "")}
                  style={{ background: "#f59e0b", color: "white", padding: "0.75rem 1.5rem", fontSize: "1rem" }}
                >
                  🚩 Mark as Spam
                </button>
                <button
                  className="button"
                  onClick={async () => {
                    await archiveEmail(detailViewEmail.id, "");
                    setDetailViewEmail(null);
                    setDetailViewDraft(null);
                  }}
                  style={{ background: "#3b82f6", color: "white", padding: "0.75rem 1.5rem", fontSize: "1rem" }}
                  disabled={archivingEmailId === detailViewEmail.id}
                >
                  {archivingEmailId === detailViewEmail.id ? "⏳ Archiving..." : "📁 Archive"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <StickyNotification 
        message={message} 
        type={messageType} 
        onClose={() => setMessage("")} 
      />
    </main>
  );
}
