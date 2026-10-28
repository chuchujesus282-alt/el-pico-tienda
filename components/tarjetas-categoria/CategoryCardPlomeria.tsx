"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { plexMono } from "./fuentes";
import { animarAlDesplazar } from "./tactil";
import styles from "./CategoryCardPlomeria.module.css";

// Tarjeta de categoría "Plomería", versión de LÍNEA: la tubería es un ícono de línea en SVG animado con JavaScript
// propio (sin librerías). Portada del prototipo aprobado tarjeta-plomeria-linea.html: piezas, state(t), curvas, bucle
// y colores sin cambios.
// Al pasar el mouse (o con el foco del teclado) el codo se pega a la pared izquierda, las piezas entran de una en una
// por la derecha, se abren las dos llaves y el agua recorre la red; al salir, todo se revierte.
// Diferencias con el prototipo, acordadas: toda la tarjeta es un <Link> que sí navega (en el teléfono anima el toque
// que desplaza la página, ver tactil.ts); en reposo el codo va CODO_REPOSO veces más grande (del tamaño del bombillo
// de Electricidad) y las cotas del plano con él; al pegarse a la pared vuelve a su tamaño, así la red armada queda
// igual. Sin window.__demo ni el texto de ayuda de arriba.

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

/** "Tuberías, conexiones, llaves y grifería." → "tuberías, conexiones, llaves y grifería" (para el aria-label). */
function enFrase(texto: string) {
  const sinPunto = texto.trim().replace(/\.$/, "");
  return sinPunto.charAt(0).toLowerCase() + sinPunto.slice(1);
}

// ---------- línea de tiempo ----------
type Ease = (x: number) => number;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, start: number, dur: number, ease: Ease) => ease(clamp((t - start) / dur));
const lin: Ease = (x) => x;
const cubicOut: Ease = (x) => 1 - Math.pow(1 - x, 3);
const cubicInOut: Ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const quadIn: Ease = (x) => x * x;

const IDLE = { x: 198.3, y: 141.7 },
  WALL = { x: 56, y: 106 };
const ARRIVE = Array.from({ length: 12 }, (_, i) => 0.62 + i * 0.2); // cuándo entra cada pieza por la derecha
const SLIDE = 0.19,
  T_LEVER = 3.06,
  T_WATER = 3.3,
  WATER_DUR = 1.4;
const T_END = T_WATER + WATER_DUR;
/** Tamaño del codo en reposo (1 = el del prototipo). Las cotas del plano están dibujadas para este valor. */
const CODO_REPOSO = 1.3;

function state(t: number) {
  const m = seg(t, 0.05, 0.7, cubicInOut);
  return {
    float: 1 - seg(t, 0, 0.4, cubicOut),
    ax: IDLE.x + (WALL.x - IDLE.x) * m,
    ay: IDLE.y + (WALL.y - IDLE.y) * m,
    codo: CODO_REPOSO + (1 - CODO_REPOSO) * m,
    pieces: ARRIVE.map((s) => seg(t, s, SLIDE, quadIn)),
    lever: seg(t, T_LEVER, 0.3, cubicOut),
    water: seg(t, T_WATER, WATER_DUR, lin),
  };
}

/** Transform del codo; crece desde el centro de su dibujo (1, 20), que en reposo cae en el centro del plano. */
const transformCodo = (x: number, y: number, giro: number, escala: number) =>
  `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${giro.toFixed(2)}) translate(1 20) scale(${escala.toFixed(3)}) translate(-1 -20)`;

/** Recorrido del agua: desde la pared hasta el borde derecho. */
const AGUA =
  "M 6 106 L 66 106 A 24 24 0 0 1 90 130 L 90 186 A 24 24 0 0 0 114 210 L 296 210 A 24 24 0 0 0 320 186 L 320 180 A 24 24 0 0 0 296 156 L 174 156 A 24 24 0 0 1 150 132 L 150 84 A 24 24 0 0 1 174 60 L 420 60";

// Posición inicial = state(0): así se ve igual que en reposo mientras carga el JS; luego la pone el bucle.
const PIEZA_FUERA = { transform: "translate(420 0)", opacity: "0" };

export default function CategoryCardPlomeria({
  titulo = "Grifería",
  descripcion = "Grifos, duchas, llaves, sanitarios, repuestos, desagües y filtros.",
  href = "#griferia",
  escalar = false,
}: Props) {
  // Id único para el filtro: varias tarjetas en la misma página no se pisan.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = { wblur: `wblur-${uid}` };

  const cardRef = useRef<HTMLAnchorElement>(null);
  const pARef = useRef<SVGGElement>(null);
  const wFillRef = useRef<SVGPathElement>(null);
  const wGlowRef = useRef<SVGPathElement>(null);
  const piecesRef = useRef<(SVGGElement | null)[]>([]);
  const leversRef = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const card = cardRef.current,
      pA = pARef.current,
      wFill = wFillRef.current,
      wGlow = wGlowRef.current;
    if (!card || !pA || !wFill || !wGlow) return;
    const pieces = piecesRef.current;
    const levers = leversRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const LEN = wFill.getTotalLength();
    [wFill, wGlow].forEach((p) => {
      p.style.strokeDasharray = `${LEN} ${LEN}`;
      p.style.strokeDashoffset = String(LEN);
    });

    // ---------- control ----------
    let tl = 0,
      dir = -1,
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
      const speed = reduce ? 3 : dir > 0 ? 1 : 1.6;
      tl = Math.max(0, Math.min(T_END, tl + dt * speed * dir));
      if (!reduce) clock += dt;

      const s = state(tl);
      const bob = Math.sin(clock * 1.6) * 6 * s.float;
      const tilt = Math.sin(clock * 0.9) * 2.5 * s.float;
      pA!.setAttribute("transform", transformCodo(s.ax, s.ay + bob, tilt, s.codo));

      pieces.forEach((el, i) => {
        if (!el) return;
        const e = s.pieces[i];
        el.setAttribute("transform", `translate(${((1 - e) * 420).toFixed(2)} 0)`);
        el.setAttribute("opacity", Math.min(1, Math.max(0, e * 3)).toFixed(3));
      });

      // llaves: cerradas (palanca hacia el frente, se ve corta) → abiertas (en línea con el tubo)
      const k = 0.18 + 0.82 * s.lever;
      levers.forEach((lv) => {
        if (!lv) return;
        const px = lv.dataset.px,
          py = lv.dataset.py;
        lv.setAttribute("transform", `translate(${px} ${py}) scale(${k.toFixed(3)} 1) translate(${-px!} ${-py!})`);
      });

      // agua
      const off = (LEN * (1 - s.water)).toFixed(2);
      wFill!.style.strokeDashoffset = off;
      wGlow!.style.strokeDashoffset = off;
      card!.style.setProperty("--f", (1 - seg(tl, 0, 0.5, cubicOut)).toFixed(3));

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
      {/* Plano del codo en reposo, a la medida de CODO_REPOSO (el del prototipo, agrandado 1,3 desde el centro
          (160, 138); los textos y los topes de las cotas conservan su tamaño). */}
      <svg className={styles.blueprint} viewBox="0 0 320 420" aria-hidden="true">
        <path d="M61 50 V36 H77" fill="none" stroke="rgba(190,215,245,.45)" strokeWidth="1.2" />
        <circle cx="160" cy="138" r="96" fill="none" stroke="rgba(190,215,245,.28)" strokeDasharray="2 4" />
        <line x1="160" y1="32" x2="160" y2="52" stroke="rgba(190,215,245,.45)" />
        <line x1="53" y1="138" x2="75" y2="138" stroke="rgba(190,215,245,.45)" />
        {/* cota vertical */}
        <line x1="285" y1="94" x2="285" y2="184" stroke="rgba(190,215,245,.5)" />
        <line x1="278" y1="94" x2="292" y2="94" stroke="rgba(190,215,245,.5)" />
        <line x1="278" y1="184" x2="292" y2="184" stroke="rgba(190,215,245,.5)" />
        <text x="299" y="139" transform="rotate(90 299 139)" textAnchor="middle">
          90 mm
        </text>
        {/* cota horizontal */}
        <line x1="108" y1="213" x2="212" y2="213" stroke="rgba(190,215,245,.5)" />
        <line x1="108" y1="207" x2="108" y2="219" stroke="rgba(190,215,245,.5)" />
        <line x1="212" y1="207" x2="212" y2="219" stroke="rgba(190,215,245,.5)" />
        <line x1="160" y1="205" x2="160" y2="221" stroke="rgba(190,215,245,.35)" />
        <circle cx="108" cy="213" r="3" fill="#e3262f" />
        <text x="160" y="231" textAnchor="middle">
          120 mm
        </text>
        <text x="98" y="104" textAnchor="end">
          PVC · Ø 1/2″
        </text>
      </svg>

      <svg className={styles.scene} viewBox="0 0 320 420" aria-hidden="true">
        <defs>
          <filter id={ids.wblur} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* todo el conjunto a escala 0.82, anclado a la pared izquierda */}
        <g transform="translate(1.5 112) scale(0.82) translate(-6 -130)">
          {/* agua: recorre la red desde la pared hasta el grifo. "0 9999" la oculta hasta que el bucle mide el largo. */}
          <g fill="none" strokeLinecap="butt" strokeLinejoin="round">
            <path
              ref={wGlowRef}
              d={AGUA}
              stroke="#4fb3ff"
              strokeWidth="22"
              opacity="0.35"
              filter={`url(#${ids.wblur})`}
              strokeDasharray="0 9999"
            />
            <path ref={wFillRef} d={AGUA} stroke="#4fb3ff" strokeWidth="18" strokeDasharray="0 9999" />
          </g>

          <g fill="none" stroke="#c3ccd8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            {/* A · codo principal (en reposo: centrado, apuntando hacia abajo) */}
            <g ref={pARef} transform={transformCodo(IDLE.x, IDLE.y, 0, CODO_REPOSO)}>
              <path d="M -50 -18 V 18" />
              <path d="M -48 -12 H 10 A 36 36 0 0 1 46 24 V 60" />
              <path d="M -48 12 H 10 A 12 12 0 0 1 22 24 V 60" />
              <path d="M 16 63 H 52" />
              <path d="M -20 -14 V -22" />
              <path d="M -29 -23 H -11" stroke="#e3262f" />
            </g>

            {/* B · codo hacia la derecha */}
            <g ref={(el) => { piecesRef.current[0] = el; }} {...PIEZA_FUERA}>
              <path d="M 78 172 V 186 A 36 36 0 0 0 114 222 H 116" />
              <path d="M 102 172 V 186 A 12 12 0 0 0 114 198 H 116" />
              <path d="M 118 192 V 228" />
            </g>
            {/* C · tubo recto */}
            <g ref={(el) => { piecesRef.current[1] = el; }} {...PIEZA_FUERA}>
              <path d="M 121 198 H 171" />
              <path d="M 121 222 H 171" />
              <path d="M 174 192 V 228" />
            </g>
            {/* D · llave de paso */}
            <g ref={(el) => { piecesRef.current[2] = el; }} {...PIEZA_FUERA}>
              <rect x="177" y="190" width="28" height="40" rx="7" fill="#0e2847" />
              <path d="M 191 190 V 181" />
              <g
                ref={(el) => { leversRef.current[0] = el; }}
                data-px="191"
                data-py="178"
                transform="translate(191 178) scale(0.18 1) translate(-191 -178)"
              >
                <path d="M 191 178 H 213" stroke="#e3262f" />
              </g>
              <path d="M 208 192 V 228" />
            </g>
            {/* F · tubo recto */}
            <g ref={(el) => { piecesRef.current[3] = el; }} {...PIEZA_FUERA}>
              <path d="M 211 198 H 261" />
              <path d="M 211 222 H 261" />
              <path d="M 264 192 V 228" />
            </g>
            {/* G1 · codo hacia arriba */}
            <g ref={(el) => { piecesRef.current[4] = el; }} {...PIEZA_FUERA}>
              <path d="M 267 222 H 296 A 36 36 0 0 0 332 186 V 184" />
              <path d="M 267 198 H 296 A 12 12 0 0 0 308 186 V 184" />
              <path d="M 302 182 H 338" />
            </g>
            {/* G2 · codo hacia la izquierda */}
            <g ref={(el) => { piecesRef.current[5] = el; }} {...PIEZA_FUERA}>
              <path d="M 332 180 A 36 36 0 0 0 296 144 H 270" />
              <path d="M 308 180 A 12 12 0 0 0 296 168 H 270" />
              <path d="M 267 138 V 174" />
            </g>
            {/* J · segunda llave de paso */}
            <g ref={(el) => { piecesRef.current[6] = el; }} {...PIEZA_FUERA}>
              <path d="M 264 138 V 174" />
              <rect x="233" y="136" width="28" height="40" rx="7" fill="#0e2847" />
              <path d="M 247 136 V 127" />
              <g
                ref={(el) => { leversRef.current[1] = el; }}
                data-px="247"
                data-py="124"
                transform="translate(247 124) scale(0.18 1) translate(-247 -124)"
              >
                <path d="M 247 124 H 269" stroke="#e3262f" />
              </g>
              <path d="M 229 138 V 174" />
            </g>
            {/* I · tubo recto */}
            <g ref={(el) => { piecesRef.current[7] = el; }} {...PIEZA_FUERA}>
              <path d="M 181 144 H 226" />
              <path d="M 181 168 H 226" />
              <path d="M 178 138 V 174" />
            </g>
            {/* K · codo hacia arriba */}
            <g ref={(el) => { piecesRef.current[8] = el; }} {...PIEZA_FUERA}>
              <path d="M 175 168 A 36 36 0 0 1 138 132 V 108" />
              <path d="M 175 144 A 12 12 0 0 1 162 132 V 108" />
              <path d="M 132 105 H 168" />
            </g>
            {/* L · codo hacia la derecha; sale por el borde derecho (el sistema continúa) */}
            <g ref={(el) => { piecesRef.current[9] = el; }} {...PIEZA_FUERA}>
              <path d="M 138 102 V 84 A 36 36 0 0 1 174 48 H 178" />
              <path d="M 162 102 V 84 A 12 12 0 0 1 174 72 H 178" />
              <path d="M 180 42 V 78" />
            </g>
            {/* T1 · tubo recto */}
            <g ref={(el) => { piecesRef.current[10] = el; }} {...PIEZA_FUERA}>
              <path d="M 183 48 H 259" />
              <path d="M 183 72 H 259" />
              <path d="M 262 42 V 78" />
            </g>
            {/* T2 · tubo recto que sigue fuera de la tarjeta */}
            <g ref={(el) => { piecesRef.current[11] = el; }} {...PIEZA_FUERA}>
              <path d="M 265 48 H 420" />
              <path d="M 265 72 H 420" />
            </g>
          </g>
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
