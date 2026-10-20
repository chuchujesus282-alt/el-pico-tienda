"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/**
 * Banner de la categoría Herramientas (va en `EncabezadoPagina` con la prop `escena`). Misma familia que Pinturas y
 * Construcción: azul marino con el título a la izquierda y, a la derecha, cortada en diagonal, una placa de acero de
 * taller (con un esquinero metálico en el corte). Delante, una columna de concreto; un rotomartillo real perfora su canto,
 * uno tras otro: apunta, la broca se hunde vibrando (la columna la tapa), cae polvo que se junta en el piso y, al
 * retirarse, queda la boca del hueco en el canto. Con 4 huecos, se borran y vuelve a empezar.
 * - Solo mientras el banner se ve y nunca con "reducir movimiento" (ahí se ven los huecos hechos y el rotomartillo quieto).
 * - Clic / Enter / toque: pausa o sigue.
 * - Mouse encima o foco con teclado: asoman herramientas clásicas por los bordes.
 * La escena se mide en `cqh` (% del alto; el área es un contenedor). Fotos en public/herramientas/; animaciones en
 * banner.css (clases .bh-*).
 */

const H = "/herramientas/";

/** Lo que asoma por los bordes (desde 768px): las clásicas. Nada sobre el título ni sobre la pared. */
const ASOMAN = [
  { src: `${H}martillo.webp`, ancho: 640, alto: 602, borde: "arriba", en: 23, tam: 135, giro: 160, asoma: 0.5 },
  { src: `${H}esmeril.webp`, ancho: 640, alto: 308, borde: "arriba", en: 38, tam: 175, giro: 186, asoma: 0.5 },
  { src: `${H}taladro.webp`, ancho: 515, alto: 640, borde: "abajo", en: 26, tam: 115, giro: -14, asoma: 0.5 },
  { src: `${H}llave-ajustable.webp`, ancho: 640, alto: 606, borde: "abajo", en: 37, tam: 135, giro: 24, asoma: 0.45 },
  { src: `${H}serrucho.webp`, ancho: 640, alto: 507, borde: "abajo", en: 47, tam: 135, giro: -8, asoma: 0.42 },
] as const;

/*
 * Rotomartillo: foto de 900×757 con la punta de la broca arriba a la izquierda (en 3, 18). Alto ALTO cqh, así que mide
 * ANCHO cqh de ancho; la punta queda a PUNTA.x cqh de su borde derecho y PUNTA.y cqh de su borde de arriba.
 */
const ALTO = 60;
const ANCHO = (ALTO * 900) / 757;
const PUNTA = { x: ANCHO - (ALTO * 3) / 757, y: (ALTO * 18) / 757 };
/** Canto de la columna: a CANTO cqh del borde derecho del área (la columna va de ahí a la izquierda). */
const CANTO = 92;
/** Ancho de la columna (en cqh): angosta, así se ve el acero a su izquierda. */
const COLUMNA = 38;
/** Huecos en el canto, de arriba abajo: altura de la punta desde arriba (en cqh). */
const HUECOS = [18, 26, 34, 41];
/** Dónde queda la punta (distancia al borde derecho): separada del canto al apuntar, hundida al perforar. */
const AFUERA = CANTO - 5;
const ADENTRO = CANTO + 9;

type Fase = "mover" | "apuntar" | "perforar" | "retirar";

export default function BannerHerramientas() {
  const raiz = useRef<HTMLDivElement>(null);
  const [punta, setPunta] = useState({ x: AFUERA, y: HUECOS[0], ms: 0 });
  const [fase, setFase] = useState<Fase>("retirar");
  const [hechos, setHechos] = useState(0);
  const [perforando, setPerforando] = useState(-1);
  const [borrando, setBorrando] = useState(false);
  const [reducido, setReducido] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pausa, setPausa] = useState(false);
  const [tocado, setTocado] = useState(false);
  const puntero = useRef("");
  const pausaRef = useRef(false);
  const avance = useRef({ n: 0, paso: 0 });

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
        if (pausaRef.current || raiz.current?.closest("header")?.matches(":has(:focus-visible)")) {
          await esperar(300);
          continue;
        }
        const a = avance.current;
        if (a.n >= HUECOS.length) {
          await esperar(1300);
          if (!vivo) return;
          setBorrando(true);
          await esperar(700);
          setHechos(0);
          setBorrando(false);
          avance.current = { n: 0, paso: 0 };
          continue;
        }
        const y = HUECOS[a.n];
        // Cada hueco: sube o baja apuntando, arrima la punta, la hunde vibrando (lento: está perforando) y se retira.
        const pasos: { x: number; ms: number; fase: Fase; espera: number }[] = [
          { x: AFUERA, ms: 900, fase: "mover", espera: 950 },
          { x: CANTO + 0.5, ms: 300, fase: "apuntar", espera: 320 },
          { x: ADENTRO, ms: 1600, fase: "perforar", espera: 1650 },
          { x: AFUERA, ms: 500, fase: "retirar", espera: 900 },
        ];
        const p = pasos[a.paso];
        setFase(p.fase);
        setPunta({ x: p.x, y, ms: p.ms });
        if (p.fase === "perforar") setPerforando(a.n);
        if (p.fase === "retirar") {
          setPerforando(-1);
          setHechos(a.n + 1);
        }
        await esperar(p.espera);
        if (!vivo) return;
        avance.current = a.paso === 3 ? { n: a.n + 1, paso: 0 } : { n: a.n, paso: a.paso + 1 };
      }
    })();
    return () => {
      vivo = false;
    };
  }, [visible, reducido]);

  // Con "reducir movimiento", los huecos ya hechos y el rotomartillo quieto, apuntando.
  const huecosVisibles = reducido ? HUECOS.length : hechos;
  const p = reducido ? { x: AFUERA, y: HUECOS[0], ms: 0 } : punta;

  return (
    <div ref={raiz} className="bp absolute inset-0 overflow-hidden" data-activo={tocado || undefined}>
      {/* Placa de acero de taller, con bordes más oscuros y el piso abajo. */}
      <div className="bp-placa absolute -inset-y-6 -right-24 left-[56%] overflow-hidden shadow-tarjeta-hover md:left-[51%] xl:left-[49%]">
        <div className="absolute inset-0 skew-x-12 scale-125 bg-[url(/banners/herramientas/acero.webp)] bg-[size:640px_auto] bg-repeat" />
        <div className="absolute inset-0 bg-pico-azul-oscuro/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,transparent_30%,color-mix(in_srgb,var(--color-pico-azul-oscuro)_45%,transparent)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[18%] border-t border-pico-blanco/20 bg-gradient-to-b from-pico-azul-oscuro/45 to-pico-azul-oscuro/75" />
      </div>
      {/* Esquinero metálico en el corte. */}
      <div className="bp-placa bh-esquinero absolute -inset-y-6 left-[calc(56%-0.45rem)] w-[0.9rem] md:left-[calc(51%-0.45rem)] xl:left-[calc(49%-0.45rem)]" />

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

      {/* En el teléfono: el rotomartillo quieto (la escena animada no cabe junto al título). */}
      <span className="absolute right-[2%] bottom-[8%] block aspect-[900/757] w-[33%] md:hidden">
        <Image src={`${H}rotomartillo.webp`} alt="" width={900} height={757} sizes="150px" className="size-full object-contain drop-shadow-2xl drop-shadow-pico-azul-oscuro/50" />
      </span>

      <button
        type="button"
        aria-label={pausa ? "Seguir perforando" : "Pausar el rotomartillo"}
        aria-pressed={pausa}
        onPointerDown={(e) => (puntero.current = e.pointerType)}
        onClick={() => {
          if (puntero.current === "touch") setTocado(true);
          puntero.current = "";
          pausaRef.current = !pausaRef.current;
          setPausa(pausaRef.current);
        }}
        className="bh-escena absolute inset-y-0 right-0 left-[55%] hidden cursor-pointer focus-visible:outline-none md:left-[50%] md:block"
      >
        {/* Columna de concreto, del techo al piso; tapa la broca cuando se hunde (va encima del rotomartillo). En su
            canto, las bocas de los huecos. */}
        <span className="bh-columna absolute top-0 bottom-[6%] z-20 block" style={{ right: `${CANTO}cqh`, width: `${COLUMNA}cqh` }}>
          {HUECOS.map((y, i) => {
            const hecho = i < huecosVisibles;
            const ahora = i === perforando;
            if (!hecho && !ahora) return null;
            return (
              <span
                key={i}
                className={`bh-boca absolute right-0 block ${ahora ? "bh-boca-abriendo" : ""} ${borrando ? "opacity-0 transition-opacity duration-700" : ""}`}
                style={{ top: `${y}cqh` }}
              />
            );
          })}
        </span>
        {/* Montoncito de polvo al pie del canto: crece con cada hueco. */}
        <span
          className={`bh-monton absolute z-20 block transition-[scale,opacity] duration-700 ${borrando ? "opacity-0" : ""}`}
          style={{ right: `${CANTO - 5}cqh`, scale: `${(reducido ? HUECOS.length : hechos + (perforando >= 0 ? 0.5 : 0)) / HUECOS.length}` }}
        />

        {/* Polvo que sale del hueco y cae por el canto mientras perfora. */}
        {fase === "perforar" && (
          <span className="absolute z-30 block" style={{ right: `${CANTO}cqh`, top: `${p.y}cqh` }}>
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="bh-mota absolute block rounded-full" style={{ "--i": i } as CSSProperties} />
            ))}
          </span>
        )}

        {/* Rotomartillo: se mueve la caja entera, así la punta de la broca queda en la posición pedida. */}
        <span
          className="absolute top-0 right-0 z-10 block ease-[cubic-bezier(0.45,0,0.25,1)] [transition-property:transform]"
          style={{
            width: `${ANCHO}cqh`,
            height: `${ALTO}cqh`,
            transform: `translate(${-(p.x - PUNTA.x)}cqh, ${p.y - PUNTA.y}cqh)`,
            transitionDuration: `${p.ms}ms`,
          }}
        >
          <span className="absolute -bottom-[14%] left-[58%] h-[10%] w-[50%] -translate-x-1/2 rounded-[50%] bg-pico-azul-oscuro/45 blur-lg" />
          <span className={`relative block size-full ${fase === "perforar" ? "bh-vibra" : ""}`}>
            <Image src={`${H}rotomartillo.webp`} alt="" width={900} height={757} priority sizes="(min-width: 1280px) 200px, 170px" className="size-full object-contain drop-shadow-2xl drop-shadow-pico-azul-oscuro/50" />
          </span>
        </span>
      </button>

      <span className="sr-only" aria-live="polite">
        {pausa ? "Rotomartillo en pausa" : ""}
      </span>
    </div>
  );
}
