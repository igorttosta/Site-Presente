import Link from "next/link";
import { prisma } from "@/lib/db";
import styles from "./page.module.css";

export default async function AlbumsPage() {
  const albums = await prisma.album.findMany({
    orderBy: { criadoEm: "asc" },
    include: { _count: { select: { photos: true } } },
  });

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Nossos álbuns</h1>

        {albums.length === 0 && (
          <p className={styles.empty}>Nenhum álbum ainda — comece um abaixo.</p>
        )}

        <div className={styles.list}>
          {albums.map((album, index) => (
            <Link key={album.id} href={`/albums/${album.id}`} className={styles.row}>
              <span className={styles.idx}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.rowTitle}>{album.titulo}</span>
              <span className={styles.leader} />
              <span className={styles.meta}>
                {album._count.photos} {album._count.photos === 1 ? "foto" : "fotos"} ·{" "}
                {album.criadoEm.getFullYear()}
              </span>
            </Link>
          ))}
          <Link href="/albums/new" className={`${styles.row} ${styles.newRow}`}>
            <span className={styles.idx}>+</span>
            <span className={styles.rowTitle}>novo álbum</span>
            <span className={styles.leader} />
            <span className={styles.meta}>&nbsp;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
