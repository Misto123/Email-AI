# Deploy EMD Pipeline Theme to Separate Git Repository

## Overview

This guide explains how to extract your cloned website (the EMD Pipeline theme based on memorable.me) from the template repository and deploy it as a standalone project in a new Git repository.

---

## 🎯 What You'll Achieve

- Separate your production-ready coupon/deals website from the cloning template
- Create a clean repository with only the necessary files
- Remove all template-specific files and documentation
- Deploy to a new GitHub repository
- Set up for independent development and deployment

---

## 📦 Files to KEEP (Your Theme)

### Core Application Files
```
src/                          # Your entire application
  ├── app/                    # Next.js routes (coupon, blog, about, etc.)
  ├── components/             # All React components
  ├── config/                 # Configuration files
  ├── hooks/                  # Custom React hooks
  ├── lib/                    # Utilities and database
  └── types/                  # TypeScript types

public/                       # Static assets
  ├── images/
  ├── videos/
  └── robots.txt

docs/design-system/           # Your design system documentation
schema.sql                    # Database schema
schema-coupons.sql           # Coupon-specific schema
migrate-db.js                # Database migration script
```

### Configuration Files
```
package.json                  # Dependencies (update name/description)
package-lock.json            # Lock file
next.config.ts               # Next.js configuration
tsconfig.json                # TypeScript configuration
tailwind.config.ts           # Tailwind configuration (if exists)
postcss.config.mjs           # PostCSS configuration
components.json              # shadcn/ui configuration
.gitignore                   # Git ignore rules
.env.local                   # Environment variables (DO NOT commit)
.env.router.example          # Example environment file
```

### Optional Keep
```
Dockerfile                   # If you want Docker support
docker-compose.yml           # If you want Docker support
.dockerignore               # If you keep Docker files
```

---

## 🗑️ Files to REMOVE (Template Files)

### Template Documentation
```
AGENTS.md                    # AI agent instructions
README.md                    # Template README (replace with your own)
CHANGELOG.md                 # Template changelog
CLAUDE.md                    # Claude-specific config
GEMINI.md                    # Gemini-specific config
.clinerules                  # Cline rules
.windsurfrules              # Windsurf rules
BLOG_SETUP_GUIDE.md         # Keep if you want the guide
COMPLETE_SETUP_NOW.md       # Remove
DATABASE_SETUP_GUIDE.md     # Keep if you want the guide
MEMORABLE_CLONE_COMPLETE.md # Remove or archive
MODEL_ROUTER_GUIDE.md       # Keep if using model router
COUPON_DESIGN_IMPROVEMENTS.md
COUPON_INTERSTITIAL_GUIDE.md
DICLOAK_REBRAND_PLAN.md
VERCEL_CREDENTIALS.md       # Remove (sensitive)
```

### AI Agent Directories
```
.claude/                     # Claude Code settings
.cursor/                     # Cursor settings
.windsurf/                   # Windsurf settings
.continue/                   # Continue settings
.aider.conf.yml             # Aider configuration
.amazonq/                    # Amazon Q settings
.augment/                    # Augment settings
.codex/                      # Codex settings
.gemini/                     # Gemini settings
.opencode/                   # OpenCode settings
.mcp.json                    # MCP configuration
```

### Template Research Files
```
docs/research/               # Remove (template research notes)
docs/design-references/      # Remove or keep comparison images
scripts/                     # Template sync scripts
examples/                    # Template examples
```

### Build/Cache Files (Already in .gitignore)
```
node_modules/
.next/
.vercel/
.DS_Store
*.tsbuildinfo
```

---

## 🚀 Step-by-Step Deployment Guide

### Option 1: Clean Export (Recommended)

This creates a fresh copy with only production files.

#### Step 1: Create a new directory
```bash
cd ~/ClaudeProjects
mkdir emd-pipeline-theme
cd emd-pipeline-theme
```

#### Step 2: Initialize new git repository
```bash
git init
```

#### Step 3: Copy essential files from your clone
```bash
# Copy core application files
cp -r ~/ClaudeProjects/my-clone/src ./
cp -r ~/ClaudeProjects/my-clone/public ./

# Copy configuration files
cp ~/ClaudeProjects/my-clone/package.json ./
cp ~/ClaudeProjects/my-clone/package-lock.json ./
cp ~/ClaudeProjects/my-clone/next.config.ts ./
cp ~/ClaudeProjects/my-clone/tsconfig.json ./
cp ~/ClaudeProjects/my-clone/postcss.config.mjs ./
cp ~/ClaudeProjects/my-clone/components.json ./
cp ~/ClaudeProjects/my-clone/.gitignore ./

# Copy database files
cp ~/ClaudeProjects/my-clone/schema.sql ./
cp ~/ClaudeProjects/my-clone/schema-coupons.sql ./
cp ~/ClaudeProjects/my-clone/migrate-db.js ./

# Copy environment example
cp ~/ClaudeProjects/my-clone/.env.router.example ./

# Optional: Copy design system docs
mkdir -p docs/design-system
cp -r ~/ClaudeProjects/my-clone/docs/design-system/ ./docs/

# Optional: Copy Docker files if needed
# cp ~/ClaudeProjects/my-clone/Dockerfile ./
# cp ~/ClaudeProjects/my-clone/docker-compose.yml ./
# cp ~/ClaudeProjects/my-clone/.dockerignore ./
```

#### Step 4: Update package.json
Edit `package.json` to update your project details:
```json
{
  "name": "emd-pipeline-theme",
  "version": "1.0.0",
  "private": true,
  "description": "Modern coupon and deals website built with Next.js",
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR-USERNAME/emd-pipeline-theme.git"
  },
  "homepage": "https://github.com/YOUR-USERNAME/emd-pipeline-theme",
  ...
}
```

#### Step 5: Create a new README.md
```bash
cat > README.md << 'EOF'
# EMD Pipeline Theme

Modern coupon and deals website built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- 🎫 Coupon management system
- 📝 Blog with markdown support
- 🗄️ PostgreSQL database integration
- 🎨 Modern design system
- 📱 Fully responsive
- ⚡ Server-side rendering
- 🔍 SEO optimized

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI components
- **PostgreSQL** - Database
- **Vercel** - Deployment

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.router.example .env.local
   ```
   
   Update `.env.local` with your database credentials.

3. Set up the database:
   ```bash
   node migrate-db.js
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript
- `npm run check` - Run all checks

## License

MIT
EOF
```

#### Step 6: Install dependencies
```bash
npm install
```

#### Step 7: Test the build
```bash
npm run build
```

#### Step 8: Create initial commit
```bash
git add .
git commit -m "Initial commit: EMD Pipeline theme"
```

---

### Option 2: In-Place Cleanup (Faster but Less Clean)

This removes template files from your existing repository.

#### Step 1: Create a backup
```bash
cd ~/ClaudeProjects
cp -r my-clone my-clone-backup
cd my-clone
```

#### Step 2: Remove template files
```bash
# Remove AI agent directories
rm -rf .claude .cursor .windsurf .continue .amazonq .augment .codex .gemini .opencode
rm -f .aider.conf.yml .clinerules .windsurfrules .mcp.json

# Remove template documentation
rm -f AGENTS.md CHANGELOG.md CLAUDE.md GEMINI.md
rm -f COMPLETE_SETUP_NOW.md MEMORABLE_CLONE_COMPLETE.md
rm -f COUPON_DESIGN_IMPROVEMENTS.md COUPON_INTERSTITIAL_GUIDE.md
rm -f DICLOAK_REBRAND_PLAN.md VERCEL_CREDENTIALS.md

# Remove template research
rm -rf docs/research docs/design-references

# Remove template scripts and examples
rm -rf scripts examples

# Optional: Remove guides you don't need
# rm -f BLOG_SETUP_GUIDE.md DATABASE_SETUP_GUIDE.md MODEL_ROUTER_GUIDE.md
```

#### Step 3: Update package.json and README.md
(Same as Option 1, Steps 4-5)

#### Step 4: Change git remote
```bash
# Remove old remote
git remote remove origin

# Add new remote (after creating repo on GitHub)
git remote add origin https://github.com/YOUR-USERNAME/emd-pipeline-theme.git
```

#### Step 5: Commit changes
```bash
git add .
git commit -m "Remove template files, prepare for deployment"
```

---

## 🌐 Deploy to GitHub

### Step 1: Create a new repository on GitHub

1. Go to https://github.com/new
2. Name: `emd-pipeline-theme` (or your preferred name)
3. Description: "Modern coupon and deals website"
4. Choose public or private
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 2: Push to GitHub

```bash
# Add remote (if not done already)
git remote add origin https://github.com/YOUR-USERNAME/emd-pipeline-theme.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🚀 Deploy to Vercel

### Option A: Via Vercel Dashboard

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add environment variables from `.env.local`
6. Click "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 🔐 Environment Variables to Set

When deploying, set these environment variables:

### Required (Database)
```
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NO_SSL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=
```

### Optional (OpenRouter/AI)
```
OPENROUTER_API_KEY=
DEFAULT_MODEL=
```

---

## ✅ Post-Deployment Checklist

- [ ] Test homepage loads correctly
- [ ] Test coupon pages display properly
- [ ] Test blog functionality
- [ ] Verify database connections work
- [ ] Check mobile responsiveness
- [ ] Test form submissions
- [ ] Verify SEO meta tags
- [ ] Set up custom domain (optional)
- [ ] Configure analytics (optional)
- [ ] Set up monitoring (optional)

---

## 🔧 Troubleshooting

### Build fails on Vercel

**Issue**: Missing environment variables
**Solution**: Add all required environment variables in Vercel dashboard

**Issue**: TypeScript errors
**Solution**: Run `npm run typecheck` locally and fix errors

### Database connection fails

**Issue**: Wrong connection string
**Solution**: Verify `POSTGRES_URL` in environment variables

**Issue**: SSL certificate error
**Solution**: Use `POSTGRES_URL_NO_SSL` for development

### Images not loading

**Issue**: Images in `public/` folder
**Solution**: Ensure all images are committed to git

---

## 📚 Next Steps

1. **Custom Domain**: Configure your domain in Vercel settings
2. **Analytics**: Add Google Analytics or Plausible
3. **Error Tracking**: Set up Sentry or similar
4. **Performance**: Optimize images with Next.js Image component
5. **SEO**: Submit sitemap to Google Search Console
6. **Security**: Review and update security headers in `next.config.ts`

---

## 🆘 Need Help?

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

## 📄 License

MIT - Feel free to use this theme for your projects!

---

**Generated**: August 18, 2026  
**Version**: 1.0.0
