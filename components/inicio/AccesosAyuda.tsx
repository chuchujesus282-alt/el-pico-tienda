import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Revelar from "@/components/ui/Revelar";
import TituloSeccion from "@/components/ui/TituloSeccion";
import { ACCESOS_AYUDA } from "./accesosInicio";

/**
 * "Estamos para ayudarte": tarjetas que llevan a las páginas de ayuda (calculadoras, cómo comprar,
 * ubícanos, horario). Cada una con su número, su ícono en una placa azul marino y una flecha en un
 * círculo que se pone roja al pasar el mouse.
 */
export default function AccesosAyuda() {
  return (
    <section aria-label="Estamos para ayudarte">
      <TituloSeccion titulo="Estamos para ayudarte" subtitulo="Resuelve tus dudas antes de comprar o de venir a la tienda." />
      <ul className="grid gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4">
        {ACCESOS_AYUDA.map(({ titulo, texto, href, icono: Icono }, i) => (
          <li key={href}>
            <Revelar retraso={i * 70} className="h-full">
              <Link
                href={href}
                className="group relative isolate flex h-full flex-col overflow-hidden rounded-tarjeta border border-gris-borde bg-pico-blanco p-5 shadow-tarjeta transition duration-300 hover:border-pico-azul/25 hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-1.5 md:p-6"
              >
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-pico-rojo transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
                {/* Número grande y tenue, como marca de agua. */}
                <span className="pointer-events-none absolute -top-3 right-3 -z-10 font-titulo text-7xl font-bold text-pico-azul/[0.06] transition-colors duration-300 group-hover:text-pico-rojo/10" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex size-12 items-center justify-center rounded-tarjeta bg-gradient-to-br from-pico-azul to-pico-azul-oscuro text-pico-blanco shadow-boton-hover transition-transform duration-300 motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-110 md:size-14">
                  <Icono className="size-6 motion-safe:group-hover:animate-sacudir md:size-7" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="mt-4 block text-lg leading-tight font-bold text-pico-azul">{titulo}</span>
                <span className="mt-1.5 block flex-1 text-sm leading-snug text-gris-texto">{texto}</span>
                <span className="mt-4 flex items-center gap-2 text-sm font-semibold text-pico-azul transition-colors group-hover:text-pico-rojo">
                  Ir ahora
                  <span className="flex size-7 items-center justify-center rounded-chip bg-pico-azul-claro transition duration-300 group-hover:bg-pico-rojo group-hover:text-pico-blanco motion-safe:group-hover:translate-x-1">
                    <ArrowRight className="size-4" aria-hidden />
                  </span>
                </span>
              </Link>
            </Revelar>
          </li>
        ))}
      </ul>
    </section>
  );
}
