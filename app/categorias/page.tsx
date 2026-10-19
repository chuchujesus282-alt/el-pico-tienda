import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { RUTA_CALCULADORAS } from "@/components/calculadoras/rutas";
import IconoCalculadora from "@/components/icons/pico/IconoCalculadora";
import { iconoDeCategoria } from "@/components/icons/pico/porCategoria";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import { getCategorias } from "@/lib/catalogo";
import type { Categoria } from "@/types/catalogo";

// Todas las categorías — responsable: persona A. Es la pestaña "Categorías" de la barra inferior del teléfono
// (en escritorio las categorías están en la barra azul de arriba, pero esta página también funciona ahí).

export const metadata: Metadata = {
  title: "Categorías",
  description: "Todas las categorías de Centro Ferretero El Pico y las calculadoras de proyectos.",
};

export default async function PaginaCategorias() {
  let categorias: Categoria[] = [];
  try {
    categorias = await getCategorias();
  } catch {
    // Si el catálogo no responde, se avisa abajo.
  }

  return (
    <>
      <EncabezadoPagina titulo="Categorías" ruta={[{ texto: "Categorías" }]} />
      <Contenedor className="py-6 md:py-10">
        {categorias.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categorias.map((categoria, i) => {
              const Icono = iconoDeCategoria(categoria.slug);
              return (
                <li key={categoria.slug} className="motion-safe:animate-aparecer" style={{ animationDelay: `${i * 40}ms` }}>
                  <Link
                    href={`/categoria/${categoria.slug}`}
                    className="group grupo-icono flex h-full flex-col items-center gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco px-2 py-5 text-center shadow-tarjeta transition duration-200 hover:border-pico-azul/30 hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:active:scale-[0.97]"
                  >
                    <span className="flex size-14 items-center justify-center rounded-chip bg-pico-azul text-pico-blanco transition-colors [--icono-fondo:var(--color-pico-azul)] group-hover:bg-pico-rojo group-hover:[--icono-acento:var(--color-pico-blanco)] group-hover:[--icono-fondo:var(--color-pico-rojo)]">
                      <Icono className="size-8" />
                    </span>
                    <span className="text-sm leading-tight font-semibold text-pico-azul">{categoria.nombre}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-tarjeta bg-pico-blanco p-4 text-center text-sm text-gris-texto">
            No pudimos cargar las categorías. Intenta de nuevo en unos minutos.
          </p>
        )}

        <Link
          href={RUTA_CALCULADORAS}
          className="group mt-4 flex items-center gap-3 rounded-tarjeta bg-gradient-to-br from-pico-azul to-pico-azul-oscuro p-4 text-pico-blanco shadow-tarjeta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-chip bg-pico-blanco/10 ring-1 ring-pico-blanco/15">
            <IconoCalculadora className="size-7" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">Calculadoras de proyectos</span>
            <span className="block text-sm text-pico-blanco/75">Calcula los materiales que necesitas</span>
          </span>
          <ChevronRight className="size-5 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </Contenedor>
    </>
  );
}
