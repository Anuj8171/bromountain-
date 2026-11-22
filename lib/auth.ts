// lib/auth.ts
// PURPOSE: Admin authentication helpers.
//   - verifyAdminPassword(password) → compares against ADMIN_PASSWORD env var.
//     Used by app/api/admin/login/route.ts.
//   - getSessionToken() → the value stored in the bm_admin_session cookie.
//     It is derived from ADMIN_PASSWORD, so it never appears in the code and
//     changing the password signs every admin out.
//   - checkAdminSession() → reads the bm_admin_session cookie and checks it
//     matches getSessionToken(). Used by server components/pages in app/admin/.
//   - requireAdmin() → for API routes. Returns a 401 response when the caller
//     is not a logged-in admin, otherwise null.
//   - AUTH constant → cookie name, imported by the login/logout routes.
// CONNECTED TO: app/api/admin/login/route.ts (sets cookie),
//   app/api/admin/logout/route.ts (clears cookie),
//   app/admin/** pages (session checks),
//   app/api/** admin routes (requireAdmin).
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "bm_admin_session";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

// ── Check password ──────────────────────────────────────────
export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== "string") return false;
  return safeEqual(password, expected);
}

// ── Session token (derived from the admin password) ─────────
export function getSessionToken(): string | null {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  return createHmac("sha256", secret).update("bm-admin-session-v1").digest("hex");
}

// ── Check session in server components ──────────────────────
export async function checkAdminSession(): Promise<boolean> {
  try {
    const expected = getSessionToken();
    if (!expected) return false;

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    return !!token && safeEqual(token, expected);
  } catch {
    return false;
  }
}

// ── Guard for admin API routes ──────────────────────────────
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await checkAdminSession()) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// ── Cookie name ─────────────────────────────────────────────
export const AUTH = {
  COOKIE_NAME: SESSION_COOKIE,
};
