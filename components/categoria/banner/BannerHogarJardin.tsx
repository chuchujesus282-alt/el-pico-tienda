"use client";

import { useId, type CSSProperties } from "react";
import BannerPlano, { azar, type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerHogarJardin.module.css";

/**
 * Banner de la categoría Hogar y jardín, estilo "plano técnico". Portado del prototipo aprobado banner-jardin-v1.html:
 * corte de terreno con grama, montón de tierra, pala, matero, planta que crece y florece, manguera con su chorro, pasto
 * bajo la etiqueta; colores, riego (650 ms), crecimiento (1600 ms), flor (500 ms) y planta que se mece sin cambios.
 * **Cambio pedido por persona B: la pala tiene un trabajo.** En el prototipo solo cavaba un hoyo y amontonaba la
 * tierra; aquí el montón ya está en reposo y, al activarse, la pala da dos paladas: saca tierra del montón (que baja),
 * la lleva en arco hasta el matero, la vuelca (cae tierra) y el matero se va llenando. Con el matero lleno, la manguera
 * lo riega, la planta crece y florece, y de vez en cuando la pala lleva otra palada para "abonar".
 * Diferencias con el prototipo: solo el nombre de la categoría en la etiqueta (sin "Hogar y", kicker ni subtítulo,
 * como todos los banners propios), sin el hoyo, y la grama y el pasto con azar fijo (no cambian al hidratar).
 * Clases globales en la raíz: `on` (BannerPlano), `riego` (corre el agua) y `vivo` (la planta se mece).
 */

/**
 * Rapidez de toda la secuencia: 0.7 = 30% más rápida que la primera versión (pedido de persona B, 2026-10-24).
 * tween y wait la aplican solos; la pausa entre paladas de abono queda en 3,8 s reales.
 */
const RAPIDEZ = 0.7;

const PX = 134; // pala en reposo: punta de la hoja clavada junto al montón
const PY = 214;
const NIVEL_ALTO = 44; // alto del matero (de 162 a 206)

/** Grama sobre el terreno, salvo bajo el matero y la manguera. */
const GRAMA = (() => {
  const lista: string[] = [];
  let i = 0;
  for (let x = 4; x < 780; x += 7, i++) {
    if ((x > 352 && x < 448) || (x > 640 && x < 762)) continue;
    const h = 4 + azar(i, 3) * 7,
      l = azar(i, 4) * 4 - 2;
    lista.push(`M${x} 206q${l.toFixed(2)} ${(-h / 2).toFixed(2)} ${(l * 1.5).toFixed(2)} ${(-h).toFixed(2)}`);
  }
  return lista;
})();

/** Hojas de la planta: [x, y, lado, en qué punto del crecimiento salen]. */
const HOJAS = [
  [400, 138, -1, 0],
  [401, 124, 1, 0.25],
  [400, 110, -1, 0.45],
  [402, 98, 1, 0.65],
] as const;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = (t: number) => 1 - Math.pow(1 - t, 3);
const back = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
const lineal = (t: number) => t;
const NS = "http://www.w3.org/2000/svg";

function crearMotor(raiz: HTMLElement): Motor {
  const q = <T extends Element>(p: string) => raiz.querySelector<T>(`[data-p="${p}"]`)!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pala = q<SVGGElement>("pala"),
    carga = q<SVGPathElement>("carga"),
    monton = q<SVGGElement>("monton"),
    nivel = q<SVGRectElement>("nivel"),
    superficie = q<SVGEllipseElement>("superficie"),
    clipRect = q<SVGRectElement>("clipRect"),
    hum = q<SVGTextElement>("hum"),
    tallo = q<SVGPathElement>("tallo"),
    flor = q<SVGGElement>("flor"),
    gotas = q<SVGGElement>("gotas");
  const hojas = HOJAS.map(([x, y, , at], i) => ({ g: q<SVGGElement>(`hoja${i}`), x, y, at, shown: false }));

  // ---------- tiempo: cada activar/reposo sube `gen` y corta lo anterior ----------
  let gen = 0,
    destruido = false;
  const rafs = new Set<number>();
  const timers = new Set<number>();
  let intervalo = 0;
  const tween = (d: number, f: (p: number, t: number) => void, e: (t: number) => number = ease) => {
    const g = gen;
    return new Promise<boolean>((r) => {
      const s = performance.now();
      const dur = d * RAPIDEZ;
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
      }, ms * RAPIDEZ);
      timers.add(id);
    });
  };

  // ---------- pala, montón y matero ----------
  let px = 0,
    py = 0,
    pr = 0,
    mont = 1,
    lleno = 0;
  const drawPala = () => pala.setAttribute("transform", `translate(${PX + px} ${PY + py}) rotate(${pr})`);
  const setMonton = (v: number) => {
    mont = v;
    monton.setAttribute("transform", `translate(78 206) scale(${v}) translate(-78 -206)`);
  };
  const setNivel = (v: number) => {
    lleno = v;
    const h = NIVEL_ALTO * v;
    nivel.setAttribute("y", String(206 - h));
    nivel.setAttribute("height", String(h));
    superficie.setAttribute("opacity", String(Math.max(0, (v - 0.85) / 0.15)));
  };

  function particulas(x: number, y: number, hastaY: number, n: number) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", String(x + Math.random() * 16 - 8));
      c.setAttribute("cy", String(y));
      c.setAttribute("r", String(1.5 + Math.random() * 1.8));
      c.setAttribute("fill", "#8a6340");
      gotas.appendChild(c);
      c.animate(
        [{ transform: "translate(0,0)" }, { transform: `translate(${Math.random() * 14 - 7}px,${hastaY - y + Math.random() * 4}px)`, opacity: 0.3 }],
        { duration: (420 + Math.random() * 180) * RAPIDEZ, easing: "ease-in", delay: i * 25 * RAPIDEZ },
      ).onfinish = () => c.remove();
    }
  }
  function salpicar() {
    if (reduce) return;
    const x = 412 + Math.random() * 16 - 8;
    for (let i = 0; i < 3; i++) {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", String(x));
      c.setAttribute("cy", "150");
      c.setAttribute("r", "1.4");
      gotas.appendChild(c);
      c.animate(
        [
          { transform: "translate(0,0)", opacity: 1 },
          { transform: `translate(${Math.random() * 22 - 11}px,${-6 - Math.random() * 8}px)`, opacity: 0 },
        ],
        { duration: 420, easing: "ease-out" },
      ).onfinish = () => c.remove();
    }
  }

  /**
   * Una palada: la pala va al montón, carga tierra (el montón baja `saca`), la lleva en arco al matero, la vuelca y el
   * matero sube `llena`. Vuelve a su sitio.
   */
  async function palada(saca: number, llena: number) {
    // va al montón y entra en la tierra
    if (!(await tween(320, (p) => ((px = -34 * p), (py = -8 * p), (pr = 28 * p), drawPala()), out))) return false;
    // carga: la hoja sale con tierra y el montón baja
    carga.setAttribute("opacity", "1");
    particulas(98, 192, 204, 4);
    const m0 = mont;
    void tween(300, (p) => setMonton(m0 - saca * p), out);
    if (!(await tween(300, (p) => ((pr = 28 - 78 * p), (py = -8 - 34 * p), drawPala())))) return false;
    // la lleva en arco hasta el matero
    if (
      !(await tween(640, (p, t) => {
        px = -34 + 304 * p;
        py = -42 - 40 * p - 26 * Math.sin(Math.PI * t);
        drawPala();
      }))
    )
      return false;
    // la vuelca: la hoja se inclina, cae la tierra y el matero se llena
    if (!(await tween(220, (p) => ((pr = -50 - 40 * p), drawPala())))) return false;
    carga.setAttribute("opacity", "0");
    const sup = 206 - NIVEL_ALTO * Math.min(1, lleno + llena);
    particulas(392, 128, sup, 9);
    const n0 = lleno;
    void tween(450, (p) => setNivel(Math.min(1, n0 + llena * p)), out);
    if (!(await wait(140))) return false;
    // vuelve a su sitio
    return tween(480, (p) => {
      px = 270 * (1 - p);
      py = -82 * (1 - p);
      pr = -90 * (1 - p);
      drawPala();
    });
  }

  function crecer(p: number) {
    tallo.setAttribute("stroke-dashoffset", String(1 - p));
    hojas.forEach((h) => {
      if (!h.shown && p >= h.at) {
        h.shown = true;
        void tween(450, (qq) => h.g.setAttribute("transform", `translate(${h.x} ${h.y}) scale(${qq})`), back);
      }
    });
  }
  const setHum = (v: number) => (hum.textContent = `HUMEDAD ${Math.round(v)} %`);

  async function activar() {
    const g = ++gen;
    raiz.classList.add("on");
    if (!(await wait(250))) return;
    // dos paladas llenan el matero
    if (!(await palada(0.22, 0.55))) return;
    if (!(await palada(0.22, 0.45))) return;
    if (g !== gen) return;
    // riego: el chorro sale de la manguera hacia el matero
    raiz.classList.add("riego");
    if (
      !(await tween(reduce ? 10 : 650, (p) => {
        clipRect.setAttribute("x", String(600 - 200 * p));
        clipRect.setAttribute("width", String(200 * p));
      }))
    )
      return;
    intervalo = window.setInterval(() => {
      if (g !== gen) return clearInterval(intervalo);
      salpicar();
    }, 180);
    // la planta crece y florece
    if (
      !(await tween(
        reduce ? 10 : 1600,
        (p) => {
          crecer(p);
          setHum(12 + 56 * p);
        },
        lineal,
      ))
    )
      return;
    if (!(await tween(500, (p) => flor.setAttribute("transform", `translate(400 82) scale(${p}) rotate(${-90 + 90 * p})`), back))) return;
    raiz.classList.add("vivo");
    // de vez en cuando, otra palada para abonar (el montón ya no baja)
    while (g === gen) {
      if (!(await wait(3800 / RAPIDEZ))) return;
      if (!(await palada(0, 0))) return;
    }
  }

  function reposo() {
    gen++;
    clearInterval(intervalo);
    raiz.classList.remove("riego", "vivo");
    clipRect.setAttribute("width", "0");
    setHum(12);
    tallo.setAttribute("stroke-dashoffset", "1");
    flor.setAttribute("transform", "translate(400 82) scale(0)");
    hojas.forEach((h) => {
      h.shown = false;
      h.g.setAttribute("transform", `translate(${h.x} ${h.y}) scale(0)`);
    });
    carga.setAttribute("opacity", "0");
    const s = { px, py, pr },
      m = mont,
      n = lleno;
    void tween(500, (p) => {
      px = s.px * (1 - p);
      py = s.py * (1 - p);
      pr = s.pr * (1 - p);
      drawPala();
      setMonton(m + (1 - m) * p);
      setNivel(n * (1 - p));
    });
  }

  drawPala();
  setMonton(1);
  setNivel(0);

  return {
    encender: () => void activar(),
    apagar: reposo,
    destruir() {
      destruido = true;
      gen++;
      clearInterval(intervalo);
      rafs.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
      raiz.classList.remove("riego", "vivo");
      gotas.replaceChildren();
    },
  };
}

export default function BannerHogarJardin({ nombre }: PropsBannerPropio) {
  const id = useId().replace(/:/g, "");
  const hatch = `hatch-${id}`,
    clipAgua = `agua-${id}`,
    clipMatero = `matero-${id}`;
  return (
    <BannerPlano
      nombre={nombre}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial="#5fbf5a"
      crearMotor={crearMotor}
      decoracion="pasto"
      variables={
        {
          "--brillo": "radial-gradient(50% 120% at 62% 60%, rgba(95,191,90,.26), rgba(111,208,255,.08) 50%, transparent 72%)",
          "--brillo-on": "1",
          "--palabra-min": "26px",
          "--palabra-vw": "2.9vw",
          "--palabra-max": "40px",
          "--palabra-movil-min": "1.35rem",
          "--palabra-movil-vw": "6vw",
          "--palabra-movil-max": "2.1rem",
          "--etiqueta-pad": "2px 22px 0",
          "--etiqueta-sombra": "0 10px 24px -10px rgba(227, 38, 47, 0.6)",
        } as CSSProperties
      }
    >
      <svg viewBox="0 0 780 260" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false" className={styles.svg}>
        <defs>
          <pattern id={hatch} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="9" stroke="rgba(190,215,245,.18)" strokeWidth="1" />
          </pattern>
          <clipPath id={clipAgua}>
            <rect data-p="clipRect" x="600" y="0" width="0" height="260" />
          </clipPath>
          <clipPath id={clipMatero}>
            <path d="M358 162L368 206H432L442 162Z" />
          </clipPath>
        </defs>

        <text data-p="hum" x="760" y="30" textAnchor="end">
          HUMEDAD 12 %
        </text>

        {/* corte de terreno */}
        <rect className={styles.fTierra} x="0" y="206" width="780" height="54" fill={`url(#${hatch})`} />
        <rect x="0" y="206" width="780" height="54" fill={`url(#${hatch})`} />
        <path className={styles.ln} d="M0 206H780" style={{ strokeWidth: 1.5 }} />
        <g className={`${styles.pz} ${styles.terrones}`}>
          <ellipse cx="60" cy="228" rx="5" ry="3" />
          <ellipse cx="190" cy="240" rx="4" ry="2.5" />
          <ellipse cx="300" cy="226" rx="6" ry="3" />
          <ellipse cx="470" cy="236" rx="4" ry="2.5" />
          <ellipse cx="560" cy="246" rx="5" ry="3" />
          <ellipse cx="690" cy="230" rx="4" ry="2.5" />
        </g>
        <text className={styles.bp} x="12" y="252" style={{ fontSize: 7 }}>
          CORTE A-A · SUELO VEGETAL
        </text>
        <g className={styles.grama}>
          {GRAMA.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* montón de tierra: de aquí saca la pala */}
        <g data-p="monton">
          <path className={`${styles.fTierra} ${styles.monton}`} d="M40 206C52 186 70 176 82 176C96 176 108 190 116 206Z" />
          <g className={`${styles.pz} ${styles.piedras}`}>
            <circle cx="70" cy="196" r="2.5" />
            <circle cx="86" cy="186" r="2" />
            <circle cx="98" cy="198" r="2.5" />
            <circle cx="60" cy="202" r="1.8" />
          </g>
        </g>
        <text className={styles.bp} x="44" y="170" style={{ fontSize: 7 }}>
          TIERRA ABONADA
        </text>

        {/* matero: se llena con lo que trae la pala */}
        <path className={`${styles.ln} ${styles.fMatero}`} d="M354 150H446V162H354Z" />
        <path className={`${styles.ln} ${styles.fMatero}`} d="M358 162L368 206H432L442 162Z" />
        <rect data-p="nivel" x="354" y="206" width="92" height="0" clipPath={`url(#${clipMatero})`} className={styles.tierraMatero} />
        <path className={styles.cota} d="M362 178H438" />
        <ellipse data-p="superficie" cx="400" cy="156" rx="40" ry="3" className={styles.superficie} opacity="0" />
        <g className={styles.bp}>
          <path className={styles.cota} d="M354 138H446M354 133v10M446 133v10" />
          <path d="M358 138l-5 -3v6z" fill="#e3262f" />
          <text x="380" y="132" style={{ fontSize: 7 }}>
            Ø 30 cm
          </text>
          <path className={styles.dash} d="M400 154C396 130 404 110 400 84" />
          <text x="300" y="196" style={{ fontSize: 7 }}>
            MATERO N°12
          </text>
        </g>

        {/* planta (crece) */}
        <g data-p="planta" className={styles.planta}>
          <path
            data-p="tallo"
            d="M400 156C396 132 404 110 400 84"
            fill="none"
            stroke="#5fbf5a"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="1"
          />
          <g fill="#5fbf5a" stroke="#2f7d3a" strokeWidth="1">
            {HOJAS.map(([x, y, s], i) => (
              <g key={i} data-p={`hoja${i}`} transform={`translate(${x} ${y}) scale(0)`}>
                <path d={`M0 0C${s * 8} -10 ${s * 20} -8 ${s * 24} -2C${s * 18} 4 ${s * 8} 4 0 0Z`} />
                <path d={`M0 0L${s * 18} -3`} stroke="#2f7d3a" fill="none" />
              </g>
            ))}
          </g>
          <g data-p="flor" transform="translate(400 82) scale(0)">
            <g fill="#e3262f">
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="0" cy="-9" rx="5" ry="8" transform={a ? `rotate(${a})` : undefined} />
              ))}
            </g>
            <circle r="4.5" fill="#ffcf5a" />
          </g>
        </g>

        {/* pala (origen en la punta de la hoja) */}
        <g data-p="pala" transform={`translate(${PX} ${PY}) rotate(0)`}>
          <path className={styles.ln} d="M0 -36V-140" style={{ strokeWidth: 3 }} />
          <path className={styles.ln} d="M-12 -140H12M-12 -140V-156H12V-140" style={{ strokeWidth: 2.5 }} />
          <path d="M-13 -36H13V-12Q13 -2 0 2Q-13 -2 -13 -12Z" fill="#e3262f" stroke="#c3ccd8" strokeWidth="1.5" />
          <path data-p="carga" d="M-14 -38Q0 -50 14 -38Z" fill="#8a6340" opacity="0" />
        </g>
        <g className={styles.bp}>
          <path className={styles.cota} d="M160 54V214M155 54h10M155 214h10" />
          <text transform="translate(172 150) rotate(-90)" style={{ fontSize: 7 }}>
            1.10 m
          </text>
          <text x="62" y="70" style={{ fontSize: 7 }}>
            PALA · ACERO
          </text>
        </g>

        {/* manguera */}
        <g>
          <ellipse className={`${styles.ln} ${styles.fMang}`} cx="702" cy="196" rx="56" ry="11" />
          <ellipse className={styles.ln} cx="702" cy="188" rx="56" ry="11" />
          <ellipse className={styles.ln} cx="702" cy="180" rx="56" ry="11" />
          <ellipse className={`${styles.ln} ${styles.fMang}`} cx="702" cy="172" rx="56" ry="11" />
          <ellipse className={styles.cota} cx="702" cy="172" rx="38" ry="6" />
          <path className={styles.ln} d="M652 168C620 160 626 128 596 120" style={{ strokeWidth: 4 }} />
          <g transform="translate(596 120) rotate(28)">
            <rect x="-22" y="-5" width="22" height="10" rx="2" fill="#e3262f" stroke="#c3ccd8" strokeWidth="1.5" />
            <rect x="-28" y="-3.5" width="7" height="7" rx="1" fill="#0a1f38" stroke="#c3ccd8" strokeWidth="1.5" />
          </g>
        </g>
        <text className={styles.bp} x="642" y="226" style={{ fontSize: 7 }}>
          MANGUERA 1/2&quot; · 20 m
        </text>

        {/* agua */}
        <g clipPath={`url(#${clipAgua})`}>
          <path className={styles.agua} d="M568 104Q490 20 412 146" />
          <path d="M568 108Q494 34 420 148" fill="none" stroke="#6fd0ff" strokeWidth="1.2" strokeDasharray="2 10" opacity=".7" />
        </g>
        <g data-p="gotas" fill="#6fd0ff" />
      </svg>
    </BannerPlano>
  );
}
