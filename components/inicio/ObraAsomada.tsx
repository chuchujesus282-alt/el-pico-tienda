import Image from "next/image";
import { Montanas } from "@/components/layout/Logo";
import SenalesProducto, { type Senal } from "./SenalesProducto";

// Escena del banner "Materiales para construir" del carrusel (persona B, 2026-11-11), igual que HerramientasAsomadas:
// azul marino con el texto y, cortada en diagonal, una placa de CONCRETO (textura real) donde flota una paleta de
// bloques real, entera dentro del banner. Al pasar el cursor crece un poco y señala sus partes (desde 1280px).
// Fotos en public/banners/construccion/ (ver su CREDITOS.md). Solo la monta BannerInicio cuando banner.id === "obra".
// Movimiento reducido: quieto.

// Mismo corte diagonal que la placa de Herramientas (ángulo del filete de la marca).
const PLACA = "left-[62%] md:left-[57%] xl:left-[52%]";
const FRANJA = "left-[calc(62%-1.4rem)] md:left-[calc(57%-1.4rem)] xl:left-[calc(52%-1.4rem)]";

/** Medidos sobre paleta-bloques.webp (820×813). */
const SENALES: Senal[] = [
  { texto: "Flejada", x: 60, y: 22, lado: "izquierda" },
  { texto: "Bloques de concreto", x: 22, y: 50, lado: "izquierda" },
  { texto: "Paleta de madera", x: 30, y: 82, lado: "izquierda" },
];

export default function ObraAsomada() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro">
        <Montanas className="absolute -bottom-16 -left-10 w-[36rem] fill-pico-blanco/[0.04]" />
        {/* Placa de concreto. */}
        <div
          className={`absolute -inset-y-6 -right-24 origin-bottom -skew-x-12 overflow-hidden shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] ${PLACA}`}
        >
          <Image src="/banners/construccion/concreto.webp" alt="" fill sizes="50vw" className="skew-x-12 scale-125 object-cover" />
          {/* Sombra hacia el borde y luz detrás de la paleta, para que el concreto no se vea plano. */}
          <div className="absolute inset-0 bg-gradient-to-r from-pico-azul-oscuro/35 via-transparent to-pico-azul-oscuro/10" />
          <div className="absolute top-1/2 left-[50%] aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 skew-x-12 rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_62%)] opacity-35" />
        </div>
        {/* Franja de seguridad amarilla y azul en el corte, como la cinta de "precaución" de la obra. */}
        <div
          className={`absolute -inset-y-6 w-[1.4rem] origin-bottom -skew-x-12 bg-[repeating-linear-gradient(135deg,var(--color-amarillo-obra)_0,var(--color-amarillo-obra)_10px,var(--color-pico-azul-oscuro)_10px,var(--color-pico-azul-oscuro)_20px)] shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] ${FRANJA}`}
        />
      </div>

      {/* Protagonista: la paleta de bloques, flotando con su sombra; entera dentro del banner. Crece un poco al pasar el
          cursor. Los señaladores van dentro de lo que flota. */}
      <div className="absolute top-1/2 right-[3%] w-[29%] max-w-[22rem] -translate-y-1/2 transition-transform duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] group-hover:scale-[1.04] motion-reduce:transition-none md:right-[6%] md:w-[26%] lg:right-[9%] lg:w-[22%] xl:right-[10%] xl:w-[24%]">
        <span className="absolute -bottom-[7%] left-1/2 h-[8%] w-[70%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/50 blur-xl" />
        <span className="relative block motion-safe:animate-levitar">
          <Image
            src="/banners/construccion/paleta-bloques.webp"
            alt=""
            width={820}
            height={813}
            sizes="(min-width: 1536px) 352px, (min-width: 768px) 26vw, 30vw"
            className="h-auto w-full drop-shadow-2xl drop-shadow-pico-azul-oscuro/50"
          />
          <SenalesProducto senales={SENALES} />
        </span>
      </div>
    </div>
  );
}
