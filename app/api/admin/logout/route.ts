import { NextResponse } from "next/server";
import { AUTH } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH.COOKIE_NAME);
  return response;
}