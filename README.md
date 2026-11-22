# BroMountain Adventures — Complete System Documentation

## What This Is

A Next.js 16 (App Router) website for a Himalayan trekking/adventure company based in Uttarkashi, Uttarakhand. Public-facing marketing site + a password-protected admin panel. Two databases conceptually: the public content lives in Supabase (Postgres), and the UI is styled with a custom "BM" theme (mountain/forest/gold palette) on top of shadcn/ui primitives.

---

## High-Level Architecture

```
Browser
  │
  ├─ Public pages (/)  ← statically-ish rendered (ISR), reads Supabase anon client
  │     ├─ Home, /adventures, /adventures/[slug], /reviews, /contact
  │     └─ All render inside app/layout.tsx (shared root layout)
  │
  ├─ Admin panel (/admin/...)  ← password-gated, reads/writes via service-role client
  │     ├─ /admin/login, /admin/logout (API)
  │     ├─ /admin/dashboard, /admin/adventures, /admin/bookings,
  │     │   /admin/reviews, /admin/sections, /admin/offers
  │     └─ All admin pages render inside app/admin/layout.tsx
  │
  └─ API routes (app/api/*/route.ts)
        ├─ /api/admin/login      → POST, sets bm_admin_session cookie
        ├─ /api/admin/logout     → POST, clears cookie
        ├─ /api/content-version  → GET, returns a content fingerprint (polling)
        ├─ /api/cron             → GET, Vercel Cron pings this; revalidates cache + keeps Supabase alive
        ├─ /api/adventures       → admin CRUD (POST/PUT/DELETE)
        ├─ /api/sections         → admin CRUD
        ├─ /api/reviews          → admin approve/reject + public submit
        ├─ /api/offers           → admin CRUD
        └─ /api/bookings         → admin status updates (PUT)
```

**Theme system:** `data-theme="dark"` or `"light"` on `<html>`. Selected in localStorage (`bm-theme`), initialized before first paint in `app/layout.tsx`. CSS variables in `app/globals.css` define two complete palettes (light :root, dark `[data-theme="dark"]`).

**Fonts:** Playfair Display (headlines), Syne (brand/nav), DM Sans (body) — loaded in `app/layout.tsx` via `next/font/google`.

**UI primitives:** `components/ui/*` (button, card, badge, dialog, select, sheet, tabs, input, textarea) built on `@base-ui/react` + `class-variance-authority`. Not all components use them — many admin/public components use inline styles, but the primitives are available.

---

## Data Flow — Public Pages

Every public page is a **server component** that imports data-fetching functions from `lib/data.ts`. Those functions talk to Supabase using either:

- `supabase` (anon/public client) — for public reads (respects RLS).
- `supabaseAdmin` (service-role client) — for admin reads/writes (bypasses RLS).

### Homepage (`app/page.tsx`)

1. Fetches in parallel: `getSections()`, `getFeaturedAdventures()`, `getApprovedReviews()`, `getActiveOffer()`.
2. Renders: `<Navbar>` → `<HeroSection>` → `<SectionsGrid>` → `<FeaturedAdventures>` → `<WhyChooseUs>` → `<AboutSection>` → `<ReviewsSection>` → `<Footer>` → (optional) `<SpecialOfferPopup>`.
3. Injects JSON-LD: `getOrganizationSchema()` + `getWebSiteSchema()`.
4. `export const metadata = getHomeMetadata()` handles `<title>`, OG, robots, etc.

### Adventures listing (`app/adventures/page.tsx`)

1. Fetches `getAdventures()` + `getActiveSections()`.
2. Filters `is_active` adventures client-side? No — the server page filters `is_active` and passes the result to `<AdventuresPage>` (client component).
3. Renders `<Suspense><AdventuresPage ...></Suspense>`.
4. Injects ItemList JSON-LD + breadcrumb JSON-LD.
5. ISR: `export const revalidate = 30` (revalidates every 30s).

### Single adventure (`app/adventures/[slug]/page.tsx`)

1. Fetches `getAdventureBySlug(slug)` (public anon client, only active adventures).
2. Renders the full adventure detail UI (itinerary, inclusions/exclusions, gallery, booking form, reviews).
3. Injects `getAdventureSchema()` (TouristTrip JSON-LD) + breadcrumb JSON-LD.
4. `export const revalidate = 30`.

### Reviews listing (`app/reviews/page.tsx`)

1. Fetches `getApprovedReviews()`.
2. Renders review cards + aggregate rating.
3. Injects `getReviewsSchema()` (TravelAgency + AggregateRating + Review JSON-LD).

### Contact (`app/contact/page.tsx`)

1. Fetches `getActiveSections()`.
2. Imports `faqs` from `lib/faqs.ts` and passes to `getFaqSchema()` for FAQPage JSON-LD.
3. Renders `<ContactClient>` (client component) which holds the entire contact UI: navbar, hero, contact cards, form, FAQ accordion, footer.

---

## Data Flow — Admin Panel

### Login

1. `app/admin/login/page.tsx` renders a login form.
2. On submit, calls `POST /api/admin/login` with `{ password }`.
3. `/api/admin/login/route.ts` calls `verifyAdminPassword(password)` from `lib/auth.ts` (compares against `ADMIN_PASSWORD` env var).
4. If correct, sets a cookie `bm_admin_session = "x9KlmPq12BroMountains2026!"` (the hard-coded `AUTH.COOKIE_VALUE` from `lib/auth.ts`).
5. Redirects to `/admin/dashboard`.

### Admin layout / session gating

1. `app/admin/layout.tsx` calls `checkAdminSession()` from `lib/auth.ts` (reads `bm_admin_session` cookie).
2. If not logged in → redirect to `/admin/login`.
3. If logged in → render `<AdminShell>` (sidebar + content area).
4. The admin layout fetches admin data (stats, recent bookings, monthly bookings, etc.) via `lib/data.ts` admin functions and passes them to client components.

### Admin pages (all server components that fetch data + render a client component)

| Page | Data source | Client component |
|------|-------------|-----------------|
| `/admin/dashboard` | `getAdminStats()`, `getRecentBookingsAdmin()`, `getMonthlyBookings()` | `AdminDashboardClient` |
| `/admin/adventures` | `getAllAdventuresAdmin()` | `AdminAdventuresClient` |
| `/admin/adventures/new` or `/admin/adventures/[id]/edit` | `getAdventureById()` | `AdventureFormClient` |
| `/admin/bookings` | `getAllBookingsAdmin()` | `AdminBookingsClient` |
| `/admin/reviews` | `getAllReviewsAdmin()` | `AdminReviewsClient` |
| `/admin/sections` | `getSections()` | `AdminSectionsClient` |
| `/admin/offers` | `getAllOffersAdmin()` | `AdminOffersClient` |

### Admin writes (API routes)

Each admin CRUD route calls `revalidatePublicContent()` from `lib/revalidate.ts` after a successful write. That calls `revalidatePath("/", "layout")` + `revalidatePath("/sitemap.xml")`, which invalidates the root layout cache so all public pages pick up the change on the next request.

- `app/api/adventures/route.ts` — POST (create), PUT (update), DELETE.
- `app/api/sections/route.ts` — POST, PUT, DELETE.
- `app/api/reviews/route.ts` — POST (public submit + admin approve/reject).
- `app/api/offers/route.ts` — POST, PUT, DELETE.
- `app/api/bookings/route.ts` — PUT (status update only).

After any write, the admin client component also calls `notifyContentUpdated()` from `lib/live-refresh.ts`. That broadcasts via `BroadcastChannel` + `localStorage` so other open tabs in the same browser know content changed.

---

## Live Refresh (public-side content update without hard refresh)

Two complementary mechanisms:

1. **BroadcastChannel/localStorage (same browser, other tabs):** When an admin edits content in one tab, `notifyContentUpdated()` fires. Other tabs that are currently open and have `components/LiveRefresh.tsx` mounted will hear the event and call `router.refresh()`.

2. **`/api/content-version` polling:** `components/LiveRefresh.tsx` (mounted on public pages) polls `/api/content-version` on a timer. That endpoint computes a SHA-1 fingerprint of all sections + adventures + offers + approved reviews and returns `{ version }`. If the version changed since last poll, the component calls `router.refresh()` to re-render the page with fresh data.

3. **ISR + cron:** Public pages have `export const revalidate = 30` (or similar). Additionally, Vercel Cron hits `/api/cron` every 12 hours (configured in `vercel.json`). The cron handler:
   - Authenticates via `CRON_SECRET` (Bearer header or `?secret=` query param).
   - Does a few real Supabase queries (to keep the free-tier project from being paused after 7 days of inactivity).
   - Calls `revalidatePath()` for `/`, `/adventures`, `/reviews`, `/contact`, `/sitemap.xml`, and `/adventures/[slug]` (page).

---

## Component Map — Public

### Layout

- **`app/layout.tsx`** — root layout. Fonts, metadata, theme-init script, `<MountainSilhouette>` backdrop, `.site-shell` wrapper. Every page (public + admin) is wrapped by this.
- **`app/admin/layout.tsx`** — admin layout. Session check, sidebar + content shell.

### Global components

- **`components/MountainSilhouette.tsx`** — pure SVG + CSS mountain range behind every page. Seeded noise for ridges, snow caps, shadow faces, forest rows, stars + moon (dark theme only). No client JS. Uses `--bm-hill-*` CSS tokens.
- **`components/Navbar.tsx`** — site-wide nav header. Transparent on hero (home page first view), solid glass after scroll. Desktop links + mobile hamburger. "Book Now" CTA → `/adventures`. Theme toggle button delegates to `ThemeToggle`.
- **`components/ThemeToggle.tsx`** — sun/moon button that toggles `bm-theme` in localStorage + `data-theme` on `<html>`.

### Homepage components

- **`components/HeroSection.tsx`** — full-viewport hero. 3 slides (hardcoded `heroSlides`), auto-rotate every 5s, dot indicators, altitude scale animation, stat counters (useCounter hook), CTA buttons.
- **`components/SectionsGrid.tsx`** — grid of activity sections (icons + names) linking to `/adventures?section=<slug>`.
- **`components/FeaturedAdventures.tsx`** — horizontal/feature card grid of featured adventures.
- **`components/WhyChooseUs.tsx`** — "why choose us" feature list.
- **`components/AboutSection.tsx`** — "Our Story" two-column section with image + floating stat card + CTA.
- **`components/ReviewsSection.tsx`** — review cards strip (latest 4 reviews on home).
- **`components/SpecialOfferPopup.tsx`** — popup/modal for active special offer (appears on home if an active offer exists).
- **`components/Footer.tsx`** — site-wide footer. Brand + socials + activities links + quick links + contact info.

### Public page components (per-page)

- **`components/AdventuresPage.tsx`** — `/adventures` listing. Filter UI + adventure grid. Imports `AdventuresFilters`, `AdventureCard`, `Navbar`, `Footer`, `HeroSection`, `MountainSilhouette`, `SpecialOfferPopup`, `LiveRefresh`, `useLiveRefresh`.
- **`components/AdventureDetailClient.tsx`** (or similar) — single adventure detail + booking form.
- **`components/ContactClient.tsx`** — full contact page UI. Own Navbar + Footer instances. Form → WhatsApp. FAQ accordion from `lib/faqs.ts`.
- **`components/LiveRefresh.tsx`** — client component that polls `/api/content-version` + listens for the broadcast event; calls `router.refresh()` on change.
- **`components/ReviewsClient.tsx`** — `/reviews` page UI (client component).
- **`components/ReviewForm.tsx`** — form for submitting a review (public).
- **`components/FAQForm.tsx`** — form for submitting a FAQ (public? or admin? check usage).

### UI primitives (`components/ui/`)

- `button.tsx`, `card.tsx`, `badge.tsx`, `dialog.tsx`, `select.tsx`, `sheet.tsx`, `tabs.tsx`, `input.tsx`, `textarea.tsx` — built on `@base-ui/react` + `class-variance-authority` + `cn()` from `lib/utils.ts`.

---

## Component Map — Admin

### Shell

- **`components/admin/AdminSidebar.tsx`** — collapsible sidebar. Logo/brand, nav links (dashboard, adventures, bookings, reviews, sections, offers) with active state + pending badges, "View Website" link, theme toggle, logout button. Mobile: hamburger → slide-in drawer.
- **`components/admin/AdminContent.tsx`** (if exists) — wrapper for the main content area of admin pages.
- **`components/admin/AdminShell.tsx`** (if exists) — combines sidebar + content.

### Admin page components (client)

- **`components/admin/AdminDashboardClient.tsx`** — stat cards (total bookings, pending, confirmed, pending reviews, active adventures, active sections), alert banner, monthly bookings bar chart, recent bookings list, quick-action links.
- **`components/admin/AdminAdventuresClient.tsx`** — adventures list/table with edit/delete, status toggle. Imports `AdventureFormClient` for the create/edit modal.
- **`components/admin/AdventureFormClient.tsx`** — create/edit adventure form (tabs for basic info, itinerary, inclusions/exclusions, gallery, departure dates). Calls `POST/PUT /api/adventures`.
- **`components/admin/AdminBookingsClient.tsx`** — bookings list with search, status filter tabs, expandable row detail, status update buttons, WhatsApp button. Calls `PUT /api/bookings`.
- **`components/admin/AdminReviewsClient.tsx`** — reviews list with approve/reject buttons, image viewer. Calls `PUT /api/reviews`.
- **`components/admin/AdminSectionsClient.tsx`** — sections list with edit form, status toggle (active/coming_soon), delete confirmation. Calls `POST/PUT/DELETE /api/sections`.
- **`components/admin/AdminOffersClient.tsx`** — special offers list with create/edit form, toggle active. Calls `POST/PUT/DELETE /api/offers`.

---

## API Routes — Full List

### Admin auth

- **`app/api/admin/login/route.ts`** — `POST { password }`. Verifies via `verifyAdminPassword()`. Sets `bm_admin_session` cookie. Returns `{ ok: true }`.
- **`app/api/admin/logout/route.ts`** — `POST`. Clears `bm_admin_session` cookie. Returns `{ ok: true }`.

### Public content

- **`app/api/content-version/route.ts`** — `GET`. Returns `{ version: "<sha1>" }` (fingerprint of sections + adventures + offers + approved reviews). Used by `LiveRefresh.tsx` polling.

### Admin CRUD

- **`app/api/adventures/route.ts`** — `POST` (create), `PUT` (update by id), `DELETE` (by id). Uses `supabaseAdmin`. Calls `revalidatePublicContent()` + `notifyContentUpdated()` (if request has `x-admin-refresh` header or similar — check exact trigger).
- **`app/api/sections/route.ts`** — `POST`, `PUT`, `DELETE`. Same pattern.
- **`app/api/reviews/route.ts`** — `POST` (submit review — public or admin?), `PUT` (approve/reject by id). Uses `supabaseAdmin` for approve/reject, possibly `supabase` for public submit.
- **`app/api/offers/route.ts`** — `POST`, `PUT`, `DELETE`. Same pattern.
- **`app/api/bookings/route.ts`** — `PUT` (update status by id). Uses `supabaseAdmin`. Calls `revalidatePublicContent()` + `notifyContentUpdated()`.

### Cron

- **`app/api/cron/route.ts`** — `GET`. Authenticates via `CRON_SECRET`. Does Supabase health-check queries. Calls `revalidatePath()` for public paths. Returns `{ ok: true, db: {...}, revalidated: [...], timestamp, keepAlive: true }`.

---

## Supabase Schema (inferred from code)

Tables referenced in `lib/data.ts`, `lib/supabase.ts`, and API routes:

| Table | Key columns | Notes |
|-------|-------------|-------|
| `sections` | id, name, slug, description, icon, cover_image_url, status (active/coming_soon), display_order, created_at | Activity categories (e.g. "Trekking", "Camping") shown in footer + filters |
| `adventures` | id, section_id, title, slug, tagline, description, location, state, difficulty, duration_days, duration_nights, max_altitude, distance_km, best_season, min_age, max_group_size, cover_image_url, gallery_images, original_price, discounted_price, offer_price, offer_expires_at, is_featured, is_active, created_at, updated_at | Main content. Has RLS + relations to sections, itinerary_days, inclusions, exclusions, departure_dates |
| `itinerary_days` | id, adventure_id, day_number, title, description, activities, accommodation, meals, distance_km, custom_fields | Day-by-day itinerary |
| `inclusions` / `exclusions` | id, adventure_id, item | What's included/excluded in the price |
| `departure_dates` | id, adventure_id, date, available_slots, booked_slots | Scheduled departures |
| `reviews` | id, adventure_id, reviewer_name, reviewer_email, rating, title, content, image_urls, status (pending/approved/rejected), created_at | Public submit + admin approve/reject |
| `bookings` | id, adventure_id, departure_date_id, name, email, phone, whatsapp, group_type (solo/random_group/friends_group/family/corporate), group_size, special_requests, status (pending/confirmed/cancelled), created_at | Submitted via booking form; admin updates status |
| `special_offers` | id, title, subtitle, badge_text, expires_at, is_active, created_at | Homepage popup offer |
| `site_settings` | id, ... | Referenced in cron job (keep-alive query); probably key/value settings |

Storage: bucket `bromountain-media`, folders `adventures/`, `reviews/`, `sections/`. Used for cover images, gallery images, review images.

---

## Environment Variables

### Required (public)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (default `https://bromountain.in` in `lib/seo.ts`)
- `NEXT_PUBLIC_ADMIN_WHATSAPP` (default `919876543210` in `ContactClient.tsx`)

### Required (server/admin)

- `SUPABASE_SERVICE_ROLE_KEY` — for `supabaseAdmin` client + admin API routes
- `ADMIN_PASSWORD` — for admin login (compared in `verifyAdminPassword()`)
- `CRON_SECRET` — for `/api/cron` authorization

### Optional

- Whatever else the app uses (check `process.env` references in code).

---

## Theming

Two complete palettes in `app/globals.css`:

**Light (`:root`):**
- Background: `#f7f3ea` (cream)
- Ink: `#1b211b` (dark green-brown)
- Gold: `#b8860b` / `#d9a51c` / `#8a6200`
- Forest: `#e6dfd1`, moss: `#cbd9cb`, sage: `#56705b`, mint: `#2e7d4f`
- Glass: `rgba(255,255,255,0.72)`

**Dark (`[data-theme="dark"]`):**
- Background: `#0a0c0b`
- Ink: `#f8fafc`
- Gold: `#d4a018` / `#f5d5a8` / `#e8c05a`
- Forest: `#26312b`, moss: `#2b672b`, sage: `#8fbf9f`, mint: `#4ade80`
- Glass: `rgba(20,26,23,0.72)`

Mountain silhouette colors also differ per theme (light: soft sage ridges; dark: moonlit dark ridges + stars + moon).

The theme is set:
1. Before first paint: inline script in `app/layout.tsx` reads `bm-theme` from localStorage.
2. On toggle: `ThemeToggle.tsx` writes `bm-theme` to localStorage + sets `data-theme` on `<html>`.
3. CSS variables switch via `[data-theme="dark"]` selector.

---

## File Structure

```
/
├── app/
│   ├── layout.tsx              # root layout (fonts, theme, backdrop, shell)
│   ├── page.tsx                # homepage
│   ├── globals.css             # BM theme tokens (light + dark), resets, animations
│   ├── adventures/
│   │   ├── page.tsx            # /adventures listing
│   │   └── [slug]/page.tsx     # single adventure
│   ├── reviews/page.tsx
│   ├── contact/page.tsx
│   ├── admin/
│   │   ├── layout.tsx          # admin layout (session gate + shell)
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── adventures/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── bookings/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── sections/page.tsx
│   │   ├── offers/page.tsx
│   │   └── customize/page.tsx (referenced by sidebar)
│   └── api/
│       ├── admin/login/route.ts
│       ├── admin/logout/route.ts
│       ├── content-version/route.ts
│       ├── cron/route.ts
│       ├── adventures/route.ts
│       ├── sections/route.ts
│       ├── reviews/route.ts
│       ├── offers/route.ts
│       └── bookings/route.ts
├── components/
│   ├── ui/                     # shadcn/base-ui primitives
│   ├── Navbar.tsx
│   ├── HeroSection.tsx
│   ├── Footer.tsx
│   ├── MountainSilhouette.tsx
│   ├── ThemeToggle.tsx
│   ├── AboutSection.tsx
│   ├── ContactClient.tsx
│   ├── ReviewsClient.tsx
│   ├── ReviewForm.tsx
│   ├── FAQForm.tsx
│   ├── LiveRefresh.tsx
│   ├── SpecialOfferPopup.tsx
│   ├── SectionsGrid.tsx
│   ├── FeaturedAdventures.tsx
│   ├── WhyChooseUs.tsx
│   ├── AdventuresPage.tsx
│   ├── AdventureDetailClient.tsx (or similar)
│   ├── AdventuresFilters.tsx
│   ├── AdventureCard.tsx
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── AdminDashboardClient.tsx
│       ├── AdminAdventuresClient.tsx
│       ├── AdventureFormClient.tsx
│       ├── AdminBookingsClient.tsx
│       ├── AdminReviewsClient.tsx
│       ├── AdminSectionsClient.tsx
│       └── AdminOffersClient.tsx
├── lib/
│   ├── supabase.ts             # supabase + supabaseAdmin clients, BUCKET, deleteImage
│   ├── data.ts                 # all data-fetching functions (public + admin)
│   ├── auth.ts                 # verifyAdminPassword, checkAdminSession, AUTH const
│   ├── seo.ts                 # metadata + JSON-LD generators, site constants
│   ├── utils.ts                # cn() helper (clsx + tailwind-merge)
│   ├── adventure-utils.ts      # getPriceInfo, getSlotsStatus, formatPrice
│   ├── faqs.ts                 # faqs array (single source of truth)
│   ├── live-refresh.ts         # notifyContentUpdated (BroadcastChannel + localStorage)
│   ├── revalidate.ts           # revalidatePublicContent() helper
│   └── store.ts               # useAppStore (zustand? — check if used in admin)
├── types/
│   └── index.ts                # Section, Adventure, Booking, Review, SpecialOffer, etc.
├── public/
│   ├── hero-1.jpg, hero-2.jpg, hero-3.jpg
│   ├── about.jpg
│   ├── logo.png, logo3.png
│   ├── icon.png, apple-icon.png
│   └── manifest.webmanifest
├── next.config.ts
├── vercel.json                 # cron schedule: every 12h
├── package.json
├── components.json             # shadcn config
└── tsconfig.json
```

---

## Key Flows

### Visitor views homepage

`app/layout.tsx` (root layout, theme init, mountain backdrop) → `app/page.tsx` (fetches sections/featured adventures/reviews/offer, renders Navbar → HeroSection → SectionsGrid → FeaturedAdventures → WhyChooseUs → AboutSection → ReviewsSection → Footer → SpecialOfferPopup) → browser.

On mount, `LiveRefresh.tsx` (if mounted on the page) starts polling `/api/content-version`. If an admin edits content in another tab, `notifyContentUpdated()` fires → `LiveRefresh` calls `router.refresh()`.

### Visitor browses adventures

`/adventures` → `app/adventures/page.tsx` (fetches adventures + sections, renders AdventuresPage with filters + grid). Click an adventure → `/adventures/[slug]` → `app/adventures/[slug]/page.tsx` (fetches by slug, renders detail + booking form + reviews).

### Visitor submits a booking

Fill the booking form on an adventure page → form submits (likely to `POST /api/bookings` or directly to Supabase via anon client — check the booking form implementation). The booking lands in the `bookings` table with status `pending`. Admin sees it in `/admin/bookings`.

### Visitor submits a review

`ReviewForm.tsx` → submits to `POST /api/reviews` (or directly via anon client). Review lands with status `pending`. Admin approves in `/admin/reviews` → status becomes `approved` → appears on `/reviews` page + Homepage ReviewsSection.

### Admin logs in

`/admin/login` → form submit → `POST /api/admin/login` → `verifyAdminPassword()` checks against `ADMIN_PASSWORD` env var → sets `bm_admin_session` cookie → redirect to `/admin/dashboard`.

### Admin edits an adventure

`/admin/adventures` → `AdminAdventuresClient` → click edit → `AdventureFormClient` (modal) → fill form → `POST/PUT /api/adventures` → `supabaseAdmin` writes to DB → `revalidatePublicContent()` invalidates root layout cache → `notifyContentUpdated()` fires → other open tabs refresh via `LiveRefresh`.

### Cron keeps things fresh

Vercel Cron hits `/api/cron` every 12h → authenticates → does Supabase health-check queries (keeps free-tier project from pausing) → revalidates `/`, `/adventures`, `/reviews`, `/contact`, `/sitemap.xml`, `/adventures/[slug]` → returns status.

---

## Known Gaps / Things to Verify

1. **`lib/store.ts`** — referenced in `AdminSidebar.tsx` comments but the actual file may or may not exist. Check if `useAppStore` is used.
2. **`components/AdventureDetailClient.tsx`** — referenced in comments; verify the exact filename for the single-adventure client component.
3. **`components/FAQForm.tsx`** — who renders it? Admin or public?
4. **`components/ReviewForm.tsx`** — same.
5. **`AppSectionsClient` / `AdminOffersClient`** — verify exact filenames.
6. **Booking form submission** — does it go through `POST /api/bookings` or write directly to Supabase via anon client? Check the adventure detail page's booking form.
7. **`app/reviews/page.tsx`** — verify it exists and how it fetches reviews.
8. **`app/admin/customize/page.tsx`** — referenced by AdminSidebar; verify it exists.
