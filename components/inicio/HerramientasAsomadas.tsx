"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Montanas } from "@/components/layout/Logo";
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

const RETRASO_MS = 28;

/** Partes del rotomartillo que se señalan al pasar el cursor (posición en % de su imagen). */
const SENALES: { texto: string; x: number; y: number; lado: "izquierda" | "derecha" }[] = [
  { texto: "Mandril SDS", x: 29, y: 15, lado: "izquierda" },
  { texto: "Empuñadura auxiliar", x: 22, y: 62, lado: "izquierda" },
  { texto: "Batería", x: 86, y: 74, lado: "derecha" },
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

/**
 * PRUEBA DE COLOR (temporal): tres fondos para comparar en la vista previa. Por defecto "corte"; los otros
 * se ven agregando `?fondo=foco` o `?fondo=rojo` a la dirección. Al elegir uno, se deja solo ese.
 */
type Fondo = "corte" | "foco" | "rojo";
const FONDOS: Fondo[] = ["corte", "foco", "rojo"];

const sinSuscripcion = () => () => {};
const leerFondo = (): Fondo => {
  const pedido = new URLSearchParams(window.location.search).get("fondo") as Fondo | null;
  return pedido && FONDOS.includes(pedido) ? pedido : "corte";
};

// Cuadrícula técnica (plano de taller). Escritas completas para que Tailwind las encuentre.
const CUADRICULA_BLANCA =
  "bg-[linear-gradient(var(--color-pico-blanco)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-blanco)_1px,transparent_1px)] bg-[size:40px_40px]";
const CUADRICULA_AZUL =
  "bg-[linear-gradient(var(--color-pico-azul)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-azul)_1px,transparent_1px)] bg-[size:40px_40px]";

function FondoTaller({ fondo }: { fondo: Fondo }) {
  if (fondo === "foco") {
    // Taller de noche: casi negro, un haz de luz cae sobre el rotomartillo y lo deja en un círculo de luz en el piso.
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-pico-azul-oscuro via-pico-azul-oscuro to-pico-azul">
        <div className={`absolute inset-0 opacity-[0.06] ${CUADRICULA_BLANCA} [mask-image:linear-gradient(to_left,black_20%,transparent_70%)]`} />
        <div className="absolute inset-y-0 right-[2%] w-[44%] bg-gradient-to-b from-pico-blanco/30 via-pico-blanco/10 to-transparent [clip-path:polygon(38%_0,62%_0,100%_100%,0_100%)] transition-opacity duration-500 group-hover:opacity-100 md:right-[6%] md:w-[38%] lg:opacity-80" />
        <div className="absolute right-[6%] bottom-[4%] h-[16%] w-[34%] rounded-chip bg-pico-blanco/15 blur-2xl md:right-[10%] md:w-[28%]" />
        <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-pico-rojo to-transparent" />
      </div>
    );
  }

  const rojo = fondo === "rojo";
  // Corte diagonal con el ángulo del filete rojo de la marca: azul marino para el texto y, a la derecha, una
  // placa (blanca en "corte", roja en "rojo") donde descansa el rotomartillo, separada por un filete.
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro">
      <div className={`absolute inset-0 opacity-[0.05] ${CUADRICULA_BLANCA} [mask-image:linear-gradient(to_right,black_10%,transparent_55%)]`} />
      <div
        className={`absolute -inset-y-6 -right-24 left-[62%] origin-bottom -skew-x-12 overflow-hidden shadow-tarjeta-hover transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] md:left-[57%] ${
          rojo ? "bg-gradient-to-br from-pico-rojo to-pico-rojo-oscuro" : "bg-gradient-to-br from-pico-blanco via-pico-blanco to-pico-azul-claro"
        }`}
      >
        <div className={`absolute inset-0 skew-x-12 ${rojo ? `opacity-[0.08] ${CUADRICULA_BLANCA}` : `opacity-[0.07] ${CUADRICULA_AZUL}`}`} />
        <Montanas
          className={`absolute -right-6 -bottom-10 w-[115%] skew-x-12 ${rojo ? "fill-pico-blanco/[0.07]" : "fill-pico-azul/[0.05]"}`}
        />
      </div>
      {/* Filete del corte: el mismo trazo inclinado de los títulos, a lo alto del banner. */}
      <div
        className={`absolute -inset-y-6 left-[calc(62%-1.1rem)] w-2.5 origin-bottom -skew-x-12 transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-[-1.5%] md:left-[calc(57%-1.1rem)] ${
          rojo ? "bg-pico-blanco" : "bg-pico-rojo"
        }`}
      />
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
  // PRUEBA DE COLOR: ?fondo=foco | rojo en la dirección (solo para comparar en la vista previa).
  const fondo = useSyncExternalStore(sinSuscripcion, leerFondo, () => "corte" as Fondo);

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
      <FondoTaller fondo={fondo} />

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
          al pasar el cursor crece un poco y se inclina, mientras las demás herramientas asoman alrededor. */}
      <div className="absolute top-1/2 right-[3%] w-[36%] max-w-[28rem] -translate-y-1/2 transition-transform duration-700 ease-[cubic-bezier(0.34,1.45,0.64,1)] group-hover:scale-105 group-hover:-rotate-3 motion-reduce:transition-none md:right-[2%] md:w-[30%] lg:right-[8%]">
        <span className="block motion-safe:animate-flotar" style={{ animationDuration: "7s" }}>
          <Image
            src="/herramientas/rotomartillo.webp"
            alt=""
            width={900}
            height={757}
            sizes="(min-width: 1536px) 448px, (min-width: 768px) 30vw, 36vw"
            className={`h-auto w-full drop-shadow-2xl ${fondo === "corte" ? "drop-shadow-pico-azul/45" : "drop-shadow-pico-azul-oscuro"}`}
          />
        </span>
        {/* Ficha técnica: al pasar el cursor, señaladores rojos nombran las partes del rotomartillo, como en un
            catálogo. Solo desde 1024px (en pantallas chicas no caben). */}
        {SENALES.map((s, i) => (
          <span
            key={s.texto}
            className="absolute hidden lg:block"
            style={{ left: `${s.x}%`, top: `${s.y}%`, "--retraso": `${380 + i * 90}ms` } as CSSProperties}
          >
            <span className="absolute -top-1.5 -left-1.5 size-3 scale-0 rounded-chip bg-pico-rojo ring-4 ring-pico-rojo/25 transition-transform duration-300 group-hover:scale-100 group-hover:[transition-delay:var(--retraso)] motion-reduce:transition-none" />
            <span
              className={`absolute top-0 h-px w-14 scale-x-0 bg-pico-rojo transition-transform duration-300 group-hover:scale-x-100 group-hover:[transition-delay:var(--retraso)] motion-reduce:transition-none ${
                s.lado === "izquierda" ? "right-0 origin-right" : "left-0 origin-left"
              }`}
            />
            <span
              className={`absolute -top-3 rounded-chip bg-pico-azul px-2.5 py-1 text-[11px] leading-none font-bold tracking-[0.08em] whitespace-nowrap text-pico-blanco uppercase opacity-0 shadow-tarjeta-hover transition duration-300 group-hover:opacity-100 group-hover:[transition-delay:calc(var(--retraso)+120ms)] ${
                s.lado === "izquierda" ? "right-15" : "left-15"
              }`}
            >
              {s.texto}
            </span>
          </span>
        ))}
        {/* Sombra en el "piso", para que se note que flota. */}
        <span className={`absolute -bottom-[8%] left-1/2 -z-10 h-[9%] w-[55%] -translate-x-1/2 rounded-chip blur-xl ${fondo === "corte" ? "bg-pico-azul/35" : "bg-pico-azul-oscuro/80"}`} />
      </div>
    </div>
  );
}
