// lib/live-refresh.ts
// PURPOSE: Client-side content-change notification helpers.
//   After an admin creates/updates/deletes content, the admin client calls
//   notifyContentUpdated(). That broadcasts a message via BroadcastChannel
//   (and falls back to localStorage) so any OTHER open tab in the same browser
//   knows content changed.
//   The public-side counterpart is components/LiveRefresh.tsx, which polls
//   /api/content-version on a timer and calls router.refresh() when the
//   version fingerprint changes.
// CONNECTED TO: All admin client components call notifyContentUpdated() after
//   a successful create/update/delete (AdminAdventuresClient,
//   AdminBookingsClient, AdminReviewsClient, AdminSectionsClient,
//   AdminOffersClient, AdventureFormClient).
//   components/LiveRefresh.tsx polls /api/content-version using the version
//   concept that this module's timestamp reinforces.
export const CONTENT_UPDATED_KEY = "bm-content-updated";
export const CONTENT_UPDATED_CHANNEL = "bm-content";

/**
 * Tell any open public tab in this browser that content changed.
 * BroadcastChannel covers modern browsers; localStorage is the fallback
 * for older ones. Other devices are covered by /api/content-version polling.
 */
export function notifyContentUpdated() {
  if (typeof window === "undefined") return;

  try {
    const channel = new BroadcastChannel(CONTENT_UPDATED_CHANNEL);
    channel.postMessage({ type: "content-updated", at: Date.now() });
    channel.close();
  } catch {
    // BroadcastChannel unsupported — localStorage below still works.
  }

  try {
    window.localStorage.setItem(CONTENT_UPDATED_KEY, String(Date.now()));
  } catch {
    // Storage can be blocked in private mode.
  }
}
