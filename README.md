# BroMountain Adventures

A website for a Himalayan trekking and adventure company based in Uttarkashi, Uttarakhand. It has a public site where visitors browse treks, send booking requests and leave reviews, and a password-protected admin panel where the owner manages everything without touching code.

Built with Next.js 16 (App Router), React 19, Supabase and Tailwind CSS 4.

## Features

**Public site**

- Home page with hero slideshow, activity categories, featured adventures, reviews and an optional special-offer popup
- Adventure listing with category filters
- Adventure detail pages with day-by-day itinerary, inclusions and exclusions, photo gallery, departure dates and pricing
- Booking request form on every adventure
- Review submission with photo upload; reviews appear after admin approval
- Contact page with FAQ and WhatsApp hand-off
- Light and dark themes, remembered per visitor
- SEO: per-page metadata, JSON-LD structured data, sitemap, robots file, web manifest and a generated Open Graph image

**Admin panel** (`/admin`)

- Dashboard with booking stats and a monthly bookings chart
- Create, edit and delete adventures, including itinerary, gallery and departure dates
- Review bookings and update their status
- Approve or reject reviews
- Manage activity categories and special offers

**Content freshness**

- Public pages are statically rendered and revalidated, so admin edits show up without a redeploy
- Open pages detect content changes and refresh themselves
- A scheduled cron job revalidates pages and keeps the Supabase project active

## Tech stack

| Area | Tools |
|------|-------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Database and storage | Supabase (Postgres, Storage, Row Level Security) |
| Styling | Tailwind CSS 4, shadcn/ui primitives on Base UI |
| Forms and UI | React Hook Form, Framer Motion, Lucide icons, React Hot Toast |
| Hosting | Vercel (with Vercel Cron) |

## Getting started

### Prerequisites

- Node.js 20 or newer
- A Supabase project

### 1. Install

```bash
git clone https://github.com/Anuj8171/bromountain-.git
cd bromountain-
npm install
```

### 2. Set up the database

Open the Supabase SQL Editor and run the contents of [supabase-schema.sql](supabase-schema.sql). It creates the tables and security policies.

Then create a public storage bucket named `bromountain-media` for adventure, category and review images.

### 3. Add environment variables

Create a file named `.env.local` in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Admin
ADMIN_PASSWORD=
NEXT_PUBLIC_ADMIN_WHATSAPP=

# Site / SEO
NEXT_PUBLIC_SITE_URL=

# Cron authentication
CRON_SECRET=
```

| Variable | What it is |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key. Server only; never expose it |
| `ADMIN_PASSWORD` | Password for the admin panel |
| `NEXT_PUBLIC_ADMIN_WHATSAPP` | WhatsApp number that receives enquiries, with country code and no `+` |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site, used for metadata and the sitemap |
| `CRON_SECRET` | Any long random string; protects the cron endpoint |

### 4. Run

```bash
npm run dev
```

The site runs at http://localhost:3000 and the admin panel at http://localhost:3000/admin.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
app/
  page.tsx            Home page
  adventures/         Listing and detail pages
  reviews/            Reviews page
  contact/            Contact page
  admin/              Admin panel pages
  api/                API routes (bookings, reviews, uploads, admin CRUD, cron)
  og/                 Open Graph image generator
components/           Page sections and shared UI
  admin/              Admin panel components
  ui/                 Reusable UI primitives
lib/                  Supabase clients, data fetching, auth, SEO helpers
types/                Shared TypeScript types
supabase-schema.sql   Database schema
vercel.json           Cron schedule
```

## Deployment

The project is set up for Vercel:

1. Import the repository in Vercel.
2. Add the environment variables listed above in the project settings.
3. Deploy. The cron job in [vercel.json](vercel.json) is picked up automatically and calls `/api/cron` twice a day.
