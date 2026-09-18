# Email AI - Database Migration Guide

## ✅ Quick Run (Recommended - 30 seconds)

**Just copy & paste in Supabase dashboard:**

1. Go to: https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/sql/new
2. Copy the contents of `run-all-migrations.sql`
3. Paste into the SQL Editor
4. Click **Run**
5. Done! ✅

---

## 🤖 Automated Options

### Option 1: Browser Automation (No login needed)

**Requirements:**
- Kimi WebBridge daemon running
- You're already logged into Supabase in your browser

**Run:**
```bash
cd /Users/northsea/ClaudeProjects/Email-AI
chmod +x run-migrations-browser.sh
./run-migrations-browser.sh
```

**What it does:**
- Opens Supabase SQL Editor automatically
- Fills in the SQL
- Clicks Run
- Shows results

---

### Option 2: Direct psql Connection (When it works)

**Requirements:**
- Project must be active (not paused)
- Connection must allow external access

**Run:**
```bash
cd /Users/northsea/ClaudeProjects/Email-AI
chmod +x run-migrations.sh
./run-migrations.sh
```

**Current Issue:**
- Supabase pooler connection format varies by project
- Direct connection blocked by firewall/IPv6
- ⚠️ This method currently fails, use Option 1 or manual run instead

---

## 📋 What Gets Created

After running migrations, your database will have:

### Tables:
- **mailboxes** - Email accounts with credentials
- **emails** - Received emails with metadata
- **drafts** - AI-generated draft responses
- **settings** - Global app settings (AI model, spam threshold, etc.)
- **folders** - Custom email categories
- **email_folders** - Email-to-folder assignments
- **spam_training** - User spam feedback for learning

### Features Enabled:
- ✅ Spam detection with scoring (0-100)
- ✅ Custom spam keywords
- ✅ Mark as spam functionality
- ✅ Folder organization
- ✅ Connection status monitoring (IMAP/SMTP)
- ✅ Email threading support
- ✅ Multi-language replies

---

## 🔧 Files Reference

| File | Purpose |
|------|---------|
| `run-all-migrations.sql` | Complete SQL (all 5 migrations combined) |
| `run-migrations-browser.sh` | Browser automation script |
| `run-migrations.sh` | Direct psql script (currently not working) |
| `run-migrations.html` | Interactive HTML tool with copy buttons |
| `supabase/migrations/001_*.sql` | Individual migration files |

---

## 🐛 Troubleshooting

### "Connection failed" error
- ✅ Use browser automation or manual dashboard method instead
- Check if project is paused in Supabase dashboard
- Verify password is correct: `S%E[d}R3YjC8`

### "Syntax error at or near 'references'"
- ✅ Fixed in `run-all-migrations.sql` (uses `"references"` with quotes)

### "Foreign key constraint incompatible types"
- ✅ Fixed in `run-all-migrations.sql` (all IDs are UUID now)

### Browser automation fails
- Start Kimi WebBridge daemon first
- Make sure you're logged into Supabase in browser
- Use manual copy/paste method as fallback

---

## 📝 Database Password

**Current password:** `S%E[d}R3YjC8`

**URL-encoded:** `S%25E%5Bd%7DR3YjC8` (for connection strings)

**Reset password:** https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/settings/database

---

## 🎯 Next Steps After Migration

1. Visit your app: https://email-ai-mu.vercel.app
2. Add a mailbox to test spam detection
3. Configure spam settings in the UI
4. Check connection status indicators

---

## 📞 Support

If automated methods fail, the manual dashboard method always works:
1. Open: https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/sql/new
2. Copy/paste: `run-all-migrations.sql`
3. Click Run
