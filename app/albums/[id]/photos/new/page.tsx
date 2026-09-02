import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import NewPhotoForm from "@/components/NewPhotoForm";

export default async function NewPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const albumId = Number(id);

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session || !Number.isInteger(albumId)) {
    notFound();
  }

  const album = await prisma.album.findFirst({
    where: { id: albumId },
  });
  if (!album) {
    notFound();
  }

  return <NewPhotoForm albumId={album.id} albumTitulo={album.titulo} />;
}
