import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { revalidatePublicContent } from "@/lib/revalidate";

// ── GET active offer (public) ────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const adminMode = searchParams.get("admin");

  if (adminMode) {
    // admin gets all offers
    const { data, error } = await supabaseAdmin
      .from("special_offers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  // public gets active non-expired offer only
  const { data, error } = await supabase
    .from("special_offers")
    .select("*")
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── POST create offer ────────────────────────────────────────
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, subtitle, badge_text, expires_at } = body;

  if (!title || !subtitle) {
    return NextResponse.json(
      { error: "Title and subtitle required" },
      { status: 400 }
    );
  }

  // deactivate all existing offers first
  await supabaseAdmin
    .from("special_offers")
    .update({ is_active: false })
    .eq("is_active", true);

  const { data, error } = await supabaseAdmin
    .from("special_offers")
    .insert({
      title,
      subtitle,
      badge_text: badge_text || "LIMITED TIME",
      expires_at: expires_at || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePublicContent();
  return NextResponse.json(data, { status: 201 });
}

// ── PUT toggle offer ─────────────────────────────────────────
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, is_active } = body;

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  // if activating — deactivate others first
  if (is_active) {
    await supabaseAdmin
      .from("special_offers")
      .update({ is_active: false })
      .neq("id", id);
  }

  const { data, error } = await supabaseAdmin
    .from("special_offers")
    .update({ is_active })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePublicContent();
  return NextResponse.json(data);
}

// ── DELETE offer ─────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("special_offers")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePublicContent();
  return NextResponse.json({ success: true });
}