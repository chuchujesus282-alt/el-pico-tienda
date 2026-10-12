import Link from "next/link";
import { House, PackageSearch, RotateCcw } from "lucide-react";

type Props = {
  /** Enlace para quitar los filtros. Si no hay filtros activos, no se muestra. */
  hrefLimpiar?: string;
};

const claseBoton =
  "group mt-2 inline-flex h-11 items-center gap-2 rounded-boton px-5 text-sm font-semibold transition duration-200 motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-marino";

/** Estado "sin resultados" de la grilla. */
export default function SinResultados({ hrefLimpiar }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-banner border border-gris-borde bg-pico-blanco px-6 py-14 text-center shadow-tarjeta motion-safe:animate-aparecer">
      <span className="flex size-20 items-center justify-center rounded-chip bg-logo-marino-claro">
        <PackageSearch className="size-10 text-logo-marino" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="font-titulo text-2xl font-bold text-logo-marino">No encontramos productos</p>
      <p className="max-w-sm text-[13px] text-gris-texto">
        {hrefLimpiar
          ? "Prueba con otra marca o subcategoría, o quita los filtros para ver todo."
          : "Todavía no tenemos productos en esta categoría. Vuelve pronto o escríbenos por WhatsApp."}
      </p>
      {hrefLimpiar ? (
        <Link
          href={hrefLimpiar}
          scroll={false}
          className={`${claseBoton} bg-logo-marino text-pico-blanco hover:bg-logo-marino-oscuro hover:shadow-boton-hover`}
        >
          <RotateCcw className="size-4 transition-transform duration-300 motion-safe:group-hover:-rotate-180" aria-hidden />
          Quitar filtros
        </Link>
      ) : (
        <Link href="/" className={`${claseBoton} border-2 border-logo-marino text-logo-marino hover:bg-logo-marino hover:text-pico-blanco`}>
          <House className="size-4" aria-hidden />
          Volver al inicio
        </Link>
      )}
    </div>
  );
}
