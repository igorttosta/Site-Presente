import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { searchTracks } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = session ? await verifySessionToken(session).catch(() => null) : null;
  if (!valid) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json({ tracks: [] });
  }

  try {
    const tracks = await searchTracks(query);
    return NextResponse.json({ tracks });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
