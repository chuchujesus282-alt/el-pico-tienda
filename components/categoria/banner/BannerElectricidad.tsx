"use client";

import { useId, type CSSProperties } from "react";
import BannerPlano, { type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerElectricidad.module.css";

/**
 * Banner de la categoría Electricidad, estilo "plano técnico". Portado TAL CUAL del prototipo aprobado
 * banner-electricidad-v1.html: SVG (techo, circuito C1, tablero con 4 breakers y voltímetro, toma, bobina y 3
 * bombillos con su plano), secuencia (30% más rápida que el prototipo, ver RAPIDEZ: bajan los portalámparas, los bombillos suben girando y se enroscan, se suben los
 * breakers, la chispa corre por el cable de la etiqueta, el pulso recorre el circuito y prende cada bombillo al pasar,
 * parpadeo ocasional) sin otros cambios.
 * Clases globales en la raíz: `on` (la pone BannerPlano; el motor la sostiene hasta que termina de apagar, como el
 * prototipo), `spark` (chispa del cable) y `lit` (luz encendida: velo, brillo cálido, corriente en el cable).
 * Diferencias con el prototipo: solo el nombre de la categoría en la etiqueta (sin "Energía para tu", kicker ni
 * subtítulo, como todos los banners propios) y la base (contenedor, texto, cable, reposo/activo) es BannerPlano.
 */

/**
 * Rapidez de la secuencia respecto al prototipo: 0.7 = 30% más rápida (pedido de persona B, 2026-10-23). Afecta
 * todos los tiempos de encender y apagar; el parpadeo ocasional queda como en el prototipo.
 */
const RAPIDEZ = 0.7;
const ms = (x: number) => x * RAPIDEZ;

const DROP = 28;
const LAMPS = [
  { cx: 290, y: 66, etiqueta: "LED 12 W" },
  { cx: 450, y: 86, etiqueta: "A60 · E27" },
  { cx: 600, y: 58, etiqueta: "6500 K" },
];
const CIRCUITO = "M85 70V24H660";
const PL = 46 + 575; // largo del circuito (getTotalLength del prototipo)
const RAYOS = [-150, -115, -65, -30, 0, 30, 150, 180].map((a) => {
  const r = (a * Math.PI) / 180;
  return { x1: Math.cos(r) * 33, y1: 46 + Math.sin(r) * 33, x2: Math.cos(r) * 43, y2: 46 + Math.sin(r) * 43 };
});
/** Rosca con giro simulado: las líneas se desplazan con la fase del giro. */
function rosca(spin: number) {
  const ph = spin % 1;
  let d = "";
  for (let k = 0; k < 3; k++) {
    const y = 2 + 4 * k + ph * 4;
    if (y < 13) d += `M-8 ${y + 1.5}L8 ${y - 1.5}`;
  }
  return d;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = (t: number) => 1 - Math.pow(1 - t, 3);
const lineal = (t: number) => t;

function crearMotor(raiz: HTMLElement): Motor {
  const q = <T extends Element>(sel: string, base: ParentNode = raiz) => base.querySelector<T>(sel)!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pulse = q<SVGPathElement>('[data-p="pulse"]'),
    volt = q<SVGTextElement>('[data-p="volt"]'),
    carga = q<SVGTextElement>('[data-p="carga"]'),
    ledToma = q<SVGCircleElement>('[data-p="ledToma"]');
  const brk = Array.from(raiz.querySelectorAll<SVGRectElement>("[data-brk]"));
  const setBrk = (i: number, on: boolean) => brk[i].setAttribute("y", on ? "116" : "136");

  const lamps = LAMPS.map((L, i) => {
    const root = q<SVGGElement>(`[data-lamp="${i}"]`);
    return {
      ...L,
      cord: q<SVGLineElement>('[data-l="cord"]', root),
      sock: q<SVGGElement>('[data-l="sock"]', root),
      b: q<SVGGElement>('[data-l="b"]', root),
      thr: q<SVGPathElement>('[data-l="thr"]', root),
      fil: q<SVGPathElement>('[data-l="fil"]', root),
      glass: q<SVGPathElement>('[data-l="glass"]', root),
      halo: q<SVGCircleElement>('[data-l="halo"]', root),
      rays: q<SVGGElement>('[data-l="rays"]', root),
      sy: -60,
      by: L.y + DROP,
      spin: 0,
      lit: 0,
    };
  });
  type Lamp = (typeof lamps)[number];

  function drawLamp(l: Lamp) {
    l.sock.setAttribute("transform", `translate(${l.cx} ${l.y + l.sy})`);
    l.cord.setAttribute("y2", String(Math.max(24, l.y + l.sy - 18)));
    l.sock.style.opacity = l.sy <= -60 ? "0" : "1";
    l.b.setAttribute("transform", `translate(${l.cx} ${l.by})`);
    const c = Math.cos(l.spin * Math.PI * 2);
    l.thr.setAttribute("d", rosca(l.spin));
    l.fil.setAttribute("transform", `translate(0 40) scale(${Math.max(0.08, Math.abs(c))} 1) translate(0 -40)`);
    const v = l.lit;
    l.fil.setAttribute("stroke", v > 0 ? "#fff4dc" : "#e3262f");
    l.fil.style.filter = v > 0 ? "drop-shadow(0 0 3px #ffcf87)" : "none";
    l.glass.setAttribute("fill", v > 0 ? `rgba(255,214,150,${0.18 + 0.5 * v})` : "#0a1f38");
    l.glass.setAttribute("stroke", v > 0 ? "#ffe2b0" : "#c3ccd8");
    l.halo.setAttribute("opacity", String(v));
    l.rays.setAttribute("opacity", String(v));
  }

  // ---------- tiempo: cada encender/apagar sube `gen` y corta lo anterior ----------
  let gen = 0,
    destruido = false;
  const rafs = new Set<number>();
  const timers = new Set<number>();
  const tween = (d: number, f: (p: number, t: number) => void, e: (t: number) => number = ease) => {
    const g = gen;
    return new Promise<boolean>((r) => {
      const s = performance.now();
      const k = (n: number) => {
        if (g !== gen || destruido) return r(false);
        const t = Math.min(1, (n - s) / d);
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

  async function encender() {
    const g = ++gen;
    raiz.classList.add("on");
    // 1. bajan los portalámparas
    await Promise.all(
      lamps.map((l, i) =>
        wait(ms(i * 120)).then(
          (ok) =>
            ok &&
            tween(
              ms(650),
              (p) => {
                l.sy = -60 + 60 * p;
                drawLamp(l);
              },
              out,
            ),
        ),
      ),
    );
    if (g !== gen) return;
    // 2. el bombillo sube girando y se enrosca
    await Promise.all(
      lamps.map((l, i) =>
        wait(ms(i * 140)).then(
          (ok) =>
            ok &&
            tween(reduce ? 10 : ms(900), (p) => {
              l.by = l.y + DROP - DROP * p;
              l.spin = 2.5 * p;
              drawLamp(l);
            }),
        ),
      ),
    );
    if (g !== gen) return;
    // 3. se suben los breakers
    for (let i = 0; i < 4; i++) {
      setBrk(i, true);
      if (!(await wait(ms(110)))) return;
    }
    volt.textContent = "120 V";
    ledToma.setAttribute("fill", "#7CFC9A");
    raiz.classList.add("spark");
    // 4. el pulso recorre el cable y enciende cada bombillo al pasar
    pulse.setAttribute("opacity", "1");
    const hit = lamps.map((l) => (46 + (l.cx - 85)) / PL);
    let n = 0;
    await tween(
      reduce ? 10 : ms(1000),
      (p) => {
        pulse.setAttribute("stroke-dashoffset", String(36 - p * (PL + 36)));
        lamps.forEach((l, i) => {
          if (!l.lit && p >= hit[i]) {
            n++;
            carga.textContent = `CARGA ${n * 12} W`;
            void tween(
              ms(380),
              (qq) => {
                l.lit = Math.min(1, qq * 1.15) * (qq < 0.35 ? (qq < 0.15 ? 1 : 0.3) : 1);
                drawLamp(l);
              },
              lineal,
            );
          }
        });
      },
      lineal,
    );
    pulse.setAttribute("opacity", "0");
    if (g !== gen) return;
    raiz.classList.add("lit");
    // 5. parpadeo ocasional mientras esté encendido
    while (g === gen) {
      if (!(await wait(2600 + Math.random() * 2200))) return;
      const l = lamps[Math.floor(Math.random() * 3)];
      await tween(
        260,
        (_p, t) => {
          l.lit = t < 0.3 || t > 0.6 ? 1 : 0.45;
          drawLamp(l);
        },
        lineal,
      );
      l.lit = 1;
      drawLamp(l);
    }
  }

  async function apagar() {
    const g = ++gen;
    // `on` se queda hasta que todo vuelve (BannerPlano ya la quitó: el prototipo la quita al final).
    raiz.classList.add("on");
    raiz.classList.remove("lit", "spark");
    volt.textContent = "--- V";
    ledToma.setAttribute("fill", "#33465f");
    carga.textContent = "CARGA 0 W";
    pulse.setAttribute("opacity", "0");
    for (let i = 0; i < 4; i++) setBrk(i, false);
    lamps.forEach((l) => {
      l.lit = 0;
      drawLamp(l);
    });
    const s = lamps.map((l) => ({ sy: l.sy, by: l.by, spin: l.spin }));
    await tween(ms(550), (p) =>
      lamps.forEach((l, i) => {
        l.sy = s[i].sy + (-60 - s[i].sy) * p;
        l.by = s[i].by + (l.y + DROP - s[i].by) * p;
        l.spin = s[i].spin * (1 - p);
        drawLamp(l);
      }),
    );
    if (g === gen && !destruido) raiz.classList.remove("on");
  }

  lamps.forEach(drawLamp);

  return {
    encender: () => void encender(),
    apagar: () => void apagar(),
    destruir() {
      destruido = true;
      gen++;
      rafs.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
      raiz.classList.remove("lit", "spark");
    },
  };
}

export default function BannerElectricidad({ nombre }: PropsBannerPropio) {
  const halo = `halo-${useId().replace(/:/g, "")}`;
  return (
    <BannerPlano
      nombre={nombre}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial="#ffcf87"
      crearMotor={crearMotor}
      decoracion="cable"
      variables={
        {
          "--brillo": "radial-gradient(48% 110% at 70% 40%, rgba(255,207,135,.30), rgba(255,170,90,.10) 45%, transparent 72%)",
          "--brillo-on": "0",
          "--brillo-lit": "1",
          "--chispa-dur": `${0.9 * RAPIDEZ}s`,
          "--palabra-min": "30px",
          "--palabra-vw": "3.4vw",
          "--palabra-max": "46px",
          "--palabra-movil-min": "1.5rem",
          "--palabra-movil-vw": "6.8vw",
          "--palabra-movil-max": "2.4rem",
          "--etiqueta-pad": "2px 26px 0",
          "--etiqueta-sombra": "0 10px 24px -10px rgba(227, 38, 47, 0.6)",
        } as CSSProperties
      }
    >
      <svg viewBox="0 0 780 260" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false" className={styles.svg}>
        <defs>
          <radialGradient id={halo}>
            <stop offset="0" stopColor="#ffe2b0" stopOpacity=".95" />
            <stop offset=".35" stopColor="#ffcf87" stopOpacity=".45" />
            <stop offset="1" stopColor="#ffcf87" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* techo + circuito */}
        <path className={styles.dash} d="M150 12H780" />
        <text className={styles.half} x="160" y="9" style={{ fontSize: 7 }}>
          TECHO · H 2.60 m
        </text>
        <path className={styles.ln} d={CIRCUITO} style={{ strokeWidth: 1.5 }} />
        <path
          data-p="pulse"
          d={CIRCUITO}
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0"
          strokeDasharray={`36 ${PL + 40}`}
          style={{ filter: "drop-shadow(0 0 4px #ffcf87)" }}
        />
        <path className={styles.flow} d={CIRCUITO} />
        <text className={styles.half} x="190" y="38" style={{ fontSize: 7 }}>
          CIRCUITO C1 · THW #12
        </text>
        <text data-p="carga" x="760" y="40" textAnchor="end">
          CARGA 0 W
        </text>

        {/* tablero */}
        <g>
          <rect x="40" y="70" width="90" height="142" rx="5" className={styles.caja} />
          <rect x="48" y="78" width="74" height="126" rx="3" className={styles.cota} />
          <rect x="56" y="86" width="58" height="18" rx="2" className={styles.pantalla} />
          <text data-p="volt" className={styles.lcd} x="85" y="99" textAnchor="middle">
            --- V
          </text>
          <g>
            {[0, 1, 2, 3].map((i) => {
              const x = 54 + 16 * i;
              return (
                <g key={i}>
                  <rect x={x} y="112" width="12" height="42" rx="2" className={styles.breaker} />
                  <rect data-brk={i} x={x + 2} y="136" width="8" height="14" rx="1.5" fill={i === 0 ? "#e3262f" : "#c3ccd8"} />
                  <text x={x + 6} y="166" textAnchor="middle" style={{ fontSize: 6 }}>
                    C{i + 1}
                  </text>
                </g>
              );
            })}
          </g>
          <text x="85" y="196" textAnchor="middle" style={{ fontSize: 7 }}>
            TABLERO · 4 CIRC.
          </text>
        </g>

        {/* toma */}
        <path className={styles.ln} d="M130 186H168" style={{ strokeWidth: 1.5 }} />
        <g transform="translate(168 166)">
          <rect width="30" height="42" rx="4" className={styles.caja} />
          <rect x="9" y="9" width="3" height="9" rx="1" fill="#c3ccd8" />
          <rect x="18" y="9" width="3" height="9" rx="1" fill="#c3ccd8" />
          <path d="M12 28a3 3 0 0 1 6 0v3h-6z" fill="#c3ccd8" />
          <circle data-p="ledToma" cx="15" cy="37" r="1.6" fill="#33465f" />
        </g>
        <text className={styles.half} x="166" y="222" style={{ fontSize: 7 }}>
          TOMA 15 A
        </text>

        {/* bobina de cable */}
        <g transform="translate(722 212)">
          <circle r="34" className={`${styles.ln} ${styles.fondoDeep}`} />
          <circle r="26" className={styles.cota} />
          <circle r="20" className={styles.cota} />
          <circle r="13" className={styles.cota} />
          <circle r="8" className={`${styles.ln} ${styles.fondoCard}`} style={{ strokeWidth: 1.5 }} />
          <path d="M-34 0C-50 6 -56 30 -70 40" className={styles.ln} style={{ strokeWidth: 1.5 }} />
        </g>
        <text className={styles.half} x="640" y="254" style={{ fontSize: 7 }}>
          BOBINA THW #12 · 100 m
        </text>

        {/* bombillos */}
        <g>
          {LAMPS.map((L, i) => {
            const cy = L.y + DROP + 46;
            return (
              <g key={i} data-lamp={i}>
                {/* plano en reposo (como la tarjeta) */}
                <g className={styles.bp}>
                  <circle cx={L.cx} cy={cy} r="54" className={styles.dash} />
                  <path
                    className={styles.cota}
                    d={`M${L.cx - 30} ${cy - 62}H${L.cx + 30}M${L.cx - 30} ${cy - 66}v8M${L.cx + 30} ${cy - 66}v8`}
                  />
                  <path d={`M${L.cx - 34} ${cy - 62}l5 -3v6z`} fill="#e3262f" />
                  <text x={L.cx - 14} y={cy - 66} style={{ fontSize: 7 }}>
                    Ø 60
                  </text>
                  <text x={L.cx - 58} y={cy + 3} textAnchor="end" style={{ fontSize: 7 }}>
                    {L.etiqueta}
                  </text>
                </g>
                {/* cordón + portalámparas (bajan desde el techo) */}
                <line data-l="cord" x1={L.cx} y1="24" x2={L.cx} y2="24" stroke="#c3ccd8" strokeWidth="1.5" />
                <g data-l="sock" transform={`translate(${L.cx} ${L.y - 60})`} style={{ opacity: 0 }}>
                  <rect x="-11" y="-18" width="22" height="18" rx="3" className={styles.caja} />
                  <path d="M-11 -12H11M-11 -6H11" className={styles.cota} />
                </g>
                {/* halo */}
                <circle data-l="halo" cx={L.cx} cy={L.y + 46} r="92" fill={`url(#${halo})`} opacity="0" />
                {/* bombillo */}
                <g data-l="b" transform={`translate(${L.cx} ${L.y + DROP})`}>
                  <g className={styles.flota} style={{ animationDelay: `${-i * 1.3}s` }}>
                  <path
                    data-l="glass"
                    d="M-7 14C-7 22 -24 28 -24 46A24 24 0 0 0 24 46C24 28 7 22 7 14Z"
                    fill="#0a1f38"
                    stroke="#c3ccd8"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <rect x="-8" y="0" width="16" height="14" rx="2" className={styles.caja} />
                  <path data-l="thr" d={rosca(0)} stroke="#c3ccd8" strokeWidth="1.5" fill="none" />
                  <path d="M-4 14V36M4 14V36" className={styles.cota} />
                  <path
                    data-l="fil"
                    d="M-8 36l4 8l4 -8l4 8l4 -8"
                    fill="none"
                    stroke="#e3262f"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <g data-l="rays" opacity="0" stroke="#ffcf87" strokeWidth="2" strokeLinecap="round">
                    {RAYOS.map((r, k) => (
                      <line key={k} {...r} />
                    ))}
                  </g>
                  </g>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </BannerPlano>
  );
}
