"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePhoto, movePhoto } from "@/app/albums/actions";
import PhotoImage from "./PhotoImage";
import styles from "./PhotoCarousel.module.css";

type Photo = {
  id: number;
  url: string;
  legenda: string | null;
  spotifyTrackId: string | null;
  trackNome: string | null;
  trackArtista: string | null;
  trackPreviewUrl: string | null;
};

const ROTATE_MS = 5000;

export default function PhotoCarousel({
  photos,
  albumTitulo,
}: {
  photos: Photo[];
  albumTitulo: string;
}) {
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function runAction(action: () => Promise<unknown>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    startTransition(async () => {
      try {
        await action();
      } catch {
        // se algo inesperado falhar, o carrossel ainda é atualizado abaixo
      } finally {
        router.refresh();
        busyRef.current = false;
        setBusy(false);
      }
    });
  }

  useEffect(() => {
    if (index >= photos.length) {
      setIndex(Math.max(0, photos.length - 1));
    }
  }, [photos.length, index]);

  useEffect(() => {
    if (photos.length < 2) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % photos.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [index, photos.length]);

  if (photos.length === 0) {
    return null;
  }

  const photo = photos[index];

  function goTo(nextIndex: number) {
    setIndex((nextIndex + photos.length) % photos.length);
  }

  function handleDelete() {
    if (!window.confirm("Excluir essa foto? Essa ação não pode ser desfeita.")) {
      return;
    }
    runAction(() => deletePhoto(photo.id));
  }

  function handleMove(direction: "left" | "right") {
    runAction(() => movePhoto(photo.id, direction));
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.frame}>
        {photos.length > 1 && (
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={() => goTo(index - 1)}
            aria-label="Foto anterior"
          >
            ‹
          </button>
        )}
        <PhotoImage
          key={photo.id}
          src={photo.url}
          width={300}
          height={300}
          crop="fill"
          alt={photo.legenda ?? albumTitulo}
          className={styles.image}
        />
        {photos.length > 1 && (
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={() => goTo(index + 1)}
            aria-label="Próxima foto"
          >
            ›
          </button>
        )}
      </div>

      {photo.legenda && <p className={styles.caption}>{photo.legenda}</p>}

      {photo.trackNome && (
        <div className={styles.track}>
          <span className={styles.trackName}>
            {photo.trackNome} — {photo.trackArtista}
          </span>
          {photo.trackPreviewUrl ? (
            <audio controls src={photo.trackPreviewUrl} className={styles.audio} />
          ) : (
            photo.spotifyTrackId && (
              <a
                href={`https://open.spotify.com/track/${photo.spotifyTrackId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.spotifyLink}
                title="Ouvir no Spotify"
                aria-label={`Ouvir ${photo.trackNome} no Spotify`}
              >
                🎧
              </a>
            )
          )}
        </div>
      )}

      {photos.length > 1 && (
        <div className={styles.dots}>
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Ir para a foto ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div className={styles.editRow}>
        {photos.length > 1 && (
          <button
            type="button"
            className={styles.editButton}
            onClick={() => handleMove("left")}
            disabled={busy || index === 0}
          >
            mover ◀
          </button>
        )}
        <button
          type="button"
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={busy}
        >
          excluir
        </button>
        {photos.length > 1 && (
          <button
            type="button"
            className={styles.editButton}
            onClick={() => handleMove("right")}
            disabled={busy || index === photos.length - 1}
          >
            mover ▶
          </button>
        )}
      </div>
    </div>
  );
}
