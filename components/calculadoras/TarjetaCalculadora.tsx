import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Calculadora } from "@/lib/calculadoras/tipos";

/** Tarjeta del listado de calculadoras: toda la tarjeta es el enlace. */
export default function TarjetaCalculadora({ calculadora }: { calculadora: Calculadora }) {
  const Icono = calculadora.icono;
  return (
    <Link
      href={`/calculadoras/${calculadora.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-tarjeta border border-gris-borde bg-pico-blanco p-5 shadow-tarjeta transition duration-300 hover:border-pico-azul/20 hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-1"
    >
      <span className="absolute inset-x-5 top-0 h-[3px] origin-center scale-x-0 rounded-b-sm bg-pico-rojo transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
      {/* Ícono grande y tenue de fondo, como en los banners. */}
      <Icono
        className="pointer-events-none absolute -right-5 -bottom-6 size-32 text-pico-azul/[0.05] transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-12"
        strokeWidth={1.25}
        aria-hidden
      />
      <span className="flex size-12 items-center justify-center rounded-tarjeta bg-gradient-to-br from-pico-azul to-pico-azul-oscuro text-pico-blanco shadow-tarjeta transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:-rotate-6">
        <Icono className="size-6 motion-safe:group-hover:animate-sacudir" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="relative mt-4 font-titulo text-lg leading-tight font-bold text-pico-azul">{calculadora.titulo}</h2>
      <p className="relative mt-1.5 flex-1 text-sm leading-snug text-gris-texto">{calculadora.descripcion}</p>
      {/* Es un span y no <Boton>: toda la tarjeta ya es un enlace. Misma forma que Boton. */}
      <span className="relative mt-4 inline-flex h-10 w-fit items-center gap-1.5 rounded-boton bg-pico-rojo px-4 text-sm font-semibold text-pico-blanco transition duration-200 group-hover:bg-pico-rojo-oscuro group-hover:shadow-boton-hover">
        Calcular
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}
