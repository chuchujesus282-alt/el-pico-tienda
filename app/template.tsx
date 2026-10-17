import type { ReactNode } from "react";

/**
 * Se vuelve a montar en cada cambio de página: el contenido entra con un fundido corto (.transicion-pagina
 * en globals.css). Solo opacidad: no usa transform, así no encierra a las barras y modales fijos de adentro.
 */
export default function Plantilla({ children }: { children: ReactNode }) {
  return <div className="transicion-pagina">{children}</div>;
}
