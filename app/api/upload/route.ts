import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, BUCKET } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file     = formData.get("file") as File;
  const folder   = formData.get("folder") as string;

  if (!file || !folder) {
    return NextResponse.json(
      { error: "File and folder required" },
      { status: 400 }
    );
  }

  // validate folder
  const validFolders = ["adventures/covers", "adventures/gallery", "sections", "reviews"];
  if (!validFolders.some((f) => folder.startsWith(f))) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  // validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG and WEBP allowed" },
      { status: 400 }
    );
  }

  // validate file size — 5MB max
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File must be under 5MB" },
      { status: 400 }
    );
  }

  const ext      = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer   = await file.arrayBuffer();

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}