// lib/revalidate.ts
// PURPOSE: Revalidation helper called after an admin edits content.
//   revalidatePublicContent() revalidates the root layout ("/") which
//   invalidates every page under it (home, listings, detail pages, sitemap).
//   This makes admin edits visible to visitors on the next request without
//   waiting for the next deployment or the route's own revalidate window.
// CONNECTED TO: All app/api/*/route.ts that handle admin writes call
//   revalidatePublicContent() after a successful create/update/delete:
//   app/api/adventures/route.ts, app/api/sections/route.ts,
//   app/api/reviews/route.ts, app/api/offers/route.ts.
//   Also related to app/api/cron/route.ts which revalidates specific paths
//   on a schedule (different mechanism — time-based, not event-based).
import { revalidatePath } from "next/cache";

/**
 * Call after an admin creates, updates or deletes content.
 *
 * Revalidating the root layout invalidates every page underneath it, so the
 * homepage, listings, nav/footer, adventure detail pages and the Uttarkashi
 * page all pick up the change on the next request instead of waiting for the
 * next deployment.
 */
export function revalidatePublicContent() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}
