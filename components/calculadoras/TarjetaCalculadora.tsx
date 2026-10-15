import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Calculadora } from "@/lib/calculadoras/tipos";

/** Tarjeta del listado de calculadoras: foto del trabajo arriba y toda la tarjeta es el enlace. */
export default function TarjetaCalculadora({ calculadora, prioritaria = false }: { calculadora: Calculadora; prioritaria?: boolean }) {
  const Icono = calculadora.icono;
  return (
    <Link
      href={`/calculadoras/${calculadora.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-tarjeta border border-gris-borde bg-pico-blanco shadow-tarjeta transition duration-300 hover:border-pico-azul/20 hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-1"
    >
      {/* Foto de alguien haciendo ese trabajo; sin foto, fondo azul con el ícono grande. */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-pico-azul to-pico-azul-oscuro">
        {calculadora.imagen ? (
          <Image
            src={calculadora.imagen}
            alt=""
            fill
            loading={prioritaria ? "eager" : undefined}
            fetchPriority={prioritaria ? "high" : undefined}
            sizes="(min-width: 1280px) 330px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
          />
        ) : (
          <Icono className="absolute top-1/2 left-1/2 size-20 -translate-1/2 text-pico-blanco/20" strokeWidth={1.25} aria-hidden />
        )}
        <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-pico-rojo transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
      </div>

      <div className="relative flex flex-1 flex-col p-5 pt-8">
        <span className="absolute -top-6 left-5 flex size-12 items-center justify-center rounded-tarjeta bg-gradient-to-br from-pico-azul to-pico-azul-oscuro text-pico-blanco shadow-tarjeta ring-2 ring-pico-blanco transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:-rotate-6">
          <Icono className="size-6 motion-safe:group-hover:animate-sacudir" strokeWidth={1.75} aria-hidden />
        </span>
        <h2 className="text-lg leading-tight font-bold text-pico-azul">{calculadora.titulo}</h2>
        <p className="mt-1.5 flex-1 text-sm leading-snug text-gris-texto">{calculadora.descripcion}</p>
        {/* Es un span y no <Boton>: toda la tarjeta ya es un enlace. Misma forma que Boton. */}
        <span className="mt-4 inline-flex h-10 w-fit items-center gap-1.5 rounded-boton bg-pico-rojo px-4 text-sm font-semibold text-pico-blanco transition duration-200 group-hover:bg-pico-rojo-oscuro group-hover:shadow-boton-hover">
          Calcular
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
