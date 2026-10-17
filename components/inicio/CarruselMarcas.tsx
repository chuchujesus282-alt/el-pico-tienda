import Image from "next/image";
import TituloSeccion from "@/components/ui/TituloSeccion";
import type { Marca } from "./contenidoInicio";

type Props = {
  titulo: string;
  marcas: Marca[];
  className?: string;
};

/**
 * Tratamientos tipográficos para las marcas sin logo (wordmarks): cada una con su carácter, en azul
 * apagado; al pasar el mouse toman el azul de marca y su detalle rojo.
 */
const ESTILOS = [
  { texto: "text-[15px] font-bold tracking-[0.22em] uppercase", detalle: "h-[3px] w-6 rounded-sm" },
  { texto: "text-lg font-bold italic tracking-tight", detalle: "size-1.5 rounded-chip" },
  { texto: "text-base font-semibold lowercase tracking-wide", detalle: "h-3 w-[3px] -skew-x-12 rounded-sm" },
  { texto: "text-sm font-bold tracking-[0.3em] uppercase", detalle: "h-[3px] w-3 rounded-sm" },
];

/**
 * Cinta de marcas que avanza sola (marquesina) y se detiene al pasar el mouse. Con "reducir movimiento"
 * queda quieta y se desliza con el dedo o la rueda. Con logo, en gris que se colorea al pasar el mouse.
 */
export default function CarruselMarcas({ titulo, marcas, className = "" }: Props) {
  if (marcas.length === 0) return null;
  // La lista va dos veces seguidas: al llegar a la mitad, la cinta vuelve al inicio sin que se note el salto.
  // Cada marca lleva su espacio a la derecha (no gap): así las dos mitades miden igual y el bucle no salta.
  const cinta = [...marcas, ...marcas];

  return (
    <section className={className}>
      <TituloSeccion titulo={titulo} />
      <div className="group/marcas -mx-[var(--margen-pagina)] overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] motion-reduce:overflow-x-auto md:mx-0">
        <ul
          className="flex w-max py-2 group-hover/marcas:[animation-play-state:paused] motion-safe:animate-marquesina"
          style={{ animationDuration: `${Math.max(marcas.length * 3.5, 24)}s` }}
        >
          {cinta.map((marca, i) => {
            const estilo = ESTILOS[i % marcas.length % ESTILOS.length];
            const copia = i >= marcas.length;
            return (
              <li key={`${marca.nombre}-${i}`} aria-hidden={copia || undefined} className={`w-39 shrink-0 pr-3 md:w-48 md:pr-4 ${copia ? "motion-reduce:hidden" : ""}`}>
                <div className="group relative flex h-20 items-center justify-center overflow-hidden rounded-2xl border border-gris-borde bg-pico-blanco px-4 shadow-tarjeta transition duration-300 ease-(--curva-suave) hover:border-pico-azul/25 hover:shadow-tarjeta-hover motion-safe:hover:-translate-y-1 md:h-24">
                  {marca.logo ? (
                    <Image src={marca.logo} alt={copia ? "" : marca.nombre} fill sizes="176px" className="object-contain p-4 opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0" />
                  ) : (
                    <span className="flex items-center gap-2 text-pico-azul/55 transition-colors duration-300 group-hover:text-pico-azul">
                      <span className={`bg-current transition-colors duration-300 group-hover:bg-pico-rojo ${estilo.detalle}`} aria-hidden />
                      <span className={`line-clamp-1 ${estilo.texto}`}>{marca.nombre}</span>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
