# DNS Migration Guide for External Domains

## Overview

If your domain is **not** currently managed by Cloudflare, you'll need to update your domain's nameservers to point to Cloudflare before you can deploy your site using the automated deployment system.

---

## Before You Start

**Check if your domain is already on Cloudflare:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Look for your domain in the domains list
3. If it's there, **you don't need this guide** — skip to the deployment section

---

## Step 1: Add Domain to Cloudflare

### 1.1 Log into Cloudflare
- Go to: https://dash.cloudflare.com/
- Email: `contact@rebelinternet.eu`

### 1.2 Add a New Site
1. Click **"Add a Site"** button (top right)
2. Enter your domain name (e.g., `example.com`)
3. Click **"Add Site"**

### 1.3 Select Plan
- Choose **Free** plan (sufficient for most sites)
- Click **"Continue"**

### 1.4 DNS Records Scan
- Cloudflare will automatically scan your existing DNS records
- Review the records it found
- Click **"Continue"**

### 1.5 Get Cloudflare Nameservers
Cloudflare will show you **2 nameservers**, for example:
```
alexa.ns.cloudflare.com
evan.ns.cloudflare.com
```

**⚠️ IMPORTANT:** Write these down! You'll need them in the next step.

---

## Step 2: Update Nameservers at Your Domain Registrar

Now you need to update your domain's nameservers at the place where you registered your domain (GoDaddy, Namecheap, Google Domains, etc.).

### Common Registrars:

#### **GoDaddy**
1. Log into [GoDaddy](https://account.godaddy.com/)
2. Go to **"My Products"** → **"Domains"**
3. Click your domain name
4. Scroll to **"Additional Settings"** → Click **"Manage DNS"**
5. Scroll to **"Nameservers"** → Click **"Change"**
6. Select **"Custom"**
7. Replace the existing nameservers with the 2 Cloudflare nameservers
8. Click **"Save"**

#### **Namecheap**
1. Log into [Namecheap](https://www.namecheap.com/)
2. Go to **"Domain List"**
3. Click **"Manage"** next to your domain
4. Find **"Nameservers"** section
5. Select **"Custom DNS"**
6. Enter the 2 Cloudflare nameservers
7. Click the green checkmark to save

#### **Google Domains** (now Squarespace Domains)
1. Log into [Squarespace Domains](https://domains.squarespace.com/)
2. Click your domain
3. Click **"DNS"** in the left menu
4. Scroll to **"Name servers"**
5. Click **"Use custom name servers"**
6. Enter the 2 Cloudflare nameservers
7. Click **"Save"**

#### **Hostinger**
1. Log into [Hostinger](https://www.hostinger.com/)
2. Go to **"Domains"**
3. Click **"Manage"** next to your domain
4. Find **"Nameservers"**
5. Select **"Change nameservers"**
6. Enter the 2 Cloudflare nameservers
7. Click **"Save"**

#### **Other Registrars**
Search for: **"[Your Registrar Name] change nameservers"**

Most registrars have similar processes:
1. Find your domain management page
2. Look for "Nameservers", "DNS Settings", or "Name Server Settings"
3. Change from default/current to "Custom" nameservers
4. Enter the 2 Cloudflare nameservers
5. Save changes

---

## Step 3: Wait for DNS Propagation

### What is DNS Propagation?
When you change nameservers, it takes time for the change to spread across the internet. This is called "DNS propagation".

### How Long?
- **Minimum:** 5 minutes
- **Typical:** 1-4 hours
- **Maximum:** 24-48 hours (rare)

### How to Check Progress

**Option 1: Cloudflare Dashboard**
- Go to your domain in Cloudflare dashboard
- Look for a banner saying "Pending Nameserver Update" or "Active"
- When it says **"Active"**, you're done!

**Option 2: Online Tools**
- Use: https://www.whatsmydns.net/
- Enter your domain name
- Select "NS" (Nameserver) record type
- Click "Search"
- Check if Cloudflare nameservers appear (green checkmarks)

**Option 3: Command Line**
```bash
# Check nameservers (Mac/Linux)
dig NS yourdomain.com

# Check nameservers (Windows)
nslookup -type=NS yourdomain.com
```

If you see Cloudflare nameservers in the results, propagation is complete!

---

## Step 4: Get Zone ID

Once your domain is active on Cloudflare:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on your domain
3. Scroll down on the Overview page
4. Find **"Zone ID"** in the right sidebar (under "API")
5. Click to copy it
6. Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**⚠️ Save this Zone ID!** You'll need it when creating the site in the admin panel.

---

## Step 5: Create Site with Zone ID

Now you can create your site in the admin panel:

1. Go to: https://my-clone-phi-silk.vercel.app/admin/sites/new
2. Fill in the form:
   - **Production domain:** `yourdomain.com` (without http/https)
   - **Display name:** Your site name
   - **Zone ID:** Paste the Zone ID you copied
   - Fill in other branding/config fields
3. Click **"Create site"**
4. Site will be **auto-deployed** to Cloudflare!

---

## Troubleshooting

### "Domain not found in Cloudflare account"
- **Cause:** Nameservers haven't propagated yet, or domain not added to Cloudflare
- **Fix:** Wait longer (check whatsmydns.net), or add domain to Cloudflare dashboard

### "Zone ID not configured"
- **Cause:** Zone ID field was left empty when creating the site
- **Fix:** Edit the site and add the Zone ID

### Nameserver change rejected by registrar
- **Cause:** Domain locked, or registrar requires verification
- **Fix:** Unlock domain at registrar, or contact registrar support

### DNS propagation taking too long (>48 hours)
- **Cause:** ISP DNS cache, or registrar delay
- **Fix:** 
  - Clear your DNS cache:
    - Mac: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
    - Windows: `ipconfig /flushdns`
    - Linux: `sudo systemd-resolve --flush-caches`
  - Try a different network (mobile data vs WiFi)
  - Contact your domain registrar

---

## Quick Reference: Current Domains

### Domains Already on Cloudflare ✅
- `nasdaq-signals.com` (Zone ID: `b454cb2432e36e3c0b0ca4ad40ee7837`)
- `afkickkliniekamsterdam.com` (Zone ID: `097b876dbe616c6d0b5859eb47ed2a17`)

**These domains are ready for instant deployment!**

### Preview Domain
- All preview URLs use: `preview-{site-id}.nasdaq-signals.com`
- Zone ID: `b454cb2432e36e3c0b0ca4ad40ee7837`

---

## Summary

1. **Add domain to Cloudflare** (if not already there)
2. **Copy Cloudflare nameservers** (shown in Cloudflare dashboard)
3. **Update nameservers at domain registrar** (GoDaddy, Namecheap, etc.)
4. **Wait for DNS propagation** (5 min - 48 hours, usually 1-4 hours)
5. **Copy Zone ID** from Cloudflare dashboard
6. **Create site** in admin panel with Zone ID
7. **Deploy automatically** — done!

---

## Need Help?

- Cloudflare Support: https://support.cloudflare.com/
- Check DNS propagation: https://www.whatsmydns.net/
- Registrar-specific guides: Search "[Registrar] change nameservers tutorial"
