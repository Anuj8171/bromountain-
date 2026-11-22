import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin, deleteImage } from "@/lib/supabase";
import { revalidatePublicContent } from "@/lib/revalidate";

// ── GET adventures ───────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section   = searchParams.get("section");
  const featured  = searchParams.get("featured");
  const adminMode = searchParams.get("admin");

  let query = (adminMode ? supabaseAdmin : supabase)
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

  if (!adminMode) {
    query = query.eq("is_active", true);
  }
  if (section) {
    query = query.eq("section_id", section);
  }
  if (featured === "true") {
    query = query.eq("is_featured", true).limit(6);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── POST create adventure ────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      itinerary, inclusions, exclusions, departure_dates,
      ...adventureData
    } = body;

    if (!adventureData.title || !adventureData.section_id) {
      return NextResponse.json(
        { error: "Title and section are required" },
        { status: 400 }
      );
    }

    // ✅ Fix 1: sanitize empty strings on nullable fields
    adventureData.offer_expires_at = adventureData.offer_expires_at || null;
    adventureData.offer_price = adventureData.offer_price || null;

    adventureData.slug = adventureData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { data: adventure, error: adventureError } = await supabaseAdmin
      .from("adventures")
      .insert(adventureData)
      .select()
      .single();

    if (adventureError) throw adventureError;

    const adventureId = adventure.id;

    // ✅ Fix 2: actually insert related data
    if (itinerary?.length > 0) {
      const { error: itinError } = await supabaseAdmin
        .from("itinerary_days")
        .insert(
          itinerary.map((day: any) => ({
            ...day,
            id: undefined,          // let DB generate id
            adventure_id: adventureId,
          }))
        );
      if (itinError) throw itinError;
    }

    if (inclusions?.length > 0) {
      const { error: inclError } = await supabaseAdmin
        .from("inclusions")
        .insert(
          inclusions.map((item: string, i: number) => ({
            adventure_id: adventureId,
            item,
            sort_order: i,
          }))
        );
      if (inclError) throw inclError;
    }

    if (exclusions?.length > 0) {
      const { error: exclError } = await supabaseAdmin
        .from("exclusions")
        .insert(
          exclusions.map((item: string, i: number) => ({
            adventure_id: adventureId,
            item,
            sort_order: i,
          }))
        );
      if (exclError) throw exclError;
    }

    if (departure_dates?.length > 0) {
      const { error: datesError } = await supabaseAdmin
        .from("departure_dates")
        .insert(
          departure_dates.map((d: any) => ({
            ...d,
            id: undefined,          // let DB generate id
            adventure_id: adventureId,
          }))
        );
      if (datesError) throw datesError;
    }

    revalidatePublicContent();
    return NextResponse.json(adventure, { status: 201 });

  } catch (error: any) {
    console.error("FULL ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}


// ── PUT update adventure ─────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id, itinerary, inclusions, exclusions, departure_dates,
      section, ...updates
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Sanitize nullable fields (same as POST)
    updates.offer_expires_at = updates.offer_expires_at || null;
    updates.offer_price = updates.offer_price || null;

    // update adventure
    const { data, error } = await supabaseAdmin
      .from("adventures")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Adventure update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // replace itinerary if provided
    if (itinerary !== undefined) {
      const { error: delErr } = await supabaseAdmin
        .from("itinerary_days").delete().eq("adventure_id", id);
      if (delErr) throw delErr;

      if (itinerary.length > 0) {
        const { error: insErr } = await supabaseAdmin
          .from("itinerary_days")
          .insert(itinerary.map((day: any) => ({ ...day, id: undefined, adventure_id: id })));
        if (insErr) throw insErr;
      }
    }

    // replace inclusions if provided
    if (inclusions !== undefined) {
      const { error: delErr } = await supabaseAdmin
        .from("inclusions").delete().eq("adventure_id", id);
      if (delErr) throw delErr;

      if (inclusions.length > 0) {
        const { error: insErr } = await supabaseAdmin
          .from("inclusions")
          .insert(inclusions.map((item: string, i: number) => ({
            adventure_id: id, item, sort_order: i,
          })));
        if (insErr) throw insErr;
      }
    }

    // replace exclusions if provided
    if (exclusions !== undefined) {
      const { error: delErr } = await supabaseAdmin
        .from("exclusions").delete().eq("adventure_id", id);
      if (delErr) throw delErr;

      if (exclusions.length > 0) {
        const { error: insErr } = await supabaseAdmin
          .from("exclusions")
          .insert(exclusions.map((item: string, i: number) => ({
            adventure_id: id, item, sort_order: i,
          })));
        if (insErr) throw insErr;
      }
    }

    // replace departure dates if provided
    if (departure_dates !== undefined) {
      const { error: delErr } = await supabaseAdmin
        .from("departure_dates").delete().eq("adventure_id", id);
      if (delErr) throw delErr;

      if (departure_dates.length > 0) {
        const { error: insErr } = await supabaseAdmin
          .from("departure_dates")
          .insert(departure_dates.map((d: any) => ({
            ...d, id: undefined, adventure_id: id,
          })));
        if (insErr) throw insErr;
      }
    }

    revalidatePublicContent();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("PUT /api/adventures FULL ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// ── DELETE adventure ─────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  // get images before deleting
  const { data: adventure } = await supabaseAdmin
    .from("adventures")
    .select("cover_image_url, gallery_images")
    .eq("id", id)
    .single();

  // get review images for this adventure
  const { data: reviews } = await supabaseAdmin
    .from("reviews")
    .select("image_urls")
    .eq("adventure_id", id);

  // delete adventure — cascades to itinerary, inclusions, exclusions, dates
  const { error } = await supabaseAdmin
    .from("adventures")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // delete all images from storage
  const imagesToDelete: string[] = [];

  if (adventure) {
    if (adventure.cover_image_url) {
      imagesToDelete.push(adventure.cover_image_url);
    }
    if (adventure.gallery_images?.length > 0) {
      imagesToDelete.push(...adventure.gallery_images);
    }
  }
  reviews?.forEach((r) => {
    if (r.image_urls?.length > 0) {
      imagesToDelete.push(...r.image_urls);
    }
  });

  await Promise.all(
    imagesToDelete.map((url) => deleteImage(url).catch(() => {}))
  );

  revalidatePublicContent();
  return NextResponse.json({ success: true });
}