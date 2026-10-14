import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Montanas } from "@/components/layout/Logo";
import Revelar from "@/components/ui/Revelar";
import { PROMOCIONES, type Promocion } from "./datosPromociones";

const estilos = {
  azul: {
    fondo: "bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro",
    etiqueta: "text-pico-blanco/70",
    titulo: "text-pico-blanco",
    texto: "text-pico-blanco/80",
    boton: "bg-pico-blanco text-pico-azul hover:bg-pico-azul-claro",
    acceso: "border-pico-blanco/25 text-pico-blanco hover:border-pico-blanco hover:bg-pico-blanco hover:text-pico-azul",
    montanas: "fill-pico-blanco/[0.05]",
    icono: "bg-pico-blanco/10 text-pico-blanco ring-pico-blanco/15",
    foco: "focus-visible:outline-pico-blanco",
  },
  claro: {
    fondo: "bg-gradient-to-br from-pico-azul-claro via-pico-blanco to-pico-azul-claro",
    etiqueta: "text-gris-texto",
    titulo: "text-pico-azul",
    texto: "text-gris-texto",
    boton: "bg-pico-azul text-pico-blanco hover:bg-pico-azul-oscuro",
    acceso: "border-gris-borde bg-pico-blanco text-pico-azul hover:border-pico-azul hover:bg-pico-azul hover:text-pico-blanco",
    montanas: "fill-pico-azul/[0.05]",
    icono: "bg-pico-blanco text-pico-azul ring-gris-borde",
    foco: "focus-visible:outline-pico-azul",
  },
} as const;

function Tarjeta({ promocion }: { promocion: Promocion }) {
  const e = estilos[promocion.variante];
  const Icono = promocion.icono;
  return (
    <article className={`group relative isolate flex h-full overflow-hidden rounded-banner border border-gris-borde shadow-tarjeta transition duration-300 hover:shadow-tarjeta-hover ${e.fondo}`}>
      {/* Montañas del logo, grandes y tenues, de fondo. */}
      <Montanas className={`pointer-events-none absolute -bottom-16 -left-10 -z-10 w-[26rem] motion-safe:animate-deriva ${e.montanas}`} />

      <div className="flex flex-1 flex-col justify-center gap-3 p-6 md:p-8 xl:p-10">
        <div className="flex items-center gap-3">
          <span className={`flex size-10 items-center justify-center rounded-tarjeta ring-1 transition-transform duration-300 motion-safe:group-hover:-rotate-6 ${e.icono}`}>
            <Icono className="size-5 motion-safe:group-hover:animate-sacudir" strokeWidth={1.75} aria-hidden />
          </span>
          <span className={`text-xs font-semibold tracking-[0.2em] uppercase ${e.etiqueta}`}>{promocion.etiqueta}</span>
        </div>
        <span className="h-1 w-10 -skew-x-12 rounded-sm bg-pico-rojo transition-all duration-300 group-hover:w-16" aria-hidden />
        <h3 className={`max-w-sm text-2xl leading-tight font-bold text-balance md:text-3xl ${e.titulo}`}>{promocion.titulo}</h3>
        <p className={`max-w-sm text-sm md:text-base ${e.texto}`}>{promocion.texto}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Link
            href={promocion.href}
            className={`group/boton inline-flex h-11 items-center gap-1 rounded-boton px-5 text-sm font-semibold shadow-tarjeta transition duration-200 hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:-translate-y-0.5 ${e.boton} ${e.foco}`}
          >
            {promocion.textoBoton}
            <ChevronRight className="size-4 transition-transform duration-300 group-hover/boton:translate-x-1" aria-hidden />
          </Link>
          <ul className="flex flex-wrap gap-2" aria-label={`Accesos rápidos de ${promocion.etiqueta}`}>
            {promocion.accesos.map((acceso) => (
              <li key={acceso.href}>
                <Link
                  href={acceso.href}
                  className={`inline-flex h-8 items-center rounded-chip border px-3 text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${e.acceso} ${e.foco}`}
                >
                  {acceso.texto}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Dos fotos de productos, levemente giradas; se enderezan y crecen al pasar el mouse. */}
      <div className="relative hidden w-48 shrink-0 sm:block lg:w-56 xl:w-64" aria-hidden>
        <div className="absolute top-8 right-6 size-32 overflow-hidden rounded-tarjeta border-4 border-pico-blanco bg-pico-blanco shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:rotate-6 motion-safe:group-hover:rotate-0 motion-safe:group-hover:scale-105 lg:size-36 xl:size-40">
          <Image src={promocion.fotos[0]} alt="" fill sizes="160px" className="object-cover" />
        </div>
        <div className="absolute right-24 bottom-8 size-28 overflow-hidden rounded-tarjeta border-4 border-pico-blanco bg-pico-blanco shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:-rotate-6 motion-safe:group-hover:rotate-0 motion-safe:group-hover:scale-105 lg:right-28 lg:size-32 xl:right-32 xl:size-36">
          <Image src={promocion.fotos[1]} alt="" fill sizes="144px" className="object-cover" />
        </div>
      </div>
    </article>
  );
}

/** Los dos avisos grandes del inicio, lado a lado en escritorio. Configuración en datosPromociones.ts. */
export default function Promociones() {
  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      {PROMOCIONES.map((promocion, i) => (
        <Revelar key={promocion.id} retraso={i * 120} className="h-full">
          <Tarjeta promocion={promocion} />
        </Revelar>
      ))}
    </div>
  );
}
