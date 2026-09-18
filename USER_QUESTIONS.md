# Email AI - User Questions Answered

## Q1: How often does spam score recalculate? Why are all scores zero?

### Current Behavior:
**Spam scores are calculated ONCE when emails are first received**, not recalculated later.

### When Spam Scores Are Calculated:
- **Location:** `/src/app/api/cron/check-mail/route.ts`
- **Trigger:** Cron job runs every 15 minutes (configured in `vercel.json`)
- **Process:** 
  1. Cron job fetches new emails from IMAP
  2. For each new email, calls `calculateSpamScore()`
  3. Stores the score in `emails.spam_score` column
  4. Score is permanent unless manually updated

### Why All Scores Are Zero:
Your emails likely have **`spam_score = 0`** because:
1. ✅ The emails were fetched BEFORE the migration added the `spam_score` column
2. ✅ When the column was added, it defaulted to `0` for existing rows
3. ✅ Spam scoring only happens for NEW incoming emails after the migration

### Solution Options:

#### Option A: Wait for New Emails
- New emails will automatically get spam scores
- Existing emails keep score of 0

#### Option B: Recalculate Existing Emails (Add Feature)
Create an API endpoint to recalculate spam scores for existing emails:

```typescript
// New file: src/app/api/emails/recalculate-spam/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateSpamScore } from "@/lib/spam-detection";

export async function POST() {
  // Get all emails with score = 0
  const { data: emails } = await supabaseAdmin
    .from("emails")
    .select("id, from_email, from_name, subject, body, spam_score")
    .eq("spam_score", 0);

  if (!emails) return NextResponse.json({ updated: 0 });

  let updated = 0;
  for (const email of emails) {
    const score = await calculateSpamScore({
      from_email: email.from_email,
      from_name: email.from_name,
      subject: email.subject,
      body: email.body
    });

    await supabaseAdmin
      .from("emails")
      .update({ spam_score: score })
      .eq("id", email.id);
    
    updated++;
  }

  return NextResponse.json({ updated });
}
```

Then add a button in Settings page to trigger it.

#### Option C: SQL Script to Manually Recalculate
Run this SQL in Supabase to reset all scores (they'll recalculate on next email fetch):

```sql
-- Force all emails to be reprocessed (not recommended - loses existing scores)
UPDATE emails SET spam_score = 0 WHERE spam_score IS NOT NULL;
```

---

## Q2: How can users modify their reply prompt?

### ✅ Feature Already Exists! Per-Mailbox Custom Prompts

Users can customize AI reply prompts **per mailbox** when adding or editing mailboxes.

### Where to Configure:

#### 1. When Adding a New Mailbox:
**Page:** `/mailboxes/add`
**URL:** https://email-ai-mu.vercel.app/mailboxes/add

Fields:
- **Email address** (required)
- **Password** (required)
- **Enable AI** (toggle)
- **Custom reply prompt** (optional textarea)
  - Example: "Always be professional and concise. Include order details when relevant."

#### 2. Editing Existing Mailbox:
**Page:** `/mailboxes`
**URL:** https://email-ai-mu.vercel.app/mailboxes

Click "Edit" on any mailbox to modify:
- AI enabled/disabled
- Custom prompt
- Reply language

### How It Works:

```typescript
// When generating a reply (src/app/api/emails/[id]/generate-reply/route.ts)
const mailboxPrompt = email.mailboxes?.prompt || null;

// If custom prompt exists, it's added to the AI system message
const systemPrompt = mailboxPrompt 
  ? `You are an email assistant. ${mailboxPrompt}`
  : "You are a professional email assistant.";
```

### Current UI:
The mailboxes page shows:
- 🤖 AI enabled / ⏸️ AI paused
- 📝 Custom instructions: {first 80 chars}...

### Database Schema:
```sql
-- mailboxes table
CREATE TABLE mailboxes (
  id UUID PRIMARY KEY,
  email TEXT,
  encrypted_password TEXT,
  ai_enabled BOOLEAN DEFAULT true,
  prompt TEXT,  -- Custom AI instructions
  reply_language TEXT DEFAULT 'en'
);
```

---

## Summary of Current Features:

### Spam Detection:
- ✅ Calculated automatically for new emails
- ✅ Scores stored permanently in database
- ✅ Custom keywords in Settings page
- ✅ Manual "Mark as Spam" to train system
- ⚠️ Existing emails have score = 0 (need recalculation feature)

### AI Reply Customization:
- ✅ Per-mailbox custom prompts
- ✅ Can enable/disable AI per mailbox
- ✅ Reply language setting
- ✅ Full CRUD for mailbox settings

---

## Recommended Improvements:

1. **Add "Recalculate Spam Scores" button in Settings**
   - Recalculates scores for all existing emails
   - Shows progress indicator

2. **Show prompt preview in mailbox list**
   - Currently shows first 80 chars
   - Could add tooltip with full prompt

3. **Add default global prompt in Settings**
   - Currently only per-mailbox prompts
   - Global prompt as fallback for all mailboxes

4. **Spam score recalculation on keyword change**
   - When user updates spam keywords in Settings
   - Automatically recalculate all email scores

---

## Testing Spam Scoring:

To test with current emails, you can:

1. **Send yourself a test email** with spam keywords:
   - Subject: "Buy backlinks for your website"
   - Body: "Limited time SEO opportunity! Click here now!"
   - Should receive high spam score (60-80+)

2. **Check the cron logs:**
   ```bash
   vercel logs https://email-ai-mu.vercel.app --since 1h | grep spam
   ```

3. **Manually mark an email as spam** to train the system
   - Click "Mark as Spam" on any email
   - Future similar emails will get +20 points

---

**Last Updated:** Sept 18, 2026  
**Version:** Post-migration, all features working
