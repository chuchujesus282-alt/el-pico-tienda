import type { ReactNode } from "react";

type Props = {
  as?: "div" | "section" | "header" | "footer" | "nav";
  className?: string;
  children: ReactNode;
};

/** Ancho máximo 1536px y márgenes laterales 16px móvil / 24px tableta / 32px escritorio grande. */
export default function Contenedor({ as: Etiqueta = "div", className = "", children }: Props) {
  return <Etiqueta className={`mx-auto w-full max-w-screen-2xl px-4 md:px-6 xl:px-8 ${className}`}>{children}</Etiqueta>;
}
