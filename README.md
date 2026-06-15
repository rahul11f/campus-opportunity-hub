# 🎓 Campus Opportunity Hub

**[🚀 Live Demo on Vercel](https://campus-opportunity-hub.vercel.app)**

> AI-powered platform that transforms raw Telegram/WhatsApp placement notices into clean, structured, student-friendly opportunity listings.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)

---

## 📖 About

**Campus Opportunity Hub** is a modern, student-centric web platform designed to streamline the way university students discover, track, and apply for placement opportunities, internships, and hackathons. 

Traditionally, placement cell notifications are scattered across WhatsApp groups, Telegram channels, and emails. This creates a chaotic experience where students often miss deadlines or struggle to find relevant links. 

This platform solves that by acting as a central, structured database. It uses AI to parse messy notification text into structured, searchable cards with clear deadlines, eligibility criteria, and direct application links. It also features a student dashboard to track saved opportunities and applications, and an admin dashboard for efficient moderation and publishing.

---

## 🎯 What It Does

Students receive chaotic placement notifications via Telegram/WhatsApp. This platform gives:

- **Admins**: A paste-and-publish workflow — paste raw notice text, AI extracts structured data, review and publish in under 2 minutes.
- **Students**: A beautiful, searchable, filterable opportunity feed with deadlines, eligibility, skills, and direct apply links.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion |
| UI Components | ShadCN UI, Radix UI primitives |
| Backend | Next.js API Routes, Supabase PostgreSQL |
| Auth | Supabase Auth (email + password) |
| AI | Google Gemini 1.5 Pro |
| Rate Limiting | Upstash Redis |
| Web Scraping | Cheerio (static), pdf-parse (PDFs) |
| Deployment | Vercel |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- An [Upstash](https://upstash.com) Redis instance (optional but recommended)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/campus-opportunity-hub.git
cd campus-opportunity-hub
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL_WHITELIST=admin@example.com
```

### 3. Set Up Supabase Database

In your Supabase project's **SQL Editor**, run these files in order:

```sql
-- 1. Create tables, indexes, and functions
-- Paste contents of: supabase/schema.sql

-- 2. Set up Row Level Security policies
-- Paste contents of: supabase/rls-policies.sql

-- 3. (Optional) Add sample data for development
-- Paste contents of: supabase/seed.sql
```

### 4. Create Admin User

In Supabase Dashboard → **Authentication** → **Users** → **Add User**:
- Enter email and password
- Make sure the email matches one in your `ADMIN_EMAIL_WHITELIST`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the student view.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Student Frontend                       │
│  Homepage (/) → Detail (/opportunities/[id]) → Search    │
│  Filter by type · Full-text search · Deadline countdown  │
└────────────────────────┬────────────────────────────────┘
                         │ Supabase (RLS: public read)
┌────────────────────────▼────────────────────────────────┐
│                  Admin Dashboard (/admin)                 │
│  1. Paste raw notice                                      │
│  2. AI Pipeline (URL detect → fetch → clean → Gemini)    │
│  3. Review & edit extracted data in form                  │
│  4. Publish → Supabase                                    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    API Layer                              │
│  /api/process-notice  — 6-step AI pipeline               │
│  /api/opportunities   — CRUD with auth                   │
│  /api/scrape          — URL scraping endpoint            │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              Infrastructure / Services                    │
│  Supabase PostgreSQL  — Primary database + auth          │
│  Gemini 1.5 Pro       — AI data extraction               │
│  Upstash Redis        — Rate limiting                     │
│  Vercel               — Hosting + Edge functions          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 AI Processing Pipeline

When an admin pastes a raw notice, the system runs a 6-step pipeline:

```
Step 1: URL Detection    → Regex scan, classify URLs (pdf/doc/telegram/etc)
Step 2: Content Fetching → Expand short URLs, scrape webpages, parse PDFs
Step 3: Text Cleaning    → Deduplicate, normalize unicode, remove decorations
Step 4: Gemini AI        → Extract structured JSON (role, salary, eligibility...)
Step 5: Form Population  → Pre-fill editable form, highlight missing fields
Step 6: Publish          → Validate, sanitize, save to Supabase
```

---

## 🔒 Security Features

- **SSRF Protection**: All URL fetching validates against private IP ranges (10.x.x.x, 192.168.x.x, 169.254.169.254, etc.)
- **Rate Limiting**: Upstash Redis sliding window (10 req/hour for AI pipeline)
- **Admin Whitelist**: Only specified emails can access `/admin/*`
- **RLS Policies**: Supabase Row Level Security on all tables
- **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options
- **Input Validation**: Zod schemas on all API endpoints

---

## 📁 Project Structure

```
campus-opportunity-hub/
├── app/
│   ├── (public)/          # Student-facing pages (with Navbar + Footer)
│   │   ├── page.tsx       # Homepage with search, filters, card grid
│   │   ├── opportunities/[id]/page.tsx  # Detail page
│   │   └── search/page.tsx
│   ├── admin/             # Admin dashboard (auth-protected)
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── new/page.tsx   # Paste & process workflow
│   │   └── listings/      # Table + edit
│   ├── api/               # API route handlers
│   │   ├── opportunities/ # CRUD endpoints
│   │   ├── process-notice/# Main AI pipeline
│   │   └── scrape/        # URL scraping
│   ├── sitemap.ts         # Dynamic sitemap
│   └── robots.ts
├── components/
│   ├── opportunity/       # Cards, filters, countdown
│   ├── admin/             # PasteWorkflow, OpportunityForm
│   ├── ads/               # AdSlot component
│   └── shared/            # Navbar, Footer, Disclaimer
├── lib/
│   ├── supabase/          # Client, server, middleware helpers
│   ├── pipeline/          # URL detection, scraping, AI extraction
│   ├── redis.ts           # Upstash Redis client
│   ├── rateLimit.ts       # Rate limiting helpers
│   └── validators.ts      # Zod schemas
├── types/opportunity.ts   # TypeScript types
└── supabase/
    ├── schema.sql         # Tables, indexes, functions
    ├── rls-policies.sql   # Row Level Security
    └── seed.sql           # Sample data
```

---

## 🚀 Deployment on Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)

### 3. Configure Environment Variables

In Vercel → Project → Settings → Environment Variables, add all variables from `.env.local.example`.

**Important**: Set `NEXT_PUBLIC_APP_URL` to your actual Vercel domain (e.g., `https://campus-opportunity-hub.vercel.app`).

### 4. Deploy

Click **Deploy**. Your app will be live in ~2 minutes.

### Optional: Custom Domain

In Vercel → Project → Settings → Domains, add your custom domain.

---

## 📣 AdSense Setup

1. Sign up at [Google AdSense](https://www.google.com/adsense/)
2. Get approved (requires real content — add seed data first)
3. Get your publisher ID (`ca-pub-XXXXXXXXX`)
4. Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` in Vercel environment variables
5. Ad slots are already placed at:
   - Homepage: Banner (728×90) + In-feed every 6 cards
   - Detail page: Right rail (300×600) + In-content
   - Footer: Leaderboard

---

## 🌐 SEO Features

- `generateMetadata()` for all dynamic pages
- OpenGraph + Twitter Card meta tags
- `JSON-LD` JobPosting structured data on detail pages
- Dynamic `sitemap.xml` from published opportunities
- `robots.txt` with proper crawl rules
- ISR (revalidate: 60) on homepage

---

## 📋 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## ⚖️ Legal Notice

This platform extracts and structures factual information from publicly shared campus notices. It does not store verbatim copyrighted content. All listings include a disclaimer directing students to verify information from official sources.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

**Built with ❤️ for students, by students.**
