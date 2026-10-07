import Link from "next/link";
import { SearchX } from "lucide-react";
import GrillaProductos from "@/components/producto/GrillaProductos";
import TituloSeccion from "@/components/ui/TituloSeccion";
import type { Categoria, Producto } from "@/types/catalogo";

type Props = {
  consulta: string;
  /** "¿Quisiste decir…?" */
  sugerencia: string | null;
  /** Categoría más parecida a lo buscado (si se encontró). */
  categoria: Categoria | null;
  /** Lo más vendido de esa categoría (o de la tienda): la página nunca queda vacía. */
  productos: Producto[];
};

/** Búsqueda sin resultados: corrección sugerida y productos para seguir comprando. */
export default function SinResultados({ consulta, sugerencia, categoria, productos }: Props) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco px-6 py-8 text-center">
        <SearchX className="size-10 text-gris-borde" strokeWidth={1.5} aria-hidden />
        <p className="text-lg font-bold text-pico-azul">
          {consulta ? <>No encontramos productos para “{consulta}”</> : "Escribe qué estás buscando"}
        </p>
        {sugerencia && (
          <p className="text-sm text-texto">
            ¿Quisiste decir{" "}
            <Link href={`/buscar?q=${encodeURIComponent(sugerencia)}`} className="font-semibold text-pico-rojo underline-offset-2 hover:underline">
              {sugerencia}
            </Link>
            ?
          </p>
        )}
        <p className="text-[13px] text-gris-texto">Prueba con otra palabra, revisa cómo está escrita o escríbenos por WhatsApp.</p>
      </div>

      {productos.length > 0 && (
        <section aria-label="Productos sugeridos">
          <TituloSeccion
            titulo={categoria ? `Lo más vendido en ${categoria.nombre}` : "Lo más vendido"}
            href={categoria ? `/categoria/${categoria.slug}` : undefined}
          />
          <GrillaProductos productos={productos} />
        </section>
      )}
    </div>
  );
}
