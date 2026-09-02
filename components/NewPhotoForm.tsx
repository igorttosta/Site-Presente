"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { createPhoto, type CreatePhotoState } from "@/app/albums/actions";
import { useCloudinaryWidget, type UploadedImage } from "./useCloudinaryWidget";
import albumStyles from "@/app/albums/page.module.css";
import formStyles from "@/app/page.module.css";
import albumPageStyles from "@/app/albums/[id]/page.module.css";
import styles from "./NewPhotoForm.module.css";

type Track = {
  id: string;
  name: string;
  artist: string;
  previewUrl: string | null;
  image: string | null;
};

const initialState: CreatePhotoState = { error: "" };

export default function NewPhotoForm({
  albumId,
  albumTitulo,
}: {
  albumId: number;
  albumTitulo: string;
}) {
  const [state, formAction, pending] = useActionState(createPhoto, initialState);
  const [image, setImage] = useState<UploadedImage | null>(null);
  const { open: openUploadWidget } = useCloudinaryWidget(setImage);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const data = await response.json();
          setResults(data.tracks ?? []);
        }
      } catch {
        // busca cancelada ou falhou; sem problema, o campo continua editável
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div className={albumStyles.container}>
      <div className={albumStyles.card}>
        <Link href={`/albums/${albumId}`} className={albumPageStyles.back}>
          ← álbum
        </Link>
        <h1 className={albumStyles.title}>Nova foto em {albumTitulo}</h1>

        <div className={styles.uploadArea}>
          {image ? (
            <div className={styles.previewWrap}>
              <img src={image.url} alt="Pré-visualização" className={styles.preview} />
              <button type="button" className={styles.changePhoto} onClick={openUploadWidget}>
                trocar foto
              </button>
            </div>
          ) : (
            <button type="button" className={styles.pickButton} onClick={openUploadWidget}>
              Escolher foto
            </button>
          )}
        </div>

        <form className={formStyles.form} action={formAction}>
          <input type="hidden" name="albumId" value={albumId} />
          <input type="hidden" name="url" value={image?.url ?? ""} />
          <input type="hidden" name="publicId" value={image?.publicId ?? ""} />
          <input type="hidden" name="spotifyTrackId" value={selectedTrack?.id ?? ""} />
          <input type="hidden" name="trackNome" value={selectedTrack?.name ?? ""} />
          <input type="hidden" name="trackArtista" value={selectedTrack?.artist ?? ""} />
          <input type="hidden" name="trackPreviewUrl" value={selectedTrack?.previewUrl ?? ""} />

          <div className={formStyles.field}>
            <label htmlFor="legenda">Legenda (opcional)</label>
            <input id="legenda" name="legenda" type="text" placeholder="Nosso primeiro rolê" />
          </div>

          <div className={formStyles.field}>
            <label htmlFor="track-search">Música (opcional)</label>
            {selectedTrack ? (
              <div className={styles.selectedTrack}>
                <span>
                  {selectedTrack.name} — {selectedTrack.artist}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTrack(null)}
                  className={styles.clearTrack}
                >
                  remover
                </button>
              </div>
            ) : (
              <>
                <input
                  id="track-search"
                  type="text"
                  placeholder="Buscar no Spotify…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
                {searching && <p className={styles.hint}>Buscando…</p>}
                {results.length > 0 && (
                  <ul className={styles.results}>
                    {results.map((track) => (
                      <li key={track.id}>
                        <button
                          type="button"
                          className={styles.resultItem}
                          onClick={() => {
                            setSelectedTrack(track);
                            setQuery("");
                            setResults([]);
                          }}
                        >
                          {track.name} — {track.artist}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <p className={formStyles.error} role="alert">
            {state.error}
          </p>

          <button type="submit" className={formStyles.submit} disabled={pending || !image}>
            {pending ? "Salvando…" : "Salvar foto"}
          </button>
        </form>
      </div>
    </div>
  );
}
