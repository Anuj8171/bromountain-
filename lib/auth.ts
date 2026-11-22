// lib/auth.ts
// PURPOSE: Admin authentication helpers.
//   - verifyAdminPassword(password) → compares against ADMIN_PASSWORD env var.
//     Used by app/api/admin/login/route.ts.
//   - checkAdminSession() → reads the bm_admin_session cookie and checks it
//     matches the hard-coded SESSION_VALUE. Used by server components/pages
//     in app/admin/ to gate access.
//   - AUTH constant → cookie name + value, imported by the login/logout routes.
// CONNECTED TO: app/api/admin/login/route.ts (sets cookie),
//   app/api/admin/logout/route.ts (clears cookie),
//   app/admin/layout.tsx and app/admin/login/page.tsx (session checks).
// NOTE: This uses a single shared password + hard-coded session token.
//   Rotate both before handing the site to a new owner.
import { cookies } from "next/headers";

const SESSION_COOKIE = "bm_admin_session";
const SESSION_VALUE  = "x9KlmPq12BroMountains2026!";

// ── Check password ──────────────────────────────────────────
export function verifyAdminPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}

// ── Check session in server components ──────────────────────
export async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies(); // ✅ await here
    const token = cookieStore.get(SESSION_COOKIE);

  // console.log("SESSION:", token); // 👈 add this

  return token?.value === SESSION_VALUE;

  } catch {
    return false;
  }
}

// ── Cookie name and value ────────────────────────────────────
export const AUTH = {
  COOKIE_NAME:  SESSION_COOKIE,
  COOKIE_VALUE: SESSION_VALUE,
};