"use client";

import { useId, type CSSProperties } from "react";
import BannerPlano, { type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerSeguridad.module.css";

/**
 * Banner de la categoría Seguridad industrial, estilo "plano técnico". Portado del prototipo banner-seguridad-v5.html:
 * un trabajador con todo su equipo (casco, lentes, chaleco reflectivo, guantes y botas) en la obra, con un cono, una
 * barrera con baliza y el andamio en plano al fondo.
 * Activo: la baliza destella, un reflejo cruza el chaleco y, una por una, salen las 5 llamadas técnicas de cada pieza
 * (línea, punto con pulso y etiqueta con su norma) mientras se marcan las 5 casillas bajo la etiqueta (clase global
 * `ok` en cada `data-casilla`); al final cae el sello "APTO PARA OBRA" (clase global `apto`) y el reflejo vuelve a
 * pasar cada 1,8 s. Al salir todo vuelve.
 * Diferencias con el prototipo: solo el nombre en la etiqueta (sin kicker, "Equipos de" ni subtítulo, como toda la
 * familia), etiquetas un poco más grandes para que se lean al tamaño del banner, el ✓ del sello dibujado (no depende
 * de la fuente) y las luces (`fondo`) cubren todo el banner.
 */

type Llamada = { p: [number, number]; e: [number, number]; lado: "L" | "R"; t: string; d: string };
const LLAMADAS: Llamada[] = [
  { p: [470, 52], e: [432, 30], lado: "L", t: "CASCO", d: "ANSI Z89.1 · RATCHET" },
  { p: [478, 73], e: [540, 50], lado: "R", t: "LENTES", d: "POLICARBONATO Z87+" },
  { p: [458, 140], e: [402, 120], lado: "L", t: "CHALECO", d: "REFLECTIVO CLASE 2" },
  { p: [508, 170], e: [540, 150], lado: "R", t: "GUANTES", d: "CARNAZA REFORZADA" },
  { p: [490, 218], e: [540, 202], lado: "R", t: "BOTAS", d: "PUNTA DE ACERO" },
];
const ANCHO = 112; // ancho de cada etiqueta

const REFLEJO_X = 420;

function crearMotor(raiz: HTMLElement): Motor {
  const q = <T extends Element>(p: string) => raiz.querySelector<T>(`[data-p="${p}"]`)!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const halo = q<SVGCircleElement>("halo"),
    reflejo = q<SVGRectElement>("reflejo");
  const llamadas = LLAMADAS.map((_, i) => q<SVGGElement>(`llamada${i}`));
  const casillas = [...raiz.querySelectorAll<HTMLElement>("[data-casilla]")];
  let destello: Animation | null = null;

  let gen = 0,
    destruido = false;
  const rafs = new Set<number>();
  const timers = new Set<number>();
  const tween = (d: number, f: (t: number) => void) => {
    const g = gen;
    const dur = reduce ? 10 : d;
    return new Promise<boolean>((r) => {
      const s = performance.now();
      const k = (n: number) => {
        if (g !== gen || destruido) return r(false);
        const t = Math.min(1, (n - s) / dur);
        f(t);
        if (t < 1) {
          const id = requestAnimationFrame((m) => {
            rafs.delete(id);
            k(m);
          });
          rafs.add(id);
        } else r(true);
      };
      k(s);
    });
  };
  const esperar = (ms: number) => {
    const g = gen;
    return new Promise<boolean>((r) => {
      const id = window.setTimeout(
        () => {
          timers.delete(id);
          r(g === gen && !destruido);
        },
        reduce ? 10 : ms,
      );
      timers.add(id);
    });
  };
  const barrer = (d: number) => tween(d, (t) => reflejo.setAttribute("x", (REFLEJO_X + 90 * t).toFixed(1)));

  async function activar() {
    const g = ++gen;
    if (!reduce)
      destello = halo.animate([{ opacity: 0.15 }, { opacity: 1 }, { opacity: 0.15 }], {
        duration: 900,
        iterations: Infinity,
      });
    void barrer(900);
    for (let i = 0; i < llamadas.length; i++) {
      if (!(await esperar(i ? 230 : 300))) return;
      llamadas[i].classList.add("in");
      casillas[i]?.classList.add("ok");
    }
    if (!(await esperar(350))) return;
    raiz.classList.add("apto");
    while (g === gen) {
      if (!(await esperar(1800))) return;
      if (!(await barrer(800))) return;
    }
  }
  function reposo() {
    gen++;
    raiz.classList.remove("apto");
    destello?.cancel();
    destello = null;
    llamadas.forEach((l) => l.classList.remove("in"));
    casillas.forEach((c) => c.classList.remove("ok"));
    reflejo.setAttribute("x", String(REFLEJO_X));
  }

  return {
    encender: () => void activar(),
    apagar: reposo,
    destruir() {
      destruido = true;
      reposo();
      rafs.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
    },
  };
}

export default function BannerSeguridad({ nombre }: PropsBannerPropio) {
  const p = `sg${useId().replace(/:/g, "")}`;
  const g = (n: string) => `${p}${n}`;
  const u = (n: string) => `url(#${p}${n})`;
  const s = styles;
  return (
    <BannerPlano
      nombre={nombre}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial="#2fd27a"
      crearMotor={crearMotor}
      decoracion="casillas"
      variables={
        {
          "--brillo-on": "0", // las luces van en `fondo`
          "--etiqueta-pad": "2px 26px 0",
          "--etiqueta-sombra": "0 10px 24px -10px rgba(227, 38, 47, 0.6)",
          // "SEGURIDAD INDUSTRIAL" es largo: letra más chica para que quepa en una línea.
          "--palabra-min": "1.6rem",
          "--palabra-vw": "2.7vw",
          "--palabra-max": "2.5rem",
          "--palabra-movil-min": "1.2rem",
          "--palabra-movil-vw": "6.2vw",
          "--palabra-movil-max": "2.1rem",
        } as CSSProperties
      }
      fondo={
        <>
          <div className={s.luz} aria-hidden />
          <div className={s.baliza} aria-hidden />
          <div className={s.luzApto} aria-hidden />
        </>
      }
    >
      <svg viewBox="200 0 580 260" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false" className={s.svg}>
        <defs>
          <linearGradient id={g("casco")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe46a" />
            <stop offset="1" stopColor="#e0a800" />
          </linearGradient>
          <linearGradient id={g("vest")} x1="0" x2="1">
            <stop offset="0" stopColor="#e85a0c" />
            <stop offset=".5" stopColor="#ff8a2a" />
            <stop offset="1" stopColor="#e85a0c" />
          </linearGradient>
          <linearGradient id={g("ref")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3f6f9" />
            <stop offset="1" stopColor="#a6b1be" />
          </linearGradient>
          <linearGradient id={g("camisa")} x1="0" x2="1">
            <stop offset="0" stopColor="#2d4d78" />
            <stop offset=".5" stopColor="#3d6596" />
            <stop offset="1" stopColor="#2d4d78" />
          </linearGradient>
          <linearGradient id={g("pant")} x1="0" x2="1">
            <stop offset="0" stopColor="#1e3150" />
            <stop offset=".5" stopColor="#2a4268" />
            <stop offset="1" stopColor="#1e3150" />
          </linearGradient>
          <linearGradient id={g("guante")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e2b676" />
            <stop offset="1" stopColor="#b8853f" />
          </linearGradient>
          <linearGradient id={g("bota")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a5636" />
            <stop offset="1" stopColor="#3f2a17" />
          </linearGradient>
          <linearGradient id={g("mica")} x1="0" x2="1">
            <stop offset="0" stopColor="#9fd8ff" stopOpacity=".9" />
            <stop offset="1" stopColor="#3b86c4" stopOpacity=".85" />
          </linearGradient>
          <linearGradient id={g("brillo")} x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".95" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={g("sombra")}>
            <stop offset="0" stopColor="#000" stopOpacity=".45" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={g("halo")}>
            <stop offset="0" stopColor="#ffb020" stopOpacity=".85" />
            <stop offset="1" stopColor="#ffb020" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={g("piso")} x1="0" x2="1">
            <stop offset="0" stopColor="#c3ccd8" stopOpacity="0" />
            <stop offset=".2" stopColor="#c3ccd8" stopOpacity=".6" />
            <stop offset=".8" stopColor="#c3ccd8" stopOpacity=".6" />
            <stop offset="1" stopColor="#c3ccd8" stopOpacity="0" />
          </linearGradient>
          <clipPath id={g("clipRef")}>
            <rect x="452" y="128" width="16" height="7" />
            <rect x="472" y="128" width="16" height="7" />
            <rect x="452" y="146" width="16" height="7" />
            <rect x="472" y="146" width="16" height="7" />
            <rect x="455" y="100" width="6" height="28" transform="rotate(-8 458 114)" />
            <rect x="479" y="100" width="6" height="28" transform="rotate(8 482 114)" />
          </clipPath>
        </defs>

        {/* andamio de fondo (plano) */}
        <g opacity=".5">
          <path
            className={s.cota}
            d="M560 226V40M640 226V40M560 70H640M560 130H640M560 190H640M560 70L640 130M640 130L560 190"
            style={{ strokeDasharray: "3 4" }}
          />
          <path className={s.cota} d="M300 226V60M360 226V60M300 90H360M300 160H360" style={{ strokeDasharray: "3 4" }} />
        </g>

        {/* piso */}
        <path d="M220 226H770" stroke={u("piso")} strokeWidth="1.5" />
        <ellipse cx="470" cy="228" rx="56" ry="5" fill={u("sombra")} />

        {/* barrera con baliza */}
        <g transform="translate(690 0)">
          <ellipse cx="0" cy="228" rx="52" ry="4" fill={u("sombra")} />
          <path d="M-38 226L-30 156M38 226L30 156" stroke="#d8dde4" strokeWidth="5" strokeLinecap="round" />
          <rect x="-46" y="150" width="92" height="18" rx="2" fill="#f3f6fa" className={s.ol} />
          <path d="M-34 150h12l-18 18h-12zM-10 150h12l-18 18h-12zM14 150h12l-18 18h-12zM38 150h8v4l-14 14h-12z" fill="#e3262f" />
          <rect x="-46" y="150" width="92" height="18" rx="2" fill="none" className={s.ol} />
          <circle data-p="halo" cx="0" cy="128" r="40" fill={u("halo")} opacity=".15" />
          <rect x="-10" y="138" width="20" height="12" rx="2" fill="#1c222c" className={s.ol} />
          <path d="M-8 138V128A8 8 0 0 1 8 128V138Z" fill="#ffb020" className={s.ol} />
          <path d="M-4 130A4 4 0 0 1 0 125" fill="none" stroke="#fff" strokeWidth="1.6" opacity=".7" strokeLinecap="round" />
        </g>
        {/* cono */}
        <g transform="translate(380 226)">
          <ellipse cx="0" cy="2" rx="28" ry="3" fill={u("sombra")} />
          <path d="M-24 0H24L21 -6H-21Z" fill="#1c222c" className={s.ol} />
          <path d="M-16 -6L-4 -58H4L16 -6Z" fill="#ff7a1a" className={s.ol} />
          <path d="M-12 -22L-8 -38H8L12 -22Z" fill={u("ref")} />
        </g>

        {/* ===== trabajador ===== */}
        <g>
          {/* botas */}
          <path d="M446 204H468V218Q468 226 460 226H440Q436 226 436 222Q436 214 446 212Z" fill={u("bota")} className={s.ol} />
          <path d="M472 204H494V212Q504 214 504 222Q504 226 500 226H480Q472 226 472 218Z" fill={u("bota")} className={s.ol} />
          <path d="M436 222H468M472 222H504" stroke="#1c222c" strokeWidth="3" />
          {/* pantalón */}
          <path d="M446 156H494L496 206H473L470 176L467 206H444Z" fill={u("pant")} className={s.ol} />
          {/* brazos */}
          <path d="M444 104Q432 108 430 120L426 160H438L444 126Z" fill={u("camisa")} className={s.ol} />
          <path d="M496 104Q508 108 510 120L514 160H502L496 126Z" fill={u("camisa")} className={s.ol} />
          {/* torso */}
          <path d="M446 100Q470 92 494 100V160H446Z" fill={u("camisa")} className={s.ol} />
          {/* chaleco */}
          <path d="M446 100Q452 98 458 96L466 120V160H446Z M494 100Q488 98 482 96L474 120V160H494Z" fill={u("vest")} className={s.ol} />
          <rect x="452" y="128" width="16" height="7" fill={u("ref")} />
          <rect x="472" y="128" width="16" height="7" fill={u("ref")} />
          <rect x="452" y="146" width="16" height="7" fill={u("ref")} />
          <rect x="472" y="146" width="16" height="7" fill={u("ref")} />
          <rect x="455" y="100" width="6" height="28" fill={u("ref")} transform="rotate(-8 458 114)" />
          <rect x="479" y="100" width="6" height="28" fill={u("ref")} transform="rotate(8 482 114)" />
          {/* reflejo que cruza las cintas (solo activo) */}
          <g clipPath={u("clipRef")} className={s.reflejo}>
            <rect data-p="reflejo" x={REFLEJO_X} y="96" width="22" height="70" fill={u("brillo")} transform="skewX(-18)" />
          </g>
          {/* guantes */}
          <path d="M424 158H440V170Q440 178 432 178Q424 178 424 170Z" fill={u("guante")} className={s.ol} />
          <path d="M500 158H516V170Q516 178 508 178Q500 178 500 170Z" fill={u("guante")} className={s.ol} />
          <path d="M424 160H440M500 160H516" stroke="#e3262f" strokeWidth="4" />
          {/* cuello y cabeza */}
          <rect x="464" y="86" width="12" height="12" rx="3" fill="#d79c6c" className={s.ol} />
          <ellipse cx="470" cy="72" rx="15" ry="17" fill="#e6ae80" className={s.ol} />
          <ellipse cx="455" cy="74" rx="3" ry="4.5" fill="#d79c6c" className={s.ol} />
          <ellipse cx="485" cy="74" rx="3" ry="4.5" fill="#d79c6c" className={s.ol} />
          <path d="M465 82Q470 86 475 82" fill="none" stroke="#7a4a2c" strokeWidth="1.6" strokeLinecap="round" />
          {/* lentes */}
          <path d="M455 70H485" stroke="#1c222c" strokeWidth="2" />
          <path
            d="M456 68H469V74Q469 78 465 78H460Q456 78 456 74Z M471 68H484V74Q484 78 480 78H475Q471 78 471 74Z"
            fill={u("mica")}
            className={s.ol}
            style={{ strokeWidth: 1.2 }}
          />
          {/* casco */}
          <path d="M452 62A18 17 0 0 1 488 62Z" fill={u("casco")} className={s.ol} />
          <path d="M447 62H493Q495 66 491 66H449Q445 66 447 62Z" fill="#e0a800" className={s.ol} />
          <path d="M468 46H472V62H468Z" fill="#f2c200" opacity=".8" />
          <path d="M458 52A14 13 0 0 1 466 46" fill="none" stroke="#fff" strokeWidth="2.2" opacity=".6" strokeLinecap="round" />
        </g>

        {/* ===== llamadas técnicas (salen una por una con la clase global `in`) ===== */}
        {LLAMADAS.map((c, i) => {
          const lx = c.lado === "L" ? c.e[0] - ANCHO : c.e[0];
          const y = c.e[1];
          return (
            <g key={i} data-p={`llamada${i}`} className={s.llamada}>
              <path className={s.lin} pathLength={1} d={`M${c.p[0]} ${c.p[1]}L${c.e[0]} ${y}`} />
              <circle className={s.ping} cx={c.p[0]} cy={c.p[1]} r="3" />
              <circle className={s.dot} cx={c.p[0]} cy={c.p[1]} r="3" />
              <g className={s.lbl} style={{ "--dx": c.lado === "L" ? "-6px" : "6px" } as CSSProperties}>
                <rect x={lx} y={y - 12} width={ANCHO} height="24" rx="4" />
                <text className={s.t1} x={lx + 7} y={y - 1}>
                  {c.t}
                </text>
                <text className={s.t2} x={lx + 7} y={y + 8}>
                  {c.d}
                </text>
                <circle cx={lx + ANCHO - 9} cy={y - 3} r="4.2" fill="#2fd27a" />
                <path d={`M${lx + ANCHO - 11} ${y - 3}L${lx + ANCHO - 9.5} ${y - 1.4}L${lx + ANCHO - 6.8} ${y - 4.6}`} className={s.visto} />
              </g>
            </g>
          );
        })}

        {/* sello "APTO PARA OBRA" (clase global `apto`) */}
        {/* sobre la baliza, en el hueco del andamio: no tapa ninguna llamada */}
        <g transform="translate(700 92)">
          <g className={s.sello}>
            <rect x="-70" y="-11" width="140" height="22" rx="4" fill="rgba(7,21,38,.85)" stroke="#2fd27a" strokeWidth="1.5" />
            <path d="M-56 0l4 4 7 -8" className={s.selloVisto} />
            <text x="7" y="4" textAnchor="middle" className={s.selloTxt}>
              APTO PARA OBRA
            </text>
          </g>
        </g>
      </svg>
    </BannerPlano>
  );
}
