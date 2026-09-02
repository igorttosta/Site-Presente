"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createAlbum, type CreateAlbumState } from "../actions";
import albumStyles from "../page.module.css";
import albumPageStyles from "../[id]/page.module.css";
import formStyles from "@/app/page.module.css";

const initialState: CreateAlbumState = { error: "" };

export default function NewAlbumPage() {
  const [state, formAction, pending] = useActionState(createAlbum, initialState);

  return (
    <div className={albumStyles.container}>
      <div className={albumStyles.card}>
        <Link href="/albums" className={albumPageStyles.back}>
          ← álbuns
        </Link>
        <h1 className={albumStyles.title}>Novo álbum</h1>
        <form className={formStyles.form} action={formAction}>
          <div className={formStyles.field}>
            <label htmlFor="titulo">Título</label>
            <input id="titulo" name="titulo" type="text" placeholder="Praia em janeiro" required />
          </div>
          <div className={formStyles.field}>
            <label htmlFor="descricao">Descrição (opcional)</label>
            <input
              id="descricao"
              name="descricao"
              type="text"
              placeholder="Aquele fim de semana em Ubatuba"
            />
          </div>
          <p className={formStyles.error} role="alert">
            {state.error}
          </p>
          <button type="submit" className={formStyles.submit} disabled={pending}>
            {pending ? "Criando…" : "Criar álbum"}
          </button>
        </form>
      </div>
    </div>
  );
}
