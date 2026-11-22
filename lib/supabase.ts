// lib/supabase.ts
// PURPOSE: Creates the two Supabase JS clients used everywhere in the app.
//   - supabase        → public client (anon key). Safe to use in browser.
//                       Used by server components for read-only public data.
//   - supabaseAdmin   → service-role client. Server-only. Used for writes,
//                       admin reads, storage uploads/deletes, and the cron job.
//   - BUCKET + ALLOWED_FOLDERS → storage config for image uploads.
// CONNECTED TO: Every file that talks to Supabase imports from here:
//   lib/data.ts, all app/api/*/route.ts, components that upload/delete images.
// ENV: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
//      SUPABASE_SERVICE_ROLE_KEY (all in .env.local)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ── Public client — safe for frontend ────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnon);

// ── Admin client — server only (DO NOT expose) ───────────────
export const supabaseAdmin = createClient(supabaseUrl, supabaseService, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ── Storage bucket ───────────────────────────────────────────
export const BUCKET = "bromountain-media";

// ── Allowed folders ──────────────────────────────────────────
const ALLOWED_FOLDERS = ["adventures", "reviews", "sections"] as const;
type Folder = (typeof ALLOWED_FOLDERS)[number];

// ── Upload Image ─────────────────────────────────────────────
// export async function uploadImage(
//   file: File,
//   folder: Folder
// ): Promise<string> {
//   // 🔒 Runtime folder validation
//   if (!ALLOWED_FOLDERS.includes(folder)) {
//     throw new Error("Invalid folder name");
//   }

//   // 📄 File validation
//   if (!file) {
//     throw new Error("No file provided");
//   }

//   // 🖼️ Only allow images
//   if (!file.type.startsWith("image/")) {
//     throw new Error("Only image files are allowed");
//   }

//   // 📏 File size limit (5MB)
//   const MAX_SIZE = 5 * 1024 * 1024;
//   if (file.size > MAX_SIZE) {
//     throw new Error("File too large (max 5MB)");
//   }

//   // 🧾 Extract extension
//   const ext = file.name.split(".").pop();
//   if (!ext) {
//     throw new Error("Invalid file format");
//   }

//   // 🧠 Generate unique filename
//   const fileName = `${folder}/${Date.now()}-${Math.random()
//     .toString(36)
//     .slice(2)}.${ext}`;

//   // 📤 Upload to Supabase
//   const { error } = await supabaseAdmin.storage
//     .from(BUCKET)
//     .upload(fileName, file, {
//       cacheControl: "3600",
//       upsert: false,
//       contentType: file.type,
//     });

//   if (error) {
//     throw new Error(`Upload failed: ${error.message}`);
//   }

//   // 🔗 Get public URL
//   const { data } = supabaseAdmin.storage
//     .from(BUCKET)
//     .getPublicUrl(fileName);

//   return data.publicUrl;
// }

// ── Delete Image ─────────────────────────────────────────────
// Deletes a file from Supabase Storage by its public URL.
// Used by the admin image editor when an adventure/section/review hero
// image is replaced or removed.
export async function deleteImage(publicUrl: string): Promise<void> {
  try {
    const url = new URL(publicUrl);

    // Extract file path after bucket name
    const pathParts = url.pathname.split(`/${BUCKET}/`);
    if (pathParts.length < 2) {
      throw new Error("Invalid file URL");
    }

    const filePath = pathParts[1];

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (err) {
    console.error("Delete error:", err);
    throw err;
  }
}