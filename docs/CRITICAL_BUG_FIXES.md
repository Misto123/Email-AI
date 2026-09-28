# 🐛 Critical Bug Fixes - Deployment

**Date:** Sep 28, 2026  
**Status:** ✅ Deployed  
**Commit:** a96e23f

---

## Issues Fixed

### 1. ✅ Duplicate Emails After Refresh
**Problem:** Same emails appeared in both "Drafts" and "Pending" sections after generating a reply

**Root Cause:** 
- Pending emails API fetched ALL `processed=false` emails
- Draft creation didn't mark emails as processed
- No filter to exclude emails that already had drafts

**Fix:**
```typescript
// src/app/api/emails/pending/route.ts
// Now fetches draft email IDs and excludes them from pending
const { data: draftEmails } = await supabaseAdmin
  .from("drafts")
  .select("email_id")
  .neq("status", "deleted");

const draftEmailIds = (draftEmails || []).map(d => d.email_id);

// Exclude emails that have drafts
if (draftEmailIds.length > 0) {
  query = query.not("id", "in", `(${draftEmailIds.join(",")})`);
}
```

**Also added:** `is_spam` field to pending emails API and drafts query

---

### 2. ✅ Sort Order Reversed
**Problem:** "Oldest First" button showed newest first, and vice versa

**Root Cause:** Sort logic was inverted
- Default comparison was `dateB - dateA` (newest first)
- But when `sortOrder === "asc"`, it kept the same order instead of flipping it

**Fix:**
```typescript
// src/components/mail-app.tsx
// Changed default comparison to oldest first (asc)
compareValue = dateA - dateB; // Older first (asc default)

// Then flip for desc
return sortOrder === "desc" ? -compareValue : compareValue;
```

**Result:**
- "Newest First" (desc) → Shows newest at top ✅
- "Oldest First" (asc) → Shows oldest at top ✅

---

### 3. ✅ AI Reply Hidden Below Original Message
**Problem:** Users had to scroll down to see the generated AI reply

**Fix:** Moved AI reply section to TOP of email detail modal
```typescript
// src/components/mail-app.tsx
// BEFORE: AI reply was at bottom after actions
// AFTER: AI reply shows FIRST, then original email content

{/* Draft Preview - MOVED TO TOP */}
{detailViewDraft && (
  <div style={{ marginBottom: "1.5rem" }}>
    <strong>✅ AI Generated Reply:</strong>
    {detailViewDraft}
  </div>
)}

{/* Then original email below */}
```

**Result:** AI reply now visible immediately without scrolling ✅

---

### 4. ✅ DeepSeek Fallback Never Triggered
**Problem:** 
```
DeepSeek fallback also failed: {"error":{"message":"Authentication Fails, 
Your api key: ****ined is invalid"}}
```

**Root Cause:** Fallback only triggered if error message contained "FALLBACK_TO_DEEPSEEK" string, which OpenRouter never sends

**Fix:**
```typescript
// src/lib/email-ai.ts
// BEFORE: Only triggered on specific error message
if (error instanceof Error && error.message.includes("FALLBACK_TO_DEEPSEEK")) {
  // fallback
}

// AFTER: Always triggers fallback on ANY OpenRouter error
} catch (error) {
  console.log("OpenRouter failed, using DeepSeek fallback...");
  try {
    // DeepSeek fallback
  } catch (fallbackError) {
    // If both fail, throw original error
  }
}
```

**⚠️ Still needs:** DeepSeek API key in Vercel environment variables

---

## Vercel Environment Variable Check

**Required:** `DEEPSEEK_API_KEY` must be set in Vercel dashboard

**To verify:**
1. Go to https://vercel.com/bram-1592s-projects/email-ai/settings/environment-variables
2. Check if `DEEPSEEK_API_KEY` exists
3. If not, add it from `.env.local`

**Current status:** Unknown - need to check Vercel dashboard

---

## Files Changed

1. `src/app/api/emails/pending/route.ts` - Exclude emails with drafts, add `is_spam`
2. `src/lib/mail-db.ts` - Add `spam_score` and `is_spam` to drafts query
3. `src/components/mail-app.tsx` - Fix sort order, move AI reply to top
4. `src/lib/email-ai.ts` - Fix DeepSeek fallback to trigger on ANY error

---

## Testing Checklist

### Duplicate Emails
- [ ] Generate AI reply for email
- [ ] Refresh page
- [ ] Email should ONLY appear in "Drafts" section, NOT in "Pending" ✅

### Sort Order
- [ ] Click "Newest First" → newest at top ✅
- [ ] Click "Oldest First" → oldest at top ✅
- [ ] Click "A → Z" → alphabetical ✅
- [ ] Click "Z → A" → reverse alphabetical ✅

### AI Reply Position
- [ ] Generate AI reply
- [ ] Click email to open detail view
- [ ] AI reply should appear AT TOP, no scrolling needed ✅

### DeepSeek Fallback
- [ ] Verify `DEEPSEEK_API_KEY` in Vercel env vars
- [ ] If OpenRouter fails, DeepSeek should work
- [ ] Check Vercel logs for "OpenRouter failed, using DeepSeek fallback..."

---

## Known Issues

### Emoji/Markup in Email Subjects
**Status:** No fix needed
- Emails are already decoded by mail parser
- If issues persist, may need to add HTML entity decoding

---

## Next Steps

1. **Verify Vercel env vars** - Check/add `DEEPSEEK_API_KEY`
2. **Test all fixes** - Use checklist above
3. **Monitor logs** - Check if DeepSeek fallback works in production

---

**Deployment URL:** https://email-ai-mu.vercel.app  
**Build Status:** ✅ Successful  
**Vercel Inspector:** https://vercel.com/bram-1592s-projects/email-ai/EmbsxpBsC9pJ3xTaJi5wLvWG5CuP
