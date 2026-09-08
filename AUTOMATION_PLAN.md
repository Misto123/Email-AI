# Purelymail API Integration (Future Automation)

## Research Notes

### Purelymail API Availability
**Status:** Need to investigate if Purelymail offers an API

**Potential Features:**
1. Auto-discovery of mailboxes under a domain
2. Validate credentials without manual testing
3. Retrieve mailbox list automatically
4. One-click "Import All Mailboxes" button

### API Endpoints to Research
```
GET /api/mailboxes - List all mailboxes under account
POST /api/auth/validate - Validate credentials
GET /api/domains - List domains
```

---

## Automation Plan (If API Exists)

### Phase 1: Single-Click Setup
**User Flow:**
1. User enters Purelymail **Account API Key** (not individual mailbox passwords)
2. Click "Import All Mailboxes"
3. Email-AI:
   - Fetches all mailboxes from Purelymail API
   - Auto-configures each mailbox
   - Tests connections automatically
   - Shows success/failure for each

**Implementation:**
```typescript
// New API endpoint: /api/purelymail/import
export async function POST(request: Request) {
  const { apiKey } = await request.json();
  
  // 1. Validate API key with Purelymail
  const mailboxes = await fetchPurelymailMailboxes(apiKey);
  
  // 2. For each mailbox, create entry in our database
  const results = await Promise.all(
    mailboxes.map(async (mb) => {
      try {
        // Store encrypted credentials
        await createMailbox({
          email: mb.email,
          password: mb.password, // If API provides it
          ai_enabled: true,
        });
        return { email: mb.email, status: 'success' };
      } catch (error) {
        return { email: mb.email, status: 'failed', error };
      }
    })
  );
  
  return Response.json({ results });
}
```

**UI Component:**
```tsx
// Add to /mailboxes page
<div className="automation-panel">
  <h3>🚀 Quick Import (Beta)</h3>
  <p>Import all mailboxes from your Purelymail account at once</p>
  
  <label>Purelymail API Key</label>
  <input 
    type="password" 
    placeholder="pm_xxxxxxxxxxxxxxxx"
  />
  
  <button onClick={handleImport}>
    Import All Mailboxes
  </button>
  
  {importing && <p>⏳ Importing...</p>}
  {results && (
    <div>
      <p>✅ {results.success} imported</p>
      <p>❌ {results.failed} failed</p>
    </div>
  )}
</div>
```

---

### Phase 2: OAuth Integration (Most Secure)
Instead of storing passwords, use OAuth:

**User Flow:**
1. Click "Connect Purelymail Account"
2. Redirect to Purelymail OAuth page
3. User authorizes Email-AI
4. Purelymail redirects back with access token
5. Email-AI stores token (encrypted)
6. Use token for all IMAP/SMTP operations

**Security Benefits:**
- No password storage (just OAuth tokens)
- User can revoke access anytime from Purelymail
- More secure than storing passwords

**Implementation:**
```typescript
// OAuth flow
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  // Exchange code for access token
  const token = await exchangeCodeForToken(code);
  
  // Store encrypted token
  await storeToken(userId, token);
  
  // Fetch mailboxes using token
  const mailboxes = await fetchMailboxesWithToken(token);
  
  return Response.redirect('/mailboxes?imported=true');
}
```

---

### Phase 3: Webhook Integration
Real-time email notifications instead of polling:

**How it works:**
1. User enables webhook in Purelymail settings
2. Points webhook to: `https://email-ai-mu.vercel.app/api/webhooks/purelymail`
3. Purelymail sends webhook when new email arrives
4. Email-AI immediately generates draft (no waiting for cron)

**Benefits:**
- Instant draft generation (no cron delays)
- More efficient (no polling every 5 minutes)
- Lower costs (fewer IMAP connections)

**Implementation:**
```typescript
// /api/webhooks/purelymail/route.ts
export async function POST(request: Request) {
  const webhook = await request.json();
  
  // Verify webhook signature
  if (!verifyPurelymailWebhook(webhook)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // Process new email
  const { mailbox, messageId } = webhook;
  
  // Generate AI draft immediately
  await generateDraftForEmail(mailbox, messageId);
  
  return Response.json({ received: true });
}
```

---

## Alternative: IMAP IDLE (Push Notifications)

If Purelymail doesn't have webhooks, use IMAP IDLE:

**What is IMAP IDLE?**
- Real-time push notifications from IMAP server
- Server tells you "new email arrived!" instead of polling
- Standard IMAP extension

**Implementation:**
```typescript
// Background worker (separate from Next.js)
import { ImapFlow } from 'imapflow';

async function watchMailbox(mailbox: Mailbox) {
  const client = new ImapFlow({
    host: 'imap.purelymail.com',
    port: 993,
    secure: true,
    auth: {
      user: mailbox.email,
      pass: decrypt(mailbox.encrypted_password),
    },
  });
  
  await client.connect();
  await client.mailboxOpen('INBOX');
  
  // Listen for new emails
  client.on('exists', async () => {
    console.log('New email arrived!');
    await generateDraftsForMailbox(mailbox.id);
  });
  
  // Keep connection alive with IDLE
  await client.idle();
}
```

**Deployment:**
- Can't run on Vercel (serverless, no long-running processes)
- Need separate server (Railway, Fly.io, etc.)
- Or use Vercel Edge Functions with WebSocket

---

## Decision Tree

```
Does Purelymail have API?
├─ YES
│  ├─ Has OAuth? → Implement OAuth (Phase 2)
│  ├─ Has Webhooks? → Implement Webhooks (Phase 3)
│  └─ Has Basic API? → Implement Import (Phase 1)
│
└─ NO
   ├─ Keep manual setup (current)
   └─ Add better UI/instructions (done ✅)
```

---

## Action Items

### Immediate (Do Now)
- [ ] Research Purelymail API documentation
- [ ] Check if they have OAuth
- [ ] Check if they support webhooks
- [ ] Test if IMAP IDLE works with their servers

### Short-term (If API Exists)
- [ ] Implement Phase 1: Import All Mailboxes
- [ ] Add UI for API key input
- [ ] Test with real Purelymail account

### Long-term (If OAuth/Webhooks Available)
- [ ] Implement OAuth flow
- [ ] Implement webhook receiver
- [ ] Migrate existing users to OAuth

---

## Current Status

**✅ What We Have:**
- Manual mailbox setup with clear instructions
- Comprehensive setup guide (PURELYMAIL_SETUP_GUIDE.md)
- Error handling and validation
- Test IMAP/SMTP connections

**🔄 What We're Planning:**
- Research Purelymail API capabilities
- Build automation if API is available
- Improve user experience with one-click setup

**📝 Next Steps:**
1. Check https://purelymail.com/docs for API documentation
2. Contact Purelymail support to ask about API access
3. Implement automation based on API capabilities

---

## Resources

- Purelymail Docs: https://purelymail.com/docs
- IMAP IDLE: https://datatracker.ietf.org/doc/html/rfc2177
- ImapFlow Library: https://github.com/postalsys/imapflow
