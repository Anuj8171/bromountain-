"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CONTENT_UPDATED_CHANNEL,
  CONTENT_UPDATED_KEY,
} from "@/lib/live-refresh";

/**
 * Keeps an already-open public page in sync with the database.
 * Admin pages are skipped because they manage their own refresh.
 */
export default function LiveRefresh({
  intervalMs = 15000,
}: {
  intervalMs?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const versionRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    const check = async () => {
      if (document.visibilityState === "hidden") return;

      try {
        const res = await fetch("/api/content-version", {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = (await res.json()) as { version?: string };
        if (!data.version) return;

        if (versionRef.current && versionRef.current !== data.version) {
          router.refresh();
        }
        versionRef.current = data.version;
      } catch {
        // Ignore network hiccups; the next poll retries.
      }
    };

    void check();

    const interval = window.setInterval(check, intervalMs);

    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };

    // Instant update when admin and public site are open in this browser.
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CONTENT_UPDATED_CHANNEL);
      channel.onmessage = () => router.refresh();
    } catch {
      channel = null;
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === CONTENT_UPDATED_KEY) router.refresh();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("storage", onStorage);

    return () => {
      window.clearInterval(interval);
      channel?.close();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("storage", onStorage);
    };
  }, [pathname, intervalMs, router]);

  return null;
}
