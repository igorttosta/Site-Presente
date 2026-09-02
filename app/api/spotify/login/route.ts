import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getAuthorizeUrl } from "@/lib/spotify";

const STATE_COOKIE = "spotify_oauth_state";

export async function GET(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = session ? await verifySessionToken(session).catch(() => null) : null;
  if (!valid) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const state = randomUUID();
  const response = NextResponse.redirect(getAuthorizeUrl(state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
