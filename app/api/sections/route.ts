import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { revalidatePublicContent } from "@/lib/revalidate";

// ── GET all sections ─────────────────────────────────────────
export async function GET() {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── POST create section ──────────────────────────────────────
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, icon, status, display_order } = body;

  if (!name || !icon) {
    return NextResponse.json(
      { error: "Name and icon are required" },
      { status: 400 }
    );
  }

  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const { data, error } = await supabaseAdmin
    .from("sections")
    .insert({
      name, slug, description, icon,
      status: status || "active",
      display_order: display_order || 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePublicContent();
  return NextResponse.json(data, { status: 201 });
}

// ── PUT update section ───────────────────────────────────────
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  if (updates.name) {
    updates.slug = updates.name.toLowerCase().replace(/\s+/g, "-");
  }

  const { data, error } = await supabaseAdmin
    .from("sections")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePublicContent();
  return NextResponse.json(data);
}

// ── DELETE section ───────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  // get cover image to delete from storage
  const { data: section } = await supabaseAdmin
    .from("sections")
    .select("cover_image_url")
    .eq("id", id)
    .single();

  // delete from DB
  const { error } = await supabaseAdmin
    .from("sections")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // delete image from storage
  if (section?.cover_image_url) {
    const { deleteImage } = await import("@/lib/supabase");
    await deleteImage(section.cover_image_url).catch(() => {});
  }

  revalidatePublicContent();
  return NextResponse.json({ success: true });
}