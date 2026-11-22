// lib/adventure-utils.ts
// PURPOSE: Pure UI helper functions that format/derive adventure display data.
//   - getPriceInfo(adventure) → returns { original, sale, offer, offerActive }
//     so the UI knows which price to show and whether an offer badge applies.
//   - getSlotsStatus(available, booked) → returns a { label, color } for slot
//     availability badges (Fully Booked / Only N left / Available).
//   - formatPrice(price) → ₹ Indian-formatted string.
// CONNECTED TO: components/AdventureCard.tsx, components/BookingForm.tsx,
//   components/admin/AdminAdventuresClient.tsx,
//   components/admin/AdventureFormClient.tsx (all import from here).
// NOT connected to Supabase — pure functions, no side effects.
import { Adventure } from "@/types";

// Get price display info
export function getPriceInfo(adventure: Adventure) {
  const now = new Date();
  const offerActive =
    !!adventure.offer_price &&
    !!adventure.offer_expires_at &&
    new Date(adventure.offer_expires_at) > now;

  return {
    original: adventure.original_price,   // always strikethrough
    sale: adventure.discounted_price,      // shown when NO offer
    offer: adventure.offer_price,          // shown ONLY when offer active
    offerActive,
  };
}

// Get slots status
export function getSlotsStatus(available: number, booked: number) {
  const remaining = available - booked;
  if (remaining === 0) return { label: "Fully Booked", color: "red" };
  if (remaining <= 3) return { label: `Only ${remaining} left!`, color: "red" };
  if (remaining <= 8) return { label: `${remaining} slots left`, color: "yellow" };
  return { label: "Available", color: "green" };
}

// Format price in Indian format
export function formatPrice(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}