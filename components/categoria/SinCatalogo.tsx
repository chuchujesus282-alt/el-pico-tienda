import Link from "next/link";
import { RotateCw, WifiOff } from "lucide-react";

type Props = {
  /** La misma página, para volver a intentar. */
  hrefReintentar: string;
};

/**
 * "No pudimos cargar los productos": se muestra en lugar de la grilla cuando el sistema (Saint) no responde y no hay
 * una lista guardada. Mismo diseño que app/categoria/[slug]/error.tsx, pero dentro de la página (con su banner).
 * Nunca se muestran productos de ejemplo en su lugar.
 */
export default function SinCatalogo({ hrefReintentar }: Props) {
  return (
    <div
      role="status"
      className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-banner border border-gris-borde bg-pico-blanco px-6 py-12 text-center shadow-tarjeta motion-safe:animate-aparecer"
    >
      <span className="flex size-20 items-center justify-center rounded-chip bg-logo-marino-claro">
        <WifiOff className="size-10 text-logo-marino" strokeWidth={1.5} aria-hidden />
      </span>
      <h2 className="text-xl font-bold text-logo-marino">No pudimos cargar los productos</h2>
      <p className="max-w-sm text-[13px] text-gris-texto">Intenta en unos minutos.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <a
          href={hrefReintentar}
          className="group inline-flex h-11 items-center gap-2 rounded-boton bg-logo-marino px-5 text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-logo-marino-oscuro hover:shadow-boton-hover motion-safe:hover:-translate-y-0.5"
        >
          <RotateCw className="size-4 transition-transform duration-500 motion-safe:group-hover:rotate-180" aria-hidden />
          Reintentar
        </a>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-boton border-2 border-logo-marino px-5 text-sm font-semibold text-logo-marino transition duration-200 hover:bg-logo-marino hover:text-pico-blanco motion-safe:hover:-translate-y-0.5"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
