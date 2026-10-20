"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Montanas } from "@/components/layout/Logo";

/**
 * Banner de la categoría Construcción (va en `EncabezadoPagina` con la prop `escena`). Misma familia que el de
 * Pinturas: azul marino con el título a la izquierda y, a la derecha, una placa de concreto real cuyo borde es el
 * dentado de una pared de bloques a medio levantar. Encima, una grúa (el gancho cuelga de un cable que sale por arriba)
 * lleva bloques, uno por uno, de la paleta a un muro en construcción que ya va por la cuarta hilada, y la completa.
 * Al terminar, se quitan esos bloques y vuelve a empezar.
 * - Solo mientras el banner se ve y nunca con "reducir movimiento" (ahí se muestra la pila ya armada, quieta).
 * - Clic / Enter / toque: pausa o sigue la grúa (al terminar el paso en curso).
 * - Mouse encima o foco con teclado: asoman herramientas y materiales reales por todo el banner.
 * Las medidas de la escena van en `cqh` (% del alto del escenario, que es un contenedor): así las posiciones de la
 * grúa, la paleta y la pila calzan igual en cualquier ancho. Fotos en public/banners/construccion/; gancho y bloque
 * son dos capas sacadas de una misma foto (mismo lienzo de 397×900: encimadas calzan exactas).
 */

const C = "/banners/construccion/";
const H = "/herramientas/";

/** Lo que asoma por los bordes (desde 768px). Nada sobre el título ni sobre la escena. */
const ASOMAN = [
  { src: `${H}martillo.webp`, ancho: 640, alto: 602, borde: "arriba", en: 23, tam: 130, giro: 160, asoma: 0.5 },
  { src: `${H}nivel.webp`, ancho: 640, alto: 580, borde: "arriba", en: 35, tam: 150, giro: 186, asoma: 0.42 },
  { src: `${C}cabillas.webp`, ancho: 192, alto: 900, borde: "arriba", en: 45, tam: 46, giro: 164, asoma: 0.4 },
  { src: `${H}cinta-metrica.webp`, ancho: 640, alto: 519, borde: "abajo", en: 27, tam: 110, giro: 12, asoma: 0.5 },
  { src: `${H}palustre.webp`, ancho: 640, alto: 587, borde: "abajo", en: 38, tam: 130, giro: 24, asoma: 0.5 },
  { src: `${C}paila.webp`, ancho: 578, alto: 760, borde: "abajo", en: 48, tam: 92, giro: 5, asoma: 0.5 },
] as const;

/** Dentado del borde izquierdo de la placa: escalones del alto de un bloque, como una pared que se sigue levantando. */
const DENTADO = (() => {
  const alto = 34;
  const saliente = 26;
  const puntos: string[] = ["100% 0", "100% 100%"];
  for (let y = 26 * alto; y >= 0; y -= alto) {
    const x = (y / alto) % 2 === 0 ? 0 : saliente;
    puntos.push(`${x}px ${y + alto}px`, `${x}px ${y}px`);
  }
  return `polygon(${puntos.join(", ")})`;
})();

/*
 * Geometría en cqh, medida desde la esquina de abajo a la derecha del escenario. `x`: distancia del borde derecho del
 * lienzo del gancho/bloque (ancho ANCHO) al borde derecho del escenario; `y`: altura de la base del bloque sobre el piso.
 */
const ANCHO = 16;
/** Paleta: a 4 del borde derecho y del piso, 63 de alto (y de ancho). */
const PALETA = { derecha: 4, abajo: 4, alto: 63 };
/** Dónde engancha: el centro de la cara de arriba de la paleta. */
const RECOGER = { x: 27.5, y: 57 };
/** Altura a la que viaja (la base del bloque, por encima de la paleta). */
const VIAJE = 69;
/**
 * Muro en construcción, en la MISMA perspectiva que la foto del bloque (medida sobre su lienzo de 397×900: a lo largo
 * avanza 309px a la derecha y sube 77; el frente mide 220px de alto). Cada hilada pone 4 bloques uno tras otro a lo
 * largo (los de atrás quedan detrás) y las hiladas impares van corridas medio bloque (trabado, con el borde dentado).
 * Arranca con 3 hiladas y un bloque de la cuarta; la grúa pone los 3 que faltan y, al terminar, se quitan y vuelve.
 * --hueco: en tableta -9cqh (se arrima a la paleta; si no, cruza el corte); desde 1280px 14cqh (en medio de la placa).
 */
const LARGO = { x: (309 / 397) * ANCHO, y: (77 / 397) * ANCHO };
const HILADA = (220 / 397) * ANCHO + 0.5; // el frente del bloque + la junta de mortero
const ORIGEN = { x: 116, y: 4 };
const MURO = Array.from({ length: 16 }, (_, i) => {
  const hilada = Math.floor(i / 4);
  const k = (i % 4) + (hilada % 2 ? 0.5 : 0);
  return { x: ORIGEN.x - k * LARGO.x, y: ORIGEN.y + k * LARGO.y + hilada * HILADA, z: hilada * 10 + (9 - (i % 4)), base: hilada === 0 };
});
const INICIALES = 13;

type Paso = { x?: number; y?: number; enPila?: boolean; ms: number; viaje?: boolean; cargar?: boolean; soltar?: boolean };

/** Los 8 pasos de la grúa para el bloque n. */
function pasos(n: number): Paso[] {
  const destino = MURO[n];
  return [
    { x: RECOGER.x, enPila: false, y: VIAJE, ms: 1200, viaje: true },
    { y: RECOGER.y, ms: 800 },
    { cargar: true, ms: 220 },
    { y: VIAJE, ms: 800 },
    { x: destino.x, enPila: true, ms: 1300, viaje: true },
    { y: destino.y, ms: 900 },
    { soltar: true, ms: 260 },
    { y: VIAJE, ms: 700 },
  ];
}

export default function BannerConstruccion() {
  const raiz = useRef<HTMLDivElement>(null);
  const [grua, setGrua] = useState({ x: RECOGER.x, y: VIAJE, enPila: false, ms: 0, viaje: 0 });
  const [cargando, setCargando] = useState(false);
  const [colocados, setColocados] = useState(INICIALES);
  const [despejando, setDespejando] = useState(false);
  const [reducido, setReducido] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pausa, setPausa] = useState(false);
  const [tocado, setTocado] = useState(false);
  const puntero = useRef("");
  const pausaRef = useRef(false);
  // Dónde va la grúa: bloque n y paso dentro de su recorrido (sobrevive a pausas y a salir de pantalla).
  const avance = useRef({ n: INICIALES, paso: 0 });

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    obs.observe(el);
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    const alCambiar = () => setReducido(consulta.matches);
    alCambiar();
    consulta.addEventListener("change", alCambiar);
    return () => {
      obs.disconnect();
      consulta.removeEventListener("change", alCambiar);
    };
  }, []);

  useEffect(() => {
    if (!visible || reducido) return;
    let vivo = true;
    const esperar = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    (async () => {
      while (vivo) {
        // La pausa (o el foco del teclado dentro) se respeta entre paso y paso.
        if (pausaRef.current || raiz.current?.closest("header")?.matches(":has(:focus-visible)")) {
          await esperar(300);
          continue;
        }
        const a = avance.current;
        if (a.n >= MURO.length) {
          await esperar(1400);
          if (!vivo) return;
          setDespejando(true);
          await esperar(700);
          setColocados(INICIALES);
          setDespejando(false);
          avance.current = { n: INICIALES, paso: 0 };
          continue;
        }
        const p = pasos(a.n)[a.paso];
        if (p.cargar) setCargando(true);
        if (p.soltar) {
          setCargando(false);
          setColocados(a.n + 1);
        }
        if (p.x !== undefined || p.y !== undefined) {
          setGrua((g) => ({ x: p.x ?? g.x, y: p.y ?? g.y, enPila: p.enPila ?? g.enPila, ms: p.ms, viaje: p.viaje ? g.viaje + 1 : g.viaje }));
        }
        await esperar(p.ms + 40);
        if (!vivo) return;
        avance.current = a.paso === 7 ? { n: a.n + 1, paso: 0 } : { n: a.n, paso: a.paso + 1 };
      }
    })();
    return () => {
      vivo = false;
    };
  }, [visible, reducido]);

  // Con "reducir movimiento" la pila se muestra ya armada.
  const bloquesEnPila = reducido ? MURO.length : colocados;
  const lienzo = (x: number, y: number, ms = 0, enPila = false): CSSProperties => ({
    transform: enPila ? `translate(calc(${-x}cqh - var(--hueco)), ${-y}cqh)` : `translate(${-x}cqh, ${-y}cqh)`,
    transitionDuration: `${ms}ms`,
  });

  return (
    <div ref={raiz} className="bp absolute inset-0 overflow-hidden" data-activo={tocado || undefined}>
      {/* Placa de concreto con el borde dentado (la sombra va en el contenedor: el recorte se la comería). */}
      <div className="absolute inset-0 drop-shadow-xl drop-shadow-pico-azul-oscuro/60">
        <div
          className="bp-placa absolute -inset-y-6 -right-24 left-[56%] overflow-hidden md:left-[51%] xl:left-[49%]"
          style={{ clipPath: DENTADO }}
        >
          <div className="absolute inset-0 skew-x-12 scale-125 bg-[url(/banners/construccion/concreto.webp)] bg-[size:520px_auto] bg-repeat" />
          <div className="absolute inset-0 bg-[linear-gradient(170deg,color-mix(in_srgb,var(--color-amarillo-obra)_14%,transparent)_0%,transparent_40%,color-mix(in_srgb,var(--color-pico-azul-oscuro)_60%,transparent)_100%)]" />
          <div className="absolute inset-0 bg-pico-azul-oscuro/25 mix-blend-multiply" />
          <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-pico-azul-oscuro/55 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,transparent_30%,color-mix(in_srgb,var(--color-pico-azul-oscuro)_40%,transparent)_100%)]" />
          <Montanas className="absolute -right-6 -bottom-10 w-[115%] skew-x-12 fill-pico-azul-oscuro/[0.08]" />
          {/* Piso de la obra: una losa más oscura con su canto iluminado, donde se apoyan la paleta y el muro. */}
          <div className="absolute inset-x-0 bottom-0 h-[30%] border-t border-pico-blanco/15 bg-gradient-to-b from-pico-azul-oscuro/35 to-pico-azul-oscuro/70" />
          <div className="absolute inset-y-0 left-0 w-[26px] bg-[repeating-linear-gradient(to_bottom,transparent_0_33px,color-mix(in_srgb,var(--color-pico-blanco)_35%,transparent)_33px_34px)]" />
          <div className="bp-funde absolute inset-y-0 left-0" />
        </div>
      </div>

      <div className="hidden [--escala:0.62] md:block lg:[--escala:0.82] xl:[--escala:1]">
        {ASOMAN.map((a, i) => (
          <span
            key={i}
            className={`bp-asoma bp-asoma-${a.borde} absolute block`}
            style={
              {
                left: `${a.en}%`,
                width: `calc(${a.tam}px * var(--escala))`,
                "--giro": `${a.giro}deg`,
                "--asoma": `${a.asoma * 100}%`,
                "--i": i,
              } as unknown as CSSProperties
            }
          >
            <Image src={a.src} alt="" width={a.ancho} height={a.alto} sizes={`${a.tam}px`} className="h-auto w-full opacity-90 blur-[1.2px] drop-shadow-xl drop-shadow-pico-azul-oscuro/60" />
          </span>
        ))}
      </div>
      <div className="bp-velo absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-pico-azul-oscuro/55 via-pico-azul-oscuro/25 to-transparent" />

      {/* En el teléfono: solo la paleta (la lupa ocupa la esquina de arriba y no cabe la grúa). */}
      <span className="absolute right-[4%] bottom-[4%] block aspect-[820/813] h-[54%] md:hidden">
        <Image src={`${C}paleta-bloques.webp`} alt="" width={820} height={813} sizes="130px" className="size-full object-contain drop-shadow-xl drop-shadow-pico-azul-oscuro/40" />
      </span>

      <button
        type="button"
        aria-label={pausa ? "Seguir con la grúa" : "Pausar la grúa"}
        aria-pressed={pausa}
        onPointerDown={(e) => (puntero.current = e.pointerType)}
        onClick={() => {
          if (puntero.current === "touch") setTocado(true);
          puntero.current = "";
          pausaRef.current = !pausaRef.current;
          setPausa(pausaRef.current);
        }}
        className="absolute inset-y-0 right-0 left-[55%] hidden cursor-pointer focus-visible:outline-none md:left-[50%] md:block"
      >
        {/* Escenario: contenedor del alto del banner; todo adentro se mide en cqh. */}
        <span className="bc-escenario absolute inset-0 block [--hueco:-9cqh] xl:[--hueco:14cqh]">
          {/* Paleta de bloques (de donde sale cada bloque). */}
          <span className="absolute block aspect-[820/813]" style={{ right: `${PALETA.derecha}cqh`, bottom: `${PALETA.abajo}cqh`, height: `${PALETA.alto}cqh` }}>
            <span className="absolute -bottom-[4%] left-1/2 h-[10%] w-[96%] -translate-x-1/2 rounded-[50%] bg-pico-azul-oscuro/55 blur-md" />
            <Image src={`${C}paleta-bloques.webp`} alt="" width={820} height={813} priority sizes="(min-width: 1280px) 180px, 150px" className="relative size-full object-contain drop-shadow-xl drop-shadow-pico-azul-oscuro/40" />
          </span>

          {/* Pila nueva: los bloques que ya dejó la grúa. */}
          {MURO.slice(0, bloquesEnPila).map((s, i) => (
            <span
              key={i}
              className={`absolute right-0 bottom-0 block transition-opacity duration-700 ${despejando && i >= INICIALES ? "opacity-0" : "opacity-100"}`}
              style={{ ...lienzo(s.x, s.y, 0, true), width: `${ANCHO}cqh`, zIndex: s.z }}
            >
              {s.base && <span className="absolute -bottom-[1%] left-1/2 h-[4%] w-[110%] -translate-x-1/2 rounded-[50%] bg-pico-azul-oscuro/55 blur-sm" />}
              <Image src={`${C}bloque.webp`} alt="" width={397} height={900} sizes="60px" className="relative h-auto w-full drop-shadow-md drop-shadow-pico-azul-oscuro/50" />
              {i === bloquesEnPila - 1 && i >= INICIALES && !reducido && <span className="bc-polvo absolute bottom-[-2%] left-1/2 block h-[8%] w-[150%] rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-pico-blanco)_70%,transparent),transparent)]" />}
            </span>
          ))}

          {/* Grúa: el cable sale por arriba del banner y el gancho (con o sin bloque) se mueve con transiciones. */}
          <span
            className="absolute right-0 bottom-0 z-50 block ease-[cubic-bezier(0.45,0,0.25,1)] [transition-property:transform]"
            style={{ ...lienzo(grua.x, grua.y, grua.ms, grua.enPila), width: `${ANCHO}cqh` }}
          >
            <span key={grua.viaje} className={`bc-gancho absolute bottom-0 left-0 flex h-[300cqh] w-full flex-col ${grua.viaje > 0 ? "bc-viaje" : ""}`}>
              <span className="mx-auto w-[3px] flex-1 bg-gradient-to-r from-gris-texto via-gris-borde to-gris-texto" />
              <span className="relative block">
                <Image src={`${C}bloque.webp`} alt="" width={397} height={900} sizes="60px" className={`absolute inset-0 h-auto w-full drop-shadow-md drop-shadow-pico-azul-oscuro/50 ${cargando ? "opacity-100" : "opacity-0"}`} />
                <Image src={`${C}gancho.webp`} alt="" width={397} height={900} sizes="60px" className="relative h-auto w-full" />
              </span>
            </span>
          </span>
        </span>
      </button>

      <span className="sr-only" aria-live="polite">
        {pausa ? "Grúa en pausa" : ""}
      </span>
    </div>
  );
}
