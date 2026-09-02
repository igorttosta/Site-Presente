"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import styles from "./page.module.css";

const initialState: LoginState = { error: "" };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className={styles.container}>
      <div className={styles.stage}>
        <div className={styles.album}>
          <div className={styles.ribbon} aria-hidden="true" />
          <div className={styles.ornament}>
            <span className={styles.line} />
            <span className={styles.dot} />
            <span className={`${styles.line} ${styles.lineRight}`} />
          </div>
          <h1 className={styles.title}>Nosso Álbum</h1>
          <p className={styles.inscription}>fotos e músicas, só nossas.</p>

          <div className={styles.page}>
            <span className={`${styles.mount} ${styles.mountTl}`} aria-hidden="true" />
            <span className={`${styles.mount} ${styles.mountTr}`} aria-hidden="true" />
            <span className={`${styles.mount} ${styles.mountBl}`} aria-hidden="true" />
            <span className={`${styles.mount} ${styles.mountBr}`} aria-hidden="true" />

            <form className={styles.form} action={formAction}>
              <div className={styles.field}>
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nome@exemplo.com"
                  autoComplete="username"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="password">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="sua senha"
                  autoComplete="current-password"
                  required
                />
              </div>
              <p className={styles.error} role="alert">
                {state.error}
              </p>
              <button type="submit" className={styles.submit} disabled={pending}>
                {pending ? "Abrindo…" : "Entrar"}
              </button>
            </form>
          </div>
        </div>
        <p className={styles.edition}>edição única</p>
      </div>
    </div>
  );
}
