# 📧 Purelymail Integration Guide for Email-AI

## Quick Start (3 Easy Steps)

### Step 1: Get Your Purelymail Credentials
You need your email address and password from Purelymail.

**Where to find them:**
1. Go to https://purelymail.com
2. Log in to your account
3. Your email address is shown in the dashboard (e.g., `sales@yourdomain.com`)
4. Your password is the one you use to log in to Purelymail

### Step 2: Add to Email-AI
1. Go to https://email-ai-mu.vercel.app/mailboxes
2. Click the **"📖 How to Add Purelymail Mailboxes"** instructions (if closed)
3. Fill in the form:
   - **Email Address:** Your full Purelymail email
   - **Password:** Your Purelymail password
   - **AI Instructions:** (Optional) Custom instructions like "Reply professionally and mention our 30-day guarantee"
   - **AI drafting enabled:** Leave checked ✅

4. Click **"➕ Add mailbox"**

### Step 3: Test Your Connection
1. Click **"📥 Test IMAP"** - Should show success ✅
2. Click **"📤 Test SMTP"** - Should show success ✅
3. Done! 🎉

---

## 🔧 Technical Details (Automatic - You Don't Need to Set These)

Email-AI automatically uses these Purelymail servers:

| Protocol | Server | Port | Encryption |
|----------|--------|------|------------|
| **IMAP** (Incoming) | `imap.purelymail.com` | 993 | SSL/TLS |
| **SMTP** (Outgoing) | `smtp.purelymail.com` | 465 | SSL/TLS |

These are **hardcoded** in Email-AI, so you don't need to configure them manually.

---

## 🔐 Security & Privacy

### How Your Password is Protected:
1. **Browser → Server:** HTTPS encrypted transmission
2. **Server Storage:** AES-256-GCM encryption with a 32-byte key
3. **Never Returned:** Encrypted passwords are NEVER sent back to your browser
4. **Server-Only Decryption:** Only server-side code can decrypt and use your password

### What This Means:
- ✅ Your password is encrypted before being stored in the database
- ✅ Even if someone steals the database, they can't read your password
- ✅ All IMAP/SMTP connections use SSL/TLS
- ✅ No plaintext passwords anywhere

---

## 📱 Purelymail App Passwords (Recommended)

For extra security, use a Purelymail **app password** instead of your main password:

1. Log in to https://purelymail.com
2. Go to **Settings** → **Security**
3. Generate an **App Password** for "Email-AI"
4. Use that app password in Email-AI instead of your main password

**Benefits:**
- ✅ Can revoke access without changing your main password
- ✅ Limit what the app can do
- ✅ Better security if Email-AI is ever compromised

*(Note: Check Purelymail docs to confirm if app passwords are available)*

---

## 🚨 Troubleshooting

### Test IMAP Fails
**Error:** "Unable to connect to IMAP server"

**Solutions:**
1. ✅ Check your email address is correct
2. ✅ Check your password is correct (try logging in at purelymail.com)
3. ✅ Wait 30 seconds and try again (temporary network issue)
4. ✅ Check if Purelymail is down: https://status.purelymail.com

### Test SMTP Fails
**Error:** "Unable to connect to SMTP server"

**Solutions:**
- Same as IMAP troubleshooting above
- SMTP uses port 465 (SSL/TLS) - make sure your network allows it

### "Incorrect credentials" Error
**Problem:** Email or password is wrong

**Solution:**
1. Go to https://purelymail.com and try logging in
2. If login works, copy the EXACT email and password
3. Paste into Email-AI (watch for extra spaces!)

### Password Has Special Characters
**Problem:** Password contains `"`, `'`, or other special characters

**Solution:**
- Email-AI handles all special characters correctly
- Just paste your password as-is
- The encryption process handles special characters

---

## 🤖 How AI Drafts Work

### The Flow:
1. **Daily Check:** Email-AI checks your inbox every night at midnight (cron job)
2. **New Emails Found:** Downloads unread emails via IMAP
3. **AI Generates Draft:** OpenRouter (GPT-5.6-Luna) creates a reply based on:
   - The original email content
   - Your custom AI instructions (if any)
   - (Future) Your knowledge base, website content, past emails
4. **Human Approval Queue:** Draft appears on the homepage for your review
5. **You Review & Send:** Edit if needed, then click "Send"
6. **SMTP Delivery:** Email-AI sends via Purelymail SMTP

### Important:
- 🚫 **AI NEVER sends automatically** - You must approve every reply
- ⏰ **Emails checked once per day** (midnight) on Hobby plan
- 💰 **Upgrade to Pro** for 5-minute email polling

---

## 📊 Multiple Mailboxes (Up to 20)

You can add multiple Purelymail accounts:

### Example Use Cases:
- **sales@company.com** - Sales inquiries (AI instruction: "Be friendly and mention our demo")
- **support@company.com** - Support tickets (AI instruction: "Be patient and link to docs")
- **info@company.com** - General inquiries (AI instruction: "Be concise and professional")

### Per-Mailbox AI Instructions:
Each mailbox can have its own custom AI instructions:

```
Sales mailbox:
"Reply warmly and professionally. Always mention our 30-day money-back guarantee. 
Include a link to schedule a demo: https://cal.com/demo"

Support mailbox:
"Be patient and helpful. Link to documentation when relevant: https://docs.example.com
If it's a bug report, acknowledge it and say we'll investigate."
```

---

## 🔮 Future Automation (Coming Soon)

### Phase 1: Purelymail API Integration (If Available)
- Auto-discover mailboxes from Purelymail account
- One-click setup for all mailboxes
- Automatic password rotation

### Phase 2: Knowledge Base
- Upload company docs, FAQs, policies
- AI references your actual documentation in replies

### Phase 3: Website Content
- Scrape your website for product info
- AI knows your pricing, features, etc.

### Phase 4: Email History Learning
- Upload past email conversations
- AI learns your tone and style
- Better, more personalized replies

---

## 💡 Pro Tips

### Tip 1: Test Before Production
Add a test mailbox first (like `test@yourdomain.com`) to verify everything works.

### Tip 2: Use Specific AI Instructions
Generic instructions = generic replies. Be specific:
- ❌ "Reply professionally"
- ✅ "Reply warmly. Mention our 24/7 support. Link to pricing: https://..."

### Tip 3: Monitor Daily
Check https://email-ai-mu.vercel.app every morning to review overnight drafts.

### Tip 4: Start with AI Paused
Add a mailbox with "AI drafting enabled" unchecked to test IMAP/SMTP first, then enable AI later.

---

## 📝 Quick Reference Card

```
┌─────────────────────────────────────────┐
│  PURELYMAIL → EMAIL-AI QUICK SETUP      │
├─────────────────────────────────────────┤
│ 1. Get credentials from purelymail.com  │
│ 2. Add at /mailboxes                    │
│ 3. Test IMAP & SMTP                     │
│ 4. Wait for midnight cron job           │
│ 5. Review drafts on homepage            │
│ 6. Edit & send!                         │
└─────────────────────────────────────────┘

Servers (automatic):
  IMAP: imap.purelymail.com:993 (SSL/TLS)
  SMTP: smtp.purelymail.com:465 (SSL/TLS)

Security:
  ✅ AES-256-GCM encrypted passwords
  ✅ HTTPS + SSL/TLS everywhere
  ✅ Server-side only decryption

Support:
  📖 MEMORY.md
  📖 ENHANCEMENT_PLAN.md
  🌐 https://purelymail.com/docs
```

---

## ❓ FAQ

### Q: Can I use Gmail/Outlook instead of Purelymail?
**A:** Not yet. Email-AI is specifically designed for Purelymail's IMAP/SMTP servers. Other providers coming soon.

### Q: How much does Purelymail cost?
**A:** Check https://purelymail.com/pricing - Usually $10/year for unlimited mailboxes.

### Q: Can I test before adding real mailboxes?
**A:** Yes! Add a test mailbox first, send yourself an email, wait for the cron job, and see if a draft appears.

### Q: What if I have 50+ mailboxes?
**A:** Email-AI currently supports up to 20 mailboxes. Contact us if you need more.

### Q: Can AI send emails without my approval?
**A:** **NO!** AI only creates drafts. You must review and click "Send" for every reply. This is a core safety feature.

### Q: How fast does AI reply to emails?
**A:** On Hobby plan: Once per day (midnight check). On Pro plan: Every 5 minutes.

---

## 🎓 Video Tutorial (Coming Soon)

We're creating a video walkthrough:
1. Setting up Purelymail account
2. Adding to Email-AI
3. Testing connections
4. Reviewing and sending first draft

Stay tuned!

---

**Need help?** Check `MEMORY.md` or open an issue on GitHub.
