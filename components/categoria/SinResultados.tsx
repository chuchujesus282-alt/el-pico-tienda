import { PackageSearch } from "lucide-react";
import Boton from "@/components/ui/Boton";

type Props = {
  /** Enlace para quitar los filtros. Si no hay filtros activos, no se muestra. */
  hrefLimpiar?: string;
};

/** Estado "sin resultados" de la grilla. */
export default function SinResultados({ hrefLimpiar }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco px-6 py-12 text-center">
      <PackageSearch className="size-12 text-gris-borde" strokeWidth={1.5} aria-hidden />
      <p className="text-xl font-bold text-pico-azul">No encontramos productos</p>
      <p className="max-w-sm text-[13px] text-gris-texto">
        {hrefLimpiar
          ? "Prueba con otra marca o subcategoría, o quita los filtros para ver todo."
          : "Todavía no tenemos productos en esta categoría. Vuelve pronto o escríbenos por WhatsApp."}
      </p>
      {hrefLimpiar ? (
        <Boton href={hrefLimpiar} scroll={false} className="mt-2">
          Quitar filtros
        </Boton>
      ) : (
        <Boton href="/" variante="secundario" className="mt-2">
          Volver al inicio
        </Boton>
      )}
    </div>
  );
}
