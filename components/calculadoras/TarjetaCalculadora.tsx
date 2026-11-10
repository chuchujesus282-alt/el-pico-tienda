import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Calculadora } from "@/lib/calculadoras/tipos";

/**
 * Tarjeta del listado de calculadoras, con la misma estética de los paneles de Mi cuenta (pedido de persona B): panel
 * blanco sin foto, el ícono en su placa azul clara, el título, una línea y la flecha. Toda la tarjeta es el enlace.
 */
export default function TarjetaCalculadora({ calculadora }: { calculadora: Calculadora; prioritaria?: boolean }) {
  const Icono = calculadora.icono;
  return (
    <Link
      href={`/calculadoras/${calculadora.slug}`}
      className="group grupo-icono flex h-full items-center gap-4 rounded-tarjeta bg-pico-blanco p-4 shadow-tarjeta transition duration-200 hover:bg-pico-azul-claro hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul md:p-5"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-pico-azul-claro text-pico-azul transition-colors duration-300 group-hover:bg-pico-blanco">
        <Icono className="size-7" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block leading-tight font-bold text-pico-azul">{calculadora.titulo}</span>
        <span className="mt-1 block text-[13px] leading-snug text-gris-texto">{calculadora.descripcion}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-gris-texto transition-transform group-hover:translate-x-0.5 group-hover:text-pico-azul" aria-hidden />
    </Link>
  );
}
