import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PlacaIcono from "@/components/icons/pico/PlacaIcono";
import Plano from "@/components/icons/pico/Plano";
import type { Calculadora } from "@/lib/calculadoras/tipos";

/** Tarjeta del listado de calculadoras: foto del trabajo arriba y toda la tarjeta es el enlace. */
export default function TarjetaCalculadora({ calculadora, prioritaria = false }: { calculadora: Calculadora; prioritaria?: boolean }) {
  const Icono = calculadora.icono;
  return (
    <Link
      href={`/calculadoras/${calculadora.slug}`}
      className="group grupo-icono relative flex h-full flex-col overflow-hidden rounded-tarjeta border border-gris-borde bg-pico-blanco shadow-tarjeta transition duration-300 hover:border-pico-azul/20 hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-1"
    >
      {/* Foto de alguien haciendo ese trabajo; sin foto, fondo azul con el plano del ícono. */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-pico-azul to-pico-azul-oscuro">
        {calculadora.imagen ? (
          <Image
            src={calculadora.imagen}
            alt=""
            fill
            loading={prioritaria ? "eager" : undefined}
            fetchPriority={prioritaria ? "high" : undefined}
            sizes="(min-width: 1280px) 330px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1400ms] ease-(--curva-suave) motion-safe:group-hover:scale-[1.07]"
          />
        ) : (
          <Plano Icono={Icono} className="absolute top-1/2 left-1/2 w-36 -translate-1/2" />
        )}
        <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-pico-rojo transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
      </div>

      <div className="relative flex flex-1 flex-col p-5 pt-8">
        {/* Placa oscura del ícono sobre el borde de la foto; sube un poco al pasar el mouse y el ícono hace su animación. */}
        <span className="absolute -top-7 left-5 rounded-xl ring-[3px] ring-pico-blanco transition-transform duration-500 ease-(--curva-suave) motion-safe:group-hover:-translate-y-1">
          <PlacaIcono tono="oscuro">
            <Icono />
          </PlacaIcono>
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
