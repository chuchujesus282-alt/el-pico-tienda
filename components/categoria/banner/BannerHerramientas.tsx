"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/**
 * Banner de la categoría Herramientas (va en `EncabezadoPagina` con la prop `escena`). Misma familia que Pinturas y
 * Construcción: azul marino con el título a la izquierda y, a la derecha, cortado en diagonal, el tablero perforado de un
 * taller (con su perfil de aluminio atornillado en el corte). Del tablero cuelgan herramientas reales en sus ganchos y,
 * al frente, un taladro real apoyado en el piso.
 * - Solo (cada pocos segundos, mientras se ve; nunca con "reducir movimiento"): el exhibidor se repone. Una herramienta
 *   se descuelga y en su gancho cae otra, que se mece hasta quedarse quieta.
 * - Clic / Enter / toque: repone una al instante.
 * - Mouse encima o foco con teclado: el taladro vibra como si estuviera encendido.
 * Fotos en public/banners/herramientas/ (las de mano, ya verticales) y public/herramientas/. Animaciones en banner.css.
 */

const CADA_MS = 5000;
const B = "/banners/herramientas/";
const H = "/herramientas/";

/**
 * Las clásicas, para colgar (fotos verticales; ancho × alto reales; el esmeril cuelga de su cable). `largo`: cuánto mide
 * colgada, en % del alto del banner. Se van rotando por los ganchos.
 */
const COLGABLES = [
  { id: "martillo", ancho: 260, alto: 640, largo: 54 },
  { id: "esmeril", ancho: 308, alto: 640, largo: 48 },
  { id: "serrucho", ancho: 150, alto: 640, largo: 68 },
  { id: "llave-tubo", ancho: 176, alto: 640, largo: 64 },
  { id: "llave-ajustable", ancho: 150, alto: 640, largo: 56 },
  { id: "nivel", ancho: 117, alto: 640, largo: 68 },
] as const;
type Colgable = (typeof COLGABLES)[number]["id"];

/**
 * Ganchos del tablero: x en % del área de la escena desde 1280px (`xMd`: entre 768 y 1279px, donde solo caben 2;
 * sin él, ese gancho solo sale desde 1280px). Medidos para la herramienta MÁS ANCHA (el esmeril, que va rotando por
 * todos): arriba, el corte diagonal se mete ~25cqh en la escena, así que el primer gancho va lejos del perfil; el último
 * deja aire antes del taladro.
 */
const GANCHOS = [
  { x: 14, xMd: null },
  { x: 26, xMd: 18 },
  { x: 38, xMd: 34 },
  { x: 50, xMd: null },
];
/** Orden en que se reponen los ganchos (salteado, para que no parezca una fila que avanza). */
const ORDEN = [1, 3, 0, 2];

const datos = (id: Colgable) => COLGABLES.find((c) => c.id === id)!;

export default function BannerHerramientas() {
  const raiz = useRef<HTMLDivElement>(null);
  const [colgadas, setColgadas] = useState<Colgable[]>(["martillo", "esmeril", "serrucho", "llave-tubo"]);
  // Herramienta que se está descolgando (sigue dibujada un momento, saliendo).
  const [saliente, setSaliente] = useState<{ gancho: number; id: Colgable; vez: number } | null>(null);
  const [vez, setVez] = useState(0);
  const [tocado, setTocado] = useState(false);
  const [visible, setVisible] = useState(false);
  const [espera, setEspera] = useState(0);
  const puntero = useRef("");

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /** Repone un gancho: la herramienta que tenía se descuelga y cae la siguiente que no esté colgada. */
  const reponer = () => {
    const gancho = ORDEN[vez % ORDEN.length];
    const actual = colgadas[gancho];
    const libres = COLGABLES.map((c) => c.id).filter((id) => !colgadas.includes(id));
    const nueva = libres[vez % libres.length];
    setSaliente({ gancho, id: actual, vez });
    setColgadas((c) => c.map((id, i) => (i === gancho ? nueva : id)));
    setVez((v) => v + 1);
  };

  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => {
      if (raiz.current?.closest("header")?.matches(":has(:focus-visible)")) setEspera((e) => e + 1);
      else reponer();
    }, CADA_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `vez` marca cada reposición; reponer() lee el estado al día.
  }, [vez, visible, espera]);

  return (
    <div ref={raiz} className="bp absolute inset-0 overflow-hidden" data-activo={tocado || undefined}>
      {/* Tablero perforado cortado en diagonal: masonite con sus agujeros en cuadrícula, la luz de una lámpara de taller
          arriba, los bordes en penumbra y abajo el mesón de trabajo donde se apoya el taladro. */}
      <div className="bp-placa bp-difumina bh-tablero absolute -inset-y-6 -right-24 left-[56%] overflow-hidden md:left-[51%] xl:left-[49%]">
        <div className="bh-lampara absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(170deg,color-mix(in_srgb,var(--color-pico-blanco)_10%,transparent)_0%,transparent_40%,color-mix(in_srgb,var(--color-pico-azul-oscuro)_45%,transparent)_100%)]" />
        <div className="bh-meson absolute inset-x-0 bottom-0 h-[20%]" />
        <div className="bp-funde absolute inset-y-0 left-0" />
      </div>

      <button
        type="button"
        aria-label="Reponer una herramienta del tablero"
        onPointerDown={(e) => (puntero.current = e.pointerType)}
        onClick={() => {
          if (puntero.current === "touch") setTocado(true);
          puntero.current = "";
          reponer();
        }}
        className="bh-escena absolute inset-y-0 right-0 left-[55%] cursor-pointer focus-visible:outline-none md:left-[50%]"
      >
        {/* Ganchos con su herramienta (desde 768px; en el teléfono solo va el taladro). */}
        {GANCHOS.map((g, i) => {
          const id = colgadas[i];
          const d = datos(id);
          const sale = saliente?.gancho === i ? saliente : null;
          return (
            <span
              key={i}
              className={`absolute top-[9%] hidden left-(--x-md) xl:left-(--x) ${g.xMd === null ? "xl:block" : "md:block"}`}
              style={{ "--x": `${g.x}%`, "--x-md": `${g.xMd ?? g.x}%` } as CSSProperties}
            >
              {/* Gancho: la pieza de alambre que sale del tablero. */}
              <span className="bh-gancho absolute -top-[3px] left-1/2 block h-3 w-1.5 -translate-x-1/2 rounded-b-full border-x-2 border-b-2 border-gris-borde" />
              {sale && (
                <span key={`sale-${sale.vez}`} className="bh-descolgar absolute top-1 left-1/2 block" style={{ height: `${datos(sale.id).largo}cqh` }}>
                  <Image src={`${B}${sale.id}.webp`} alt="" width={datos(sale.id).ancho} height={datos(sale.id).alto} sizes="60px" className="bh-sombra h-full w-auto max-w-none -translate-x-1/2" />
                </span>
              )}
              <span
                key={`${id}-${vez}`}
                className={`bh-colgada absolute top-1 left-1/2 block origin-top ${vez > 0 && saliente?.gancho === i ? "bh-colgar" : ""}`}
                style={{ height: `${d.largo}cqh`, "--i": i } as CSSProperties}
              >
                <Image src={`${B}${id}.webp`} alt="" width={d.ancho} height={d.alto} sizes="60px" className="bh-sombra h-full w-auto max-w-none -translate-x-1/2" />
              </span>
            </span>
          );
        })}

        {/* Taladro colgado en el tablero como las demás, en su gancho propio (siempre el mismo: es la estrella). Se
            mece igual que las otras; al pasar el mouse vibra como si estuviera encendido. */}
        <span className="absolute top-[24%] right-[26cqh] md:top-[9%] md:right-[34cqh] xl:right-[40cqh]">
          <span className="bh-gancho absolute -top-[3px] left-1/2 block h-3 w-1.5 -translate-x-1/2 rounded-b-full border-x-2 border-b-2 border-gris-borde" />
          <span className="bh-colgada absolute top-1 left-1/2 block h-[50cqh] origin-top md:h-[66cqh]" style={{ "--i": 4 } as CSSProperties}>
            <span className="bh-taladro block h-full">
              <Image src={`${H}taladro.webp`} alt="" width={515} height={640} priority sizes="(min-width: 768px) 200px, 120px" className="bh-sombra h-full w-auto max-w-none -translate-x-1/2" />
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}
