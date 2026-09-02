import { prisma } from "@/lib/db";
import AlbumList from "@/components/AlbumList";
import styles from "./page.module.css";

export default async function AlbumsPage() {
  const albums = await prisma.album.findMany({
    orderBy: { ordem: "asc" },
    include: { _count: { select: { photos: true } } },
  });

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Nossos álbuns</h1>

        {albums.length === 0 && (
          <p className={styles.empty}>Nenhum álbum ainda — comece um abaixo.</p>
        )}

        <AlbumList albums={albums} />
      </div>
    </div>
  );
}
