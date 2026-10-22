"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { plexMono } from "./fuentes";
import { animarAlDesplazar } from "./tactil";
import styles from "./CategoryCardJardin.module.css";

// Tarjeta de categoría "Hogar y jardín", versión de LÍNEA: la pala es un ícono de línea en SVG animado con JavaScript
// propio (sin librerías). Portada TAL CUAL del prototipo aprobado tarjeta-jardin-linea.html: SVG, poses, línea de
// tiempo, terrones, curvas, colores y CSS sin cambios.
// Al pasar el mouse (o con el foco del teclado) la escena se corre a la izquierda, entra la montaña de tierra, la pala
// da tres paladas lanzando terrones arriba a la izquierda (la montaña baja con cada una) y se clava en el suelo. Al
// salir NO se rebobina: la pala vuelve directo al centro y la escena se retira.
// Diferencias con el prototipo, las mismas que en Electricidad y Plomería: toda la tarjeta es un <Link> que sí navega
// (en el teléfono anima el toque que desplaza la página, ver tactil.ts) y la cuadrícula se difumina bajo el texto;
// sin window.__demo ni el texto de ayuda de arriba.

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

/** "Mangueras, herramientas de jardín y más para tu casa." → "mangueras, …" (para el aria-label). */
function enFrase(texto: string) {
  const sinPunto = texto.trim().replace(/\.$/, "");
  return sinPunto.charAt(0).toLowerCase() + sinPunto.slice(1);
}

const NS = "http://www.w3.org/2000/svg";

// ---------- utilidades ----------
type Ease = (x: number) => number;
type Pose = { x: number; y: number; r: number };
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, start: number, dur: number, ease: Ease) => ease(clamp((t - start) / dur));
const lin: Ease = (x) => x;
const quadIn: Ease = (x) => x * x;
const cubicOut: Ease = (x) => 1 - Math.pow(1 - x, 3);
const cubicInOut: Ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpPose = (a: Pose, b: Pose, k: number): Pose => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), r: lerp(a.r, b.r, k) });
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

// ---------- poses de la pala (x, y del origen; r en grados) ----------
const IDLE: Pose = { x: 160, y: 182, r: 0 };
const READY: Pose = { x: 128, y: 164, r: -40 };
const LIFT: Pose = { x: 126, y: 140, r: -14 };
const THROW: Pose = { x: 98, y: 124, r: -6 }; // impulso hacia arriba y a la izquierda, sin voltearse
const RAISE: Pose = { x: 96, y: 118, r: -2 };
const PLANT: Pose = { x: 96, y: 234, r: -4 };
const digPose = (i: number): Pose => ({ x: 170 + i * 7, y: 193 + i * 2, r: -40 });

// ---------- línea de tiempo de ida ----------
const SCOOP0 = 0.8,
  SCOOP = 1.05,
  N = 3;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- como en el prototipo: recibe la vuelta y no la usa.
const spin = (p: Pose, _vuelta: number) => p;
const T_PLANT_UP = SCOOP0 + N * SCOOP,
  T_IMPACT = T_PLANT_UP + 0.53,
  T_END = T_IMPACT + 0.12;
const releaseTimes: number[] = [],
  shrinkTimes: number[] = [];

type Key = { t: number; p: Pose; e: Ease };
function buildKeys(start: Pose): Key[] {
  const K: Key[] = [
    { t: 0, p: start, e: lin },
    { t: 0.6, p: READY, e: cubicInOut },
  ];
  for (let i = 0; i < N; i++) {
    const s = SCOOP0 + i * SCOOP;
    K.push({ t: s, p: spin(READY, i), e: lin });
    K.push({ t: s + 0.22, p: spin(digPose(i), i), e: quadIn });
    K.push({ t: s + 0.3, p: spin(digPose(i), i), e: lin });
    K.push({ t: s + 0.55, p: spin(LIFT, i), e: cubicOut });
    K.push({ t: s + 0.78, p: spin(THROW, i), e: quadIn });
    K.push({ t: s + 1.05, p: spin(READY, i + 1), e: cubicOut }); // termina la vuelta
  }
  K.push({ t: T_PLANT_UP + 0.35, p: spin(RAISE, N), e: cubicOut });
  K.push({ t: T_IMPACT, p: spin(PLANT, N), e: quadIn });
  return K;
}
for (let i = 0; i < N; i++) {
  releaseTimes.push(SCOOP0 + i * SCOOP + 0.76);
  shrinkTimes.push(SCOOP0 + i * SCOOP + 0.25);
}
function poseFromKeys(K: Key[], t: number): Pose {
  if (t <= K[0].t) return K[0].p;
  for (let i = 1; i < K.length; i++) {
    if (t <= K[i].t) {
      const k = K[i].e((t - K[i - 1].t) / (K[i].t - K[i - 1].t || 1));
      return lerpPose(K[i - 1].p, K[i].p, k);
    }
  }
  return K[K.length - 1].p;
}
function shrinkAt(t: number) {
  let v = 0;
  shrinkTimes.forEach((st) => {
    v += seg(t, st, 0.15, cubicOut);
  });
  return v; // 0..N
}

const bladeWorld = (p: Pose, lx: number, ly: number) => {
  const a = (p.r * Math.PI) / 180;
  return { x: p.x + lx * Math.cos(a) - ly * Math.sin(a), y: p.y + lx * Math.sin(a) + ly * Math.cos(a) };
};

/** Rayado de tierra bajo la línea del suelo (el prototipo lo armaba con JS; mismas líneas). */
const RAYADO = Array.from({ length: Math.ceil((330 - 8) / 16) }, (_, i) => 8 + i * 16);

const BACK_DUR = 0.75;

type Chunk = {
  el: SVGPathElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  life: number;
  fade: number;
};
type Escena = { pan: number; mound: number; ground: number; shrink: number };

export default function CategoryCardJardin({
  titulo = "Hogar y jardín",
  descripcion = "Mangueras, herramientas de jardín y más para tu casa.",
  href = "#hogar-y-jardin",
  escalar = false,
}: Props) {
  // Id único para el clipPath: varias tarjetas en la misma página no se pisan.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = { aboveGround: `aboveGround-${uid}` };

  const cardRef = useRef<HTMLAnchorElement>(null);
  const shovelRef = useRef<SVGGElement>(null);
  const groundRef = useRef<SVGGElement>(null);
  const groundLineRef = useRef<SVGLineElement>(null);
  const moundSlideRef = useRef<SVGGElement>(null);
  const moundRef = useRef<SVGGElement>(null);
  const chunksRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const card = cardRef.current,
      shovel = shovelRef.current,
      ground = groundRef.current,
      groundLine = groundLineRef.current;
    const moundSlide = moundSlideRef.current,
      mound = moundRef.current,
      chunksG = chunksRef.current;
    if (!card || !shovel || !ground || !groundLine || !moundSlide || !mound || !chunksG) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- terrones ----------
    const chunks: Chunk[] = [];
    function spawn(x: number, y: number, n: number, vxR: [number, number], vyR: [number, number]) {
      for (let i = 0; i < n; i++) {
        const el = document.createElementNS(NS, "path");
        const r = rnd(2.8, 5.5),
          pts = [];
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2,
            rr = r * rnd(0.7, 1.15);
          pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
        }
        el.setAttribute("d", "M" + pts.join("L") + "Z");
        el.setAttribute("fill", "#0d2541");
        el.setAttribute("stroke", "#c3ccd8");
        el.setAttribute("stroke-width", "1.6");
        el.setAttribute("stroke-linejoin", "round");
        chunksG!.appendChild(el);
        chunks.push({
          el,
          x: x + rnd(-6, 6),
          y: y + rnd(-4, 4),
          vx: rnd(vxR[0], vxR[1]),
          vy: rnd(vyR[0], vyR[1]),
          rot: rnd(0, 360),
          vr: rnd(-400, 400),
          life: 0,
          fade: 1,
        });
      }
    }
    function stepChunks(dt: number, fadeAll: boolean) {
      for (let i = chunks.length - 1; i >= 0; i--) {
        const c = chunks[i];
        c.life += dt;
        c.vy += 560 * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.rot += c.vr * dt;
        if (c.y > 220) {
          c.y = 220;
          c.vy *= -0.25;
          c.vx *= 0.55;
          c.vr *= 0.5;
        }
        if (c.life > 1.1 || fadeAll) c.fade -= dt * (fadeAll ? 4 : 1.6);
        if (c.fade <= 0 || c.x < -20) {
          c.el.remove();
          chunks.splice(i, 1);
          continue;
        }
        c.el.setAttribute("transform", `translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${c.rot.toFixed(0)})`);
        c.el.setAttribute("opacity", Math.max(0, c.fade).toFixed(2));
      }
    }

    // ---------- estado ----------
    // idle → forward (mouse encima) → back (mouse fuera: la pala sube al centro, sin rebobinar)
    let mode: "idle" | "forward" | "back" = "idle",
      t = 0,
      rt = 0,
      clock = 0,
      keys = buildKeys(IDLE),
      fired = 0,
      impactDone = false;
    let pose: Pose = { ...IDLE },
      cap: Pose = { ...IDLE };
    let ch: Escena = { pan: 0, mound: 0, ground: 0, shrink: 0 };
    let capCh: Escena = { ...ch };

    function turnOn() {
      if (mode === "forward") return;
      card!.classList.add(styles.on);
      keys = buildKeys({ ...pose, r: (((pose.r % 360) + 540) % 360) - 180 });
      mode = "forward";
      t = 0;
      fired = 0;
      impactDone = false;
    }
    function turnOff() {
      if (mode !== "forward") return;
      card!.classList.remove(styles.on);
      const nr = (((pose.r % 360) + 540) % 360) - 180; // ángulo normalizado para no dar vueltas al regresar
      cap = { ...pose, r: nr };
      capCh = { ...ch };
      mode = "back";
      rt = 0;
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
      const speed = reduce ? 3 : 1;
      if (!reduce) clock += dt;

      if (mode === "idle") {
        const bob = Math.sin(clock * 1.6) * 6,
          tilt = Math.sin(clock * 0.9) * 3;
        pose = { x: IDLE.x, y: IDLE.y + bob, r: tilt };
        ch = { pan: 0, mound: 0, ground: 0, shrink: 0 };
      } else if (mode === "forward") {
        t = Math.min(T_END, t + dt * speed);
        pose = poseFromKeys(keys, t);
        ch = {
          pan: seg(t, 0, 0.6, cubicInOut),
          mound: seg(t, 0.15, 0.6, cubicOut),
          ground: seg(t, 0, 0.5, cubicOut),
          shrink: shrinkAt(t),
        };
        while (fired < N && t >= releaseTimes[fired]) {
          if (!reduce) {
            const b = bladeWorld(pose, 0, -36);
            spawn(b.x, b.y, 12, [-210, -100], [-250, -130]);
          }
          fired++;
        }
        if (!impactDone && t >= T_IMPACT) {
          impactDone = true;
          if (!reduce) {
            spawn(PLANT.x - 6, 220, 4, [-90, -30], [-150, -70]);
            spawn(PLANT.x + 6, 220, 4, [30, 90], [-150, -70]);
          }
        }
      } else {
        // back: sale del suelo y va directo al centro en un solo movimiento
        rt = Math.min(BACK_DUR, rt + dt * speed);
        pose = lerpPose(cap, IDLE, cubicInOut(rt / BACK_DUR));
        const k = cubicInOut(clamp(rt / 0.75));
        ch = {
          pan: lerp(capCh.pan, 0, k),
          mound: lerp(capCh.mound, 0, k),
          ground: lerp(capCh.ground, 0, k),
          shrink: capCh.shrink,
        };
        if (rt >= BACK_DUR) {
          mode = "idle";
          clock = 0;
        }
      }

      // pala
      shovel!.setAttribute("transform", `translate(${pose.x.toFixed(2)} ${pose.y.toFixed(2)}) rotate(${pose.r.toFixed(2)})`);

      // escena
      card!.style.setProperty("--pan", ch.pan.toFixed(3));
      card!.style.setProperty("--f", (1 - ch.pan).toFixed(3));
      ground!.setAttribute("opacity", ch.ground.toFixed(3));
      groundLine!.setAttribute("x1", (320 - 320 * ch.ground).toFixed(1));
      moundSlide!.setAttribute("transform", `translate(${((1 - ch.mound) * 200).toFixed(1)} 0)`);
      const sc = 1 - 0.07 * ch.shrink;
      mound!.setAttribute(
        "transform",
        `translate(334 222) scale(${(1 - 0.04 * ch.shrink).toFixed(3)} ${sc.toFixed(3)}) translate(-334 -222)`,
      );

      stepChunks(dt, mode === "back");
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
      for (const c of chunks) c.el.remove();
      chunks.length = 0;
      card.classList.remove(styles.on);
      card.style.removeProperty("--pan");
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
      <svg className={styles.blueprint} viewBox="0 0 320 420" aria-hidden="true">
        <path d="M74 66 V52 H90" fill="none" stroke="rgba(190,215,245,.45)" strokeWidth="1.2" />
        <circle cx="160" cy="135" r="92" fill="none" stroke="rgba(190,215,245,.28)" strokeDasharray="2 4" />
        <line x1="160" y1="30" x2="160" y2="48" stroke="rgba(190,215,245,.45)" />
        <line x1="50" y1="135" x2="72" y2="135" stroke="rgba(190,215,245,.45)" />
        {/* cota vertical: largo total */}
        <line x1="248" y1="70" x2="248" y2="200" stroke="rgba(190,215,245,.5)" />
        <line x1="241" y1="70" x2="255" y2="70" stroke="rgba(190,215,245,.5)" />
        <line x1="241" y1="200" x2="255" y2="200" stroke="rgba(190,215,245,.5)" />
        <text x="262" y="135" transform="rotate(90 262 135)" textAnchor="middle">
          0.80 m
        </text>
        {/* cota horizontal: ancho de la hoja */}
        <line x1="138" y1="214" x2="182" y2="214" stroke="rgba(190,215,245,.5)" />
        <line x1="138" y1="208" x2="138" y2="220" stroke="rgba(190,215,245,.5)" />
        <line x1="182" y1="208" x2="182" y2="220" stroke="rgba(190,215,245,.5)" />
        <path d="M122 214 l8 -4 v8 z" fill="#e3262f" />
        <text x="160" y="230" textAnchor="middle">
          22 cm
        </text>
        <text x="36" y="100">
          PALA · ACERO
        </text>
      </svg>

      <svg className={styles.scene} viewBox="0 0 320 420" aria-hidden="true">
        <defs>
          <clipPath id={ids.aboveGround}>
            <rect x="-200" y="-200" width="720" height="423" />
          </clipPath>
        </defs>

        {/* suelo */}
        <g ref={groundRef} opacity="0" stroke="#c3ccd8" strokeLinecap="round">
          <line ref={groundLineRef} x1="0" y1="222" x2="320" y2="222" strokeWidth="3.5" />
          <g strokeWidth="1.5" opacity="0.5">
            {RAYADO.map((x) => (
              <line key={x} x1={x} y1="226" x2={x - 7} y2="233" />
            ))}
          </g>
        </g>

        {/* pala. La posición inicial es la de reposo, para que no aparezca en la esquina mientras carga el JS. */}
        <g clipPath={`url(#${ids.aboveGround})`}>
          <g
            ref={shovelRef}
            transform={`translate(${IDLE.x} ${IDLE.y}) rotate(0)`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M -20 -112 H 20" stroke="#c3ccd8" strokeWidth="3.5" />
            <path d="M 0 -112 V -39" stroke="#c3ccd8" strokeWidth="3.5" />
            <path d="M -9 -38 H 9" stroke="#c3ccd8" strokeWidth="3.5" />
            <path
              d="M -22 -33 H 22 V -10 C 22 4, 11 11, 0 18 C -11 11, -22 4, -22 -10 Z"
              fill="#a81d26"
              stroke="#e3262f"
              strokeWidth="2.5"
            />
          </g>
        </g>

        {/* montaña de tierra (entra por la derecha, cortada por el borde); en reposo, fuera de la tarjeta */}
        <g ref={moundSlideRef} transform="translate(200.0 0)">
          <g ref={moundRef} stroke="#c3ccd8" strokeLinejoin="round" strokeLinecap="round">
            <path
              d="M 140.0 222.0 Q 145.8 216.2 153.6 218.4 Q 157.0 211.5 164.6 210.1 Q 165.1 201.6 173.5 200.0 Q 175.3 192.0 182.3 187.7 Q 181.9 179.4 189.7 176.3 Q 189.9 168.0 197.3 164.2 Q 198.5 156.3 205.1 151.8 Q 205.3 143.0 213.4 139.4 Q 215.3 131.6 222.3 127.5 Q 223.6 118.9 231.9 116.2 Q 234.9 108.7 242.5 105.9 Q 245.8 99.1 253.2 97.5 Q 256.9 89.7 265.5 89.4 Q 269.1 80.9 278.1 82.9 Q 283.3 77.2 290.9 77.9 Q 296.4 72.4 303.9 74.2 Q 309.6 67.9 317.2 71.7 Q 324.9 64.6 334.0 70.0 V 222 Z"
              fill="#0d2541"
              strokeWidth="3.5"
            />
            <g fill="none" strokeWidth="1.8" opacity="0.75">
              <path d="M 201 196 q 1.5 -5.0 5.0 -4.5 q 4.5 0.5 5.0 4.5 q -2.0 4.0 -5.0 3.5 q -4.0 -0.5 -5.0 -3.5 Z" />
              <path d="M 226 170 q 1.8 -6.0 6.0 -5.4 q 5.4 0.6 6.0 5.4 q -2.4 4.8 -6.0 4.2 q -4.8 -0.6 -6.0 -4.2 Z" />
              <path d="M 257 140 q 1.5 -5.0 5.0 -4.5 q 4.5 0.5 5.0 4.5 q -2.0 4.0 -5.0 3.5 q -4.0 -0.5 -5.0 -3.5 Z" />
              <path d="M 284 112 q 1.8 -6.0 6.0 -5.4 q 5.4 0.6 6.0 5.4 q -2.4 4.8 -6.0 4.2 q -4.8 -0.6 -6.0 -4.2 Z" />
              <path d="M 243 200 q 2.1 -7.0 7.0 -6.3 q 6.3 0.7 7.0 6.3 q -2.8 5.6 -7.0 4.9 q -5.6 -0.7 -7.0 -4.9 Z" />
              <path d="M 280 176 q 1.8 -6.0 6.0 -5.4 q 5.4 0.6 6.0 5.4 q -2.4 4.8 -6.0 4.2 q -4.8 -0.6 -6.0 -4.2 Z" />
              <path d="M 307 140 q 1.5 -5.0 5.0 -4.5 q 4.5 0.5 5.0 4.5 q -2.0 4.0 -5.0 3.5 q -4.0 -0.5 -5.0 -3.5 Z" />
              <path d="M 309 198 q 2.1 -7.0 7.0 -6.3 q 6.3 0.7 7.0 6.3 q -2.8 5.6 -7.0 4.9 q -5.6 -0.7 -7.0 -4.9 Z" />
              <path d="M 224 206 q 1.2 -4.0 4.0 -3.6 q 3.6 0.4 4.0 3.6 q -1.6 3.2 -4.0 2.8 q -3.2 -0.4 -4.0 -2.8 Z" />
              <path d="M 296 94 q 1.2 -4.0 4.0 -3.6 q 3.6 0.4 4.0 3.6 q -1.6 3.2 -4.0 2.8 q -3.2 -0.4 -4.0 -2.8 Z" />
            </g>
          </g>
        </g>

        {/* terrones (los crea y los borra el bucle) */}
        <g ref={chunksRef} />
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
