import { PackageSearch } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Contenedor from "@/components/ui/Contenedor";

/** Producto inexistente (código que no está en el catálogo). */
export default function ProductoNoEncontrado() {
  return (
    <Contenedor className="py-12 md:py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco px-6 py-12 text-center shadow-tarjeta">
        <PackageSearch className="size-12 text-gris-borde" strokeWidth={1.5} aria-hidden />
        <h1 className="text-xl font-bold text-pico-azul">No encontramos este producto</h1>
        <p className="max-w-sm text-[13px] text-gris-texto">
          Puede que el código haya cambiado. Busca en las categorías o escríbenos por WhatsApp y te ayudamos.
        </p>
        <Boton href="/" className="mt-2">
          Volver al inicio
        </Boton>
      </div>
    </Contenedor>
  );
}
