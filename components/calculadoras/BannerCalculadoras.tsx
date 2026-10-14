import Image from "next/image";
import Link from "next/link";
import { BrickWall, Calculator, ChevronRight, Package, Ruler } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Contenedor from "@/components/ui/Contenedor";
import { RUTA_CALCULADORAS } from "./rutas";

/** Accesos rápidos a calculadoras concretas (slug de lib/calculadoras/registro.ts). */
const ACCESOS = [
  { texto: "Bloques", slug: "bloques" },
  { texto: "Concreto", slug: "concreto" },
  { texto: "Pintura", slug: "pintura" },
  { texto: "Cabillas", slug: "cabillas" },
];

type Props = {
  /**
   * Foto o imagen de producto recortada para el lado derecho (en public/ o URL absoluta).
   * Mientras no exista, se muestra la composición de íconos.
   */
  imagen?: string | null;
};

/**
 * Banner de las calculadoras de obra: franja blanca de borde a borde (como las demás franjas blancas
 * del sitio) con el contenido dentro del Contenedor. Reutilizable: va en el inicio y en categorías.
 */
export default function BannerCalculadoras({ imagen = null }: Props) {
  return (
    <section
      aria-labelledby="titulo-banner-calculadoras"
      className="relative isolate overflow-hidden border-y border-gris-borde bg-pico-blanco print:hidden"
    >
      <Contenedor className="grid items-center gap-6 py-9 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10 md:py-12">
        <div>
          <Badge variante="oferta">Herramienta gratis</Badge>
          <span className="mt-4 block h-1 w-10 -skew-x-12 rounded-sm bg-pico-rojo lg:w-14" aria-hidden />
          <h2 id="titulo-banner-calculadoras" className="mt-3 max-w-2xl text-2xl leading-tight font-bold text-balance text-pico-azul md:text-4xl">
            ¿No sabes cuánto material necesitas?
          </h2>
          <p className="mt-2 max-w-xl text-sm text-gris-texto md:text-base">
            Calcula bloques, cemento, cabillas, pintura y más, y llévate todo en un solo pedido.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
            {/* Botón azul con chevron: el mismo de los banners claros del inicio. */}
            <Link
              href={RUTA_CALCULADORAS}
              className="group inline-flex h-10 w-fit items-center gap-1 rounded-boton bg-pico-azul px-4 text-sm font-semibold text-pico-blanco shadow-tarjeta transition duration-200 hover:bg-pico-azul-oscuro hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-0.5 lg:h-12 lg:px-6 lg:text-base"
            >
              Calcular ahora
              <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
            <ul className="flex flex-wrap items-center gap-2" aria-label="Calculadoras más usadas">
              {ACCESOS.map(({ texto, slug }) => (
                <li key={slug}>
                  <Link
                    href={`${RUTA_CALCULADORAS}/${slug}`}
                    className="inline-flex h-8 items-center rounded-chip border border-gris-borde bg-pico-blanco px-3 text-xs font-semibold text-pico-azul transition-colors duration-200 hover:border-pico-azul hover:bg-pico-azul hover:text-pico-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
                  >
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lado derecho: foto recortada si existe; si no, composición de íconos lineales como los del hero. */}
        {imagen ? (
          <div className="relative hidden h-56 w-80 md:block lg:h-64 lg:w-96">
            <Image src={imagen} alt="" fill sizes="384px" className="object-contain" />
          </div>
        ) : (
          <div className="relative hidden h-52 w-80 text-pico-azul md:block lg:h-60 lg:w-[26rem]" aria-hidden>
            <Calculator className="absolute top-0 right-24 size-44 opacity-15 motion-safe:animate-flotar lg:size-56" strokeWidth={1.25} />
            <Ruler className="absolute bottom-0 left-0 size-24 opacity-10 motion-safe:animate-deriva lg:size-28" strokeWidth={1.25} />
            <BrickWall className="absolute top-2 right-0 size-24 opacity-10 motion-safe:animate-deriva [animation-delay:-4s] lg:size-28" strokeWidth={1.25} />
            <Package className="absolute right-4 bottom-0 size-20 opacity-10 motion-safe:animate-flotar [animation-delay:-2s] lg:size-24" strokeWidth={1.25} />
          </div>
        )}
      </Contenedor>
    </section>
  );
}
