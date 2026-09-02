import type { Metadata } from "next";
import { Cinzel, Karla, Petit_Formal_Script } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const karla = Karla({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const petitFormalScript = Petit_Formal_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Nosso Álbum",
  description: "Fotos e músicas, só nossas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${cinzel.variable} ${karla.variable} ${petitFormalScript.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
