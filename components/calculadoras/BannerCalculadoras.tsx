import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import IconoCalculadora from "@/components/icons/pico/IconoCalculadora";
import { Montanas } from "@/components/layout/Logo";
import Contenedor from "@/components/ui/Contenedor";
import { RUTA_CALCULADORAS } from "./rutas";

/** Accesos rápidos a calculadoras concretas (slug de lib/calculadoras/registro.ts). */
const ACCESOS = [
  { texto: "Bloques", slug: "bloques" },
  { texto: "Concreto", slug: "concreto" },
  { texto: "Pintura", slug: "pintura" },
  { texto: "Cabillas", slug: "cabillas" },
];

/** Lo que el cliente obtiene, en tres frases cortas. */
const PUNTOS = ["10 calculadoras de obra", "Lista exacta de materiales", "Todo al carrito en un clic"];

type Props = {
  /**
   * Foto o imagen de producto recortada para el lado derecho (en public/ o URL absoluta).
   * Mientras no exista, se muestran tres fotos de las calculadoras (public/proyectos/).
   */
  imagen?: string | null;
};

/**
 * Banner de las calculadoras de obra: franja blanca de borde a borde, con un velo azul claro y las
 * montañas del logo muy tenues de fondo. Reutilizable: va en el inicio y en categorías.
 */
export default function BannerCalculadoras({ imagen = null }: Props) {
  return (
    <section
      aria-labelledby="titulo-banner-calculadoras"
      className="group/banner relative isolate overflow-hidden border-y border-gris-borde bg-pico-blanco print:hidden"
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-2/3 bg-gradient-to-l from-pico-azul-claro to-transparent" aria-hidden />
      <Montanas className="pointer-events-none absolute -bottom-12 left-1/3 -z-10 hidden w-[30rem] fill-pico-azul/[0.04] motion-safe:animate-deriva md:block" />

      <Contenedor className="grid items-center gap-8 py-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10 md:py-14">
        <div>
          <span className="block h-1 w-10 -skew-x-12 rounded-sm bg-pico-rojo lg:w-14" aria-hidden />
          <h2 id="titulo-banner-calculadoras" className="mt-3 max-w-2xl text-2xl leading-tight font-bold text-balance text-pico-azul md:text-4xl">
            ¿No sabes cuánto material necesitas?
          </h2>
          <p className="mt-2 max-w-xl text-sm text-gris-texto md:text-base">
            Calcula bloques, cemento, cabillas, pintura y más, y llévate todo en un solo pedido.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {PUNTOS.map((punto) => (
              <li key={punto} className="flex items-center gap-2 text-sm font-semibold text-pico-azul">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-chip bg-pico-rojo text-pico-blanco">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
                {punto}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            {/* Botón azul con chevron: el mismo de los banners claros del inicio. */}
            <Link
              href={RUTA_CALCULADORAS}
              className="group grupo-icono inline-flex h-11 w-fit items-center gap-1.5 rounded-boton bg-pico-azul px-5 text-sm font-semibold text-pico-blanco shadow-tarjeta transition duration-200 hover:bg-pico-azul-oscuro hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-0.5 lg:h-12 lg:px-6 lg:text-base"
            >
              <IconoCalculadora className="size-6" />
              Calcular ahora
              <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
            <ul className="flex flex-wrap items-center gap-2" aria-label="Calculadoras más usadas">
              {ACCESOS.map(({ texto, slug }) => (
                <li key={slug}>
                  <Link
                    href={`${RUTA_CALCULADORAS}/${slug}`}
                    className="inline-flex h-8 items-center rounded-chip border border-gris-borde bg-pico-blanco px-3 text-xs font-semibold text-pico-azul shadow-tarjeta transition duration-200 hover:border-pico-azul hover:bg-pico-azul hover:text-pico-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-0.5"
                  >
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lado derecho: la imagen que se pase; si no, fotos de las calculadoras. */}
        {imagen ? (
          <div className="relative hidden h-56 w-80 md:block lg:h-64 lg:w-96">
            <Image src={imagen} alt="" fill sizes="384px" className="object-contain" />
          </div>
        ) : (
          <div className="relative hidden h-60 w-80 md:block lg:h-72 lg:w-[32rem]" aria-hidden>
            {/* Tres fotos de las calculadoras, levemente giradas; se enderezan al pasar el mouse por el banner. */}
            <div className="absolute top-0 right-0 h-36 w-56 overflow-hidden rounded-banner border-4 border-pico-blanco shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:rotate-3 motion-safe:group-hover/banner:rotate-0 lg:h-48 lg:w-80">
              <Image src="/proyectos/bloques.webp" alt="" fill sizes="320px" className="object-cover" />
            </div>
            <div className="absolute bottom-0 left-0 h-32 w-48 overflow-hidden rounded-banner border-4 border-pico-blanco shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:-rotate-3 motion-safe:group-hover/banner:rotate-0 lg:h-44 lg:w-72">
              <Image src="/proyectos/pintura.webp" alt="" fill sizes="288px" className="object-cover" />
            </div>
            <div className="absolute right-4 bottom-1 hidden h-28 w-44 overflow-hidden rounded-banner border-4 border-pico-blanco shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:rotate-2 motion-safe:group-hover/banner:rotate-0 lg:block">
              <Image src="/proyectos/concreto.webp" alt="" fill sizes="176px" className="object-cover" />
            </div>
            <span className="absolute top-1/2 left-1/2 flex size-16 -translate-1/2 items-center justify-center rounded-tarjeta bg-pico-rojo text-pico-blanco shadow-boton-hover ring-4 ring-pico-blanco [--icono-acento:var(--color-pico-blanco)] motion-safe:animate-flotar lg:size-20">
              <IconoCalculadora className="size-10 lg:size-12" />
            </span>
          </div>
        )}
      </Contenedor>
    </section>
  );
}
