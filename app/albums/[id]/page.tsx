import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import PhotoCarousel from "@/components/PhotoCarousel";
import albumStyles from "../page.module.css";
import styles from "./page.module.css";

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const albumId = Number(id);

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session || !Number.isInteger(albumId)) {
    notFound();
  }

  const album = await prisma.album.findFirst({
    where: { id: albumId, userId: session.userId },
    include: { photos: { orderBy: { ordem: "asc" } } },
  });

  if (!album) {
    notFound();
  }

  return (
    <div className={albumStyles.container}>
      <div className={albumStyles.card}>
        <Link href="/albums" className={styles.back}>
          ← álbuns
        </Link>
        <h1 className={albumStyles.title}>{album.titulo}</h1>
        {album.descricao && <p className={styles.description}>{album.descricao}</p>}

        {album.photos.length === 0 ? (
          <p className={styles.empty}>Nenhuma foto ainda.</p>
        ) : (
          <PhotoCarousel photos={album.photos} albumTitulo={album.titulo} />
        )}

        <Link href={`/albums/${album.id}/photos/new`} className={styles.addLink}>
          + adicionar foto
        </Link>
      </div>
    </div>
  );
}
