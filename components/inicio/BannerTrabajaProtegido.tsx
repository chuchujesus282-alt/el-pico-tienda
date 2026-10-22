"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { plexMono } from "@/components/tarjetas-categoria/fuentes";
import { animarAlDesplazar } from "@/components/tarjetas-categoria/tactil";
import styles from "./BannerTrabajaProtegido.module.css";

// Banner "Trabaja protegido", versión de LÍNEA: el casco es un ícono de línea en SVG animado con JavaScript propio
// (sin librerías). Portado TAL CUAL del prototipo aprobado banner-trabaja-protegido.html: SVG, física (G, TOP, Y0,
// LIFE, DROPS), objState(), helmetKick(), startBob, flotación, colores y CSS sin cambios.
// Al pasar el mouse (o con el foco del teclado) caen un bloque, un martillo y una llave inglesa sobre el casco, que se
// hunde y se balancea en cada golpe; los objetos rebotan y salen por abajo a la derecha. Corre UNA vez por entrada y
// siempre termina; no se rebobina.
// Diferencias con el prototipo, acordadas: todo el banner es un <Link> a la categoría y el botón es solo el indicador
// (en el teléfono anima el toque que desplaza la página y el toque quieto entra, como las tarjetas de categoría, ver
// tactil.ts); título más grande (44px; 36px en una columna); pasa a una columna (ilustración arriba) cuando el BANNER
// mide 560px o menos, no la pantalla (en el inicio va en media columna); llena el ancho de quien lo contiene (el
// prototipo medía hasta 620px); sin window.__demo ni el texto de ayuda de arriba.

type Props = {
  titulo?: string;
  descripcion?: string;
  textoBoton?: string;
  href?: string;
};

/** "Cascos, guantes… en cada obra." → "cascos, guantes… en cada obra" (para el aria-label). */
function enFrase(texto: string) {
  const sinPunto = texto.trim().replace(/\.$/, "");
  return sinPunto.charAt(0).toLowerCase() + sinPunto.slice(1);
}

type Ease = (x: number) => number;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, s: number, d: number, e: Ease) => e(clamp((t - s) / d));
const cubicOut: Ease = (x) => 1 - Math.pow(1 - x, 3);

// ---------- caída y rebote ----------
const G = 1400,
  TOP = 98; // gravedad y punto más alto del casco
const Y0 = -70;
type Drop = {
  at: number;
  x: number;
  half: number;
  r0: number;
  rFall: number;
  vx: number;
  vy: number;
  w: number;
  yc: number;
  tc: number;
};
// half: distancia del centro del objeto a su borde inferior al caer
const DROPS: Drop[] = [
  { at: 0.0, x: 138, half: 16, r0: 0, rFall: 0, vx: 150, vy: -220, w: 380 }, // bloque
  { at: 0.75, x: 142, half: 26, r0: 0, rFall: 0, vx: 165, vy: -240, w: 560 }, // martillo
  { at: 1.5, x: 140, half: 34, r0: 150, rFall: 30, vx: 140, vy: -260, w: 700 }, // llave
].map((d) => {
  const yc = TOP - d.half;
  return { ...d, yc, tc: Math.sqrt((2 * (yc - Y0)) / G) };
});
const LIFE = 1.45;
const T_END = DROPS[2].at + LIFE;

function objState(d: Drop, t: number) {
  const lt = t - d.at;
  if (lt < 0 || lt > LIFE) return null;
  if (lt <= d.tc) return { x: d.x, y: Y0 + 0.5 * G * lt * lt, r: d.r0 + d.rFall * (lt / d.tc) };
  const u = lt - d.tc;
  return { x: d.x + d.vx * u, y: d.yc + d.vy * u + 0.5 * G * u * u, r: d.r0 + d.rFall + d.w * u };
}
// respuesta del casco: se hunde y vuelve con un pequeño rebote amortiguado
function helmetKick(t: number) {
  let dip = 0,
    tilt = 0;
  DROPS.forEach((d, i) => {
    const u = t - d.at - d.tc;
    if (u < 0 || u > 0.6) return;
    const k = Math.exp(-u * 9) * Math.sin(u * 30 + 0.2);
    dip += 7 * Math.abs(k) * (u < 0.05 ? u / 0.05 : 1);
    tilt += (i === 1 ? 3 : -3) * k;
  });
  return { dip, tilt };
}

const transformCasco = (bob: number, dip: number, tilt: number) =>
  `translate(0 ${(bob + dip).toFixed(2)}) rotate(${tilt.toFixed(2)} 140 185) translate(140 185) scale(1 ${(1 - dip * 0.006).toFixed(3)}) translate(-140 -185)`;

export default function BannerTrabajaProtegido({
  titulo = "Trabaja protegido",
  descripcion = "Cascos, guantes, botas y mascarillas de seguridad industrial.",
  textoBoton = "Ver seguridad",
  href = "#seguridad",
}: Props) {
  // Id único para el clipPath: no choca con otros SVG de la página.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = { domeClip: `domeClip-${uid}` };

  const bannerRef = useRef<HTMLAnchorElement>(null);
  const helmetRef = useRef<SVGGElement>(null);
  const hitRef = useRef<SVGGElement>(null);
  const objsRef = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const banner = bannerRef.current,
      helmet = helmetRef.current,
      hit = hitRef.current;
    const objs = objsRef.current;
    if (!banner || !helmet || !hit) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- control: una pasada por cada entrada, nunca se rebobina ----------
    let mode: "idle" | "run" = "idle",
      t = 0,
      clock = 0,
      floatAmt = 1,
      startBob = 0,
      curBob = 0;
    function start() {
      if (mode === "run") return;
      mode = "run";
      t = 0;
      startBob = curBob;
    }
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    // Foco: solo el del teclado anima (en el teléfono, el toque también enfoca el enlace).
    const onFocusIn = () => {
      if (banner.matches(":focus-visible")) start();
    };
    banner.addEventListener("focusin", onFocusIn);
    // Escritorio: anima el mouse al entrar. Teléfono: anima el toque que desplaza la página; el que no, entra. La
    // pasada no se cancela (es corta y nunca se rebobina): si una tarjeta toma el turno, el banner solo termina.
    const quitarTactil = finePointer ? null : animarAlDesplazar(banner, start, () => {});
    if (finePointer) banner.addEventListener("mouseenter", start);

    let last = performance.now();
    let raf = 0;
    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!reduce) clock += dt;
      let bob = 0,
        dip = 0,
        tilt = 0,
        f = 1;
      objs.forEach((o) => o?.setAttribute("opacity", "0"));
      hit!.setAttribute("opacity", "0");

      if (mode === "run") {
        t += dt * (reduce ? 3 : 1);
        floatAmt = 0;
        bob = startBob * (1 - seg(t, 0, 0.3, cubicOut));
        ({ dip, tilt } = helmetKick(t));
        DROPS.forEach((d, i) => {
          const s = objState(d, t);
          const o = objs[i];
          if (!s || !o) return;
          o.setAttribute("opacity", "1");
          o.setAttribute("transform", `translate(${s.x.toFixed(1)} ${s.y.toFixed(1)}) rotate(${s.r.toFixed(1)})`);
          const u = t - d.at - d.tc;
          if (u >= 0 && u < 0.16) {
            hit!.setAttribute("opacity", (1 - u / 0.16).toFixed(2));
            hit!.setAttribute("transform", `translate(140 ${TOP + dip}) scale(${(0.8 + u * 2.5).toFixed(2)})`);
          }
        });
        f = 1 - seg(t, 0, 0.3, cubicOut) + seg(t, T_END - 0.35, 0.35, cubicOut);
        if (t >= T_END) {
          mode = "idle";
          clock = 0;
        }
      } else {
        floatAmt = Math.min(1, floatAmt + dt * 1.5);
        bob = Math.sin(clock * 1.6) * 5 * floatAmt;
      }
      curBob = bob;
      helmet!.setAttribute("transform", transformCasco(bob, dip, tilt));
      banner!.style.setProperty("--f", clamp(f).toFixed(3));
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // ---------- limpieza: nada queda vivo al cambiar de página ----------
    return () => {
      cancelAnimationFrame(raf);
      banner.removeEventListener("mouseenter", start);
      banner.removeEventListener("focusin", onFocusIn);
      quitarTactil?.();
      banner.style.removeProperty("--f");
    };
  }, []);

  return (
    <div className={styles.contenedor}>
      <Link
        ref={bannerRef}
        href={href}
        aria-label={`${titulo}: ${enFrase(descripcion)}`}
        className={`${styles.banner} ${plexMono.variable}`}
      >
        <div className={styles.copy}>
          <div className={styles.rule} />
          <h2>{titulo}</h2>
          <p>{descripcion}</p>
          <span className={styles.btn}>
            {textoBoton}
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M6 3l5 5-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        <div className={styles.art} aria-hidden="true">
          <svg className={styles.blueprint} viewBox="0 0 280 290" preserveAspectRatio="xMidYMid meet">
            <path d="M40 58 V44 H56" fill="none" stroke="rgba(190,215,245,.45)" strokeWidth="1.2" />
            <circle cx="140" cy="150" r="96" fill="none" stroke="rgba(190,215,245,.28)" strokeDasharray="2 4" />
            <line x1="140" y1="40" x2="140" y2="60" stroke="rgba(190,215,245,.45)" />
            <line x1="28" y1="150" x2="50" y2="150" stroke="rgba(190,215,245,.45)" />
            {/* cota vertical: alto del casco */}
            <line x1="234" y1="98" x2="234" y2="185" stroke="rgba(190,215,245,.5)" />
            <line x1="227" y1="98" x2="241" y2="98" stroke="rgba(190,215,245,.5)" />
            <line x1="227" y1="185" x2="241" y2="185" stroke="rgba(190,215,245,.5)" />
            <text x="248" y="142" transform="rotate(90 248 142)" textAnchor="middle">
              16 cm
            </text>
            {/* cota horizontal: largo del ala */}
            <line x1="66" y1="214" x2="214" y2="214" stroke="rgba(190,215,245,.5)" />
            <line x1="66" y1="208" x2="66" y2="220" stroke="rgba(190,215,245,.5)" />
            <line x1="214" y1="208" x2="214" y2="220" stroke="rgba(190,215,245,.5)" />
            <circle cx="66" cy="214" r="3" fill="#e3262f" />
            <text x="140" y="230" textAnchor="middle">
              30 cm
            </text>
            <text x="20" y="96">
              CASCO · ABS
            </text>
          </svg>

          <svg className={styles.scene} viewBox="0 0 280 290" preserveAspectRatio="xMidYMid meet">
            <defs>
              <clipPath id={ids.domeClip}>
                <path d="M 84 170 C 84 122, 110 98, 140 98 C 170 98, 196 122, 196 170 Z" />
              </clipPath>
            </defs>

            {/* casco: cúpula con franja roja, nervaduras laterales y ala curva (pivote en la base del ala) */}
            <g
              ref={helmetRef}
              transform={transformCasco(0, 0, 0)}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <rect
                x="129"
                y="94"
                width="22"
                height="80"
                fill="#a81d26"
                stroke="none"
                clipPath={`url(#${ids.domeClip})`}
              />
              <path d="M 129 100 V 168 M 151 100 V 168" stroke="#e3262f" strokeWidth="2.5" />
              <path d="M 84 170 C 84 122, 110 98, 140 98 C 170 98, 196 122, 196 170" stroke="#c3ccd8" strokeWidth="3.5" />
              <path
                d="M 112 108 C 104 124, 102 146, 103 168 M 168 108 C 176 124, 178 146, 177 168"
                stroke="#c3ccd8"
                strokeWidth="2.5"
                opacity="0.8"
              />
              <path
                d="M 66 172 Q 140 160 214 172 Q 217 182 206 185 Q 140 175 74 185 Q 63 182 66 172 Z"
                fill="#0e2847"
                stroke="#c3ccd8"
                strokeWidth="3.5"
              />
            </g>

            {/* golpe */}
            <g ref={hitRef} stroke="#c3ccd8" strokeWidth="2.5" strokeLinecap="round" opacity="0">
              <path d="M -26 -6 L -38 -14 M 26 -6 L 38 -14 M -16 -16 L -22 -28 M 16 -16 L 22 -28" />
            </g>

            {/* objetos que caen */}
            {/* bloque de concreto */}
            <g
              ref={(el) => {
                objsRef.current[0] = el;
              }}
              stroke="#c3ccd8"
              strokeLinejoin="round"
              opacity="0"
            >
              <rect x="-28" y="-16" width="56" height="32" rx="2" fill="#0e2847" strokeWidth="3.5" />
              <rect x="-21" y="-9" width="16" height="18" rx="2" fill="none" strokeWidth="2.5" />
              <rect x="5" y="-9" width="16" height="18" rx="2" fill="none" strokeWidth="2.5" />
            </g>
            {/* martillo (cae con la cabeza hacia abajo) */}
            <g
              ref={(el) => {
                objsRef.current[1] = el;
              }}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0"
            >
              <rect x="-4" y="-34" width="8" height="46" rx="3" fill="#a81d26" stroke="#e3262f" strokeWidth="2.5" />
              <path
                d="M -20 12 H 14 Q 22 12 24 20 Q 18 18 14 22 V 26 H -20 Z"
                fill="#0e2847"
                stroke="#c3ccd8"
                strokeWidth="3.5"
              />
            </g>
            {/* llave inglesa */}
            <g
              ref={(el) => {
                objsRef.current[2] = el;
              }}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0"
            >
              <rect x="-4.5" y="-6" width="9" height="40" rx="4" fill="#a81d26" stroke="#e3262f" strokeWidth="2.5" />
              <path
                d="M -12 -8 V -22 Q -12 -32 -4 -34 V -22 H 4 V -34 Q 12 -32 12 -22 V -8 Q 0 -2 -12 -8 Z"
                fill="#0e2847"
                stroke="#c3ccd8"
                strokeWidth="3.5"
              />
            </g>
          </svg>
        </div>
      </Link>
    </div>
  );
}
