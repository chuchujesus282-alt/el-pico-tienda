"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

// PRUEBA (rama `prueba/animacion-herramientas`): herramientas reales que asoman por los cuatro bordes del
// banner "Herramientas que rinden" del carrusel, alrededor de un rotomartillo real que flota a la derecha (en lugar
// del taladro de línea), sobre una cuadrícula tenue y un resplandor rojo. Solo la monta BannerInicio cuando
// banner.id === "herramientas".
// Fotos generadas con Higgsfield (GPT Image 2.5), sin fondo, en public/herramientas/ (ver CREDITOS.md).
//
// - Escritorio: entran al pasar el cursor (group-hover del enlace del banner), una tras otra con un rebote
//   suave; se mecen mientras el cursor sigue encima y vuelven a salir al quitarlo. El carrusel ya se pausa solo
//   con el cursor encima.
// - Celular (sin hover): entran UNA sola vez cuando el banner se ve en pantalla y se quedan asomadas; el toque
//   sigue llevando a la categoría. En el celular solo salen las marcadas `movil`.
// - Movimiento reducido: aparecen ya en su sitio, sin desplazarse ni mecerse.
// - Las fotos no se descargan hasta que el banner se ve en pantalla.

type Borde = "arriba" | "abajo" | "izquierda" | "derecha";

/** Tamaño real de cada foto (para next/image): el lado mayor mide 600 px. */
const FOTOS = {
  taladro: [462, 600],
  martillo: [600, 415],
  "llave-ajustable": [600, 352],
  destornillador: [600, 371],
  serrucho: [600, 396],
  "cinta-metrica": [600, 499],
  alicate: [256, 600],
  esmeril: [600, 308],
  nivel: [600, 264],
  rodillo: [600, 494],
  brocha: [600, 469],
  palustre: [600, 516],
  cuter: [600, 347],
  "llave-tubo": [600, 564],
  "caja-herramientas": [600, 414],
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

// El texto va a la izquierda y el rotomartillo flota a la derecha (ocupa ~58–92% del ancho). Las herramientas
// lo enmarcan desde las esquinas y llenan el hueco entre el texto y él, sin taparlo; las del borde izquierdo
// asoman poco, van al fondo y quedan bajo el velo que protege el texto.
const PIEZAS: Pieza[] = [
  { foto: "serrucho", borde: "arriba", en: 96, tam: 250, giro: -146, asoma: 0.4, movil: true },
  { foto: "caja-herramientas", borde: "abajo", en: 62, tam: 240, giro: -6, asoma: 0.32, movil: true },
  { foto: "taladro", borde: "arriba", en: 48, tam: 210, giro: 168, asoma: 0.38 },
  { foto: "esmeril", borde: "derecha", en: 16, tam: 230, giro: -24, asoma: 0.28 },
  { foto: "llave-tubo", borde: "abajo", en: 46, tam: 210, giro: 26, asoma: 0.34, movil: true },
  { foto: "martillo", borde: "derecha", en: 76, tam: 220, giro: 205, asoma: 0.3 },
  { foto: "cinta-metrica", borde: "abajo", en: 6, tam: 170, giro: 14, asoma: 0.4, movil: true },
  { foto: "palustre", borde: "izquierda", en: 86, tam: 175, giro: -30, asoma: 0.32 },
  { foto: "destornillador", borde: "abajo", en: 34, tam: 165, giro: -62, asoma: 0.3, fondo: true },
  { foto: "llave-ajustable", borde: "izquierda", en: 14, tam: 170, giro: 32, asoma: 0.3, fondo: true },
  { foto: "rodillo", borde: "arriba", en: 30, tam: 160, giro: 150, asoma: 0.4, fondo: true },
  { foto: "alicate", borde: "abajo", en: 20, tam: 150, giro: 16, asoma: 0.32, fondo: true },
  { foto: "cuter", borde: "arriba", en: 60, tam: 150, giro: 200, asoma: 0.3, fondo: true },
  { foto: "brocha", borde: "arriba", en: 10, tam: 155, giro: 140, asoma: 0.36, fondo: true },
  { foto: "nivel", borde: "abajo", en: 88, tam: 190, giro: -12, asoma: 0.28, fondo: true },
];

const RETRASO_MS = 55;

/** Transformación fuera del banner (escondida) y asomada, según el borde por el que entra. */
function transformaciones({ borde, giro, asoma }: Pieza) {
  const dentro = `${((1 - asoma) * 100).toFixed(1)}%`;
  const r = `rotate(${giro}deg)`;
  switch (borde) {
    case "arriba":
      return { fuera: `translate(-50%, -150%) ${r}`, asomada: `translate(-50%, -${dentro}) ${r}` };
    case "abajo":
      return { fuera: `translate(-50%, 150%) ${r}`, asomada: `translate(-50%, ${dentro}) ${r}` };
    case "izquierda":
      return { fuera: `translate(-150%, -50%) ${r}`, asomada: `translate(-${dentro}, -50%) ${r}` };
    case "derecha":
      return { fuera: `translate(150%, -50%) ${r}`, asomada: `translate(${dentro}, -50%) ${r}` };
  }
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
      {/* Fondo de taller: cuadrícula técnica muy tenue que se desvanece hacia el texto y un resplandor rojo
          detrás del rotomartillo. Se ven siempre (también en reposo). */}
      <div className="absolute inset-0 bg-[linear-gradient(var(--color-pico-blanco)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-blanco)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.05] [mask-image:linear-gradient(to_left,black_25%,transparent_75%)]" />
      <div className="absolute top-1/2 right-[27%] aspect-square w-[min(62%,40rem)] translate-x-1/2 -translate-y-1/2 rounded-chip bg-[radial-gradient(circle,var(--color-pico-rojo)_0%,transparent_62%)] opacity-35 transition-opacity duration-700 group-hover:opacity-55 md:right-[24%] md:w-[min(48%,40rem)]" />

      {visible &&
        PIEZAS.map((pieza, i) => {
          const [ancho, alto] = FOTOS[pieza.foto];
          const { fuera, asomada } = transformaciones(pieza);
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
              // Escondida fuera del borde; al pasar el cursor (o en celular, al verse) entra con rebote suave y su retraso.
              // Al salir, todas a la vez y sin rebote. Con movimiento reducido solo aparece, ya en su sitio.
              className={`absolute block opacity-0 [transform:var(--fuera)] transition-[transform,opacity] duration-500 ease-in [transition-delay:0ms] group-hover:opacity-100 group-hover:[transform:var(--asomada)] group-hover:duration-700 group-hover:ease-[cubic-bezier(0.34,1.45,0.64,1)] group-hover:[transition-delay:var(--retraso)] group-data-[asomadas=si]/capa:opacity-100 group-data-[asomadas=si]/capa:[transform:var(--asomada)] group-data-[asomadas=si]/capa:duration-700 group-data-[asomadas=si]/capa:ease-[cubic-bezier(0.34,1.45,0.64,1)] group-data-[asomadas=si]/capa:[transition-delay:var(--retraso)] motion-reduce:[transform:var(--asomada)] motion-reduce:transition-opacity motion-reduce:duration-200 ${
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
                  className={`h-auto w-full drop-shadow-lg drop-shadow-pico-azul-oscuro/70 ${pieza.fondo ? "opacity-60 blur-[1.5px]" : ""}`}
                />
              </span>
            </span>
          );
        })}

      {/* Velo azul sobre las herramientas de la izquierda: el título, el texto y el botón siempre se leen. */}
      <div className="absolute inset-y-0 left-0 w-[85%] bg-gradient-to-r from-pico-azul-oscuro/90 via-pico-azul-oscuro/55 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-data-[asomadas=si]/capa:opacity-100 md:w-[65%]" />

      {/* Protagonista: un rotomartillo real que flota a la derecha (reemplaza al taladro de línea). Se ve siempre;
          al pasar el cursor crece un poco y se inclina, mientras las demás herramientas asoman alrededor. */}
      <div className="absolute top-1/2 right-[3%] w-[36%] max-w-[28rem] -translate-y-1/2 transition-transform duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] group-hover:scale-105 group-hover:-rotate-3 motion-reduce:transition-none md:right-[2%] md:w-[30%] lg:right-[8%]">
        <span className="block motion-safe:animate-flotar" style={{ animationDuration: "7s" }}>
          <Image
            src="/herramientas/rotomartillo.webp"
            alt=""
            width={900}
            height={757}
            sizes="(min-width: 1536px) 448px, (min-width: 768px) 30vw, 36vw"
            className="h-auto w-full drop-shadow-2xl drop-shadow-pico-azul-oscuro"
          />
        </span>
        {/* Sombra en el "piso", para que se note que flota. */}
        <span className="absolute -bottom-[8%] left-1/2 -z-10 h-[9%] w-[55%] -translate-x-1/2 rounded-chip bg-pico-azul-oscuro/80 blur-xl" />
      </div>
    </div>
  );
}
