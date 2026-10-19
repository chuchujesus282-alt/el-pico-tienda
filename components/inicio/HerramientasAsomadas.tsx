"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Montanas } from "@/components/layout/Logo";
import type { CSSProperties } from "react";

// Herramientas reales que asoman por los cuatro bordes del
// banner "Herramientas que rinden" del carrusel, alrededor de un rotomartillo real que flota a la derecha (en lugar
// del taladro de línea), sobre una cuadrícula tenue y un resplandor rojo. Solo la monta BannerInicio cuando
// banner.id === "herramientas".
// Fotos HD generadas con Higgsfield (GPT Image 2.5, calidad alta, 2K, fondo transparente) en public/herramientas/.
//
// - Escritorio: entran al pasar el cursor (group-hover del enlace del banner), una tras otra con un rebote
//   suave; se mecen mientras el cursor sigue encima y vuelven a salir al quitarlo. El carrusel ya se pausa solo
//   con el cursor encima.
// - Celular (sin hover): entran UNA sola vez cuando el banner se ve en pantalla y se quedan asomadas; el toque
//   sigue llevando a la categoría. En el celular solo salen las marcadas `movil`.
// - Movimiento reducido: aparecen ya en su sitio, sin desplazarse ni mecerse.
// - Las fotos no se descargan hasta que el banner se ve en pantalla.

type Borde = "arriba" | "abajo" | "izquierda" | "derecha";

/** Tamaño real de cada foto (para next/image): HD, el lado mayor mide 640 px. */
const FOTOS = {
  taladro: [515, 640],
  martillo: [640, 602],
  "llave-ajustable": [640, 606],
  destornillador: [640, 575],
  serrucho: [640, 507],
  "cinta-metrica": [640, 519],
  alicate: [236, 640],
  esmeril: [640, 308],
  nivel: [640, 580],
  rodillo: [563, 640],
  brocha: [635, 640],
  palustre: [640, 587],
  cuter: [640, 532],
  "llave-tubo": [640, 611],
  "caja-herramientas": [640, 455],
} as const;

type Pieza = {
  foto: keyof typeof FOTOS;
  borde: Borde;
  /** Posición a lo largo del borde, en % (de izquierda a derecha, o de arriba abajo). */
  en: number;
  /** Ancho en escritorio, en px (en tableta y celular se reduce con --escala). */
  tam: number;
  giro: number;
  /** Fracción de la herramienta que queda dentro del banner (0–1). */
  asoma: number;
  /** Más pequeña, desenfocada y tenue para dar profundidad. */
  fondo?: boolean;
  /** También sale en el celular (ahí solo van unas pocas, para no tapar el título ni el rotomartillo). */
  movil?: boolean;
};

// Distribución por ZONAS, para que ninguna herramienta toque a otra, al texto, a la franja ni al rotomartillo:
// - Abajo a la izquierda (0–46%, bajo el botón): tres piezas separadas al menos su ancho.
// - Arriba a la izquierda (0–46%): tres piezas que asoman poco, para no bajar hasta el título.
// - Borde izquierdo: dos piezas de fondo bajo el velo que protege el texto.
// - Lado amarillo: solo la caja abajo (entre la franja, que empieza en el 52%, y la empuñadura) y el esmeril en el
//   borde derecho arriba. Encima del rotomartillo y junto a sus etiquetas (Mandril, Empuñadura, Batería) no va nada.
// Si agregas una pieza, búscale una zona libre: nunca encima de otra.
const PIEZAS: Pieza[] = [
  { foto: "cinta-metrica", borde: "abajo", en: 6, tam: 170, giro: 14, asoma: 0.4, movil: true },
  { foto: "destornillador", borde: "abajo", en: 20, tam: 165, giro: -62, asoma: 0.3, fondo: true },
  { foto: "llave-tubo", borde: "abajo", en: 37, tam: 210, giro: 26, asoma: 0.34, movil: true },
  { foto: "caja-herramientas", borde: "abajo", en: 69, tam: 240, giro: -6, asoma: 0.32, movil: true },
  { foto: "brocha", borde: "arriba", en: 6, tam: 155, giro: 140, asoma: 0.3, fondo: true },
  { foto: "taladro", borde: "arriba", en: 22, tam: 210, giro: 168, asoma: 0.25 },
  { foto: "rodillo", borde: "arriba", en: 40, tam: 160, giro: 150, asoma: 0.3, fondo: true },
  { foto: "llave-ajustable", borde: "izquierda", en: 18, tam: 170, giro: 32, asoma: 0.3, fondo: true },
  { foto: "palustre", borde: "izquierda", en: 60, tam: 175, giro: -30, asoma: 0.3 },
  { foto: "esmeril", borde: "derecha", en: 18, tam: 230, giro: -24, asoma: 0.28 },
];
const COLUMNA = { izquierda: 2, derecha: 104 };

const RETRASO_MS = 28;

/**
 * Partes del rotomartillo que se señalan al pasar el cursor. x/y: el punto, en % de su imagen. columna: dónde
 * termina la línea y empieza la etiqueta (las de un mismo lado comparten columna, así quedan alineadas).
 */
const SENALES: { texto: string; x: number; y: number; lado: "izquierda" | "derecha" }[] = [
  // Medidos sobre rotomartillo.webp (900×757). El mandril va un poco bajo su centro para que la línea no roce la broca.
  { texto: "Mandril SDS", x: 43, y: 17, lado: "izquierda" },
  { texto: "Empuñadura auxiliar", x: 45, y: 58, lado: "izquierda" },
  { texto: "Batería", x: 77, y: 89, lado: "derecha" },
];

/**
 * Transformación fuera del banner (escondida) y asomada, según el borde por el que entra. Afuera va más
 * pequeña y girada de más: al entrar "se clava" en su sitio con un giro corto, no solo se desliza.
 */
function transformaciones({ borde, giro, asoma }: Pieza, i: number) {
  const dentro = `${((1 - asoma) * 100).toFixed(1)}%`;
  const r = `rotate(${giro}deg)`;
  const rFuera = `rotate(${giro + (i % 2 ? 38 : -38)}deg) scale(0.7)`;
  switch (borde) {
    case "arriba":
      return { fuera: `translate(-50%, -150%) ${rFuera}`, asomada: `translate(-50%, -${dentro}) ${r}` };
    case "abajo":
      return { fuera: `translate(-50%, 150%) ${rFuera}`, asomada: `translate(-50%, ${dentro}) ${r}` };
    case "izquierda":
      return { fuera: `translate(-150%, -50%) ${rFuera}`, asomada: `translate(-${dentro}, -50%) ${r}` };
    case "derecha":
      return { fuera: `translate(150%, -50%) ${rFuera}`, asomada: `translate(${dentro}, -50%) ${r}` };
  }
}

// Cuadrícula técnica (plano de taller). Escrita completa para que Tailwind la encuentre.
const CUADRICULA_BLANCA =
  "bg-[linear-gradient(var(--color-pico-blanco)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-blanco)_1px,transparent_1px)] bg-[size:40px_40px]";
const CUADRICULA_AZUL =
  "bg-[linear-gradient(var(--color-pico-azul)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-azul)_1px,transparent_1px)] bg-[size:40px_40px]";

/**
 * Fondo de taller: azul marino para el texto y, cortada en diagonal con el ángulo del filete de la marca, una
 * placa AMARILLO INDUSTRIAL (el color de la señalización de obra) donde el rojo de las herramientas salta a la
 * vista. El corte lleva una franja de seguridad amarilla y azul marino, como la cinta de "precaución".
 */
function FondoTaller() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro">
      <div className={`absolute inset-0 opacity-[0.05] ${CUADRICULA_BLANCA} [mask-image:linear-gradient(to_right,black_10%,transparent_55%)]`} />
      <div className="absolute -inset-y-6 -right-24 left-[62%] origin-bottom -skew-x-12 overflow-hidden bg-gradient-to-br from-amarillo-obra via-amarillo-obra to-amarillo-obra-oscuro shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] md:left-[57%] xl:left-[52%]">
        <div className={`absolute inset-0 skew-x-12 opacity-[0.09] ${CUADRICULA_AZUL}`} />
        <Montanas className="absolute -right-6 -bottom-10 w-[115%] skew-x-12 fill-pico-azul/[0.07]" />
        {/* Luz suave detrás del rotomartillo. */}
        <div className="absolute top-1/2 left-[45%] aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 skew-x-12 rounded-chip bg-[radial-gradient(circle,var(--color-pico-blanco)_0%,transparent_60%)] opacity-40" />
      </div>
      {/* Franja de seguridad en el corte. */}
      <div className="absolute -inset-y-6 left-[calc(62%-1.4rem)] w-[1.4rem] origin-bottom -skew-x-12 bg-[repeating-linear-gradient(135deg,var(--color-amarillo-obra)_0,var(--color-amarillo-obra)_10px,var(--color-pico-azul-oscuro)_10px,var(--color-pico-azul-oscuro)_20px)] shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] md:left-[calc(57%-1.4rem)] xl:left-[calc(52%-1.4rem)]" />
    </div>
  );
}

function posicion({ borde, en }: Pieza): CSSProperties {
  if (borde === "arriba") return { top: 0, left: `${en}%` };
  if (borde === "abajo") return { bottom: 0, left: `${en}%` };
  if (borde === "izquierda") return { left: 0, top: `${en}%` };
  return { right: 0, top: `${en}%` };
}

export default function HerramientasAsomadas() {
  const capa = useRef<HTMLDivElement>(null);
  // visible: el banner ya se vio en pantalla (se descargan las fotos). asomadas: en celular, entran solas una vez.
  const [visible, setVisible] = useState(false);
  const [asomadas, setAsomadas] = useState(false);

  useEffect(() => {
    const el = capa.current;
    if (!el) return;
    // El carrusel recorta con overflow:hidden: un banner que no es el actual no cuenta como visible.
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setVisible(true);
        if (window.matchMedia("(hover: none)").matches) {
          setAsomadas(true);
          observador.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={capa}
      data-asomadas={asomadas ? "si" : undefined}
      className="group/capa pointer-events-none absolute inset-0 [--escala:0.45] md:[--escala:0.62] lg:[--escala:0.8] xl:[--escala:0.92] 2xl:[--escala:1]"
      aria-hidden
    >
      <FondoTaller />

      {visible &&
        PIEZAS.map((pieza, i) => {
          const [ancho, alto] = FOTOS[pieza.foto];
          const { fuera, asomada } = transformaciones(pieza, i);
          return (
            <span
              key={pieza.foto}
              style={
                {
                  ...posicion(pieza),
                  width: `calc(${pieza.tam}px * var(--escala))`,
                  "--fuera": fuera,
                  "--asomada": asomada,
                  "--retraso": `${i * RETRASO_MS}ms`,
                } as CSSProperties
              }
              // Escondida fuera del borde; al pasar el cursor (o en celular, al verse) entra rápido, girando y con un
              // rebote corto, una tras otra. Al salir, todas a la vez. Con movimiento reducido solo aparece en su sitio.
              className={`absolute block opacity-0 [transform:var(--fuera)] transition-[transform,opacity] duration-250 ease-in [transition-delay:0ms] group-hover:opacity-100 group-hover:[transform:var(--asomada)] group-hover:duration-450 group-hover:ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:[transition-delay:var(--retraso)] group-data-[asomadas=si]/capa:opacity-100 group-data-[asomadas=si]/capa:[transform:var(--asomada)] group-data-[asomadas=si]/capa:duration-450 group-data-[asomadas=si]/capa:ease-[cubic-bezier(0.34,1.56,0.64,1)] group-data-[asomadas=si]/capa:[transition-delay:var(--retraso)] motion-reduce:[transform:var(--asomada)] motion-reduce:transition-opacity motion-reduce:duration-200 ${
                pieza.movil ? "" : "hidden md:block"
              }`}
            >
              {/* Vaivén muy suave mientras están asomadas (pausado cuando están escondidas). */}
              <span
                className="block [animation-play-state:paused] group-hover:[animation-play-state:running] group-data-[asomadas=si]/capa:[animation-play-state:running] motion-safe:animate-flotar"
                style={{ animationDelay: `-${(i * 0.7).toFixed(1)}s`, animationDuration: `${5 + (i % 4)}s` }}
              >
                <Image
                  src={`/herramientas/${pieza.foto}.webp`}
                  alt=""
                  width={ancho}
                  height={alto}
                  sizes={`(min-width: 1536px) ${pieza.tam}px, (min-width: 1280px) ${Math.round(pieza.tam * 0.92)}px, (min-width: 1024px) ${Math.round(pieza.tam * 0.8)}px, (min-width: 768px) ${Math.round(pieza.tam * 0.62)}px, ${Math.round(pieza.tam * 0.45)}px`}
                  className={`h-auto w-full drop-shadow-xl drop-shadow-pico-azul-oscuro/60 ${pieza.fondo ? "opacity-85 blur-[1px]" : ""}`}
                />
              </span>
            </span>
          );
        })}

      {/* Velo azul sobre las herramientas de la izquierda: el título, el texto y el botón siempre se leen. */}
      <div className="absolute inset-y-0 left-0 w-[80%] bg-gradient-to-r from-pico-azul-oscuro/80 via-pico-azul-oscuro/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-data-[asomadas=si]/capa:opacity-100 md:w-[52%]" />

      {/* Protagonista: un rotomartillo real que flota a la derecha (reemplaza al taladro de línea). Se ve siempre;
          al pasar el cursor crece un poco mientras las demás herramientas asoman alrededor. Flota solo en vertical
          y los señaladores van DENTRO de lo que flota: así los puntos no se despegan de las piezas. */}
      <div className="absolute top-1/2 right-[3%] w-[36%] max-w-[28rem] -translate-y-1/2 transition-transform duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] group-hover:scale-[1.04] motion-reduce:transition-none md:right-[2%] md:w-[30%] lg:right-[7%] lg:w-[25%] xl:right-[8%] xl:w-[30%]">
        {/* Sombra en el "piso", para que se note que flota. */}
        <span className="absolute -bottom-[8%] left-1/2 h-[9%] w-[55%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/45 blur-xl" />
        <span className="relative block motion-safe:animate-levitar">
          <Image
            src="/herramientas/rotomartillo.webp"
            alt=""
            width={900}
            height={757}
            sizes="(min-width: 1536px) 448px, (min-width: 768px) 30vw, 36vw"
            className="h-auto w-full drop-shadow-2xl drop-shadow-pico-azul-oscuro/50"
          />
          {/* Ficha técnica: punto rojo sobre la pieza, línea hasta la columna y etiqueta centrada en la línea.
              Solo desde 1280px: más angosto, las etiquetas de la izquierda pisaban el título. */}
          {SENALES.map((s, i) => {
            const izquierda = s.lado === "izquierda";
            const col = COLUMNA[s.lado];
            const retraso = { "--retraso": `${380 + i * 90}ms` } as CSSProperties;
            return (
              <span key={s.texto} className="hidden xl:block" style={retraso}>
                <span
                  className={`absolute h-0.5 -translate-y-1/2 scale-x-0 rounded-chip bg-pico-azul-oscuro transition-transform duration-300 group-hover:scale-x-100 group-hover:[transition-delay:var(--retraso)] motion-reduce:transition-none ${
                    izquierda ? "origin-right" : "origin-left"
                  }`}
                  style={{ top: `${s.y}%`, left: `${Math.min(s.x, col)}%`, width: `${Math.abs(s.x - col)}%` }}
                />
                <span
                  className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-chip border-2 border-pico-blanco bg-pico-rojo shadow-tarjeta transition-transform duration-300 group-hover:scale-100 group-hover:[transition-delay:var(--retraso)] motion-reduce:transition-none"
                  style={{ top: `${s.y}%`, left: `${s.x}%` }}
                />
                <span
                  className="absolute -translate-y-1/2 rounded-chip bg-pico-azul-oscuro px-3 py-1.5 text-[11px] leading-none font-bold tracking-[0.1em] whitespace-nowrap text-pico-blanco uppercase opacity-0 shadow-tarjeta-hover transition-opacity duration-300 group-hover:opacity-100 group-hover:[transition-delay:calc(var(--retraso)+150ms)]"
                  style={izquierda ? { top: `${s.y}%`, right: `${100 - col}%` } : { top: `${s.y}%`, left: `${col}%` }}
                >
                  {s.texto}
                </span>
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
}
