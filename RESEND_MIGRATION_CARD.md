# Migration Card: Resend Email Integration for HomeGeeks

## 🎯 Objective
Migrate Email AI app to use Resend for email handling instead of direct IMAP/SMTP.

---

## 📋 Resend Account Details

### Account Access
- **Platform:** AdsPower 267
- **1Password Entry:** `Resend | HG24 | AdsP 267`
- **Website:** https://resend.com/home (Resend HomeGeeks)

### API Credentials
- **API Key:** `re_***************************` (stored in 1Password: `Resend | HG24 | AdsP 267`)
- **Webhook URL:** `https://dieyatrsmhkvdbyqvkxz.supabase.co/functions/v1/resend-inbound-webhook`

### SMTP Configuration
- **Host:** `smtp.resend.com`
- **Port:** `465`
- **Username:** `resend`
- **Password:** (Use API Key above)

### Email Domain
- **Email:** `contact@homegeeks.org`
- **Provider:** PurelyMail

---

## 🔧 Required Changes

### 1. Environment Variables (.env.local)
Add to the Email AI project:

```bash
# Resend Integration
RESEND_API_KEY=<get from 1Password: Resend | HG24 | AdsP 267>
RESEND_WEBHOOK_SECRET=<generate new secret for webhook verification>
RESEND_FROM_EMAIL=contact@homegeeks.org
```

### 2. Install Resend SDK

```bash
npm install resend
```

### 3. Code Changes Needed

#### A. Replace IMAP Email Fetching
**Current:** `/src/app/api/cron/check-mail/route.ts` uses `imap-simple`  
**New:** Use Resend webhook to receive incoming emails

Create webhook handler:
```typescript
// src/app/api/resend/webhook/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateSpamScore } from "@/lib/spam-detection";

export async function POST(request: Request) {
  // Verify webhook signature
  const body = await request.json();
  
  // Parse incoming email
  const email = {
    from_email: body.from,
    from_name: body.from_name,
    subject: body.subject,
    body: body.html || body.text,
    message_id: body.message_id
  };
  
  // Calculate spam score
  const spamScore = await calculateSpamScore(email);
  
  // Save to database
  await supabaseAdmin.from("emails").insert({
    mailbox_id: "<mailbox_id>",
    message_id: email.message_id,
    from_email: email.from_email,
    from_name: email.from_name,
    subject: email.subject,
    body: email.body,
    spam_score: spamScore,
    received_at: new Date().toISOString(),
    processed: true
  });
  
  return NextResponse.json({ ok: true });
}
```

#### B. Replace SMTP Email Sending
**Current:** Uses `nodemailer` in draft sending  
**New:** Use Resend SDK

```typescript
// Example: Send email via Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'contact@homegeeks.org',
  to: recipient,
  subject: subject,
  html: body
});
```

#### C. Update Mailbox Configuration
- Remove IMAP/SMTP password fields (no longer needed)
- Resend handles all incoming/outgoing email
- Keep mailbox email address for reference

---

## 🔐 Security Considerations

1. **Webhook Verification:**
   - Resend sends signature in headers
   - Verify webhook authenticity before processing
   - Use `RESEND_WEBHOOK_SECRET`

2. **API Key Security:**
   - Store in environment variables only
   - Never expose in client-side code
   - Rotate periodically

3. **Rate Limits:**
   - Check Resend plan limits
   - Implement rate limiting if needed

---

## 📊 Migration Steps

### Phase 1: Setup (15 min)
1. Add environment variables to Vercel
2. Install Resend SDK
3. Configure webhook in Resend dashboard
4. Set up domain verification (if needed)

### Phase 2: Incoming Email (30 min)
1. Create webhook handler endpoint
2. Test with sample webhook payload
3. Disable old IMAP cron job
4. Monitor for 24 hours

### Phase 3: Outgoing Email (30 min)
1. Replace nodemailer with Resend SDK
2. Update draft sending logic
3. Test sending emails
4. Remove SMTP code

### Phase 4: Cleanup (15 min)
1. Remove unused dependencies (imap-simple, nodemailer)
2. Update UI to remove IMAP/SMTP password fields
3. Update documentation
4. Deploy final version

---

## 🧪 Testing Checklist

- [ ] Webhook receives incoming emails
- [ ] Spam scores calculated correctly
- [ ] Emails saved to database
- [ ] AI replies generated
- [ ] Emails sent successfully via Resend
- [ ] No IMAP/SMTP credentials needed
- [ ] Webhook signature verification works
- [ ] Error handling for failed sends

---

## 📚 Documentation Links

- **Resend Docs:** https://resend.com/docs
- **Resend Node SDK:** https://github.com/resendlabs/resend-node
- **Webhook Guide:** https://resend.com/docs/dashboard/webhooks/introduction
- **Inbound Email:** https://resend.com/docs/api-reference/emails/receive-email

---

## 🎁 Benefits After Migration

✅ **Simpler setup** - No IMAP/SMTP credentials needed  
✅ **More reliable** - No connection timeouts or mail server issues  
✅ **Better deliverability** - Resend handles email reputation  
✅ **Webhooks** - Real-time email delivery (no polling)  
✅ **Email tracking** - Opens, clicks, bounces built-in  
✅ **Better DX** - Clean API vs. complex IMAP/SMTP  

---

## ⚠️ Important Notes

1. **Existing Emails:**
   - Old emails in database remain unchanged
   - Only new emails use Resend
   - Consider one-time IMAP sync for historical data

2. **Multiple Mailboxes:**
   - Resend webhook receives ALL domain emails
   - Filter by recipient in webhook handler
   - Map to correct mailbox_id

3. **PurelyMail DNS:**
   - May need to update MX records to point to Resend
   - Check current DNS configuration
   - Coordinate with domain admin

---

## 📞 Support

- **Resend Support:** support@resend.com
- **Resend Dashboard:** https://resend.com/emails
- **API Status:** https://resend.statuspage.io/

---

**Created:** Sept 18, 2026  
**For:** Email AI Migration to Resend  
**Status:** Ready for implementation
