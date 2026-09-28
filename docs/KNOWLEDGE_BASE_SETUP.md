# Knowledge Base System - Setup & Usage

## What Was Built

A smart context system that enhances AI email replies with:
1. **Website & Business Context** - Tell AI about your company
2. **FAQ Database** - Automatic matching to relevant questions
3. **Past Conversation Learning** - AI learns from your previous replies
4. **Brand Voice Guidelines** - Consistent tone across all emails
5. **Services & Pricing Info** - Accurate information for customer inquiries

## Setup Instructions

### 1. Run Database Migration

The migration adds two new columns to the `mailboxes` table:
- `website_url` (TEXT)
- `knowledge_base` (JSONB)

**Option A: Via API endpoint (easiest)**
```bash
curl -X POST http://localhost:3000/api/migrations/add-knowledge-base
```

**Option B: Manual SQL (if API fails)**
Open Supabase SQL Editor and run:
```sql
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS knowledge_base JSONB DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_mailboxes_knowledge_base ON mailboxes USING GIN (knowledge_base);
```

### 2. Configure Knowledge Base

1. Go to **Mailboxes** page
2. Click **🧠 Edit Knowledge Base** for any mailbox
3. Fill in relevant sections:
   - Website URL
   - About Us / Website Context
   - Services offered
   - Pricing information
   - Brand voice guidelines
   - FAQs (Q&A pairs)
4. Click **💾 Save Knowledge Base**

### 3. Test AI Replies

Generate a new AI reply for any email. The AI will now:
- Use your business context
- Match relevant FAQs automatically
- Reference similar past conversations
- Follow your brand voice guidelines

## How It Works

### Knowledge Base Matching
When an email arrives, the system:
1. Extracts keywords from the email subject and body
2. Finds relevant FAQs by keyword matching
3. Retrieves 3 most similar past conversations
4. Builds enhanced context with all relevant information
5. Passes everything to AI for reply generation

### Past Conversation Learning
- System automatically learns from sent drafts
- Matches based on keyword similarity
- Shows AI 3 most relevant past examples
- Helps maintain consistency in responses

### Relevance Scoring
Simple keyword-based scoring:
- Removes common stop words (the, is, and, etc.)
- Matches meaningful keywords (4+ characters)
- Ranks FAQs and past conversations by match count
- Top 5 FAQs and top 3 conversations included in context

## Code Changes Summary

### New Files
- `src/types/knowledge-base.ts` - TypeScript types
- `src/components/KnowledgeBaseEditor.tsx` - UI component
- `src/app/mailboxes/[id]/knowledge-base/page.tsx` - Editor page
- `src/app/api/mailboxes/[id]/knowledge-base/route.ts` - Update endpoint
- `src/app/api/migrations/add-knowledge-base/route.ts` - Migration endpoint
- `supabase/migrations/20260925_add_knowledge_base.sql` - DB schema

### Modified Files
- `src/lib/email-ai.ts` - Enhanced AI generation with context
- `src/app/api/emails/[id]/generate-reply/route.ts` - Pass knowledge base to AI
- `src/lib/mail-db.ts` - Select new fields
- `src/lib/mail-types.ts` - Add fields to Mailbox type
- `src/app/mailboxes/page.tsx` - Add "Edit Knowledge Base" link

## Example Knowledge Base

```json
{
  "website_context": "We are a digital marketing agency specializing in SEO, content creation, and social media management for small businesses.",
  "services": [
    "SEO optimization",
    "Content writing",
    "Social media management",
    "PPC advertising"
  ],
  "pricing_info": "Our packages start at $499/month for basic SEO. Custom enterprise solutions available.",
  "brand_voice": "Professional yet friendly. We use clear, jargon-free language. Always helpful and solution-oriented.",
  "faq": [
    {
      "q": "How long does SEO take to show results?",
      "a": "Typically 3-6 months for significant improvements. Quick wins possible in 4-6 weeks for low-competition keywords."
    },
    {
      "q": "Do you offer custom packages?",
      "a": "Yes! We tailor all our services to your specific needs and budget. Let's discuss your goals."
    }
  ]
}
```

## Benefits

### Before (Basic AI)
- Generic, template-like responses
- No business context
- Inconsistent tone
- Manual follow-ups for FAQs

### After (Knowledge Base)
- Personalized, contextual replies
- Accurate business information
- Consistent brand voice
- Auto-answers common questions
- Learns from past conversations

## Troubleshooting

### Migration fails
- Run SQL manually in Supabase SQL Editor
- Check database permissions
- Verify Supabase connection

### Knowledge base not saving
- Check browser console for errors
- Verify API endpoint is accessible
- Ensure JSON structure is valid

### AI not using context
- Verify knowledge_base field populated in database
- Check email generation logs
- Ensure mailbox_id passed to generateReply()

## Next Steps (Optional Enhancements)

1. **Website Scraping** - Auto-extract FAQs from website
2. **Semantic Search** - Use embeddings for better FAQ matching
3. **Category Detection** - Auto-tag emails (pricing, support, sales)
4. **A/B Testing** - Compare replies with/without context
5. **Analytics Dashboard** - Track which FAQs are most used
6. **Multi-language Support** - Translate knowledge base per language
7. **Version Control** - Track knowledge base changes over time

## Performance Notes

- FAQ matching: O(n) keyword scan, fast for <100 FAQs
- Past conversations: Limited to 20 most recent, top 3 returned
- Context size: ~1-2KB added per email (negligible token cost)
- No caching yet - future optimization opportunity
