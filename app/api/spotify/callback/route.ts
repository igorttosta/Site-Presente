import { NextResponse, type NextRequest } from "next/server";
import { exchangeCodeForTokens } from "@/lib/spotify";

const STATE_COOKIE = "spotify_oauth_state";

function htmlResponse(title: string, message: string) {
  return new NextResponse(
    `<!doctype html><html lang="pt-BR"><meta charset="utf-8">
    <body style="font-family: system-ui, sans-serif; background:#2b1b24; color:#eee3d2; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
      <div style="text-align:center; max-width:24rem; padding:2rem;">
        <h1 style="font-size:1.1rem; margin:0 0 0.5rem;">${title}</h1>
        <p style="color:#b8a896; font-size:0.9rem;">${message}</p>
      </div>
    </body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = request.cookies.get(STATE_COOKIE)?.value;

  const response = error || !code || !state || state !== savedState
    ? htmlResponse(
        "Não deu pra conectar.",
        error === "access_denied"
          ? "A autorização foi cancelada."
          : "O link expirou ou é inválido. Tenta conectar de novo."
      )
    : await exchangeCodeForTokens(code)
        .then(() => htmlResponse("Spotify conectado!", "Pode fechar esta aba."))
        .catch((err: Error) => htmlResponse("Não deu pra conectar.", err.message));

  response.cookies.delete(STATE_COOKIE);
  return response;
}
