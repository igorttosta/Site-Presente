"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

async function requireSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? await verifySessionToken(token).catch(() => null) : null;
}

export type CreateAlbumState = { error: string };

export async function createAlbum(
  _prevState: CreateAlbumState,
  formData: FormData
): Promise<CreateAlbumState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) {
    return { error: "Sessão expirada. Faça login de novo." };
  }

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();

  if (!titulo) {
    return { error: "Dá um nome pro álbum." };
  }

  await prisma.album.create({
    data: {
      titulo,
      descricao: descricao || null,
      userId: session.userId,
    },
  });

  redirect("/albums");
}

export type CreatePhotoState = { error: string };

export async function createPhoto(
  _prevState: CreatePhotoState,
  formData: FormData
): Promise<CreatePhotoState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) {
    return { error: "Sessão expirada. Faça login de novo." };
  }

  const albumId = Number(formData.get("albumId"));
  const url = String(formData.get("url") ?? "").trim();
  const publicId = String(formData.get("publicId") ?? "").trim();
  const legenda = String(formData.get("legenda") ?? "").trim();
  const spotifyTrackId = String(formData.get("spotifyTrackId") ?? "").trim();
  const trackNome = String(formData.get("trackNome") ?? "").trim();
  const trackArtista = String(formData.get("trackArtista") ?? "").trim();
  const trackPreviewUrl = String(formData.get("trackPreviewUrl") ?? "").trim();

  if (!albumId || !url) {
    return { error: "Escolha uma foto antes de salvar." };
  }

  const album = await prisma.album.findFirst({
    where: { id: albumId, userId: session.userId },
  });
  if (!album) {
    return { error: "Álbum não encontrado." };
  }

  const last = await prisma.photo.findFirst({
    where: { albumId },
    orderBy: { ordem: "desc" },
  });
  const ordem = (last?.ordem ?? -1) + 1;

  await prisma.photo.create({
    data: {
      albumId,
      url,
      publicId: publicId || null,
      legenda: legenda || null,
      ordem,
      spotifyTrackId: spotifyTrackId || null,
      trackNome: trackNome || null,
      trackArtista: trackArtista || null,
      trackPreviewUrl: trackPreviewUrl || null,
    },
  });

  redirect(`/albums/${albumId}`);
}

export async function deletePhoto(photoId: number) {
  const session = await requireSession();
  if (!session) {
    throw new Error("Sessão expirada. Faça login de novo.");
  }

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, album: { userId: session.userId } },
  });
  if (!photo) {
    throw new Error("Foto não encontrada.");
  }

  if (photo.publicId) {
    await cloudinary.uploader.destroy(photo.publicId).catch(() => {
      // best-effort: se falhar em apagar do Cloudinary, ainda removemos do álbum
    });
  }

  await prisma.photo.delete({ where: { id: photoId } });
}

export async function movePhoto(photoId: number, direction: "left" | "right") {
  const session = await requireSession();
  if (!session) {
    throw new Error("Sessão expirada. Faça login de novo.");
  }

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, album: { userId: session.userId } },
  });
  if (!photo) {
    throw new Error("Foto não encontrada.");
  }

  const neighbor = await prisma.photo.findFirst({
    where: {
      albumId: photo.albumId,
      ordem: direction === "left" ? { lt: photo.ordem } : { gt: photo.ordem },
    },
    orderBy: { ordem: direction === "left" ? "desc" : "asc" },
  });
  if (!neighbor) {
    return;
  }

  await prisma.$transaction([
    prisma.photo.update({ where: { id: photo.id }, data: { ordem: neighbor.ordem } }),
    prisma.photo.update({ where: { id: neighbor.id }, data: { ordem: photo.ordem } }),
  ]);
}
