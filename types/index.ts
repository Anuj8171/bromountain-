// types/index.ts
// PURPOSE: Shared TypeScript types and interfaces for the whole app.
// Every component, page, and API route that works with domain data imports
// from here. Keeps the shape of Section, Adventure, Booking, Review,
// SpecialOffer, DepartureDate, ItineraryDay, etc. consistent.
// CONNECTED TO: lib/data.ts (fetches these shapes), all app/api/*/route.ts
//   (return/request these shapes), all components that render domain data.
// types/index.ts
// PURPOSE: Shared TypeScript types and interfaces for the whole app.
// Every component, page, and API route that works with domain data imports
// from here. Keeps the shape of Section, Adventure, Booking, Review,
// SpecialOffer, DepartureDate, ItineraryDay, etc. consistent.
// CONNECTED TO: lib/data.ts (fetches these shapes), all app/api/*/route.ts
//   (return/request these shapes), all components that render domain data.
export type DifficultyLevel = "Easy" | "Moderate" | "Hard" | "Extreme";
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type GroupType =
  | "solo"
  | "random_group"
  | "friends_group"
  | "family"
  | "corporate";
export type SectionStatus = "active" | "coming_soon";
export type ReviewStatus = "pending" | "approved" | "rejected";

// ── Section ──────────────────────────────────────────────────
export interface Section {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  cover_image_url: string | null;
  status: SectionStatus;
  display_order: number;
  created_at: string;
}

// ── Custom Field (flexible itinerary fields) ─────────────────
export interface CustomField {
  icon: string;    // emoji e.g. "🌤️"
  label: string;   // e.g. "Weather"
  value: string;   // e.g. "Cold, -5°C"
}

// ── Itinerary Day ─────────────────────────────────────────────
export interface ItineraryDay {
  id: string;
  adventure_id: string;
  day_number: number;
  title: string;
  description: string;
  activities: string[];
  accommodation: string | null;
  meals: string;
  distance_km: number | null;
  custom_fields: CustomField[];
}

// ── Departure Date ────────────────────────────────────────────
export interface DepartureDate {
  id: string;
  adventure_id: string;
  date: string;
  available_slots: number;
  booked_slots: number;
}

// ── Adventure ─────────────────────────────────────────────────
export interface Adventure {
  id: string;
  section_id: string;
  section?: Section;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  location: string;
  state: string;
  difficulty: DifficultyLevel;
  duration_days: number;
  duration_nights: number;
  max_altitude: string | null;
  distance_km: number | null;
  best_season: string;
  min_age: number;
  max_group_size: number;
  cover_image_url: string | null;
  gallery_images: string[];
  original_price: number;
  discounted_price: number;
  offer_price: number | null;
  offer_expires_at: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  itinerary?: ItineraryDay[];
  inclusions?: string[];
  exclusions?: string[];
  departure_dates?: DepartureDate[];
}

// ── Booking ───────────────────────────────────────────────────
export interface Booking {
  id: string;
  adventure_id: string;
  adventure?: Adventure;
  departure_date_id: string | null;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  group_type: GroupType;
  group_size: number;
  special_requests: string | null;
  status: BookingStatus;
  created_at: string;
}

// ── Review ────────────────────────────────────────────────────
export interface Review {
  id: string;
  adventure_id: string | null;
  adventure?: Adventure;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  title: string;
  content: string;
  image_urls: string[];
  status: ReviewStatus;
  created_at: string;
}

// ── Special Offer ─────────────────────────────────────────────
export interface SpecialOffer {
  id: string;
  title: string;
  subtitle: string;
  badge_text: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

// ── Admin Stats ───────────────────────────────────────────────
export interface AdminStats {
  total_bookings: number;
  pending_bookings: number;
  total_adventures: number;
  active_adventures: number;
  pending_reviews: number;
  total_sections: number;
}