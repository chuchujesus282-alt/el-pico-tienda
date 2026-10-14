import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Revelar from "@/components/ui/Revelar";
import TituloSeccion from "@/components/ui/TituloSeccion";
import type { Categoria } from "@/types/catalogo";
import { ICONO_CATEGORIA_GENERICO, ICONOS_CATEGORIA } from "./accesosInicio";

/**
 * "Compra por categoría": una tarjeta por categoría del catálogo. Cada tarjeta lleva su ícono en una
 * placa azul marino, el mismo ícono grande y tenue de fondo (como en los banners) y, al pasar el
 * mouse, se eleva, muestra el filete rojo y aparece "Ver productos".
 */
export default function CategoriasInicio({ categorias }: { categorias: Categoria[] }) {
  if (categorias.length === 0) return null;

  return (
    <section aria-label="Compra por categoría">
      <TituloSeccion titulo="Compra por categoría" subtitulo="Todo el catálogo, ordenado para que encuentres rápido lo que buscas." />
      <ul className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-5 xl:grid-cols-9">
        {categorias.map((categoria, i) => {
          const Icono = ICONOS_CATEGORIA[categoria.slug] ?? ICONO_CATEGORIA_GENERICO;
          return (
            <li key={categoria.slug}>
              <Revelar retraso={Math.min(i, 8) * 50} className="h-full">
                <Link
                  href={`/categoria/${categoria.slug}`}
                  className="group relative isolate flex h-full flex-col items-center gap-3 overflow-hidden rounded-tarjeta border border-gris-borde bg-gradient-to-b from-pico-blanco to-pico-azul-claro/60 px-2 pt-5 pb-4 text-center shadow-tarjeta transition duration-300 hover:border-pico-azul/25 hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-1.5 md:pt-6 md:pb-5"
                >
                  <span className="absolute inset-x-0 top-0 h-1 origin-center scale-x-0 bg-pico-rojo transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
                  {/* Ícono grande y tenue de fondo. */}
                  <Icono
                    className="pointer-events-none absolute -right-4 -bottom-5 -z-10 size-24 text-pico-azul/[0.06] transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-12"
                    strokeWidth={1.25}
                    aria-hidden
                  />
                  <span className="flex size-12 items-center justify-center rounded-tarjeta bg-gradient-to-br from-pico-azul to-pico-azul-oscuro text-pico-blanco shadow-boton-hover ring-4 ring-pico-blanco transition-transform duration-300 motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-110 md:size-14">
                    <Icono className="size-6 motion-safe:group-hover:animate-sacudir md:size-7" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="flex flex-1 items-center text-[13px] leading-tight font-bold text-balance text-pico-azul md:text-sm">{categoria.nombre}</span>
                  <span className="hidden items-center gap-1 text-xs font-semibold text-pico-rojo opacity-0 transition duration-300 group-hover:opacity-100 motion-safe:translate-y-1 motion-safe:group-hover:translate-y-0 xl:inline-flex">
                    Ver productos
                    <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </Link>
              </Revelar>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
