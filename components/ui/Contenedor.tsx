import type { ReactNode } from "react";

type Props = {
  as?: "div" | "section" | "header" | "footer" | "nav";
  className?: string;
  children: ReactNode;
};

/** Ancho máximo 1280px y márgenes laterales 16px móvil / 24px escritorio. */
export default function Contenedor({ as: Etiqueta = "div", className = "", children }: Props) {
  return <Etiqueta className={`mx-auto w-full max-w-7xl px-4 md:px-6 ${className}`}>{children}</Etiqueta>;
}
