"use client";

import { useId, type CSSProperties } from "react";
import BannerPlano, { type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerVehiculos.module.css";

/**
 * Banner de la categoría Vehículos, estilo "plano técnico". Portado TAL CUAL del prototipo aprobado
 * banner-vehiculos-v1.html: SVG (piso con zona de carga, gato botella, llave en cruz, caucho 205/55 R16, triángulo de
 * seguridad y traspaleta con su carga: bidón 20W50 y cajas), secuencia y tiempos sin cambios:
 * traspaleta y caucho salen de cuadro y vuelven rodando, el timón bombea 3 veces y la carga sube (CARGA 1.250 kg),
 * el gato botella bombea 4 veces y el pistón sube, y el triángulo destella (clase global `vivo`).
 * Al salir todo baja (450 ms) y vuelve a su sitio (400 ms); `on` se sostiene hasta que baja, como el prototipo.
 * Diferencias con el prototipo: solo el nombre de la categoría en la etiqueta (sin "Mueve y mantén tus", kicker ni
 * subtítulo, como todos los banners propios) y, en reposo, un movimiento muy sutil (el caucho se balancea y el
 * triángulo destella suave; pedido de persona B).
 */

const OFF_TP = 470; // fuera de cuadro
const OFF_C = -330;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = (t: number) => 1 - Math.pow(1 - t, 3);
const inq = (t: number) => t * t * t;

type Estado = { tx: number; lift: number; tim: number; cx: number; ram: number; pal: number; cargo: number };

function crearMotor(raiz: HTMLElement): Motor {
  const q = <T extends Element>(p: string) => raiz.querySelector<T>(`[data-p="${p}"]`)!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tp = q<SVGGElement>("tp"),
    ruedaD = q<SVGGElement>("ruedaD"),
    lift = q<SVGGElement>("lift"),
    timon = q<SVGGElement>("timon"),
    caucho = q<SVGGElement>("caucho"),
    rin = q<SVGGElement>("rin"),
    ram = q<SVGRectElement>("ram"),
    sillin = q<SVGRectElement>("sillin"),
    palanca = q<SVGGElement>("palanca"),
    carga = q<SVGTextElement>("carga");

  const S: Estado = { tx: 0, lift: 0, tim: 0, cx: 0, ram: 0, pal: 0, cargo: 0 };
  function draw() {
    tp.setAttribute("transform", `translate(${370 + S.tx} 226)`);
    ruedaD.setAttribute("transform", `translate(248 -11) rotate(${(S.tx / 11) * 57.3})`);
    lift.setAttribute("transform", `translate(0 ${-S.lift})`);
    timon.setAttribute("transform", `rotate(${S.tim} 250 -64)`);
    caucho.setAttribute("transform", `translate(${262 + S.cx} 190)`);
    rin.setAttribute("transform", `rotate(${(S.cx / 36) * 57.3})`);
    ram.setAttribute("y", String(150 - S.ram));
    ram.setAttribute("height", String(16 + S.ram));
    sillin.setAttribute("y", String(144 - S.ram));
    palanca.setAttribute("transform", `rotate(${S.pal} 112 200)`);
    carga.textContent = `CARGA ${Math.round(S.cargo).toLocaleString("es")} kg`;
  }

  // ---------- tiempo: cada activar/reposo sube `gen` y corta lo anterior ----------
  let gen = 0,
    destruido = false;
  const rafs = new Set<number>();
  const timers = new Set<number>();
  const tween = (d: number, f: (p: number, t: number) => void, e: (t: number) => number = ease) => {
    const g = gen;
    const dur = reduce ? 10 : d;
    return new Promise<boolean>((r) => {
      const s = performance.now();
      const k = (n: number) => {
        if (g !== gen || destruido) return r(false);
        const t = Math.min(1, (n - s) / dur);
        f(e(t), t);
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
  const wait = (ms: number) => {
    const g = gen;
    return new Promise<boolean>((r) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        r(g === gen && !destruido);
      }, ms);
      timers.add(id);
    });
  };

  async function bombear(n: number, key: "tim" | "pal", amp: number, dur: number, onStroke?: () => void) {
    for (let i = 0; i < n; i++) {
      if (!(await tween(dur * 0.45, (p) => ((S[key] = amp * p), draw())))) return false;
      onStroke?.();
      if (!(await tween(dur * 0.55, (p) => ((S[key] = amp * (1 - p)), draw())))) return false;
    }
    return true;
  }

  async function activar() {
    ++gen;
    raiz.classList.add("on");
    // el plano real sale de cuadro y vuelve rodando (como el caucho de la tarjeta)
    const fuera = await Promise.all([
      tween(420, (p) => ((S.tx = OFF_TP * p), draw()), inq),
      tween(420, (p) => ((S.cx = OFF_C * p), draw()), inq),
    ]);
    if (!fuera.every(Boolean)) return;
    if (!(await wait(150))) return;
    const a = tween(1500, (p) => ((S.tx = OFF_TP * (1 - p)), draw()), out);
    const b = wait(250).then((ok) => ok && tween(1300, (p) => ((S.cx = OFF_C * (1 - p)), draw()), out));
    if (!(await a) || !(await b)) return;
    // traspaleta: 3 bombeos con el timón, la carga se eleva
    if (
      !(await bombear(3, "tim", -16, 520, () => {
        const l0 = S.lift,
          c0 = S.cargo;
        void tween(260, (p) => ((S.lift = l0 + 4 * p), (S.cargo = c0 + (1250 / 3) * p), draw()), out);
      }))
    )
      return;
    // gato botella: 4 bombeos, el pistón sube
    if (
      !(await bombear(4, "pal", -14, 420, () => {
        const r0 = S.ram;
        void tween(220, (p) => ((S.ram = r0 + 6 * p), draw()), out);
      }))
    )
      return;
    raiz.classList.add("vivo");
  }

  async function reposo() {
    ++gen;
    // `on` se queda hasta que la carga baja (BannerPlano ya la quitó: el prototipo la quita después).
    raiz.classList.add("on");
    raiz.classList.remove("vivo");
    const s = { ...S };
    if (
      !(await tween(450, (p) => {
        S.lift = s.lift * (1 - p);
        S.ram = s.ram * (1 - p);
        S.tim = s.tim * (1 - p);
        S.pal = s.pal * (1 - p);
        S.cargo = s.cargo * (1 - p);
        draw();
      }))
    )
      return;
    raiz.classList.remove("on");
    if (!(await wait(10))) return;
    // vuelve al plano: posición de reposo
    const t0 = S.tx,
      c0 = S.cx;
    void tween(400, (p) => ((S.tx = t0 * (1 - p)), (S.cx = c0 * (1 - p)), draw()));
  }

  draw();

  return {
    encender: () => void activar(),
    apagar: () => void reposo(),
    destruir() {
      destruido = true;
      gen++;
      rafs.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
      raiz.classList.remove("vivo");
    },
  };
}

export default function BannerVehiculos({ nombre }: PropsBannerPropio) {
  const id = useId().replace(/:/g, "");
  const hatch = `hatch-${id}`,
    hazard = `hazard-${id}`;
  const F = styles.fill;
  return (
    <BannerPlano
      nombre={nombre}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial="#FF8A1F"
      crearMotor={crearMotor}
      decoracion="banda"
      variables={
        {
          "--brillo": "radial-gradient(55% 120% at 70% 70%, rgba(255,138,31,.22), transparent 70%)",
          "--brillo-on": "1",
          "--etiqueta-pad": "2px 26px 0",
          "--etiqueta-sombra": "0 10px 24px -10px rgba(227, 38, 47, 0.6)",
        } as CSSProperties
      }
    >
      <svg viewBox="0 0 780 260" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false" className={styles.svg}>
        <defs>
          <pattern id={hatch} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="9" stroke="rgba(190,215,245,.16)" strokeWidth="1" />
          </pattern>
          <pattern id={hazard} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="16" fill="#FF8A1F" />
            <rect x="8" width="8" height="16" fill="#0b1d33" />
          </pattern>
        </defs>

        <text data-p="carga" x="760" y="30" textAnchor="end">
          CARGA 0 kg
        </text>

        {/* piso */}
        <rect x="0" y="226" width="780" height="34" fill={`url(#${hatch})`} />
        <path className={styles.ln} d="M0 226H780" style={{ strokeWidth: 1.5 }} />
        <rect className={styles.dash} x="350" y="230" width="370" height="7" />
        <rect className={styles.franja} x="350" y="230" width="370" height="7" fill={`url(#${hazard})`} />
        <text className={styles.bp} x="352" y="252" style={{ fontSize: 7 }}>
          ZONA DE CARGA · CAP. 2 500 kg
        </text>

        {/* ===== GATO BOTELLA ===== */}
        <g>
          <rect className={`${F} ${styles.fRojo} ${styles.ln}`} x="66" y="212" width="56" height="14" rx="2" />
          <rect data-p="ram" className={`${F} ${styles.ln}`} x="86" y="150" width="16" height="16" />
          <rect data-p="sillin" className={`${F} ${styles.ln}`} x="82" y="144" width="24" height="7" rx="1.5" />
          <path className={`${F} ${styles.fRojo} ${styles.ln}`} d="M76 212V170Q76 162 84 162H104Q112 162 112 170V212Z" />
          <path className={styles.cota} d="M76 178H112M76 198H112" />
          <text className={styles.fTxt} x="80" y="192" style={{ fontSize: 7 }}>
            4 T
          </text>
          <g data-p="palanca">
            <path className={styles.ln} d="M112 200L166 182" style={{ strokeWidth: 2.5 }} />
            <rect x="160" y="177" width="12" height="7" rx="3" fill="#e3262f" transform="rotate(-18 166 181)" />
          </g>
        </g>
        <g className={styles.bp}>
          <path className={styles.cota} d="M54 144V226M49 144h10M49 226h10" />
          <text transform="translate(46 204) rotate(-90)" style={{ fontSize: 7 }}>
            ELEV. 18 cm
          </text>
          <text x="58" y="136" style={{ fontSize: 7 }}>
            GATO BOTELLA
          </text>
        </g>

        {/* llave en cruz en el piso */}
        <g transform="translate(150 218)">
          <path className={styles.ln} d="M0 4L70 -4M22 -10L48 10" style={{ strokeWidth: 2.5 }} />
          <circle cx="0" cy="4" r="3.5" className={styles.ln} style={{ strokeWidth: 1.5 }} />
          <circle cx="70" cy="-4" r="3.5" className={styles.ln} style={{ strokeWidth: 1.5 }} />
        </g>
        <text className={styles.bp} x="152" y="252" style={{ fontSize: 7 }}>
          LLAVE EN CRUZ 17-23
        </text>

        {/* caucho (gesto de la tarjeta: entra rodando) */}
        <g className={styles.bp}>
          <circle cx="262" cy="190" r="36" className={styles.dash} />
          <text x="236" y="146" style={{ fontSize: 7 }}>
            205/55 R16
          </text>
        </g>
        <g data-p="caucho" transform="translate(262 190)">
          <g className={styles.balanceo}>
            <circle r="36" className={`${F} ${styles.fGoma} ${styles.ln}`} />
            <circle r="24" fill="none" stroke="#c3ccd8" strokeWidth="1.5" />
            <circle r="30" fill="none" stroke="rgba(190,215,245,.55)" strokeWidth="1" strokeDasharray="2 4" />
            <g data-p="rin">
              <path className={styles.ln} d="M0 -22V22M-19 -11L19 11M-19 11L19 -11" style={{ strokeWidth: 1.5 }} />
            </g>
            <circle r="6" fill="#e3262f" />
          </g>
        </g>

        {/* triángulo de seguridad */}
        <g transform="translate(316 226)">
          <path className={styles.ln} d="M-6 0H34M0 0L4 -4M28 0L24 -4" style={{ strokeWidth: 1.5 }} />
          <path d="M14 -46L32 -6H-4Z" fill="none" stroke="#e3262f" strokeWidth="4" strokeLinejoin="round" />
          <path
            className={styles.refl}
            d="M14 -46L32 -6H-4Z"
            fill="none"
            stroke="#ffd2a8"
            strokeWidth="2"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 4px #FF8A1F)" }}
          />
        </g>

        {/* ===== TRASPALETA: fantasma en reposo ===== */}
        <g className={styles.bp} transform="translate(370 226)">
          <path className={styles.dash} d="M0 -16H232V-6H0Z M232 -66H264V-6H232Z M250 -66L300 -156" />
          <rect className={styles.dash} x="6" y="-122" width="216" height="92" />
          <text x="96" y="-130" style={{ fontSize: 7 }}>
            TRASPALETA · 2.5 T
          </text>
        </g>

        {/* ===== TRASPALETA real (entra rodando) ===== */}
        <g data-p="tp" transform="translate(370 226)">
          {/* rodillo de carga y rueda direccional (no suben) */}
          <g>
            <circle cx="18" cy="-5" r="5" className={`${F} ${styles.fGoma} ${styles.ln}`} style={{ strokeWidth: 1.5 }} />
            <path d="M18 -9V-1" stroke="#c3ccd8" strokeWidth="1" />
          </g>
          <g data-p="ruedaD" transform="translate(248 -11)">
            <circle r="11" className={`${F} ${styles.fGoma} ${styles.ln}`} />
            <circle r="3" fill="#c3ccd8" />
            <path d="M0 -8V8M-8 0H8" stroke="#c3ccd8" strokeWidth="1.2" />
          </g>
          {/* todo lo que se eleva */}
          <g data-p="lift">
            <path className={`${F} ${styles.fNaranja} ${styles.ln}`} d="M0 -18H234V-8H8Q0 -8 0 -12Z" />
            {/* paleta */}
            <rect className={`${F} ${styles.fMadera} ${styles.ln}`} x="4" y="-30" width="222" height="7" rx="1" style={{ strokeWidth: 1.5 }} />
            <rect className={`${F} ${styles.fMadera} ${styles.ln}`} x="6" y="-23" width="18" height="12" style={{ strokeWidth: 1.5 }} />
            <rect className={`${F} ${styles.fMadera} ${styles.ln}`} x="106" y="-23" width="18" height="12" style={{ strokeWidth: 1.5 }} />
            <rect className={`${F} ${styles.fMadera} ${styles.ln}`} x="206" y="-23" width="18" height="12" style={{ strokeWidth: 1.5 }} />
            {/* carga: bidón de aceite + cajas */}
            <rect className={`${F} ${styles.fAceite} ${styles.ln}`} x="14" y="-96" width="62" height="66" rx="4" />
            <rect className={`${F} ${styles.ln}`} x="10" y="-102" width="70" height="8" rx="2" style={{ strokeWidth: 1.5 }} />
            <path className={styles.cota} d="M14 -80H76M14 -44H76" />
            <text className={styles.fTxt} x="22" y="-58" style={{ fontSize: 9, fontWeight: 500 }}>
              20W50
            </text>
            <text className={styles.fTxt} x="22" y="-48" style={{ fontSize: 6 }}>
              ACEITE · 18 L
            </text>
            <rect className={`${F} ${styles.fCarton} ${styles.ln}`} x="86" y="-86" width="80" height="56" rx="1.5" />
            <path className={styles.cota} d="M126 -86V-30" style={{ strokeDasharray: "4 3" }} />
            <text className={styles.fTxt} x="92" y="-46" style={{ fontSize: 7 }}>
              GATO 4 T
            </text>
            <path className={styles.cota} d="M150 -76v-6l-3 3M150 -82l3 3M158 -76v-6l-3 3M158 -82l3 3" />
            <rect className={`${F} ${styles.fCarton} ${styles.ln}`} x="96" y="-122" width="58" height="36" rx="1.5" />
            <text className={styles.fTxt} x="101" y="-100" style={{ fontSize: 6 }}>
              ACCESORIOS
            </text>
            <rect className={`${F} ${styles.fCarton} ${styles.ln}`} x="174" y="-70" width="46" height="40" rx="1.5" />
            <text className={styles.fTxt} x="178" y="-46" style={{ fontSize: 6 }}>
              CABLES
            </text>
            <text className={styles.fTxt} x="178" y="-38" style={{ fontSize: 6 }}>
              400 A
            </text>
            {/* cuerpo de la bomba */}
            <rect className={`${F} ${styles.fNaranja} ${styles.ln}`} x="232" y="-66" width="32" height="50" rx="3" />
            <rect className={`${F} ${styles.ln}`} x="238" y="-58" width="20" height="10" rx="1.5" style={{ strokeWidth: 1.2 }} />
            {/* timón */}
            <g data-p="timon">
              <path className={styles.ln} d="M250 -64L298 -150" style={{ strokeWidth: 3 }} />
              <path className={styles.ln} d="M290 -146Q286 -168 304 -168Q322 -168 316 -146Z" style={{ strokeWidth: 2.5 }} />
              <rect x="293" y="-156" width="10" height="5" rx="2" fill="#e3262f" transform="rotate(-60 298 -153)" />
            </g>
          </g>
        </g>
      </svg>
    </BannerPlano>
  );
}
