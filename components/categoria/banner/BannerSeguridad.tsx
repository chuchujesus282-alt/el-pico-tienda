"use client";

import type { CSSProperties } from "react";
import BannerPlano, { type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerSeguridad.module.css";

/**
 * Banner de la categoría Seguridad industrial, estilo "plano técnico". Portado del prototipo aprobado
 * banner-seguridad-v1.html: vista explotada del EPP (casco, lentes, mascarilla N95, guantes y botas punta de acero)
 * alrededor de la silueta de un trabajador, con su checklist.
 * Activo: la silueta pasa a trazo firme, las piezas toman su material y van a su sitio una por una; cada una marca su
 * fila del checklist y su casilla bajo la etiqueta. Con las 5, el sello "APTO PARA OBRA" (clase global `apto`, que
 * también prende el brillo verde). Al salir se desmarca todo y las piezas vuelven a la vista explotada.
 * Diferencias con el prototipo: ~35% más rápido (pedido de persona B), las guías, burbujas y filas se dibujan en el
 * servidor (el prototipo las armaba con JS), solo el nombre en la etiqueta (sin kicker ni subtítulo, como todos los
 * banners propios) y, en reposo, las piezas flotan apenas.
 */

type Pieza = { item: number; a: [number, number]; b: [number, number]; s: [number, number] };

/** Piezas: posición explotada (a) → puesta (b); s = escala puesta; item = fila del checklist. */
const PIEZAS: Pieza[] = [
  { item: 0, a: [340, 56], b: [470, 52], s: [1, 1] }, // casco
  { item: 1, a: [340, 104], b: [470, 62], s: [1, 0.9] }, // lentes
  { item: 2, a: [340, 150], b: [470, 73], s: [1, 0.85] }, // mascarilla
  { item: 3, a: [586, 112], b: [433, 163], s: [1, 1] }, // guante izq.
  { item: 3, a: [612, 112], b: [507, 163], s: [1, 1] }, // guante der.
  { item: 4, a: [580, 190], b: [455, 222], s: [1, 1] }, // bota izq.
  { item: 4, a: [612, 190], b: [481, 222], s: [1, 1] }, // bota der.
];
/** Orden en que se ponen (los pares van juntos). */
const GRUPOS = [[0], [1], [2], [3, 4], [5, 6]];
const ITEMS = ["CASCO", "LENTES", "MASCARILLA N95", "GUANTES", "BOTAS P/ACERO"];
const BURBUJAS: [number, number][] = [
  [300, 56],
  [300, 104],
  [300, 150],
  [640, 112],
  [640, 190],
];

// Tiempos (ms). El prototipo: 300 / 640 / 220 / 250 / 520.
const ARRANQUE = 180;
const PONER = 440;
const ENTRE = 130;
const ANTES_SELLO = 150;
const QUITAR = 380;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const transformDe = (x: number, y: number, sx = 1, sy = 1) =>
  `translate(${x.toFixed(1)} ${y.toFixed(1)})${sx !== 1 || sy !== 1 ? ` scale(${sx.toFixed(3)} ${sy.toFixed(3)})` : ""}`;

function crearMotor(raiz: HTMLElement): Motor {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const piezas = PIEZAS.map((p, i) => ({
    ...p,
    g: raiz.querySelector<SVGGElement>(`[data-p="p${i}"]`)!,
    x: p.a[0],
    y: p.a[1],
    k: 0, // 0 = explotada, 1 = puesta (escala)
  }));
  const filas = [...raiz.querySelectorAll<SVGGElement>("[data-fila]")];
  const casillas = [...raiz.querySelectorAll<HTMLElement>("[data-casilla]")];
  const contador = raiz.querySelector<SVGTextElement>('[data-p="cont"]')!;

  const draw = (p: (typeof piezas)[number]) =>
    p.g.setAttribute("transform", transformDe(p.x, p.y, 1 + (p.s[0] - 1) * p.k, 1 + (p.s[1] - 1) * p.k));

  function marcar(n: number) {
    filas.forEach((f, i) => f.classList.toggle("ok", i < n));
    casillas.forEach((c, i) => c.classList.toggle("ok", i < n));
    contador.textContent = `${n}/5`;
  }

  // ---------- tiempo: cada encender/apagar sube `gen` y corta lo anterior ----------
  let gen = 0,
    destruido = false;
  const rafs = new Set<number>();
  const timers = new Set<number>();
  const tween = (d: number, f: (p: number) => void) => {
    const g = gen;
    const dur = reduce ? 10 : d;
    return new Promise<boolean>((r) => {
      const s = performance.now();
      const k = (n: number) => {
        if (g !== gen || destruido) return r(false);
        const t = Math.min(1, (n - s) / dur);
        f(ease(t));
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

  /** Lleva la pieza a su sitio (o de vuelta) en arco. */
  function mover(p: (typeof piezas)[number], puesta: boolean, arco: number, dur: number) {
    const [tx, ty] = puesta ? p.b : p.a;
    const fx = p.x,
      fy = p.y,
      k0 = p.k,
      k1 = puesta ? 1 : 0;
    return tween(dur, (q) => {
      p.x = fx + (tx - fx) * q;
      p.y = fy + (ty - fy) * q - arco * Math.sin(Math.PI * q);
      p.k = k0 + (k1 - k0) * q;
      draw(p);
    });
  }

  async function activar() {
    ++gen;
    raiz.classList.add("on");
    if (!(await wait(ARRANQUE))) return;
    for (const [gi, grupo] of GRUPOS.entries()) {
      const ok = await Promise.all(grupo.map((i) => mover(piezas[i], true, gi < 3 ? 18 : 14, PONER)));
      if (!ok.every(Boolean)) return;
      marcar(gi + 1);
      if (!(await wait(ENTRE))) return;
    }
    if (!(await wait(ANTES_SELLO))) return;
    raiz.classList.add("apto");
  }

  async function reposo() {
    const g = ++gen;
    // `on` se queda hasta que las piezas vuelven (BannerPlano ya la quitó; el prototipo la quita al final).
    raiz.classList.add("on");
    raiz.classList.remove("apto");
    marcar(0);
    await Promise.all(piezas.map((p) => mover(p, false, 10, QUITAR)));
    if (g === gen && !destruido) raiz.classList.remove("on");
  }

  return {
    encender: () => void activar(),
    apagar: () => void reposo(),
    destruir() {
      destruido = true;
      gen++;
      rafs.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
      raiz.classList.remove("apto");
    },
  };
}

/** Rayado del piso: trazos cortos cada 18 unidades. */
const RAYADO_PISO = Array.from({ length: 21 }, (_, k) => `M${268 + k * 18} 226l-8 8`).join("");

export default function BannerSeguridad({ nombre }: PropsBannerPropio) {
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
          "--brillo": "radial-gradient(45% 110% at 62% 50%, rgba(245,196,0,.14), transparent 70%)",
          "--brillo-on": "1",
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
    >
      <div className={s.brilloApto} aria-hidden />
      <svg viewBox="170 0 610 260" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false" className={s.svg}>
        <text className={s.bp} x="290" y="20" style={{ fontSize: 7 }}>
          VISTA EXPLOTADA · EQUIPO DE PROTECCIÓN PERSONAL
        </text>

        {/* piso */}
        <path className={s.cota} d={`M260 226H640${RAYADO_PISO}`} />

        {/* cota de altura */}
        <g className={s.bp}>
          <path className={s.cota} d="M410 44V226M405 44h10M405 226h10" />
          <path d="M410 48l-3 -5h6z" fill="#e3262f" />
          <text transform="translate(402 150) rotate(-90)" style={{ fontSize: 7 }}>
            1.75 m
          </text>
        </g>

        {/* trabajador: discontinuo en reposo, trazo firme al activarse */}
        <g className={s.figura}>
          <circle cx="470" cy="62" r="15" />
          <path d="M464 77V84H476V77" />
          <path d="M446 88Q446 84 452 84H488Q494 84 494 88L498 150H442Z" />
          <path d="M446 90L432 152Q430 158 434 158" />
          <path d="M494 90L508 152Q510 158 506 158" />
          <path d="M446 150L450 204H464L468 150" />
          <path d="M472 150L476 204H490L494 150" />
        </g>

        {/* guías de la vista explotada */}
        <path
          className={`${s.dash} ${s.bp}`}
          d={PIEZAS.map((p) => `M${p.a[0]} ${p.a[1]}L${p.b[0]} ${p.b[1] - (p.item === 4 ? 10 : 0)}`).join("")}
        />

        {/* ===== piezas de EPP (el motor las mueve con transform) ===== */}
        <g data-p="p0" transform={transformDe(...PIEZAS[0].a)}>
          <g className={s.flota}>
            <path className={`${s.fill} ${s.fCasco} ${s.ln}`} d="M-22 4A22 21 0 0 1 22 4Z" />
            <path className={`${s.fill} ${s.fCasco} ${s.ln} ${s.w15}`} d="M-28 4H28V9H-28Z" />
            <path className={s.cota} d="M0 -16V3M-10 -12Q-12 -4 -12 3M10 -12Q12 -4 12 3" />
          </g>
        </g>
        <g data-p="p1" transform={transformDe(...PIEZAS[1].a)}>
          <g className={s.flota} style={{ animationDelay: "-0.6s" }}>
            <rect className={`${s.fill} ${s.fMica} ${s.ln} ${s.w15}`} x="-15" y="-5" width="13" height="10" rx="3" />
            <rect className={`${s.fill} ${s.fMica} ${s.ln} ${s.w15}`} x="2" y="-5" width="13" height="10" rx="3" />
            <path className={`${s.ln} ${s.w15}`} d="M-2 -2H2M-15 -2L-19 -1M15 -2L19 -1" />
          </g>
        </g>
        <g data-p="p2" transform={transformDe(...PIEZAS[2].a)}>
          <g className={s.flota} style={{ animationDelay: "-1.2s" }}>
            <path className={`${s.ln} ${s.w1}`} d="M-10 -3L-18 -9M10 -3L18 -9M-10 3L-17 7M10 3L17 7" />
            <ellipse className={`${s.fill} ${s.fN95} ${s.ln} ${s.w15}`} rx="11" ry="8" />
            <circle r="2.5" className={`${s.fill} ${s.ln} ${s.w1}`} />
          </g>
        </g>
        {[3, 4].map((i) => (
          <g key={i} data-p={`p${i}`} transform={transformDe(...PIEZAS[i].a)}>
            <g className={s.flota} style={{ animationDelay: `${-1.8 - (i - 3) * 0.3}s` }}>
              <path className={`${s.fill} ${s.fCarnaza} ${s.ln} ${s.w15}`} d="M-7 -6H7V8Q7 13 0 13Q-7 13 -7 8Z" />
              <path className={s.cota} d="M-4 9V13M0 9V13M4 9V13" />
              <path className={`${s.fill} ${s.fCarnaza} ${s.ln} ${s.w15}`} d={i === 3 ? "M-7 -1L-12 4" : "M7 -1L12 4"} />
              <rect className={`${s.fill} ${s.fCarnaza} ${s.ln} ${s.w12}`} x="-8" y="-11" width="16" height="6" rx="1.5" />
            </g>
          </g>
        ))}
        {[5, 6].map((i) => (
          <g key={i} data-p={`p${i}`} transform={transformDe(...PIEZAS[i].a)}>
            <path className={`${s.fill} ${s.fBota} ${s.ln} ${s.w15}`} d="M-9 -24H6V-6H12Q18 -6 18 1V4H-9Z" />
            <path className={`${s.fill} ${s.fAcero}`} d="M8 -5Q16 -5 16 1V3H8Z" />
            <path className={s.cota} d="M-9 0H18" />
          </g>
        ))}

        {/* burbujas numeradas */}
        <g className={s.bp}>
          {BURBUJAS.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="8" className={s.cota} />
              <text x={x} y={y + 3} textAnchor="middle" style={{ fontSize: 7 }}>
                0{i + 1}
              </text>
            </g>
          ))}
        </g>

        {/* ===== checklist ===== */}
        <g transform="translate(650 44)">
          <rect width="116" height="160" rx="6" fill="rgba(7,21,38,.7)" stroke="rgba(190,215,245,.55)" />
          <text x="10" y="18" style={{ fontSize: 8 }}>
            CHECKLIST EPP
          </text>
          <text data-p="cont" x="106" y="18" textAnchor="end" style={{ fontSize: 8 }}>
            0/5
          </text>
          <path className={s.cota} d="M8 26H108M8 128H108" />
          {ITEMS.map((t, i) => (
            <g key={t} data-fila={i} className={s.fila} transform={`translate(10 ${36 + i * 18})`}>
              <rect className={s.caja} width="11" height="11" rx="2" />
              <path className={s.tick} d="M2.5 6L4.8 8.3L8.8 3.2" />
              <text x="18" y="9" style={{ fontSize: 7.5 }}>
                0{i + 1} {t}
              </text>
            </g>
          ))}
          <text className={s.estado} x="58" y="148" textAnchor="middle" style={{ fontSize: 8 }}>
            PENDIENTE
          </text>
          <g className={s.sello}>
            <rect x="8" y="134" width="100" height="20" rx="3" fill="none" stroke="var(--c)" strokeWidth="2" />
            <text x="58" y="147.5" textAnchor="middle" textLength="88" lengthAdjust="spacingAndGlyphs" className={s.selloTexto}>
              APTO PARA OBRA
            </text>
          </g>
        </g>
      </svg>
    </BannerPlano>
  );
}
