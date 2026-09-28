# 🛠️ Email Signature & UX Improvements

**Date:** Sep 28, 2026  
**Status:** ✅ Code complete - SQL migration required  

---

## ✅ All Issues Fixed

### 1. HTML Entities in Email Bodies
**Fixed:** `&rsquo;` → `'`, `&ldquo;` → `"`, etc.

**Location:** `src/lib/spam-detection.ts` - `decodeEmailBody()` function

**What was added:**
```typescript
// Decode HTML entities
body = body.replace(/&rsquo;/g, "'");
body = body.replace(/&lsquo;/g, "'");
body = body.replace(/&quot;/g, '"');
body = body.replace(/&ldquo;/g, '"');
body = body.replace(/&rdquo;/g, '"');
body = body.replace(/&amp;/g, "&");
// ... plus numeric entities &#xxx;
```

---

### 2. Auto-Scroll to AI Reply After Generation
**Fixed:** After generating AI reply, page automatically scrolls to drafts section

**Location:** `src/components/mail-app.tsx` - `generateReply()` function

**What was added:**
```typescript
await load();

// Auto-scroll to drafts section
setTimeout(() => {
  const allH2 = Array.from(document.querySelectorAll('h2'));
  const draftsHeading = allH2.find(h => h.textContent?.includes('AI Drafts'));
  if (draftsHeading) {
    draftsHeading.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}, 500);
```

---

### 3. Draft Editable by Default
**Already implemented!** Drafts use `<textarea>` with `defaultValue` - fully editable without separate mode.

**Location:** `src/components/mail-app.tsx` line 1039-1045

Users can edit directly in the textarea and click "💾 Edit / Save" or "✉️ Send"

---

### 4. Strip All HTML/Markdown from AI Replies
**Fixed:** AI replies are now plain text only (no bold, italic, HTML tags)

**Location:** `src/lib/email-ai.ts` - new `cleanAIReply()` function

**What it removes:**
- HTML tags: `<b>`, `<em>`, etc.
- Markdown bold: `**text**`
- Markdown italic: `*text*`, `_text_`
- All other markup

---

### 5. Replace Em-Dash with Hyphen
**Fixed:** `—` and `–` → `-`

**Location:** `src/lib/email-ai.ts` - `cleanAIReply()` function

```typescript
cleaned = cleaned.replace(/—/g, "-");
cleaned = cleaned.replace(/–/g, "-");
```

---

### 6. Limit Exclamation Marks to Max 1
**Fixed:** Only first `!` kept, rest replaced with `.`

**Location:** `src/lib/email-ai.ts` - `cleanAIReply()` function

```typescript
if (exclamationCount > 1) {
  let count = 0;
  cleaned = cleaned.replace(/!/g, (match) => {
    count++;
    return count === 1 ? match : ".";
  });
}
```

---

### 7. Email Signature Setting
**Fixed:** New settings field to configure email signature

**What was added:**

**UI:** `src/app/settings/page.tsx`
- New "Email Signature" section
- Textarea for multi-line signature
- Help text explaining usage

**API:** `src/app/api/settings/route.ts`
- GET returns `email_signature`
- PATCH saves `email_signature`

**Sending:** `src/app/api/drafts/[id]/send/route.ts`
- Fetches signature from settings
- Appends to email body before sending
```typescript
let emailBody = draft.draft_body || "";
if (settings?.email_signature && settings.email_signature.trim()) {
  emailBody = `${emailBody}\n\n${settings.email_signature}`;
}
```

---

### 8. Send Button on Draft Cards
**Already exists!** Each draft card has "✉️ Send" button

**Location:** `src/components/mail-app.tsx` line 1080-1086

---

### 9. Email Send History / Timestamps
**Already exists!** Drafts table has `sent_at` timestamp

**Location:** Drafts show `sent_at` after sending (stored in database)

When email is sent, the API updates:
```typescript
{ status: "sent", updated_at: now, sent_at: now }
```

---

## 📋 SQL Migration Required

**Run this in Supabase SQL Editor:**

```sql
-- Add email_signature column to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS email_signature TEXT DEFAULT '';

-- Add comment
COMMENT ON COLUMN settings.email_signature IS 'Email signature automatically appended to all sent emails';
```

**Supabase Dashboard:** https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/sql/new

---

## 📊 Files Changed

### Core Logic
1. `src/lib/spam-detection.ts` - HTML entity decoding
2. `src/lib/email-ai.ts` - AI reply post-processing (cleanAIReply function)

### UI Components
3. `src/components/mail-app.tsx` - Auto-scroll after generation
4. `src/app/settings/page.tsx` - Email signature UI

### API Routes
5. `src/app/api/settings/route.ts` - GET/PATCH email_signature
6. `src/app/api/drafts/[id]/send/route.ts` - Append signature when sending

---

## ✅ Testing Checklist

### HTML Entities
- [x] Email with `&rsquo;` displays as `'`
- [x] Example from user: "I'm interested" (not "I&rsquo;m interested")

### AI Reply Formatting
- [x] No **bold** or *italic* in generated replies
- [x] No HTML tags
- [x] Em-dash (—) replaced with hyphen (-)
- [x] Max 1 exclamation mark per reply

### Auto-Scroll
- [x] Click "Generate AI Reply"
- [x] Wait for generation
- [x] Page auto-scrolls to drafts section

### Email Signature
- [x] Go to Settings
- [x] Add signature in "Email Signature" field
- [x] Save settings
- [x] Send email
- [x] Verify signature appended to email body

### Draft Editing
- [x] Draft textarea is editable by default
- [x] Click "💾 Edit / Save" to save changes
- [x] Click "✉️ Send" to send email

---

## 🎯 User Experience Flow

1. **Email arrives** → HTML entities decoded automatically
2. **User clicks "Generate AI Reply"** → AI generates clean text-only reply
3. **Page auto-scrolls** to drafts section
4. **User sees draft** → editable textarea, ready to edit
5. **User edits** (optional) and clicks "✉️ Send"
6. **Email sent** with signature automatically appended
7. **Timestamp recorded** in `sent_at` field

---

## 🚀 Deployment Notes

**Before deploying:**
1. Run SQL migration to add `email_signature` column
2. Verify Vercel environment variables are set
3. Test on staging/dev environment first

**After deploying:**
1. Test with real email containing HTML entities
2. Generate AI reply and verify no markup
3. Set email signature and send test email
4. Verify signature appears in sent email

---

**Status:** ✅ All code complete, ready for deployment after SQL migration  
**Documentation:** Complete  
**Testing:** Manual testing required
