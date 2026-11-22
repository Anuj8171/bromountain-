import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

// Cron must never be statically cached.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const REVALIDATED_PATHS = [
  "/",
  "/adventures",
  "/reviews",
  "/contact",
  "/sitemap.xml",
];

/**
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically.
 * The ?secret= fallback lets you test the job from cron-job.org or curl.
 */
function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;

  return request.nextUrl.searchParams.get("secret") === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const startedAt = Date.now();

  // Real reads (not just a TCP ping) so Supabase counts this as user activity
  // and keeps the free-tier project from being paused after 7 days of inactivity.
  // https://supabase.com/docs/guides/platform/free-project-pausing
  const [adventures, sections, reviews, siteSettings] = await Promise.all([
    supabaseAdmin
      .from("adventures")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabaseAdmin
      .from("sections")
      .select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    // Extra keep-alive query: a real table scan so Supabase logs user activity.
    // Runs in addition to the counts above; cheap enough to not matter.
    supabaseAdmin
      .from("site_settings")
      .select("id", { count: "exact", head: true }),
  ]);

  const dbError =
    adventures.error || sections.error || reviews.error || null;

  if (dbError) {
    console.error("[cron] Supabase health check failed:", dbError.message);
    return NextResponse.json(
      {
        ok: false,
        error: dbError.message,
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  // Refresh cached pages once the DB has been reached, so content changes
  // made in the admin panel are picked up on the next crawl.
  for (const path of REVALIDATED_PATHS) {
    revalidatePath(path);
  }
  // Dynamic adventure pages share one route pattern.
  revalidatePath("/adventures/[slug]", "page");

  return NextResponse.json({
    ok: true,
    db: {
      activeAdventures: adventures.count ?? 0,
      sections: sections.count ?? 0,
      approvedReviews: reviews.count ?? 0,
      siteSettings: siteSettings?.count ?? 0,
      latencyMs: Date.now() - startedAt,
    },
    revalidated: REVALIDATED_PATHS,
    timestamp: new Date().toISOString(),
    keepAlive: true,
  });
}
