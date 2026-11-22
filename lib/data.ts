// lib/data.ts
// PURPOSE: Central data-fetching layer. Every server component that needs
//   content imports its functions from here. No component talks to Supabase
//   directly — they all go through these functions.
//
//   READ functions (use public anon client by default):
//     getSections, getActiveSections, getAdventures, getAdventureBySlug,
//     getFeaturedAdventures, getApprovedReviews, getActiveOffer
//
//   ADMIN READ functions (use service-role client, bypass RLS, include
//   draft/inactive rows):
//     getAdventureById, getAllAdventuresAdmin, getAllReviewsAdmin,
//     getAllBookingsAdmin, getRecentBookingsAdmin, getAllOffersAdmin,
//     getAdminStats, getMonthlyBookings
//
//   The public pages use the READ functions. The admin pages use the ADMIN
//   READ functions. The admin API routes use the ADMIN functions too.
//
// CONNECTED TO:
//   - app/page.tsx → getSections, getFeaturedAdventures, getApprovedReviews,
//     getActiveOffer
//   - app/adventures/page.tsx → getAdventures, getActiveSections
//   - app/adventures/[slug]/page.tsx → getAdventureBySlug
//   - app/reviews/page.tsx → getApprovedReviews
//   - app/contact/page.tsx → getActiveSections
//   - app/admin/dashboard/page.tsx → getAdminStats, getRecentBookingsAdmin,
//     getMonthlyBookings
//   - app/admin/adventures/page.tsx → getAllAdventuresAdmin
//   - app/admin/bookings/page.tsx → getAllBookingsAdmin
//   - app/admin/reviews/page.tsx → getAllReviewsAdmin
//   - app/admin/sections/page.tsx → getSections
//   - app/admin/offers/page.tsx → getAllOffersAdmin
//   - components/FeaturedAdventures.tsx, ReviewsSection.tsx,
//     SectionsGrid.tsx, AdventuresPage.tsx, AdventureDetailClient.tsx,
//     AdminDashboardClient.tsx (via their parent pages)
//
// USES: lib/supabase.ts (supabase + supabaseAdmin clients),
//        types/index.ts (Adventure, Section, Review, etc.)
import { supabase, supabaseAdmin } from "@/lib/supabase";
import {
  Adventure, Section, Review,
  SpecialOffer, ItineraryDay,
} from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// ── helper to fetch from our own API ────────────────────────
async function apiFetch(path: string) {
  const res = await fetch(`${SITE_URL}${path}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

// ── SECTIONS ─────────────────────────────────────────────────

export async function getSections(): Promise<Section[]> {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getActiveSections(): Promise<Section[]> {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("status", "active")
    .order("display_order", { ascending: true });

  if (error) { console.error(error); return []; }
  return data || [];
}

// ── ADVENTURES ───────────────────────────────────────────────

export async function getAdventures(options?: {
  sectionId?: string;
  featured?: boolean;
  adminMode?: boolean;
}): Promise<Adventure[]> {
  let query = (options?.adminMode ? supabaseAdmin : supabase)
    .from("adventures")
    .select(`
      *,
      section:sections(*),
      itinerary:itinerary_days(*),
      inclusions(*),
      exclusions(*),
      departure_dates(*)
    `)
    .order("created_at", { ascending: false });

  if (!options?.adminMode) {
    query = query.eq("is_active", true);
  }
  if (options?.sectionId) {
    query = query.eq("section_id", options.sectionId);
  }
  if (options?.featured) {
    query = query.eq("is_featured", true).limit(6);
  }

  const { data, error } = await query;
  if (error) { console.error(error); return []; }

  // normalize inclusions/exclusions to string arrays
  return (data || []).map((a: any) => ({
    ...a,
    inclusions: a.inclusions?.map((i: any) => i.item) || [],
    exclusions: a.exclusions?.map((e: any) => e.item) || [],
    itinerary:  a.itinerary?.sort(
      (x: ItineraryDay, y: ItineraryDay) => x.day_number - y.day_number
    ) || [],
  }));
}

export async function getAdventureBySlug(
  slug: string
): Promise<Adventure | null> {
  const { data, error } = await supabase
    .from("adventures")
    .select(`
      *,
      section:sections(*),
      itinerary:itinerary_days(*),
      inclusions(*),
      exclusions(*),
      departure_dates(*)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) { console.error(error); return null; }

  return {
    ...data,
    inclusions: data.inclusions?.map((i: any) => i.item) || [],
    exclusions: data.exclusions?.map((e: any) => e.item) || [],
    itinerary:  data.itinerary?.sort(
      (x: ItineraryDay, y: ItineraryDay) => x.day_number - y.day_number
    ) || [],
  };
}

export async function getAdventureById(
  id: string
): Promise<Adventure | null> {
  const { data, error } = await supabaseAdmin
    .from("adventures")
    .select(`
      *,
      section:sections(*),
      itinerary:itinerary_days(*),
      inclusions(*),
      exclusions(*),
      departure_dates(*)
    `)
    .eq("id", id)
    .single();

  if (error) { console.error(error); return null; }

  return {
    ...data,
    inclusions: data.inclusions?.map((i: any) => i.item) || [],
    exclusions: data.exclusions?.map((e: any) => e.item) || [],
    itinerary:  data.itinerary?.sort(
      (x: ItineraryDay, y: ItineraryDay) => x.day_number - y.day_number
    ) || [],
  };
}

export async function getFeaturedAdventures(): Promise<Adventure[]> {
  const featured = await getAdventures({ featured: true });

  // If nobody has marked an adventure as featured yet, show the latest
  // active ones instead of leaving the homepage section empty.
  if (featured.length > 0) return featured;

  const latest = await getAdventures();
  return latest.slice(0, 6);
}

export async function getAllAdventuresAdmin(): Promise<Adventure[]> {
  return getAdventures({ adminMode: true });
}

// ── REVIEWS ──────────────────────────────────────────────────

export async function getApprovedReviews(
  adventureId?: string
): Promise<Review[]> {
  let query = supabase
    .from("reviews")
    .select("*, adventure:adventures(title, slug)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (adventureId) {
    query = query.eq("adventure_id", adventureId);
  }

  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getAllReviewsAdmin(): Promise<Review[]> {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*, adventure:adventures(title, slug)")
    .order("created_at", { ascending: false });

  if (error) { console.error(error); return []; }
  return data || [];
}

// ── BOOKINGS ─────────────────────────────────────────────────

export async function getAllBookingsAdmin() {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(`
      *,
      adventure:adventures(title, slug),
      departure_date:departure_dates(date)
    `)
    .order("created_at", { ascending: false });

  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getRecentBookingsAdmin(limit = 4) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(`
      *,
      adventure:adventures(title, slug),
      departure_date:departure_dates(date)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) { console.error(error); return []; }
  return data || [];
}

// ── SPECIAL OFFER ─────────────────────────────────────────────

export async function getActiveOffer(): Promise<SpecialOffer | null> {
  const { data, error } = await supabase
    .from("special_offers")
    .select("*")
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .limit(1)
    .maybeSingle();

  if (error) { console.error(error); return null; }
  return data;
}

export async function getAllOffersAdmin(): Promise<SpecialOffer[]> {
  const { data, error } = await supabaseAdmin
    .from("special_offers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) { console.error(error); return []; }
  return data || [];
}

// ── ADMIN STATS ───────────────────────────────────────────────

export async function getAdminStats() {
  const [
    { count: totalBookings },
    { count: pendingBookings },
    { count: confirmedBookings },
    { count: pendingReviews },
    { count: totalAdventures },
    { count: totalSections },
  ] = await Promise.all([
    supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabaseAdmin.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("adventures").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("sections").select("*", { count: "exact", head: true }).eq("status", "active"),
  ]);

  return {
    totalBookings:    totalBookings    || 0,
    pendingBookings:  pendingBookings  || 0,
    confirmedBookings: confirmedBookings || 0,
    pendingReviews:   pendingReviews   || 0,
    totalAdventures:  totalAdventures  || 0,
    totalSections:    totalSections    || 0,
  };
}

// ── MONTHLY BOOKINGS CHART ────────────────────────────────────

export async function getMonthlyBookings() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("created_at")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true });

  if (error) { console.error(error); return []; }

  // group by month
  const months: Record<string, number> = {};
  (data || []).forEach((booking: any) => {
    const month = new Date(booking.created_at).toLocaleDateString("en-IN", {
      month: "short",
    });
    months[month] = (months[month] || 0) + 1;
  });

  return Object.entries(months).map(([month, count]) => ({ month, count }));
}