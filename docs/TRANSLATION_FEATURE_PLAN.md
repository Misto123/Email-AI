# 🌍 Translation Feature Implementation Plan

**Date:** Sep 28, 2026  
**Status:** 🚧 In Progress

---

## Overview

Add automatic translation for incoming emails and replies:
1. **Incoming emails**: Translate to user's preferred `default_language` for display
2. **AI replies**: Automatically translate back to original sender's language

---

## Architecture

### Database Schema Changes

**SQL Migration Required:**

```sql
-- Add default_language column to mailboxes table
ALTER TABLE mailboxes 
ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';

COMMENT ON COLUMN mailboxes.default_language IS 'Language to display incoming emails (auto-translate)';

-- Note: reply_language already exists (language for AI replies)
```

---

## Implementation Strategy

### Option 1: Simple Approach (Recommended)
**Use AI for both translation and reply in one step**

**Pros:**
- No separate translation API needed
- One AI call handles both translation and reply generation
- Context-aware translation

**Cons:**
- Slightly slower (but acceptable)
- Uses more AI tokens

**Implementation:**
```typescript
// In generateReply()
const messages = [
  { 
    role: "system", 
    content: `${systemPrompt}
    
IMPORTANT: The incoming email may be in a different language. 
- First, understand the email in its original language
- Then generate your reply in ${targetLanguage}
- The reply should address all points from the original email
    ` 
  },
  { 
    role: "user", 
    content: `Context: ${enhancedContext}

Incoming Email:
From: ${email.from_name} <${email.from_email}>
Subject: ${email.subject}

${email.body}
` 
  }
];
```

### Option 2: Two-Step Approach
**Translate first, then generate reply**

**Pros:**
- Clean separation of concerns
- Can show translated email to user
- More accurate translation

**Cons:**
- Two AI API calls (slower, more expensive)
- More complex code

**Implementation:**
```typescript
// Step 1: Detect language and translate
async function translateEmail(text: string, targetLang: string) {
  const messages = [
    { 
      role: "system", 
      content: "You are a translator. Translate the following email to ${targetLang}. Preserve tone and meaning. Return ONLY the translation, no explanations." 
    },
    { role: "user", content: text }
  ];
  // Call AI API...
}

// Step 2: Generate reply in original language
// (using reply_language from mailbox settings)
```

---

## Recommended: Simple One-Step Approach

### Files to Modify

#### 1. Database
**SQL:** Add `default_language` column (already in API)

#### 2. Type Definitions
**File:** `src/lib/mail-types.ts`
- ✅ Added `default_language?: string` to Mailbox interface

#### 3. API
**File:** `src/app/api/mailboxes/[id]/route.ts`
- ✅ Added support for `default_language` in PATCH

#### 4. UI
**File:** `src/app/mailboxes/page.tsx`
- ✅ Added language dropdown for `default_language`

#### 5. Email Generation
**File:** `src/app/api/emails/[id]/generate-reply/route.ts`

**Update to pass original language:**
```typescript
// Detect language from email (simple heuristic or AI detection)
const detectedLanguage = detectLanguage(email.subject + " " + email.body);

// Get mailbox settings
const mailbox = await getMailbox(email.mailbox_id);
const replyLanguage = mailbox.reply_language || detectedLanguage || "en";

// Generate reply
const draftBody = await generateReply(
  email,
  mailboxPrompt,
  replyLanguage, // Reply in original sender's language
  mailboxId,
  knowledgeBase
);
```

#### 6. AI Reply Generation
**File:** `src/lib/email-ai.ts`

**Update system prompt:**
```typescript
const systemPrompt = `You are an email drafting assistant. 

TRANSLATION INSTRUCTIONS:
- The incoming email may be in any language
- Understand the content in its original language
- Generate your reply in the language specified below
- Preserve professional tone and context
- Do not mention that you translated anything

Reply in: ${languageNames[language] || "English"}

Generate a suggested reply to the incoming email...`;
```

---

## Language Detection

### Simple Heuristic Approach
```typescript
function detectLanguage(text: string): string {
  // Simple detection based on character sets
  if (/[\u4e00-\u9fa5]/.test(text)) return "zh"; // Chinese
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "ja"; // Japanese
  if (/[\uac00-\ud7af]/.test(text)) return "ko"; // Korean
  if (/[\u0400-\u04FF]/.test(text)) return "ru"; // Cyrillic
  if (/[\u0600-\u06FF]/.test(text)) return "ar"; // Arabic
  
  // For European languages, default to English (AI will handle nuances)
  return "en";
}
```

### AI-Based Detection (More Accurate)
```typescript
async function detectLanguageAI(text: string): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    body: JSON.stringify({
      model: "deepseek/deepseek-v4.1-flash",
      messages: [
        { 
          role: "user", 
          content: `Detect the language of this text. Reply with ONLY the two-letter ISO code (en, es, fr, de, etc.): "${text.substring(0, 200)}"` 
        }
      ]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content.trim().toLowerCase();
}
```

---

## User Experience Flow

### Before Translation Feature
1. Email arrives in Spanish
2. User sees Spanish text (may not understand)
3. AI generates reply in English (wrong language!)
4. User manually translates or sends wrong language

### After Translation Feature
1. Email arrives in Spanish
2. **System detects language: "es"**
3. **User's `default_language` = "en"**, so email is understood by AI in Spanish
4. **AI generates reply in Spanish** (original sender's language)
5. User sees the draft in Spanish, can edit
6. Sent email is in Spanish ✅

---

## Configuration

### Per-Mailbox Settings

**In Mailboxes page:**
- **Display Language (for you)**: Language preference for understanding emails
  - Default: English
  - Options: English, Spanish, French, German, etc.
  
**Note:** `reply_language` field already exists but is currently not exposed in UI. We can add it later if needed.

---

## Testing Checklist

### Manual Tests
- [ ] Set mailbox `default_language` to "en"
- [ ] Send test email in Spanish
- [ ] Generate AI reply
- [ ] Verify reply is in Spanish (matches sender's language)
- [ ] Test with multiple languages (French, German, Chinese)

### Edge Cases
- [ ] Email with mixed languages
- [ ] Email with no clear language (gibberish)
- [ ] Very short emails (1-2 words)

---

## SQL Migration

**Run in Supabase:**

```sql
-- Add default_language column
ALTER TABLE mailboxes 
ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';

-- Add email_signature column (from previous feature)
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS email_signature TEXT DEFAULT '';

-- Verify columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'mailboxes' 
AND column_name IN ('default_language', 'reply_language');
```

**Expected output:**
```
column_name      | data_type | column_default
-----------------|-----------|--------------
reply_language   | text      | NULL
default_language | text      | 'en'
```

---

## Implementation Steps

### Phase 1: ✅ Completed
1. ✅ Add `default_language` to Mailbox type
2. ✅ Update API to support `default_language`
3. ✅ Add UI for language selection
4. ✅ Add Archive button to pending emails
5. ✅ Add Knowledge Base explanation

### Phase 2: 🚧 TODO
1. ⏳ Add language detection function
2. ⏳ Update `generateReply` to handle translation
3. ⏳ Update email generation API to detect & pass language
4. ⏳ Test with multiple languages

---

## Alternative: Display Translation

If we want to show translated email text to users:

```typescript
// Store both original and translated versions
interface EmailWithTranslation {
  id: string;
  original_body: string;
  translated_body?: string; // null if same language
  detected_language: string;
  // ...
}
```

**Pros:** User can see both versions  
**Cons:** More DB storage, more complexity

**Decision:** Not needed for MVP. AI understands emails in any language and replies appropriately.

---

**Status:** Code changes ready, needs SQL migration and testing  
**Next:** Run SQL migration, then test with multi-language emails
