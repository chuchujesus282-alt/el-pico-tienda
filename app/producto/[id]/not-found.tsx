import Link from "next/link";
import { House, PackageSearch } from "lucide-react";
import { fuentePaginas } from "@/components/producto-detalle/fuentes";
import Contenedor from "@/components/ui/Contenedor";

/** Producto inexistente (código que no está en el catálogo). */
export default function ProductoNoEncontrado() {
  return (
    <div className={fuentePaginas}>
      <Contenedor className="py-12 md:py-16">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-banner border border-gris-borde bg-pico-blanco px-6 py-12 text-center shadow-tarjeta motion-safe:animate-aparecer">
          <span className="flex size-20 items-center justify-center rounded-chip bg-logo-marino-claro">
            <PackageSearch className="size-10 text-logo-marino" strokeWidth={1.5} aria-hidden />
          </span>
          <h1 className="text-2xl font-bold text-logo-marino">No encontramos este producto</h1>
          <p className="max-w-sm text-[13px] text-gris-texto">
            Puede que el código haya cambiado. Busca en las categorías o escríbenos por WhatsApp y te ayudamos.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex h-11 items-center gap-2 rounded-boton bg-logo-marino px-5 text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-logo-marino-oscuro hover:shadow-boton-hover motion-safe:hover:-translate-y-0.5"
          >
            <House className="size-4" aria-hidden />
            Volver al inicio
          </Link>
        </div>
      </Contenedor>
    </div>
  );
}
