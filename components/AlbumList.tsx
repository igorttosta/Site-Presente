"use client";

import { useRef, useState, useTransition } from "react";
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
  const [, startTransition] = useTransition();
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());
  const busyRef = useRef<Set<number>>(new Set());
  const router = useRouter();

  function runAction(id: number, action: () => Promise<unknown>) {
    if (busyRef.current.has(id)) return;
    busyRef.current.add(id);
    setBusyIds(new Set(busyRef.current));
    startTransition(async () => {
      try {
        await action();
      } catch {
        // se algo inesperado falhar, a lista ainda é atualizada abaixo
      } finally {
        router.refresh();
        busyRef.current.delete(id);
        setBusyIds(new Set(busyRef.current));
      }
    });
  }

  function handleDelete(id: number, titulo: string) {
    if (
      !window.confirm(`Excluir o álbum "${titulo}" e todas as fotos dele? Essa ação não pode ser desfeita.`)
    ) {
      return;
    }
    runAction(id, () => deleteAlbum(id));
  }

  function handleMove(id: number, direction: "up" | "down") {
    runAction(id, () => moveAlbum(id, direction));
  }

  return (
    <div className={styles.list}>
      {albums.map((album, index) => {
        const busy = busyIds.has(album.id);
        return (
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
                disabled={busy || index === 0}
                aria-label="Mover álbum pra cima"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => handleMove(album.id, "down")}
                disabled={busy || index === albums.length - 1}
                aria-label="Mover álbum pra baixo"
              >
                ▼
              </button>
              <button
                type="button"
                className={styles.deleteAlbumButton}
                onClick={() => handleDelete(album.id, album.titulo)}
                disabled={busy}
              >
                excluir
              </button>
            </div>
          </div>
        );
      })}
      <Link href="/albums/new" className={`${styles.row} ${styles.newRow}`}>
        <span className={styles.idx}>+</span>
        <span className={styles.rowTitle}>novo álbum</span>
        <span className={styles.leader} />
        <span className={styles.meta}>&nbsp;</span>
      </Link>
    </div>
  );
}
