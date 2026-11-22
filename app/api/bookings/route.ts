import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

// ── Generate booking reference ───────────────────────────────
function generateBookingRef(): string {
  const year = new Date().getFullYear();
  const num  = Math.floor(1000 + Math.random() * 9000);
  return `BM-${year}-${num}`;
}

// ── GET all bookings (admin) ─────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabaseAdmin
    .from("bookings")
    .select(`
      *,
      adventure:adventures(title, slug),
      departure_date:departure_dates(date)
    `)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── POST create booking ──────────────────────────────────────
export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    adventure_id, departure_date_id, name, email,
    phone, whatsapp, group_type, group_size, special_requests,
  } = body;

  if (!adventure_id || !name || !phone || !whatsapp || !group_type) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const bookingRef = generateBookingRef();

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .insert({
      id: bookingRef,
      adventure_id,
      departure_date_id: departure_date_id || null,
      name,
      email,
      phone,
      whatsapp,
      group_type,
      group_size: Number(group_size) || 1,
      special_requests: special_requests || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // update booked slots if date selected
  if (departure_date_id) {
    try {
      await supabaseAdmin.rpc("increment_booked_slots", {
        date_id: departure_date_id,
      });
    } catch {
      // silently ignore errors
    }
  }

  return NextResponse.json({ success: true, booking_ref: bookingRef, data }, { status: 201 });
}

// ── PUT update booking status ────────────────────────────────
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "ID and status required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}