"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { plexMono } from "./fuentes";
import { animarAlDesplazar } from "./tactil";
import styles from "./CategoryCardElectricidad.module.css";

// Tarjeta de categoría "Electricidad", versión de LÍNEA: el bombillo es un ícono de línea en SVG animado con
// JavaScript propio (sin librerías). Portada TAL CUAL del prototipo aprobado tarjeta-electricidad-linea.html: SVG,
// state(t), curvas, parpadeo, bucle, colores y CSS sin cambios. Reemplaza a la versión 3D (Three.js + GSAP).
// Al pasar el mouse (o con el foco del teclado) baja el portalámparas, el bombillo se voltea, se enrosca y prende con
// un parpadeo.
// Diferencias con el prototipo, acordadas: toda la tarjeta es un <Link> que sí navega (en el teléfono anima el toque
// que desplaza la página, ver tactil.ts); cuadrícula de plano en el fondo, como la de Plomería; sin window.__demo ni
// el texto de ayuda de arriba.

type Props = {
  titulo?: string;
  descripcion?: string;
  href?: string;
  /**
   * Llena el ancho de quien la contiene y escala TODO en proporción (ej. una columna del inicio). Sin ella mide
   * 320×420, como el prototipo.
   */
  escalar?: boolean;
};

/** "Cables, breakers, tomas e iluminación." → "cables, breakers, tomas e iluminación" (para el aria-label). */
function enFrase(texto: string) {
  const sinPunto = texto.trim().replace(/\.$/, "");
  return sinPunto.charAt(0).toLowerCase() + sinPunto.slice(1);
}

// ---------- línea de tiempo (mismos tiempos que la versión 3D) ----------
type Ease = (x: number) => number;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, start: number, dur: number, ease: Ease) => ease(clamp((t - start) / dur));
const lin: Ease = (x) => x;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- está en el prototipo, sin uso.
const quadOut: Ease = (x) => 1 - (1 - x) * (1 - x);
const cubicOut: Ease = (x) => 1 - Math.pow(1 - x, 3);
const quartOut: Ease = (x) => 1 - Math.pow(1 - x, 4);
const quadInOut: Ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const cubicInOut: Ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

const IDLE_Y = 158,
  MID_Y = 112,
  FINAL_Y = 86;
const FLICKER: [number, number, Ease][] = [
  [0.05, 0.7, lin],
  [0.08, 0.1, lin],
  [0.05, 0.85, lin],
  [0.07, 0.35, lin],
  [0.35, 1, cubicOut],
];
const T_END = 1.72 + FLICKER.reduce((a, k) => a + k[0], 0);

function state(t: number) {
  const s = { float: 0, sock: 0, flip: 0, y: 0, screw: 0, power: 0 };
  s.float = 1 - seg(t, 0, 0.4, cubicOut);
  s.sock = seg(t, 0.05, 0.8, quartOut);
  const a = seg(t, 0.05, 0.7, cubicInOut);
  const b = seg(t, 0.75, 0.95, quadInOut);
  s.flip = a;
  s.y = t < 0.75 ? IDLE_Y + (MID_Y - IDLE_Y) * a : MID_Y + (FINAL_Y - MID_Y) * b;
  s.screw = Math.PI * 4 * b;
  let p = 0,
    tt = t - 1.72;
  if (tt > 0) {
    for (const [d, v, e] of FLICKER) {
      if (tt <= d) {
        p = p + (v - p) * e(tt / d);
        tt = -1;
        break;
      }
      tt -= d;
      p = v;
    }
  }
  s.power = p;
  return s;
}

type Color = [number, number, number];
const RED: Color = [227, 38, 47],
  WARM: Color = [255, 179, 92],
  HOT: Color = [255, 241, 210];
const mix = (c1: Color, c2: Color, k: number) => c1.map((v, i) => Math.round(v + (c2[i] - v) * k)) as Color;
const rgb = (c: Color) => `rgb(${c[0]},${c[1]},${c[2]})`;

/** Ángulos de los 10 rayos de luz alrededor del vidrio. */
const RAYOS = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2 + Math.PI / 10);

export default function CategoryCardElectricidad({
  titulo = "Electricidad",
  descripcion = "Cables, breakers, tomas e iluminación.",
  href = "#electricidad",
  escalar = false,
}: Props) {
  // Ids únicos para gradientes y filtros: varias tarjetas en la misma página no se pisan.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = { glassOn: `glassOn-${uid}`, haloGrad: `haloGrad-${uid}`, blur3: `blur3-${uid}`, blur2: `blur2-${uid}` };

  const cardRef = useRef<HTMLAnchorElement>(null);
  const bulbRef = useRef<SVGGElement>(null);
  const socketRef = useRef<SVGGElement>(null);
  const filRef = useRef<SVGGElement>(null);
  const filWRef = useRef<SVGPolylineElement>(null);
  const filGlowRef = useRef<SVGPolylineElement>(null);
  const glassLitRef = useRef<SVGPathElement>(null);
  const glassGlowRef = useRef<SVGPathElement>(null);
  const haloRef = useRef<SVGCircleElement>(null);
  const outlineRef = useRef<SVGPathElement>(null);
  const baseRef = useRef<SVGGElement>(null);
  const idleRaysRef = useRef<SVGGElement>(null);
  const litRaysRef = useRef<SVGGElement>(null);
  const rayosRef = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const card = cardRef.current;
    const bulb = bulbRef.current,
      socket = socketRef.current,
      fil = filRef.current,
      filW = filWRef.current,
      filGlow = filGlowRef.current;
    const glassLit = glassLitRef.current,
      glassGlow = glassGlowRef.current,
      halo = haloRef.current,
      outline = outlineRef.current,
      base = baseRef.current;
    const idleRays = idleRaysRef.current,
      litRays = litRaysRef.current;
    if (!card || !bulb || !socket || !fil || !filW || !filGlow || !glassLit || !glassGlow || !halo || !outline || !base) return;
    if (!idleRays || !litRays) return;
    const rays = RAYOS.map((a, i) => [rayosRef.current[i], a] as const);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- control ----------
    let tl = 0,
      dir = -1,
      spin = 0,
      clock = 0,
      on = false;
    function turnOn() {
      if (on) return;
      on = true;
      dir = 1;
      card!.classList.add(styles.on);
    }
    function turnOff() {
      if (!on) return;
      on = false;
      dir = -1;
      card!.classList.remove(styles.on);
    }

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onFocusOut = (e: FocusEvent) => {
      if (!card.contains(e.relatedTarget as Node | null)) turnOff();
    };
    // Foco: solo el del teclado anima (en el teléfono, el toque también enfoca el enlace).
    const onFocusIn = () => {
      if (card.matches(":focus-visible")) turnOn();
    };
    card.addEventListener("focusin", onFocusIn);
    card.addEventListener("focusout", onFocusOut);
    // Escritorio: anima el mouse encima. Teléfono: anima el toque que desplaza la página; el que no, entra sin animar.
    const quitarTactil = finePointer ? null : animarAlDesplazar(card, turnOn, turnOff);
    if (finePointer) {
      card.addEventListener("mouseenter", turnOn);
      card.addEventListener("mouseleave", turnOff);
    }

    // ---------- bucle ----------
    let last = performance.now();
    let raf = 0;
    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const speed = reduce ? 3 : dir > 0 ? 1 : 1.5;
      tl = Math.max(0, Math.min(T_END, tl + dt * speed * dir));
      if (!reduce) clock += dt;

      // giro en reposo: avanza solo cuando está apagado y quieto
      if (tl === 0 && !on) {
        if (!reduce) spin += dt * 0.7;
      } else {
        const target = Math.round(spin / Math.PI) * Math.PI;
        spin += (target - spin) * Math.min(1, dt * 8);
      }

      const s = state(tl);
      const turn = spin + s.screw;
      const bob = Math.sin(clock * 1.6) * 6 * s.float;
      const tilt = Math.sin(clock * 0.9) * 3 * s.float;

      bulb!.setAttribute("transform", `translate(160 ${(s.y + bob).toFixed(2)}) rotate(${(tilt + s.flip * 180).toFixed(2)})`);
      socket!.setAttribute("transform", `translate(160 ${((1 - s.sock) * -140).toFixed(2)})`);

      // ilusión de giro: el filamento se aplana y se voltea
      const c = Math.cos(turn);
      fil!.setAttribute("transform", `scale(${(Math.sign(c || 1) * Math.max(Math.abs(c), 0.06)).toFixed(3)} 1)`);
      idleRays!.setAttribute("opacity", s.float.toFixed(3));

      // luz
      const p = s.power;
      const col = p < 0.6 ? mix(RED, WARM, p / 0.6) : mix(WARM, HOT, (p - 0.6) / 0.4);
      filW!.setAttribute("stroke", rgb(col));
      filGlow!.setAttribute("opacity", p.toFixed(3));
      glassLit!.setAttribute("opacity", (p * 0.85).toFixed(3));
      glassGlow!.setAttribute("opacity", p.toFixed(3));
      const lineCol = rgb(mix([195, 204, 216], [255, 222, 170], p));
      outline!.setAttribute("stroke", lineCol);
      base!.setAttribute("stroke", lineCol);

      // rayos encendidos en el centro real del vidrio
      const th = ((tilt + s.flip * 180) * Math.PI) / 180;
      const gx = 160 + 30 * Math.sin(th),
        gy = s.y + bob - 30 * Math.cos(th);
      litRays!.setAttribute("opacity", p.toFixed(3));
      const r1 = 58,
        r2 = 58 + 6 + 10 * p;
      for (const [l, a] of rays) {
        if (!l) continue;
        l.setAttribute("x1", (gx + Math.cos(a) * r1).toFixed(1));
        l.setAttribute("y1", (gy + Math.sin(a) * r1).toFixed(1));
        l.setAttribute("x2", (gx + Math.cos(a) * r2).toFixed(1));
        l.setAttribute("y2", (gy + Math.sin(a) * r2).toFixed(1));
      }
      halo!.setAttribute("opacity", p.toFixed(3));
      card!.style.setProperty("--p", p.toFixed(3));
      card!.style.setProperty("--f", (s.float * (1 - p)).toFixed(3));

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // ---------- limpieza: nada queda vivo al cambiar de página ----------
    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener("mouseenter", turnOn);
      card.removeEventListener("mouseleave", turnOff);
      card.removeEventListener("focusin", onFocusIn);
      card.removeEventListener("focusout", onFocusOut);
      quitarTactil?.();
      card.classList.remove(styles.on);
      card.style.removeProperty("--p");
      card.style.removeProperty("--f");
    };
  }, []);

  const tarjeta = (
    <Link
      ref={cardRef}
      href={href}
      aria-label={`${titulo}: ${enFrase(descripcion)}`}
      className={`${styles.card} ${escalar ? styles.escalable : ""} ${plexMono.variable}`}
    >
      <div className={styles.dim} />
      <div className={styles.glow} />

      <svg className={styles.blueprint} viewBox="0 0 320 420" preserveAspectRatio="none" aria-hidden="true">
        <path d="M40 46 V30 H56" fill="none" stroke="rgba(190,215,245,.45)" strokeWidth="1.2" />
        <circle cx="160" cy="136" r="100" fill="none" stroke="rgba(190,215,245,.28)" strokeDasharray="2 4" />
        <line x1="250" y1="50" x2="250" y2="221" stroke="rgba(190,215,245,.5)" />
        <line x1="243" y1="50" x2="257" y2="50" stroke="rgba(190,215,245,.5)" />
        <line x1="243" y1="221" x2="257" y2="221" stroke="rgba(190,215,245,.5)" />
        <text x="264" y="136" transform="rotate(90 264 136)" textAnchor="middle">
          108 mm
        </text>
        <line x1="111" y1="22" x2="209" y2="22" stroke="rgba(190,215,245,.5)" />
        <line x1="111" y1="16" x2="111" y2="28" stroke="rgba(190,215,245,.5)" />
        <line x1="209" y1="16" x2="209" y2="28" stroke="rgba(190,215,245,.5)" />
        <path d="M95 22 l8 -4 v8 z" fill="#e3262f" />
        <text x="222" y="25">
          Ø 60 mm
        </text>
        <text x="40" y="140">
          A60 · E27
        </text>
      </svg>

      <svg className={styles.scene} viewBox="0 0 320 420" aria-hidden="true">
        <defs>
          <radialGradient id={ids.glassOn} cx="0.5" cy="0.45" r="0.6">
            <stop offset="0" stopColor="#fff6e2" />
            <stop offset="0.5" stopColor="#ffd58f" />
            <stop offset="1" stopColor="#ffab4a" stopOpacity="0.85" />
          </radialGradient>
          <radialGradient id={ids.haloGrad}>
            <stop offset="0" stopColor="#fff4dc" stopOpacity="0.9" />
            <stop offset="0.3" stopColor="#ffcf80" stopOpacity="0.45" />
            <stop offset="0.65" stopColor="#ff9f45" stopOpacity="0.1" />
            <stop offset="1" stopColor="#ff8c3a" stopOpacity="0" />
          </radialGradient>
          <filter id={ids.blur3} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id={ids.blur2} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* rayos al encender (no giran con el bombillo) */}
        <g ref={litRaysRef} opacity="0" stroke="#ffd59a" strokeWidth="3.5" strokeLinecap="round">
          {RAYOS.map((a, i) => (
            <line
              key={a}
              ref={(el) => {
                rayosRef.current[i] = el;
              }}
            />
          ))}
        </g>

        {/* bombillo en línea: centro del vidrio en (0,-30). La posición inicial es la de state(0) (en reposo), para que
            no aparezca en la esquina mientras carga el JS; luego la pone el bucle. */}
        <g ref={bulbRef} transform={`translate(160 ${IDLE_Y}) rotate(0)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle
            ref={haloRef}
            className={styles.halo}
            cx="0"
            cy="-30"
            r="105"
            fill={`url(#${ids.haloGrad})`}
            stroke="none"
            opacity="0"
          />
          {/* rayos en reposo, como el ícono original */}
          <g ref={idleRaysRef} stroke="var(--stroke)" strokeWidth="3.5">
            <line x1="0" y1="-86" x2="0" y2="-96" />
            <line x1="-39.6" y1="-69.6" x2="-46.7" y2="-76.7" />
            <line x1="39.6" y1="-69.6" x2="46.7" y2="-76.7" />
          </g>
          <path
            ref={glassLitRef}
            d="M -18 24 L -18 16 C -18 8, -30 2, -36 -4.7 A 44 44 0 1 1 36 -4.7 C 30 2, 18 8, 18 16 L 18 24 Z"
            fill={`url(#${ids.glassOn})`}
            stroke="none"
            opacity="0"
          />
          <path
            ref={glassGlowRef}
            d="M -18 24 L -18 16 C -18 8, -30 2, -36 -4.7 A 44 44 0 1 1 36 -4.7 C 30 2, 18 8, 18 16 L 18 24"
            stroke="#ffcf87"
            strokeWidth="7"
            filter={`url(#${ids.blur2})`}
            opacity="0"
          />
          <path
            ref={outlineRef}
            d="M -18 24 L -18 16 C -18 8, -30 2, -36 -4.7 A 44 44 0 1 1 36 -4.7 C 30 2, 18 8, 18 16 L 18 24"
            stroke="#c3ccd8"
            strokeWidth="3.5"
          />
          {/* filamento W (escala en X para simular el giro) */}
          <g ref={filRef}>
            <polyline
              ref={filGlowRef}
              points="-15,-38 -8,-23 0,-34 8,-23 15,-38"
              stroke="#ffd27a"
              strokeWidth="8"
              filter={`url(#${ids.blur3})`}
              opacity="0"
            />
            <polyline ref={filWRef} points="-15,-38 -8,-23 0,-34 8,-23 15,-38" stroke="#e3262f" strokeWidth="3.5" />
          </g>
          {/* base: tres líneas */}
          <g ref={baseRef} stroke="#c3ccd8" strokeWidth="3.5">
            <line x1="-20" y1="33" x2="20" y2="33" />
            <line x1="-20" y1="43" x2="20" y2="43" />
            <line x1="-9" y1="53" x2="9" y2="53" />
          </g>
        </g>

        {/* portalámparas en línea (relleno con el azul de la tarjeta para tapar la base) */}
        <g
          ref={socketRef}
          transform="translate(160 -140)"
          stroke="#c3ccd8"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="0" y1="-320" x2="0" y2="2" />
          <path d="M -12 2 L 12 2 L 22 16 L -22 16 Z" fill="#0e2847" />
          <rect x="-27" y="16" width="54" height="44" rx="4" fill="#0e2847" />
          <line x1="-17" y1="30" x2="17" y2="30" />
          <line x1="-17" y1="44" x2="17" y2="44" />
        </g>
      </svg>

      <div className={styles.copy}>
        <div className={styles.rule} />
        <h2>{titulo}</h2>
        <p>{descripcion}</p>
        <div className={styles.cta}>
          Ver categoría <span>→</span>
        </div>
      </div>
    </Link>
  );

  // Para escalar, el ancho de referencia (100cqw) es el de este contenedor.
  return escalar ? <div className={styles.contenedor}>{tarjeta}</div> : tarjeta;
}
