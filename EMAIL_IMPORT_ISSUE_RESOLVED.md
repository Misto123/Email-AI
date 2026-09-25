# Email Import Issue - Resolved

## 🐛 Problem

**Reported:** "Last emails shown on /drafts page are from 14/09/26 • there should be emails from stefan@rebelinternet.eu in both mailboxes from 21/09/26"

**Root Cause:** Emails were being imported with `processed: true` but no drafts were generated (because auto-generation was disabled). This caused them to be invisible in the UI:
- `/api/drafts` only shows emails WITH drafts
- `/api/emails/pending` only shows emails with `processed: false`
- Emails with `processed: true` and no draft = **invisible**

---

## 🔍 Investigation Steps

### 1. Check Now Button Not Working
- Button was calling cron endpoint with `CRON_SECRET` from client (not accessible)
- **Fix:** Created `/api/emails/check-now` that calls cron internally with secret

### 2. Emails Imported 0
- Cron was running but importing 0 new emails
- Debug endpoint showed emails existed in mailboxes
- **Issue:** Emails were marked as "existing" in database

### 3. Found Hidden Emails
Created debug endpoints:
- `/api/mailboxes/debug?mailbox=email` - shows IMAP inbox contents
- `/api/emails/debug?from=email` - shows emails table directly

**Discovered:**
```json
{
  "from_email": "stefan@rebelinternet.eu",
  "subject": "A few questions about improving my Airbnb ranking",
  "received_at": "2026-09-21T13:09:47+00:00",
  "processed": true,  // ← Problem!
  "spam_score": 0
}
```

Emails existed with `processed: true` but no drafts generated!

---

## ✅ Solutions Implemented

### 1. Fixed Check Now Button
**File:** `src/app/api/emails/check-now/route.ts`
- Public POST endpoint that internally calls cron with secret
- Shows count of imported emails in notification

### 2. Fixed Processed Flag
**File:** `src/app/api/cron/check-mail/route.ts`
- Changed from `processed: mailbox.ai_enabled` 
- To: `processed: false` (always)
- Emails now show in pending section for manual draft generation

### 3. Repaired Existing Emails
**File:** `src/app/api/emails/fix-processed/route.ts`
- One-time fix endpoint to set `processed=false` on stuck emails
- Fixed 30 emails including both Stefan emails

### 4. Added Spam Score to Insert
- Was calculated but not saved to database
- Caused silent failures in email import

### 5. Added Debug Logging
- Logs total messages found
- Logs which emails are skipped
- Logs save errors with details

---

## 📊 Results

### Before:
```
Total drafts: 14
Newest: 2026-09-14T13:10:51+00:00
Stefan emails: 0
```

### After:
```
Total pending: 30
Stefan emails: 2
  📧 2026-09-21 - stefan@rebelinternet.eu - A few questions about improving my Airbnb ranking
  📧 2026-09-21 - stefan@rebelinternet.eu - Een paar vragen voordat ik bestel
```

---

## 🛠️ New Debug Endpoints

### Check Mailbox Contents (IMAP)
```bash
curl "https://email-ai-mu.vercel.app/api/mailboxes/debug?mailbox=contact@bnbgeeks.org"
```
Shows:
- Total messages in INBOX
- Unseen count
- Last 20 emails with from/subject/date

### Check Emails Table
```bash
curl "https://email-ai-mu.vercel.app/api/emails/debug?from=stefan"
```
Shows:
- Raw emails table data
- Processed status
- Spam scores

### Manual Email Check
```bash
curl -X POST "https://email-ai-mu.vercel.app/api/emails/check-now"
```
Returns:
```json
{"ok":true,"results":[
  {"mailbox":"contact@bnbgeeks.org","imported":3},
  {"mailbox":"contact@ggeeks.org","imported":2}
]}
```

### Fix Stuck Emails (One-time)
```bash
curl -X POST "https://email-ai-mu.vercel.app/api/emails/fix-processed"
```

---

## 📋 Current Email Flow

1. **Cron/Manual Check** → Imports emails from IMAP
2. **Spam Score** → Calculated and saved (0-100)
3. **Processed Flag** → Always set to `false`
4. **Pending Section** → User sees new emails
5. **Generate Reply** → User clicks button to create draft
6. **Drafts Section** → Draft appears for editing/sending

---

## ✅ Verified Working

- ✅ Check Now button works (takes 10-15 seconds)
- ✅ Emails from Sept 21 now visible in UI
- ✅ Both mailboxes importing correctly
- ✅ Spam scores calculated and saved
- ✅ 30 pending emails ready for draft generation
- ✅ Stefan's 2 emails visible and actionable

---

## 🚀 Deployment

**Status:** All fixes deployed to production  
**URL:** https://email-ai-mu.vercel.app  
**Date:** September 25, 2026  

**Files Changed:**
- `src/app/api/cron/check-mail/route.ts` - Fixed processed flag + logging
- `src/app/api/emails/check-now/route.ts` - Public check endpoint
- `src/app/api/emails/debug/route.ts` - Debug emails table
- `src/app/api/emails/fix-processed/route.ts` - Repair stuck emails
- `src/app/api/mailboxes/debug/route.ts` - Debug IMAP contents

---

**Issue Status:** ✅ **RESOLVED**
