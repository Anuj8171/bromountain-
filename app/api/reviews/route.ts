import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabase, supabaseAdmin, deleteImage } from "@/lib/supabase";
import { revalidatePublicContent } from "@/lib/revalidate";

// ── GET reviews ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status      = searchParams.get("status");
  const adventureId = searchParams.get("adventure_id");
  const adminMode   = searchParams.get("admin");

  if (adminMode) {
    const denied = await requireAdmin();
    if (denied) return denied;
  }

  let query = (adminMode ? supabaseAdmin : supabase)
    .from("reviews")
    .select(`*, adventure:adventures(title, slug)`)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  } else if (!adminMode) {
    query = query.eq("status", "approved");
  }

  if (adventureId) {
    query = query.eq("adventure_id", adventureId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── POST submit review ───────────────────────────────────────
export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    adventure_id, reviewer_name, reviewer_email,
    rating, title, content, image_urls,
  } = body;

  if (!reviewer_name || !reviewer_email || !rating || !title || !content) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .insert({
      adventure_id: adventure_id || null,
      reviewer_name,
      reviewer_email,
      rating: Number(rating),
      title,
      content,
      image_urls: image_urls || [],
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { success: true, message: "Review submitted — awaiting approval", data },
    { status: 201 }
  );
}

// ── PUT approve/reject review ────────────────────────────────
export async function PUT(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "ID and status required" },
      { status: 400 }
    );
  }

  if (status === "rejected") {
    // get images before deleting
    const { data: review } = await supabaseAdmin
      .from("reviews")
      .select("image_urls")
      .eq("id", id)
      .single();

    // delete review
    const { error } = await supabaseAdmin
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // delete images from storage
    if (review?.image_urls?.length > 0) {
      await Promise.all(
        review?.image_urls?.map((url: string) => deleteImage(url).catch(() => {}))
      );
    }

    revalidatePublicContent();
    return NextResponse.json({ success: true, action: "rejected_and_deleted" });
  }

  // approve
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePublicContent();
  return NextResponse.json(data);
}

// ── DELETE review ────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  // get images
  const { data: review } = await supabaseAdmin
    .from("reviews")
    .select("image_urls")
    .eq("id", id)
    .single();

  // delete review
  const { error } = await supabaseAdmin
    .from("reviews")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // delete images
  if (review?.image_urls?.length > 0) {
    await Promise.all(
      review?.image_urls?.map((url: string) => deleteImage(url).catch(() => {}))
    );
  }

  revalidatePublicContent();
  return NextResponse.json({ success: true });
}