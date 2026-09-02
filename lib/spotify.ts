import { prisma } from "./db";

const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const SCOPES = "streaming user-read-email user-read-private";

function basicAuthHeader() {
  const credentials = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

export function getAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: SCOPES,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

export async function exchangeCodeForTokens(code: string) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao trocar o código pelo token: ${await response.text()}`);
  }

  const data = (await response.json()) as TokenResponse;
  if (!data.refresh_token) {
    throw new Error("Spotify não retornou refresh_token.");
  }

  await prisma.spotifyToken.upsert({
    where: { id: 1 },
    update: { refreshToken: data.refresh_token },
    create: { id: 1, refreshToken: data.refresh_token },
  });

  return data;
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao renovar o token do Spotify: ${await response.text()}`);
  }

  const data = (await response.json()) as TokenResponse;

  if (data.refresh_token && data.refresh_token !== refreshToken) {
    await prisma.spotifyToken.update({
      where: { id: 1 },
      data: { refreshToken: data.refresh_token },
    });
  }

  return data;
}

export async function isSpotifyConnected() {
  const token = await prisma.spotifyToken.findUnique({ where: { id: 1 } });
  return Boolean(token);
}

export async function getValidAccessToken() {
  const stored = await prisma.spotifyToken.findUnique({ where: { id: 1 } });
  if (!stored) {
    throw new Error("Spotify ainda não foi conectado.");
  }
  const { access_token } = await refreshAccessToken(stored.refreshToken);
  return access_token;
}

export type SpotifyTrackResult = {
  id: string;
  name: string;
  artist: string;
  previewUrl: string | null;
  image: string | null;
};

type SpotifyApiTrack = {
  id: string;
  name: string;
  artists: { name: string }[];
  preview_url: string | null;
  album: { images: { url: string }[] };
};

export async function searchTracks(query: string): Promise<SpotifyTrackResult[]> {
  const accessToken = await getValidAccessToken();
  const params = new URLSearchParams({ q: query, type: "track", limit: "8" });
  const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Falha na busca do Spotify: ${await response.text()}`);
  }

  const data = (await response.json()) as { tracks?: { items: SpotifyApiTrack[] } };
  return (data.tracks?.items ?? []).map((track) => ({
    id: track.id,
    name: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    previewUrl: track.preview_url,
    image: track.album.images.at(-1)?.url ?? null,
  }));
}
