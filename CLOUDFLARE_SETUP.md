# Cloudflare Deployment Setup

## Required Environment Variables

To enable one-click Cloudflare deployment, add these to your `.env.local`:

```env
# Cloudflare API Credentials
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ZONE_ID=your_zone_id_here
```

---

## How to Get These Values

### 1. Account ID
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on any domain
3. Scroll down on the Overview page
4. Copy the **Account ID** from the right sidebar

**Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

### 2. API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click your profile icon (top right) → **My Profile**
3. Go to **API Tokens** tab
4. Click **Create Token**
5. Use **Custom token** template
6. Configure permissions:
   - **Account** → Workers Scripts → **Edit**
   - **Account** → Workers Routes → **Edit**
   - **Zone** → DNS → **Read**
   - **Zone** → Zone → **Read**
7. Set **Account Resources**:
   - Include → Your Account
8. Set **Zone Resources**:
   - Include → All zones (or specific zone)
9. Click **Continue to summary**
10. Click **Create Token**
11. **Copy the token immediately** (you can't see it again!)

**Example:** `AbCdEf1234567890GhIjKl_MnOpQrStUvWxYz`

---

### 3. Zone ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on the domain you want to use (e.g., `anwb-energie.nl`)
3. Scroll down on the Overview page
4. Copy the **Zone ID** from the right sidebar

**Example:** `z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4`

**Note:** If you manage multiple domains, you'll need the Zone ID for each domain's zone. However, if all your domains are in the same Cloudflare account, you can often use one Zone ID for the primary domain.

---

## Setup Instructions

### Step 1: Create `.env.local`

In your project root (`/Users/northsea/ClaudeProjects/my-clone/`), create or edit `.env.local`:

```bash
# Copy from .env.example if it exists
cp .env.example .env.local

# Or create new file
touch .env.local
```

### Step 2: Add Credentials

Edit `.env.local` and add:

```env
# Cloudflare API Credentials
CLOUDFLARE_ACCOUNT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
CLOUDFLARE_API_TOKEN=AbCdEf1234567890GhIjKl_MnOpQrStUvWxYz
CLOUDFLARE_ZONE_ID=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4

# Keep existing variables (database, etc.)
DATABASE_URL=your_existing_database_url
# ... other variables
```

### Step 3: Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

### Step 4: Deploy to Vercel

Add the environment variables to Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `my-clone`
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: `your_account_id`
   - Environment: Production, Preview, Development
5. Click **Save**
6. Repeat for `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID`
7. Redeploy: `npx vercel --prod`

---

## Testing Deployment

### Test Locally First

1. Restart dev server with new env vars
2. Go to http://localhost:3000/admin/sites
3. Click **🚀 Deploy to Cloudflare** on any site
4. Watch the deployment status
5. Check Cloudflare dashboard to verify Worker deployed

### Test on Production

1. Add env vars to Vercel (see Step 4 above)
2. Deploy: `npx vercel --prod`
3. Go to https://my-clone-phi-silk.vercel.app/admin/sites
4. Click **🚀 Deploy to Cloudflare**
5. Site should deploy automatically

---

## Troubleshooting

### Error: "Missing Cloudflare credentials"

**Cause:** Environment variables not set or wrong names

**Fix:**
1. Check `.env.local` has correct variable names
2. Restart dev server
3. For production, check Vercel environment variables

### Error: "Authentication failed"

**Cause:** Invalid API token or expired token

**Fix:**
1. Generate new API token with correct permissions
2. Update `.env.local` and Vercel env vars
3. Redeploy

### Error: "Zone not found"

**Cause:** Wrong Zone ID or domain not on Cloudflare

**Fix:**
1. Verify domain is added to Cloudflare
2. Copy Zone ID from correct domain
3. Update `.env.local` and redeploy

### Error: "Worker deployment failed"

**Cause:** Worker script issue or insufficient permissions

**Fix:**
1. Check API token has **Workers Scripts: Edit** permission
2. Check Cloudflare dashboard for worker limits (free tier has limits)
3. Check deployment logs: `/api/admin/deployments`

---

## Security Notes

- ✅ **Never commit `.env.local` to git** (already in `.gitignore`)
- ✅ **Use API tokens, not API keys** (tokens are more secure)
- ✅ **Limit token permissions** (only what's needed)
- ✅ **Rotate tokens regularly** (every 90 days recommended)
- ✅ **Use separate tokens for dev/prod** (optional but recommended)

---

## What Happens When You Click Deploy

1. **Admin UI sends request** → `POST /api/admin/sites/[id]/deploy`
2. **API validates site** → Checks site exists and is active
3. **CloudflareDeploymentOrchestrator starts**:
   - Validates configuration
   - Deploys Worker to Cloudflare
   - Attaches domain to Worker route
   - Verifies deployment
4. **Deployment tracked** → Saved to `deployments` table
5. **Site goes live** → Domain routes to Worker → Next.js app renders

**Total time: ~30 seconds**

---

## Next Steps After Setup

Once environment variables are configured:

1. ✅ Create a test site in admin
2. ✅ Click **🚀 Deploy to Cloudflare**
3. ✅ Wait 30 seconds
4. ✅ Visit the domain → See your site live!
5. ✅ Check deployment history at `/api/admin/sites/[id]/deploy`

---

**You're all set!** One-click deployment is now enabled. 🚀
