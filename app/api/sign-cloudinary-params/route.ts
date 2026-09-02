import { NextResponse, type NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = session ? await verifySessionToken(session).catch(() => null) : null;
  if (!valid) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { paramsToSign } = (await request.json()) as { paramsToSign: Record<string, unknown> };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({ signature });
}
