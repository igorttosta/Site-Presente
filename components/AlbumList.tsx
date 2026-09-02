"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteAlbum, moveAlbum } from "@/app/albums/actions";
import styles from "@/app/albums/page.module.css";

type Album = {
  id: number;
  titulo: string;
  criadoEm: Date;
  _count: { photos: number };
};

export default function AlbumList({ albums }: { albums: Album[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(id: number, titulo: string) {
    if (
      !window.confirm(`Excluir o álbum "${titulo}" e todas as fotos dele? Essa ação não pode ser desfeita.`)
    ) {
      return;
    }
    startTransition(async () => {
      await deleteAlbum(id);
      router.refresh();
    });
  }

  function handleMove(id: number, direction: "up" | "down") {
    startTransition(async () => {
      await moveAlbum(id, direction);
      router.refresh();
    });
  }

  return (
    <div className={styles.list}>
      {albums.map((album, index) => (
        <div key={album.id} className={styles.row}>
          <Link href={`/albums/${album.id}`} className={styles.rowLink}>
            <span className={styles.idx}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.rowTitle}>{album.titulo}</span>
            <span className={styles.leader} />
            <span className={styles.meta}>
              {album._count.photos} {album._count.photos === 1 ? "foto" : "fotos"} ·{" "}
              {album.criadoEm.getFullYear()}
            </span>
          </Link>
          <div className={styles.rowActions}>
            <button
              type="button"
              onClick={() => handleMove(album.id, "up")}
              disabled={isPending || index === 0}
              aria-label="Mover álbum pra cima"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => handleMove(album.id, "down")}
              disabled={isPending || index === albums.length - 1}
              aria-label="Mover álbum pra baixo"
            >
              ▼
            </button>
            <button
              type="button"
              className={styles.deleteAlbumButton}
              onClick={() => handleDelete(album.id, album.titulo)}
              disabled={isPending}
            >
              excluir
            </button>
          </div>
        </div>
      ))}
      <Link href="/albums/new" className={`${styles.row} ${styles.newRow}`}>
        <span className={styles.idx}>+</span>
        <span className={styles.rowTitle}>novo álbum</span>
        <span className={styles.leader} />
        <span className={styles.meta}>&nbsp;</span>
      </Link>
    </div>
  );
}
