# Knowledge Base QA Checklist

## Prerequisites - MANUAL STEP REQUIRED ⚠️

**Run this SQL in Supabase SQL Editor first:**
```sql
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS knowledge_base JSONB DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_mailboxes_knowledge_base ON mailboxes USING GIN (knowledge_base);
```

**How to run:**
1. Go to https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/sql/new
2. Paste the SQL above
3. Click "Run"

---

## QA Steps

### 1. Database Migration ✅ (Pending Manual Run)
- [ ] SQL runs without errors
- [ ] `website_url` column exists in `mailboxes` table
- [ ] `knowledge_base` column exists with JSONB type and default `{}`
- [ ] GIN index `idx_mailboxes_knowledge_base` created

### 2. Mailboxes List Page
- [ ] Navigate to http://localhost:3000/mailboxes
- [ ] Page loads without errors
- [ ] Two mailboxes visible: contact@bnbgeeks.org and contact@ggeeks.org
- [ ] Each mailbox card shows "🧠 Edit Knowledge Base" button

### 3. Knowledge Base Editor UI
- [ ] Click "🧠 Edit Knowledge Base" on contact@bnbgeeks.org
- [ ] Navigate to `/mailboxes/[id]/knowledge-base` page
- [ ] Form sections visible:
  - Website URL input
  - About Us / Website Context textarea
  - Services input (comma-separated)
  - Pricing Information textarea
  - Brand Voice & Tone textarea
  - FAQ section with "Add FAQ" button
- [ ] Can add new FAQ (Q&A pair)
- [ ] Can remove FAQ
- [ ] Save button present

### 4. Save Knowledge Base
- [ ] Fill in test data:
  ```
  Website URL: https://bnbgeeks.org
  About Us: We provide digital marketing services including SEO, content writing, and social media management for small businesses.
  Services: SEO optimization, Content writing, Social media management
  Pricing: Our packages start at $499/month for basic SEO.
  Brand Voice: Professional yet friendly. Clear, jargon-free language.
  FAQ 1:
    Q: How long does SEO take to show results?
    A: Typically 3-6 months for significant improvements.
  ```
- [ ] Click "💾 Save Knowledge Base"
- [ ] Success message appears: "✅ Saved successfully!"

### 5. Verify Database Storage
Check database directly:
```sql
SELECT email, website_url, knowledge_base 
FROM mailboxes 
WHERE email = 'contact@bnbgeeks.org';
```
- [ ] `knowledge_base` JSONB contains saved data
- [ ] All fields properly structured

### 6. AI Reply Generation (Integration Test)
- [ ] Go to Inbox (pending emails)
- [ ] Select any email from contact@bnbgeeks.org mailbox
- [ ] Click "Generate AI Reply"
- [ ] AI reply generation completes
- [ ] Check reply quality:
  - [ ] Uses business context from knowledge base
  - [ ] References relevant FAQ if applicable
  - [ ] Follows brand voice guidelines
  - [ ] Professional and accurate

### 7. Past Conversations Context
- [ ] Generate reply for a second email
- [ ] AI should reference the first generated reply as past conversation example
- [ ] Context building working (check console logs if needed)

### 8. Edge Cases
- [ ] Empty knowledge base (new mailbox) - AI reply still works
- [ ] Very long FAQ list (10+ items) - only top 5 relevant FAQs used
- [ ] No matching FAQs - AI reply uses only general context
- [ ] Special characters in FAQs (quotes, apostrophes) - saved correctly

---

## Expected Behavior

### AI Context Enhancement
When generating a reply, the AI receives:
1. **Knowledge Base Context**:
   - Website context
   - Services list
   - Pricing info
   - Brand voice guidelines
   - Top 5 relevant FAQs (keyword-matched)

2. **Past Conversation Examples**:
   - Top 3 similar previous email-reply pairs
   - Based on keyword similarity
   - Helps maintain consistency

### Relevance Matching
- Keywords extracted from email (4+ chars, no stop words)
- FAQs scored by keyword overlap
- Top 5 FAQs included in context
- Past conversations similarly scored, top 3 included

---

## Known Limitations

1. **Keyword Matching**: Simple word overlap, not semantic
2. **No Caching**: Context rebuilt for every reply (future optimization)
3. **FAQ Limit**: Max 100 FAQs recommended for performance
4. **Past Conversation Limit**: Searches most recent 20 emails only

---

## Rollback Plan (If Issues)

If the feature causes problems:

1. **Remove columns** (safe, no data loss in other tables):
```sql
ALTER TABLE mailboxes DROP COLUMN IF EXISTS knowledge_base;
ALTER TABLE mailboxes DROP COLUMN IF EXISTS website_url;
DROP INDEX IF EXISTS idx_mailboxes_knowledge_base;
```

2. **Revert code changes**:
```bash
git diff HEAD -- src/lib/email-ai.ts
git diff HEAD -- src/app/api/emails/[id]/generate-reply/route.ts
# Review changes, then:
git checkout HEAD -- src/lib/email-ai.ts src/app/api/emails/[id]/generate-reply/route.ts
```

3. **Restart dev server**
