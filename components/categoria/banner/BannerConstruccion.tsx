"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Montanas } from "@/components/layout/Logo";

/**
 * Banner de la categoría Construcción (va en `EncabezadoPagina` con la prop `escena`). Misma familia que el de
 * Pinturas: azul marino con el título a la izquierda y, a la derecha, una placa de concreto real cuyo borde es el
 * dentado de una pared de bloques a medio levantar. En la placa, el acopio de la obra: la paleta de bloques, el saco de
 * cemento y el balde con mezcla (fotos reales), y un gancho de grúa que cuelga del borde de arriba con un bloque.
 * - Solo (cada pocos segundos, mientras se ve; nunca con "reducir movimiento") o con clic / Enter / toque: el gancho
 *   baja el bloque y lo deja sobre la paleta (con un poco de polvo) y sube vacío; la vez siguiente baja, lo engancha y
 *   lo vuelve a subir. Colgado, se mece apenas.
 * - Mouse encima o foco con teclado: asoman herramientas y materiales reales por todo el banner.
 * Fotos en public/banners/construccion/ y public/herramientas/. Animaciones en banner.css (clases .bc-*).
 * El gancho y el bloque son DOS fotos sacadas de una misma (mismo lienzo de 397×900): encimadas calzan exactas.
 */

const CADA_MS = 6500;
const C = "/banners/construccion/";
const H = "/herramientas/";

/** Lo que asoma por los bordes (desde 768px). Mismas reglas que en Pinturas: nada sobre el título ni sobre el acopio. */
const ASOMAN = [
  // Arriba, sobre el azul.
  { src: `${H}martillo.webp`, ancho: 640, alto: 602, borde: "arriba", en: 23, tam: 130, giro: 160, asoma: 0.5 },
  { src: `${H}nivel.webp`, ancho: 640, alto: 580, borde: "arriba", en: 35, tam: 150, giro: 186, asoma: 0.42 },
  { src: `${C}cabillas.webp`, ancho: 192, alto: 900, borde: "arriba", en: 45, tam: 46, giro: 164, asoma: 0.4 },
  // Abajo.
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

export default function BannerConstruccion() {
  const raiz = useRef<HTMLDivElement>(null);
  // ciclo par: el bloque cuelga del gancho; impar: está sobre la paleta.
  const [ciclo, setCiclo] = useState(0);
  const [tocado, setTocado] = useState(false);
  const [visible, setVisible] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const [espera, setEspera] = useState(0);
  const puntero = useRef("");
  const colocado = ciclo % 2 === 1;

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => {
      if (raiz.current?.closest("header")?.matches(":has(:focus-visible)")) setEspera((e) => e + 1);
      else setCiclo((c) => c + 1);
    }, CADA_MS);
    return () => window.clearTimeout(t);
  }, [ciclo, visible, espera]);

  return (
    <div ref={raiz} className="bp absolute inset-0 overflow-hidden" data-activo={tocado || undefined}>
      {/* Placa de concreto con el borde dentado (la sombra va en el contenedor: el recorte se la comería). */}
      <div className="absolute inset-0 drop-shadow-xl drop-shadow-pico-azul-oscuro/60">
        <div
          className="bp-placa absolute -inset-y-6 -right-24 left-[56%] overflow-hidden md:left-[51%] xl:left-[49%]"
          style={{ clipPath: DENTADO }}
        >
          <div className="absolute inset-0 skew-x-12 scale-125 bg-[url(/banners/construccion/concreto.webp)] bg-[size:520px_auto] bg-repeat" />
          {/* Luz cálida de obra arriba y piso más oscuro abajo, donde se apoya el acopio. */}
          <div className="absolute inset-0 bg-[linear-gradient(170deg,color-mix(in_srgb,var(--color-amarillo-obra)_14%,transparent)_0%,transparent_40%,color-mix(in_srgb,var(--color-pico-azul-oscuro)_60%,transparent)_100%)]" />
          <div className="absolute inset-0 bg-pico-azul-oscuro/25 mix-blend-multiply" />
          <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-pico-azul-oscuro/55 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,transparent_30%,color-mix(in_srgb,var(--color-pico-azul-oscuro)_40%,transparent)_100%)]" />
          <Montanas className="absolute -right-6 -bottom-10 w-[115%] skew-x-12 fill-pico-azul-oscuro/[0.08]" />
          {/* Juntas de mortero que siguen los escalones del dentado. */}
          <div className="absolute inset-y-0 left-0 w-[26px] bg-[repeating-linear-gradient(to_bottom,transparent_0_33px,color-mix(in_srgb,var(--color-pico-blanco)_35%,transparent)_33px_34px)]" />
        </div>
      </div>

      {/* Lo que asoma por los bordes (desfocado: el acopio es el foco). */}
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

      <button
        type="button"
        aria-label={colocado ? "Levantar el bloque con el gancho" : "Bajar el bloque a la paleta"}
        onPointerDown={(e) => (puntero.current = e.pointerType)}
        onClick={() => {
          if (puntero.current === "touch") setTocado(true);
          puntero.current = "";
          setCiclo((c) => c + 1);
          setAnuncio(colocado ? "El gancho levantó el bloque" : "El bloque quedó sobre la paleta");
        }}
        className="absolute inset-y-0 right-0 left-[55%] cursor-pointer focus-visible:outline-none md:left-[50%]"
      >
        {/* Saco de cemento recostado a la izquierda de la paleta (desde 768px; en el teléfono solo va la paleta). */}
        <span className="absolute right-[42%] bottom-[4%] hidden aspect-[463/760] h-[56%] origin-bottom -rotate-6 md:block md:h-[76%] xl:right-[44%]">
          <span className="absolute -bottom-[3%] left-1/2 h-[8%] w-[90%] -translate-x-1/2 rounded-[50%] bg-pico-azul-oscuro/55 blur-md" />
          <Image src={`${C}saco-cemento.webp`} alt="" width={463} height={760} sizes="(min-width: 768px) 110px, 70px" className="bc-saco relative size-full object-contain drop-shadow-xl drop-shadow-pico-azul-oscuro/40" />
        </span>

        {/* Balde con mezcla y palustre al frente, a la izquierda del saco (desde 768px). */}
        <span className="absolute right-[64%] bottom-[3%] hidden aspect-[546/640] h-[40%] md:block xl:right-[66%]">
          <span className="absolute -bottom-[3%] left-1/2 h-[9%] w-[90%] -translate-x-1/2 rounded-[50%] bg-pico-azul-oscuro/55 blur-md" />
          <Image src={`${C}balde.webp`} alt="" width={546} height={640} sizes="110px" className="relative size-full object-contain drop-shadow-xl drop-shadow-pico-azul-oscuro/40" />
        </span>

        {/* Paleta de bloques con el gancho encima. */}
        <span className="bc-paleta absolute right-[4%] bottom-[4%] block aspect-[820/813] h-[54%] md:h-[63%] xl:right-[6%]" data-estado={colocado ? "colocado" : "colgado"}>
          <span className="absolute -bottom-[4%] left-1/2 h-[10%] w-[96%] -translate-x-1/2 rounded-[50%] bg-pico-azul-oscuro/55 blur-md" />
          <Image src={`${C}paleta-bloques.webp`} alt="" width={820} height={813} priority sizes="(min-width: 1280px) 240px, (min-width: 768px) 200px, 130px" className="relative size-full object-contain drop-shadow-xl drop-shadow-pico-azul-oscuro/40" />

          {/* Polvo cuando el bloque toca la paleta. */}
          {colocado && <span key={`polvo-${ciclo}`} className="bc-polvo absolute bottom-[80%] left-[48%] block h-[12%] w-[46%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-pico-blanco)_70%,transparent),transparent)]" />}

          {/* Gancho (desde 768px; en el teléfono la lupa ocupa esa esquina). Dos columnas iguales que nacen arriba del
              banner: una con el cable y el gancho, otra con el bloque. Encimadas calzan exactas. */}
          <span className="bc-grua absolute bottom-[84%] left-1/2 hidden h-[400%] w-[24%] -translate-x-1/2 md:block">
            <span key={`gancho-${ciclo}`} className={`bc-gancho absolute inset-0 flex flex-col ${ciclo > 0 ? "bc-baja-y-sube" : ""}`}>
              <span className="mx-auto w-[3px] flex-1 bg-gradient-to-r from-gris-texto via-gris-borde to-gris-texto" />
              <Image src={`${C}gancho.webp`} alt="" width={397} height={900} sizes="60px" className="h-auto w-full" />
            </span>
            <span className="bc-bloque absolute inset-0 flex flex-col justify-end">
              <Image src={`${C}bloque.webp`} alt="" width={397} height={900} sizes="60px" className="h-auto w-full drop-shadow-lg drop-shadow-pico-azul-oscuro/40" />
            </span>
          </span>
        </span>
      </button>

      <span className="sr-only" aria-live="polite">
        {anuncio}
      </span>
    </div>
  );
}
