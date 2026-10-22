"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { plexMono } from "./fuentes";
import { animarAlDesplazar } from "./tactil";
import styles from "./CategoryCardVehiculos.module.css";

// Tarjeta de categoría "Vehículos", versión de LÍNEA: la rueda es un ícono de línea en SVG animado con JavaScript
// propio (sin librerías). Portada TAL CUAL del prototipo aprobado tarjeta-vehiculos-linea.html: SVG, línea de tiempo,
// state(t), curvas, baseAng/startBob, flotación, colores y CSS sin cambios.
// Al pasar el mouse (o con el foco del teclado) la rueda gira en su sitio acelerando, sale por la derecha, entra
// rodando por la izquierda y frena en el centro. Corre UNA vez por entrada y siempre termina; no se rebobina.
// Diferencias con el prototipo, las mismas que en las otras tarjetas: toda la tarjeta es un <Link> que sí navega (en
// el teléfono anima el toque que desplaza la página, ver tactil.ts) y la cuadrícula se difumina bajo el texto; sin
// window.__demo ni el texto de ayuda de arriba. Agregado: si otra tarjeta toma el turno (solo una animada a la vez) o
// la tarjeta sale de la pantalla, la vuelta se cancela y la rueda regresa rodando al centro en CANCEL_DUR.

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

/** "Aceites, lubricantes y accesorios para tu carro." → "aceites, …" (para el aria-label). */
function enFrase(texto: string) {
  const sinPunto = texto.trim().replace(/\.$/, "");
  return sinPunto.charAt(0).toLowerCase() + sinPunto.slice(1);
}

type Ease = (x: number) => number;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, start: number, dur: number, ease: Ease) => ease(clamp((t - start) / dur));
const cubicOut: Ease = (x) => 1 - Math.pow(1 - x, 3);
const cubicInOut: Ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

const CX = 160,
  CY = 135,
  R = 52;
const DEG = 180 / Math.PI;

// ---------- línea de tiempo (una sola pasada, no se rebobina) ----------
const T_SPIN = 0.9; // gira en su sitio acelerando
const T_EXIT = T_SPIN + 0.42; // arranca y sale por la derecha
const T_BACK = T_EXIT + 0.95; // entra por la izquierda y frena en el centro
const T_END = T_BACK + 0.3; // pequeño asentamiento
const OUT_X = 400,
  IN_X = -80;
const SPIN_SPEED = 1500; // grados/s al arrancar
/** Regreso al centro cuando se cancela la vuelta (no está en el prototipo, ver arriba). */
const CANCEL_DUR = 0.4;

// ángulo acumulado durante el giro en sitio: velocidad crece de 0 a SPIN_SPEED (cuadrática)
const spinAngle = (t: number) => {
  const u = Math.min(t, T_SPIN);
  return (SPIN_SPEED * u * u * u) / (3 * T_SPIN * T_SPIN);
};
const ANG_AT_SPIN = spinAngle(T_SPIN);

function state(t: number) {
  let x = CX,
    ang = 0,
    jx = 0,
    jy = 0;
  if (t <= T_SPIN) {
    ang = spinAngle(t);
    const k = t / T_SPIN; // vibración que aumenta con la velocidad
    jx = Math.sin(t * 90) * 1.2 * k;
    jy = Math.cos(t * 77) * 0.9 * k;
  } else if (t <= T_EXIT) {
    const u = (t - T_SPIN) / (T_EXIT - T_SPIN);
    const dx = (OUT_X - CX) * u * u; // acelera hacia la derecha
    x = CX + dx;
    ang = ANG_AT_SPIN + SPIN_SPEED * (t - T_SPIN) + (dx / R) * DEG * 0.35;
  } else if (t <= T_BACK) {
    const u = cubicOut((t - T_EXIT) / (T_BACK - T_EXIT));
    x = IN_X + (CX - IN_X) * u; // rueda y frena
    ang = ((x - IN_X) / R) * DEG;
  } else {
    const u = (t - T_BACK) / (T_END - T_BACK);
    ang = ((CX - IN_X) / R) * DEG + Math.sin(u * Math.PI) * 6 * (1 - u); // se asienta
  }
  const f = 1 - seg(t, 0.55, 0.3, cubicOut) + seg(t, T_BACK - 0.15, 0.4, cubicOut);
  return { x, ang, jx, jy, f: clamp(f) };
}

/** Marcas de la banda de rodadura (24, cada 15°), tal cual el path del prototipo. */
const BANDA =
  "M 46.0 0.0 L 52.0 0.0 M 44.4 11.9 L 50.2 13.5 M 39.8 23.0 L 45.0 26.0 M 32.5 32.5 L 36.8 36.8 M 23.0 39.8 L 26.0 45.0 M 11.9 44.4 L 13.5 50.2 M 0.0 46.0 L 0.0 52.0 M -11.9 44.4 L -13.5 50.2 M -23.0 39.8 L -26.0 45.0 M -32.5 32.5 L -36.8 36.8 M -39.8 23.0 L -45.0 26.0 M -44.4 11.9 L -50.2 13.5 M -46.0 0.0 L -52.0 0.0 M -44.4 -11.9 L -50.2 -13.5 M -39.8 -23.0 L -45.0 -26.0 M -32.5 -32.5 L -36.8 -36.8 M -23.0 -39.8 L -26.0 -45.0 M -11.9 -44.4 L -13.5 -50.2 M -0.0 -46.0 L -0.0 -52.0 M 11.9 -44.4 L 13.5 -50.2 M 23.0 -39.8 L 26.0 -45.0 M 32.5 -32.5 L 36.8 -36.8 M 39.8 -23.0 L 45.0 -26.0 M 44.4 -11.9 L 50.2 -13.5";

export default function CategoryCardVehiculos({
  titulo = "Vehículos",
  descripcion = "Aceites, lubricantes y accesorios para tu carro.",
  href = "#vehiculos",
  escalar = false,
}: Props) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const wheelRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const card = cardRef.current,
      wheel = wheelRef.current;
    if (!card || !wheel) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- control ----------
    // baseAng: ángulo en que quedó la rueda la última vez, para que no salte al terminar
    // startBob: altura de la flotación al arrancar, para que no salte al empezar
    let mode: "idle" | "run" | "cancel" = "idle",
      t = 0,
      clock = 0,
      floatAmt = 1,
      baseAng = 0,
      startBob = 0,
      curY = CY;
    let curX = CX,
      curAng = 0,
      curF = 1;
    // Desde dónde vuelve al centro al cancelar.
    let desde = { x: CX, y: CY, ang: 0, f: 1 },
      ct = 0;

    function start() {
      if (mode !== "idle") return;
      mode = "run";
      t = 0;
      startBob = curY - CY;
      card!.classList.add(styles.on);
    }
    function cancel() {
      card!.classList.remove(styles.on);
      if (mode !== "run") return;
      mode = "cancel";
      ct = 0;
      desde = { x: curX, y: curY, ang: curAng, f: curF };
    }

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const quitarOn = () => card.classList.remove(styles.on);
    // Foco: solo el del teclado anima (en el teléfono, el toque también enfoca el enlace).
    const onFocusIn = () => {
      if (card.matches(":focus-visible")) start();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!card.contains(e.relatedTarget as Node | null)) quitarOn();
    };
    card.addEventListener("focusin", onFocusIn);
    card.addEventListener("focusout", onFocusOut);
    // Escritorio: anima el mouse al entrar (al salir la vuelta sigue hasta terminar, como el prototipo). Teléfono: anima
    // el toque que desplaza la página; el que no, entra sin animar.
    const quitarTactil = finePointer ? null : animarAlDesplazar(card, start, cancel);
    if (finePointer) {
      card.addEventListener("mouseenter", start);
      card.addEventListener("mouseleave", quitarOn);
    }

    // ---------- bucle ----------
    let last = performance.now();
    let raf = 0;
    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!reduce) clock += dt;
      let x = CX,
        y = CY,
        ang = 0,
        f = 1;
      if (mode === "run") {
        t += dt * (reduce ? 3 : 1);
        const s = state(Math.min(t, T_END));
        x = s.x + s.jx;
        y = CY + s.jy + startBob * (1 - seg(t, 0, 0.3, cubicOut));
        ang = baseAng + s.ang;
        f = s.f;
        floatAmt = 0;
        if (t >= T_END) {
          mode = "idle";
          clock = 0;
          baseAng = (baseAng + state(T_END).ang) % 360;
          ang = baseAng;
        }
      } else if (mode === "cancel") {
        // vuelve rodando al centro: el ángulo sigue a la distancia recorrida (dx / R), como al entrar
        ct = Math.min(CANCEL_DUR, ct + dt * (reduce ? 3 : 1));
        const k = cubicInOut(ct / CANCEL_DUR);
        x = desde.x + (CX - desde.x) * k;
        y = desde.y + (CY - desde.y) * k;
        ang = desde.ang + ((x - desde.x) / R) * DEG;
        f = desde.f + (1 - desde.f) * k;
        floatAmt = 0;
        if (ct >= CANCEL_DUR) {
          mode = "idle";
          clock = 0;
          baseAng = ang % 360;
        }
      } else {
        floatAmt = Math.min(1, floatAmt + dt * 1.5);
        y = CY + Math.sin(clock * 1.6) * 6 * floatAmt;
        ang = baseAng;
      }
      curY = y;
      curX = x;
      curAng = ang;
      curF = f;
      wheel!.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(ang % 360).toFixed(2)})`);
      card!.style.setProperty("--f", f.toFixed(3));
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // ---------- limpieza: nada queda vivo al cambiar de página ----------
    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener("mouseenter", start);
      card.removeEventListener("mouseleave", quitarOn);
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
      <svg className={styles.blueprint} viewBox="0 0 320 420" preserveAspectRatio="none" aria-hidden="true">
        <path d="M74 66 V52 H90" fill="none" stroke="rgba(190,215,245,.45)" strokeWidth="1.2" />
        <circle cx="160" cy="135" r="88" fill="none" stroke="rgba(190,215,245,.28)" strokeDasharray="2 4" />
        <line x1="160" y1="34" x2="160" y2="52" stroke="rgba(190,215,245,.45)" />
        <line x1="54" y1="135" x2="76" y2="135" stroke="rgba(190,215,245,.45)" />
        {/* cota vertical: diámetro */}
        <line x1="248" y1="83" x2="248" y2="187" stroke="rgba(190,215,245,.5)" />
        <line x1="241" y1="83" x2="255" y2="83" stroke="rgba(190,215,245,.5)" />
        <line x1="241" y1="187" x2="255" y2="187" stroke="rgba(190,215,245,.5)" />
        <text x="262" y="135" transform="rotate(90 262 135)" textAnchor="middle">
          Ø 0.65 m
        </text>
        {/* cota horizontal */}
        <line x1="108" y1="214" x2="212" y2="214" stroke="rgba(190,215,245,.5)" />
        <line x1="108" y1="208" x2="108" y2="220" stroke="rgba(190,215,245,.5)" />
        <line x1="212" y1="208" x2="212" y2="220" stroke="rgba(190,215,245,.5)" />
        <path d="M92 214 l8 -4 v8 z" fill="#e3262f" />
        <text x="160" y="230" textAnchor="middle">
          205/55 R16
        </text>
        <text x="36" y="100">
          NEUMÁTICO
        </text>
      </svg>

      <svg className={styles.scene} viewBox="0 0 320 420" aria-hidden="true">
        {/* llanta: neumático con banda de rodadura, rin de 5 rayos y tapa central roja. La posición inicial es la de
            reposo, para que no aparezca en la esquina mientras carga el JS. */}
        <g
          ref={wheelRef}
          transform={`translate(${CX} ${CY}) rotate(0)`}
          fill="none"
          stroke="#c3ccd8"
          strokeWidth="3.5"
          strokeLinecap="round"
        >
          <circle r="52" />
          <path d={BANDA} strokeWidth="2.5" />
          <circle r="38" />
          <circle r="31" strokeWidth="2.5" />
          <path d="M 0.0 -11.0 L 0.0 -29.3 M 10.5 -3.4 L 27.9 -9.1 M 6.5 8.9 L 17.2 23.7 M -6.5 8.9 L -17.2 23.7 M -10.5 -3.4 L -27.9 -9.1" />
          <circle r="9" fill="#a81d26" stroke="#e3262f" strokeWidth="2.5" />
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
