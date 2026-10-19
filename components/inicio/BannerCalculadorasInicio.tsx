import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import IconoCalculadora from "@/components/icons/pico/IconoCalculadora";
import { RUTA_CALCULADORAS } from "@/components/calculadoras/rutas";
import Boton from "@/components/ui/Boton";
import { CALCULADORAS } from "@/lib/calculadoras/registro";

/** Accesos directos a la derecha del banner (slugs de lib/calculadoras/registro.ts). */
const DESTACADAS = ["bloques", "concreto", "pintura"];

/** Ejemplo que se "marca" en la tablilla: lo que sale al calcular un muro de bloques. Solo ilustra. */
const FILAS = [
  { material: "Bloques de concreto 15 cm", cantidad: "94 und" },
  { material: "Cemento gris 42,5 kg", cantidad: "3 sacos" },
  { material: "Arena lavada", cantidad: "0,4 m³" },
  { material: "Cabillas 3/8\"", cantidad: "6 und" },
];

/**
 * Tablilla de obra con la lista de materiales: el ícono `IconoLista` en grande (contorno azul marino, pinza arriba
 * y check rojo que se dibuja). Los checks se marcan en cascada mientras la barra roja avanza, y vuelve a empezar;
 * con "reducir movimiento" queda todo marcado y quieto. Animación en globals.css (`.lista-materiales`).
 */
function TablillaMateriales() {
  return (
    <div className="lista-materiales relative mx-auto w-full max-w-[19rem] py-4 motion-safe:animate-flotar" aria-hidden>
      {/* Placa azul clara detrás, girada al otro lado: le da profundidad a la tablilla. */}
      <div className="absolute inset-x-3 inset-y-1 rotate-3 rounded-[1.75rem] bg-pico-azul-claro transition-transform duration-500 ease-(--curva-suave) group-hover:rotate-6" />

      <div className="relative -rotate-2 rounded-tarjeta border-2 border-pico-azul bg-pico-blanco px-4 pt-7 pb-4 shadow-tarjeta-hover transition-transform duration-500 ease-(--curva-suave) group-hover:rotate-0">
        {/* Pinza de la tablilla. */}
        <div className="absolute -top-4 left-1/2 h-7 w-24 -translate-x-1/2 rounded-boton border-2 border-pico-azul bg-pico-azul-claro">
          <span className="absolute top-1.5 left-1/2 size-2.5 -translate-x-1/2 rounded-chip border-2 border-pico-azul bg-pico-blanco" />
        </div>

        <div className="flex items-baseline justify-between gap-2 border-b-2 border-dashed border-gris-borde pb-2">
          <span className="text-[11px] font-bold tracking-[0.14em] text-pico-azul uppercase">Lista de materiales</span>
          <span className="text-[11px] whitespace-nowrap text-gris-texto">Muro 3 × 2,5 m</span>
        </div>

        <ul className="mt-1 divide-y divide-gris-borde">
          {FILAS.map(({ material, cantidad }, i) => (
            <li
              key={material}
              className="lista-fila flex items-center gap-2.5 rounded-sm px-1 py-2"
              style={{ "--i": i } as CSSProperties}
            >
              <svg viewBox="0 0 20 20" fill="none" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0">
                <rect x="1.5" y="1.5" width="17" height="17" rx="4" strokeWidth="1.75" className="stroke-pico-azul" />
                <path pathLength={1} strokeWidth="2.5" d="M5.5 10.5l3 3 6-6.5" className="lista-check stroke-pico-rojo" />
              </svg>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-texto">{material}</span>
              <span className="text-[13px] font-bold whitespace-nowrap text-pico-azul tabular-nums">{cantidad}</span>
            </li>
          ))}
        </ul>

        {/* pr-12: deja libre la esquina del sello de la calculadora. */}
        <div className="mt-3 pr-12">
          <div className="flex justify-between text-[11px] font-semibold text-gris-texto">
            <span>Listo para tu pedido</span>
            <span className="text-pico-rojo">{FILAS.length}/{FILAS.length}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-chip bg-pico-azul-claro">
            <div className="lista-progreso h-full origin-left rounded-chip bg-pico-rojo" />
          </div>
        </div>
      </div>

      {/* Sello con la calculadora: de ahí sale la lista. */}
      <span className="absolute -right-2 bottom-0 flex size-14 rotate-6 items-center justify-center rounded-chip bg-pico-azul text-pico-blanco shadow-tarjeta-hover ring-4 ring-pico-blanco transition-transform duration-500 ease-(--curva-suave) group-hover:rotate-0">
        <IconoCalculadora className="size-7" />
      </span>
    </div>
  );
}

/**
 * Banner del inicio que lleva a /calculadoras: claro, con una cuadrícula de plano muy tenue, el texto a la izquierda,
 * la tablilla con la lista de materiales animada al centro y accesos a las calculadoras más usadas a la derecha.
 * El de las categorías es components/calculadoras/BannerCalculadoras.
 */
export default function BannerCalculadoras() {
  const destacadas = DESTACADAS.map((slug) => CALCULADORAS.find((c) => c.slug === slug)).filter((c) => c !== undefined);

  return (
    <section
      aria-labelledby="titulo-banner-calculadoras"
      className="group relative isolate overflow-hidden rounded-banner border border-gris-borde bg-pico-blanco shadow-tarjeta"
    >
      <div className="plano-cuadricula pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <div className="grid items-center gap-8 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10 md:p-10 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,15rem)] lg:gap-12 xl:px-14">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-pico-rojo uppercase">Calculadoras de proyectos</p>
          <span className="mt-3 block h-1 w-8 -skew-x-12 rounded-sm bg-pico-rojo transition-all duration-300 group-hover:w-14" aria-hidden />
          <h2 id="titulo-banner-calculadoras" className="mt-2 text-2xl leading-tight font-bold text-pico-azul md:text-4xl">
            Calcula tu proyecto
          </h2>
          <p className="mt-2 max-w-md text-sm text-gris-texto md:text-base">
            Bloques, cemento, cabillas, pintura y más: dinos las medidas, te armamos la lista de materiales y te llevas todo en
            un solo pedido.
          </p>
          <Boton href={RUTA_CALCULADORAS} className="mt-5">
            Ver calculadoras
            <ArrowRight className="size-4 transition-transform duration-300 motion-safe:group-hover/boton:translate-x-1" aria-hidden />
          </Boton>
        </div>

        <TablillaMateriales />

        {destacadas.length > 0 && (
          <div className="md:col-span-2 lg:col-span-1">
            <p className="text-xs font-bold tracking-[0.14em] text-gris-texto uppercase">Las más usadas</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {destacadas.map(({ slug, titulo, icono: Icono }) => (
                <li key={slug}>
                  <Link
                    href={`${RUTA_CALCULADORAS}/${slug}`}
                    className="group/acceso grupo-icono flex items-center gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco/90 p-2.5 transition duration-200 hover:border-pico-azul/30 hover:shadow-tarjeta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-chip bg-pico-azul-claro text-pico-azul transition-colors group-hover/acceso:bg-pico-azul group-hover/acceso:text-pico-blanco group-hover/acceso:[--icono-fondo:var(--color-pico-azul)]">
                      <Icono className="size-6" />
                    </span>
                    <span className="min-w-0 flex-1 text-sm leading-tight font-semibold text-pico-azul">{titulo}</span>
                    <ChevronRight
                      className="size-4 shrink-0 text-gris-texto transition-transform duration-300 group-hover/acceso:translate-x-0.5 group-hover/acceso:text-pico-rojo"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
