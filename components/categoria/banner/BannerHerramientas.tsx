"use client";

import { useId, type CSSProperties } from "react";
import BannerPlano, { type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerHerramientas.module.css";

/**
 * Banner de la categoría Herramientas, estilo "plano técnico" (reemplaza al de fotos con el tablero que se reponía).
 * Portado del prototipo aprobado banner-herramientas-v1.html: tablero perforado con 6 ganchos y la silueta punteada de
 * cada herramienta (esmeril 4½", martillo, llave 10", serrucho, nivel 24" y taladro 20V), repisa y cota.
 * Activo: cada herramienta cae en su silueta (110 ms entre una y otra) y se balancea en el gancho, la burbuja del nivel
 * se centra y arrancan el esmeril (el disco gira y echa chispas) y el taladro (la broca gira): clase global `vivo`,
 * RPM 0 → 1.500. Al salir suben y se desvanecen (380 ms). Tiempos y colores del prototipo.
 * Diferencias con el prototipo: las herramientas se dibujan en JSX (el prototipo las armaba con innerHTML), solo el
 * nombre en la etiqueta (sin "Herramientas para", kicker ni subtítulo) y, en reposo, las siluetas se mecen apenas en
 * su gancho. Con "reducir movimiento", sin chispas.
 */

const XS = [92, 196, 292, 392, 486, 650];
const ETIQUETAS = ['ESMERIL 4½"', "MARTILLO", 'LLAVE 10"', "SERRUCHO", 'NIVEL 24"', "TALADRO 20V"];
const ACERO = "#aab5c3";
/** Dientes del serrucho: 14 dientes, como el prototipo. */
const DIENTES = "M-20 48" + "l-4 6l3 3".repeat(14) + "l-1 2";

const out = (t: number) => 1 - Math.pow(1 - t, 3);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function crearMotor(raiz: HTMLElement): Motor {
  const q = <T extends Element>(p: string) => raiz.querySelector<T>(`[data-p="${p}"]`)!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rpm = q<SVGTextElement>("rpm"),
    burbuja = q<SVGCircleElement>("burbuja"),
    chispas = q<SVGGElement>("chispas");
  const tools = XS.map((x, i) => ({ x, g: q<SVGGElement>(`t${i}`), y: -260, a: 0 }));
  const draw = (t: (typeof tools)[number]) =>
    t.g.setAttribute("transform", `translate(${t.x} ${(40 + t.y).toFixed(1)}) rotate(${t.a.toFixed(2)})`);

  // ---------- tiempo: cada encender/apagar sube `gen` y corta lo anterior ----------
  let gen = 0,
    destruido = false,
    chisporroteo = 0;
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
  const pararChispas = () => {
    clearInterval(chisporroteo);
    chisporroteo = 0;
  };

  /** Una chispa del esmeril: sale del disco hacia la izquierda y abajo, y se borra sola. */
  function chispa() {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "line");
    c.setAttribute("x1", "74");
    c.setAttribute("y1", "196");
    c.setAttribute("x2", "68");
    c.setAttribute("y2", "201");
    chispas.appendChild(c);
    const dx = -26 - Math.random() * 46,
      dy = 4 + Math.random() * 26;
    c.animate(
      [
        { transform: "translate(0,0)", opacity: 1 },
        { transform: `translate(${dx}px,${dy}px)`, opacity: 0 },
      ],
      { duration: 320 + Math.random() * 200, easing: "ease-out" },
    ).onfinish = () => c.remove();
  }

  async function activar() {
    const g = ++gen;
    raiz.classList.add("on");
    // 1. cada herramienta cae en su silueta del tablero y se balancea en el gancho
    const jobs = tools.map((t, i) =>
      wait(i * 110).then(async (ok) => {
        if (!ok) return false;
        t.g.style.opacity = "1";
        if (!(await tween(460, (p) => ((t.y = -260 * (1 - p)), draw(t)), out))) return false;
        const amp = (i % 2 ? -1 : 1) * (7 + Math.random() * 3);
        return tween(800, (_, u) => ((t.a = amp * Math.exp(-4.5 * u) * Math.sin(u * 16)), draw(t)), (x) => x);
      }),
    );
    if (!(await Promise.all(jobs)).every(Boolean)) return;
    // 2. la burbuja del nivel se centra
    if (!(await tween(420, (p) => burbuja.setAttribute("cy", (81 + 8 * p).toFixed(2))))) return;
    // 3. arrancan el esmeril y el taladro
    raiz.classList.add("vivo");
    if (!reduce)
      chisporroteo = window.setInterval(() => {
        if (g !== gen || destruido) return pararChispas();
        chispa();
        chispa();
        chispa();
      }, 45);
    await tween(700, (p) => (rpm.textContent = `RPM ${Math.round(1500 * p).toLocaleString("es")}`), out);
  }

  async function reposo() {
    const g = ++gen;
    pararChispas();
    // `on` se queda hasta que suben (BannerPlano ya la quitó; el prototipo la quita al final).
    raiz.classList.add("on");
    raiz.classList.remove("vivo");
    rpm.textContent = "RPM 0";
    burbuja.setAttribute("cy", "81");
    const s = tools.map((t) => ({ y: t.y, a: t.a }));
    const ok = await tween(
      380,
      (p) =>
        tools.forEach((t, i) => {
          t.y = s[i].y - 200 * p;
          t.a = s[i].a * (1 - p);
          t.g.style.opacity = String(1 - p);
          draw(t);
        }),
      (t) => t * t,
    );
    if (!ok || g !== gen) return;
    raiz.classList.remove("on");
    tools.forEach((t) => {
      t.y = -260;
      draw(t);
    });
  }

  return {
    encender: () => void activar(),
    apagar: () => void reposo(),
    destruir() {
      destruido = true;
      gen++;
      pararChispas();
      rafs.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
      raiz.classList.remove("vivo");
    },
  };
}

/** Dibujo de cada herramienta (origen = su gancho). `real`: la que cae (con sus piezas animadas); si no, la silueta. */
function Herramienta({ i, real, clip }: { i: number; real: boolean; clip: string }) {
  const s = styles;
  const f = (c: string) => `${s.f} ${c}`;
  switch (i) {
    case 0: // esmeril
      return (
        <>
          <rect className={f(s.fRojo)} x="-14" y="8" width="28" height="88" rx="12" />
          <path className={s.no} d="M-7 22V40M0 22V40M7 22V40" />
          <rect className={f(s.fNegro)} x="-6" y="52" width="12" height="16" rx="2" />
          <rect className={f(s.fAcero)} x="-10" y="96" width="20" height="18" rx="2" />
          <g className={real ? s.disco : undefined}>
            <circle className={f(s.fNegro)} cx="0" cy="142" r="26" />
            <circle className={f(s.fAcero)} cx="0" cy="142" r="6" />
            <path className={s.no} d="M0 120V128M0 156V164M-22 142H-14M14 142H22" style={{ stroke: ACERO }} />
          </g>
          <path className={f(s.fAcero)} d="M-30 142A30 30 0 0 1 30 142H24A24 24 0 0 0 -24 142Z" />
        </>
      );
    case 1: // martillo
      return (
        <>
          <rect className={f(s.fMadera)} x="-5" y="24" width="10" height="146" rx="3" />
          <rect className={f(s.fRojo)} x="-7" y="110" width="14" height="62" rx="4" />
          <path className={f(s.fAcero)} d="M-32 10H20Q38 12 44 30L36 30Q32 20 20 22H-32Z" />
          <rect className={f(s.fAcero)} x="-34" y="8" width="12" height="16" rx="2" />
        </>
      );
    case 2: // llave
      return (
        <>
          <path className={f(s.fAcero)} d="M-20 10H20V34H7V22H-7V34H-20Z" />
          <rect className={f(s.fAcero)} x="-7" y="34" width="14" height="128" rx="5" />
          <rect className={f(s.fRojo)} x="-8" y="104" width="16" height="58" rx="5" />
          <circle className={s.hole} cx="0" cy="150" r="3" />
        </>
      );
    case 3: // serrucho
      return (
        <>
          <path className={f(s.fAcero)} d="M-20 48H20L14 168H-8Z" />
          <path className={s.no} d={DIENTES} />
          <rect className={f(s.fRojo)} x="-24" y="8" width="48" height="42" rx="12" />
          <rect className={s.hole} x="-13" y="18" width="26" height="20" rx="7" />
        </>
      );
    case 4: // nivel
      return (
        <>
          <rect className={f(s.fAcero)} x="-10" y="8" width="20" height="160" rx="3" />
          <rect className={f(s.fRojo)} x="-10" y="8" width="20" height="14" rx="3" />
          <rect className={f(s.fRojo)} x="-10" y="154" width="20" height="14" rx="3" />
          <rect className={f(s.fVial)} x="-6" y="76" width="12" height="26" rx="6" />
          <path className={s.no} d="M-6 84H6M-6 94H6" style={{ stroke: "#0b1d33", strokeWidth: 1 }} />
          <circle data-p={real ? "burbuja" : undefined} cx="0" cy="81" r="3.6" fill="#fff" style={{ stroke: "none" }} />
        </>
      );
    default: // taladro
      return (
        <>
          <rect className={f(s.fRojo)} x="-52" y="10" width="84" height="34" rx="15" />
          <path className={s.no} d="M8 18V36M14 18V36M20 18V36" />
          <path className={f(s.fAcero)} d="M-66 18H-52V36H-66L-70 32V22Z" />
          <g clipPath={`url(#${clip})`}>
            <rect className={f(s.fAcero)} x="-112" y="24" width="46" height="7" />
            <g className={real ? s.estrias : undefined}>
              <path
                className={s.no}
                d="M-120 31L-114 24M-112 31L-106 24M-104 31L-98 24M-96 31L-90 24M-88 31L-82 24M-80 31L-74 24M-72 31L-66 24M-64 31L-58 24"
                style={{ stroke: "#0b1d33", strokeWidth: 1.2 }}
              />
            </g>
          </g>
          <path className={f(s.fNegro)} d="M-8 44L2 114H30L24 44Z" />
          <rect className={f(s.fRojo)} x="-10" y="50" width="8" height="15" rx="2" />
          <rect className={f(s.fNegro)} x="-6" y="114" width="48" height="24" rx="4" />
          <rect className={f(s.fRojo)} x="-6" y="122" width="48" height="5" />
          <text x="4" y="135" style={{ fontSize: 7, stroke: "none" }}>
            20V
          </text>
        </>
      );
  }
}

export default function BannerHerramientas({ nombre }: PropsBannerPropio) {
  const id = useId().replace(/:/g, "");
  const huecos = `huecos-${id}`,
    clip = `broca-${id}`;
  const s = styles;
  return (
    <BannerPlano
      nombre={nombre}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial="#f5c400"
      crearMotor={crearMotor}
      decoracion="metro"
      variables={
        {
          "--brillo":
            "radial-gradient(55% 120% at 70% 50%, rgba(227,38,47,.16), rgba(255,170,80,.06) 45%, transparent 72%)",
          "--brillo-on": "1",
          "--etiqueta-pad": "2px 26px 0",
          "--etiqueta-sombra": "0 10px 24px -10px rgba(227, 38, 47, 0.6)",
        } as CSSProperties
      }
    >
      <svg viewBox="0 0 780 260" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false" className={s.svg}>
        <defs>
          <pattern id={huecos} width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="11" cy="11" r="1.8" fill="rgba(190,215,245,.28)" />
          </pattern>
          <clipPath id={clip}>
            <rect x="-112" y="24" width="46" height="7" rx="2" />
          </clipPath>
        </defs>

        <text data-p="rpm" x="760" y="12" textAnchor="end">
          RPM 0
        </text>

        {/* tablero perforado + repisa */}
        <rect className={s.tablero} x="20" y="16" width="752" height="206" rx="4" />
        <rect x="20" y="16" width="752" height="206" rx="4" fill={`url(#${huecos})`} />
        <path d="M14 222H778" stroke="#c3ccd8" strokeWidth="2" />
        <path className={s.cota} d="M14 230H778" />
        <text className={s.bp} x="24" y="246" style={{ fontSize: 7 }}>
          TABLERO PERFORADO · 1.20 × 0.60 m
        </text>

        {/* siluetas punteadas (en reposo se mecen apenas en su gancho) y etiquetas */}
        {XS.map((x, i) => (
          <g key={`s${i}`}>
            <g className={`${s.gh} ${s.t}`} transform={`translate(${x} 40)`}>
              <g className={s.mece} style={{ animationDelay: `${-i * 0.7}s` }}>
                <Herramienta i={i} real={false} clip={clip} />
              </g>
            </g>
            <text className={s.bp} x={x + 12} y="34" style={{ fontSize: 6.5 }}>
              {ETIQUETAS[i]}
            </text>
          </g>
        ))}

        {/* ganchos */}
        <path
          d={XS.map((x) => `M${x - 3} 30V40Q${x - 3} 46 ${x + 3} 46`).join("")}
          fill="none"
          stroke="#c3ccd8"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* herramientas reales: arriba, fuera de cuadro e invisibles hasta activarse (el motor las mueve) */}
        {XS.map((x, i) => (
          <g key={`t${i}`} data-p={`t${i}`} className={s.t} transform={`translate(${x} -220) rotate(0)`} style={{ opacity: 0 }}>
            <Herramienta i={i} real clip={clip} />
          </g>
        ))}

        <g data-p="chispas" className={s.chispas} />
      </svg>
    </BannerPlano>
  );
}
