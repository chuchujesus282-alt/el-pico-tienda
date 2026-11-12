import Image from "next/image";
import type { ReactNode } from "react";
import { Montanas } from "@/components/layout/Logo";
import { CALIDAD_BANNER } from "../SenalesProducto";
import { MarcoVertical } from "./Marcos";

// Columnas VERTICALES (fila de cuatro del inicio) con fotos reales, para las categorías que no tienen tarjeta animada
// (persona B, 2026-11-11). Las cuatro pueden salir juntas el mismo día, así que cada una tiene otro fondo y otro gesto
// al pasar el mouse. El producto queda arriba y entero; abajo, el texto sobre el velo del marco.

const SIZES = "(min-width: 1536px) 280px, (min-width: 1024px) 18vw, 40vw";
const MOVER = "transition-[translate,rotate,scale] duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:transition-none";
const SOMBRA = "drop-shadow-xl drop-shadow-pico-azul-oscuro/45";
const FRANJA_OBRA =
  "bg-[repeating-linear-gradient(135deg,var(--color-amarillo-obra)_0,var(--color-amarillo-obra)_10px,var(--color-pico-azul-oscuro)_10px,var(--color-pico-azul-oscuro)_20px)]";

/** Foto centrada arriba, con el ancho en % de la columna. */
function Foto({ src, ancho, alto, className }: { src: string; ancho: number; alto: number; className: string }) {
  return (
    <span className={`absolute ${MOVER} ${className}`}>
      <Image src={src} alt="" width={ancho} height={alto} sizes={SIZES} quality={CALIDAD_BANNER} className={`h-auto w-full ${SOMBRA}`} />
    </span>
  );
}

/** Construcción: concreto arriba, cinta de precaución en diagonal y la paleta de bloques flotando. */
function Construccion() {
  return (
    <MarcoVertical
      slug="construccion"
      fondo="bg-pico-azul-oscuro"
      escena={
        <>
          <span className="absolute inset-x-0 top-0 h-[64%] overflow-hidden">
            <Image src="/banners/construccion/concreto-hd.webp" alt="" fill sizes={SIZES} quality={CALIDAD_BANNER} className="object-cover" />
            <span className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-pico-azul-oscuro" />
          </span>
          <span className={`absolute top-[58%] -left-[10%] h-3.5 w-[120%] -rotate-6 shadow-tarjeta ${FRANJA_OBRA}`} />
          <span className="absolute top-[8%] left-1/2 w-[74%] -translate-x-1/2 motion-safe:animate-levitar">
            <Foto
              src="/banners/construccion/paleta-bloques.webp"
              ancho={820}
              alto={813}
              className="relative! block group-hover:scale-105"
            />
          </span>
        </>
      }
    />
  );
}

/** Herramientas: placa amarilla de obra con el taladro (que se endereza al pasar el mouse) y el juego de llaves. */
function Herramientas() {
  return (
    <MarcoVertical
      slug="herramientas"
      fondo="bg-gradient-to-b from-amarillo-obra via-amarillo-obra-oscuro to-pico-azul-oscuro"
      escena={
        <>
          <Montanas className="absolute top-[18%] -right-6 w-[120%] fill-pico-azul/[0.08]" />
          <span className="absolute top-[12%] left-1/2 aspect-square w-[80%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_62%)] opacity-45" />
          <Foto
            src="/banners/categorias/llaves-torx.webp"
            ancho={545}
            alto={900}
            className="top-[16%] right-[6%] w-[30%] rotate-[14deg] group-hover:rotate-[22deg]"
          />
          <Foto
            src="/herramientas/taladro.webp"
            ancho={515}
            alto={640}
            className="top-[7%] left-[10%] w-[58%] -rotate-[12deg] group-hover:rotate-0"
          />
        </>
      }
    />
  );
}

/** Pinturas: pintura terracota que chorrea desde arriba (al pasar el mouse, chorrea más) sobre su lata. */
function Pinturas() {
  const gotas = [
    { left: "8%", ancho: "9%", alto: "14%" },
    { left: "24%", ancho: "7%", alto: "24%" },
    { left: "44%", ancho: "10%", alto: "10%" },
    { left: "66%", ancho: "7%", alto: "20%" },
    { left: "84%", ancho: "9%", alto: "12%" },
  ];
  return (
    <MarcoVertical
      slug="pinturas"
      fondo="bg-gradient-to-b from-pico-azul to-pico-azul-oscuro"
      escena={
        <>
          <span className="absolute inset-x-0 top-0 h-[12%] bg-pintura-terracota" />
          {gotas.map((g) => (
            <span
              key={g.left}
              className="absolute top-[11%] origin-top rounded-b-full bg-pintura-terracota transition-transform duration-700 ease-out group-hover:scale-y-150 motion-reduce:transition-none"
              style={{ left: g.left, width: g.ancho, height: g.alto }}
            />
          ))}
          <Foto
            src="/banners/pinturas/lata-terracota.webp"
            ancho={699}
            alto={700}
            className="top-[24%] left-1/2 w-[70%] -translate-x-1/2 group-hover:-translate-y-1.5"
          />
        </>
      }
    />
  );
}

/** Cerrajería: placa de acero claro con el candado colgado de su cordón, que se mece al pasar el mouse. */
function Cerrajeria() {
  return (
    <MarcoVertical
      slug="cerrajeria"
      fondo="bg-gradient-to-br from-pico-blanco via-pico-azul-claro to-gris-fondo"
      escena={
        <>
          <span className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_3px,rgb(255_255_255/0.45)_3px,rgb(255_255_255/0.45)_4px)] opacity-60" />
          <Montanas className="absolute top-[20%] -right-6 w-[120%] fill-pico-azul/[0.06]" />
          {/* Cordón rojo hasta el arco (el arco está al 42 % del candado: 21 % + 0,42 × 62 % ≈ 47 %). */}
          <span className="absolute top-0 left-[47%] h-[10%] w-0.5 bg-pico-rojo" />
          <span className={`absolute top-[8%] left-[21%] w-[62%] origin-[42%_0] -rotate-[4deg] group-hover:rotate-[5deg] ${MOVER}`}>
            <Image
              src="/banners/cerrajeria/candado-laton.webp"
              alt=""
              width={777}
              height={859}
              sizes={SIZES}
              quality={CALIDAD_BANNER}
              className={`h-auto w-full ${SOMBRA}`}
            />
          </span>
        </>
      }
    />
  );
}

export const verticalesCategoria: Record<string, () => ReactNode> = {
  construccion: Construccion,
  herramientas: Herramientas,
  pinturas: Pinturas,
  cerrajeria: Cerrajeria,
};
