import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Returns a fingerprint of all public content. The browser polls this and
 * calls router.refresh() when it changes, so an open public page picks up an
 * admin edit without the visitor doing a hard refresh.
 */
export async function GET() {
  const [sections, adventures, offers, reviews] = await Promise.all([
    supabase
      .from("sections")
      .select("id,name,slug,description,icon,cover_image_url,status,display_order")
      .order("id"),
    supabase
      .from("adventures")
      .select("id,slug,title,is_active,is_featured,updated_at")
      .order("id"),
    supabase
      .from("special_offers")
      .select("id,title,subtitle,badge_text,is_active,expires_at")
      .order("id"),
    supabase
      .from("reviews")
      .select("id,adventure_id,reviewer_name,rating,title,content,image_urls,status,created_at")
      .eq("status", "approved")
      .order("id"),
  ]);

  const error =
    sections.error || adventures.error || offers.error || reviews.error;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const version = createHash("sha1")
    .update(
      JSON.stringify({
        sections: sections.data,
        adventures: adventures.data,
        offers: offers.data,
        reviews: reviews.data,
      })
    )
    .digest("hex")
    .slice(0, 16);

  return NextResponse.json(
    { version },
    { headers: { "Cache-Control": "no-store" } }
  );
}
