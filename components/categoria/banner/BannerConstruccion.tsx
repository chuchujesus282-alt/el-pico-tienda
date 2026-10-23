"use client";

import type { CSSProperties } from "react";
import BannerPlano, { type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerConstruccion.module.css";

/**
 * Banner de la categoría Construcción, estilo "plano técnico". Portado TAL CUAL del prototipo aprobado
 * banner-construccion-v1.html: SVG (pluma, muro de 7 hiladas trabadas, cabillas, saco, paleta 4×4, grúa), tiempos de
 * la grúa (moveX 600/850, moveY 400/450/350, vuelta 700), polvo y colores sin cambios.
 * Reposo: el muro es plano (3 hiladas hechas, las de arriba punteadas). Activo (mouse encima; en táctil, al tocar): la
 * grúa toma bloques de la paleta y levanta el muro hilada por hilada (contador 23 / 53). Al salir termina el bloque que
 * lleva, vuelve a su sitio y el muro regresa al plano.
 * Diferencias con el prototipo: la base (contenedor, texto, cinta, reposo/activo) es BannerPlano; el muro y la paleta
 * se dibujan en JSX y se reinician quitando clases en vez de rehacerse; si el muro se completa con el banner activo, la
 * grúa se queda en su sitio (el prototipo repetía la vuelta en vacío); con "reducir movimiento" la grúa no se mueve y
 * el muro aparece completo.
 */

// ---------- geometría (del prototipo) ----------
const ROWS = 7;
const BASE_ROWS = 3;
const TX0 = 560; // grúa en reposo
const HY0 = 60;
const SAFE = 34; // altura de traslado

type Bloque = { x: number; y: number; w: number; r: number; slot?: number; media?: boolean };

/** Muro: 7 hiladas, aparejo trabado; desde la 4ª son espacios (slots) que llena la grúa. */
const MURO: Bloque[] = (() => {
  const lista: Bloque[] = [];
  let slot = 0;
  for (let r = 0; r < ROWS; r++) {
    const y = 236 - 20 * (r + 1),
      odd = r % 2 === 1;
    if (odd) {
      lista.push({ x: 100, y, w: 20, r, media: true });
      lista.push({ x: 400, y, w: 20, r, media: true });
    }
    const n = odd ? 7 : 8,
      x0 = odd ? 120 : 100;
    for (let i = 0; i < n; i++) lista.push({ x: x0 + 40 * i, y, w: 40, r, slot: r >= BASE_ROWS ? slot++ : undefined });
  }
  return lista;
})();

/** Paleta 4×4; la fila de arriba (r = 3) es la que toma la grúa. */
const PALETA = Array.from({ length: 16 }, (_, k) => ({ r: Math.floor(k / 4), c: k % 4 }));

const CELOSIA = Array.from({ length: 37 }, (_, k) => `M${40 + k * 20} 20L${50 + k * 20} 8L${60 + k * 20} 20`).join("");
const RAYADO_PISO = Array.from({ length: 41 }, (_, k) => `M${48 + k * 18} 236l-8 8`).join("");
const CABILLAS = [86, 92, 428, 434];
const rayasCabilla = (x: number) => Array.from({ length: 21 }, (_, k) => `M${x - 2.5} ${74 + k * 8 + 3}l5 -3`).join("");

function BloqueSvg({ x, y, w, className, ...data }: { x: number; y: number; w: number; className: string } & Record<`data-${string}`, string | number>) {
  return (
    <g className={className} {...data}>
      <rect className={styles.f} x={x} y={y} width={w} height={20} rx={1.5} />
      {w === 40 ? (
        <>
          <rect className={styles.h} x={x + 5} y={y + 4} width={12} height={12} rx={2} />
          <rect className={styles.h} x={x + 23} y={y + 4} width={12} height={12} rx={2} />
        </>
      ) : (
        <rect className={styles.h} x={x + 4} y={y + 4} width={12} height={12} rx={2} />
      )}
    </g>
  );
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const NS = "http://www.w3.org/2000/svg";

function crearMotor(raiz: HTMLElement): Motor {
  const q = <T extends Element>(sel: string) => raiz.querySelector<T>(sel)!;
  const trolley = q<SVGGElement>('[data-p="trolley"]'),
    hook = q<SVGGElement>('[data-p="hook"]'),
    cable = q<SVGLineElement>('[data-p="cable"]'),
    carry = q<SVGGElement>('[data-p="carry"]'),
    dust = q<SVGGElement>('[data-p="dust"]'),
    count = q<SVGTextElement>('[data-p="count"]');
  const slots = Array.from(raiz.querySelectorAll<SVGGElement>("[data-slot]"))
    .map((g) => ({ g, i: Number(g.dataset.slot), x: Number(g.dataset.x) + 20, y: Number(g.dataset.y), r: Number(g.dataset.r) }))
    .sort((a, b) => a.i - b.i);
  const medias = Array.from(raiz.querySelectorAll<SVGGElement>("[data-media]"));
  const palTop = Array.from(raiz.querySelectorAll<SVGGElement>("[data-pal]"))
    .map((g) => ({ g, c: Number(g.dataset.pal), x: 610 + 40 * Number(g.dataset.pal), y: 146 }))
    .sort((a, b) => a.c - b.c);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let tx = TX0,
    hy = HY0,
    ang = 0;
  let active = false,
    running = false,
    destruido = false,
    placed = 0,
    picked = 0;
  const rafs = new Set<number>();
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  function draw() {
    trolley.setAttribute("transform", `translate(${tx} 0)`);
    hook.setAttribute("transform", `rotate(${ang} 0 29) translate(0 ${hy})`);
    cable.setAttribute("y2", String(hy));
  }
  const tween = (d: number, f: (p: number, t: number) => void) =>
    new Promise<void>((r) => {
      const s = performance.now();
      const k = (n: number) => {
        if (destruido) return r();
        const t = Math.min(1, (n - s) / d);
        f(ease(t), t);
        if (t < 1) {
          const id = requestAnimationFrame((m) => {
            rafs.delete(id);
            k(m);
          });
          rafs.add(id);
        } else r();
      };
      k(s);
    });
  const moveX = (to: number, d: number) => {
    const f = tx;
    return tween(d, (p, t) => {
      tx = f + (to - f) * p;
      ang = (-(to - f) / Math.abs(to - f || 1)) * 5 * Math.sin(Math.PI * t);
      draw();
    });
  };
  const moveY = (to: number, d: number) => {
    const f = hy;
    return tween(d, (p) => {
      hy = f + (to - f) * p;
      draw();
    });
  };

  function puff(x: number, y: number) {
    if (reduce) return;
    for (let i = 0; i < 9; i++) {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", String(x + (Math.random() * 40 - 20)));
      c.setAttribute("cy", String(y));
      c.setAttribute("r", String(1.5 + Math.random() * 2));
      dust.appendChild(c);
      const dx = (Math.random() - 0.5) * 50,
        dy = -6 - Math.random() * 14;
      c.animate(
        [
          { transform: "translate(0,0)", opacity: 0.9 },
          { transform: `translate(${dx}px,${dy}px)`, opacity: 0 },
        ],
        { duration: 700 + Math.random() * 400, easing: "ease-out" },
      ).onfinish = () => c.remove();
    }
  }

  const setCount = () => (count.textContent = `${23 + placed} / 53`);

  /** Coloca el bloque del slot: el muro lo muestra en concreto (y las medias piezas de su hilada). */
  function colocar(dst: (typeof slots)[number], destello: boolean) {
    medias.filter((m) => Number(m.dataset.media) === dst.r).forEach((m) => m.classList.remove(styles.plan));
    dst.g.classList.remove(styles.plan);
    if (destello) {
      dst.g.classList.add(styles.nuevo);
      later(() => dst.g.classList.remove(styles.nuevo), 500);
    }
  }

  /** Vuelve el muro al plano y la paleta llena (en el prototipo, buildWall + buildPallet). */
  function reiniciar() {
    placed = 0;
    picked = 0;
    slots.forEach((s) => s.g.classList.add(styles.plan));
    medias.forEach((m) => m.classList.add(styles.plan));
    palTop.forEach((b) => (b.g.style.visibility = ""));
    setCount();
  }

  async function loop() {
    if (running) return;
    running = true;
    while (active && placed < slots.length && !destruido) {
      const src = palTop[picked % 4],
        dst = slots[placed];
      await moveX(src.x, 600);
      if (!active) break;
      await moveY(src.y - 26, 400);
      src.g.style.visibility = "hidden";
      carry.style.display = "";
      picked++;
      if (palTop.every((b) => b.g.style.visibility === "hidden")) later(() => palTop.forEach((b) => (b.g.style.visibility = "")), 900);
      await moveY(SAFE, 450);
      await moveX(dst.x, 850);
      await moveY(dst.y - 26, 450);
      carry.style.display = "none";
      colocar(dst, true);
      puff(dst.x, dst.y + 20);
      placed++;
      setCount();
      await moveY(SAFE, 350);
    }
    if (destruido) return;
    // reposo: la grúa vuelve y el muro regresa al plano
    carry.style.display = "none";
    await Promise.all([moveX(TX0, 700), moveY(HY0, 700)]);
    if (!active && !destruido) reiniciar();
    running = false;
    if (active && placed < slots.length) void loop();
  }

  return {
    encender() {
      active = true;
      if (reduce) {
        slots.forEach((s) => colocar(s, false));
        placed = slots.length;
        setCount();
        return;
      }
      void loop();
    },
    apagar() {
      active = false;
      if (reduce) reiniciar();
    },
    destruir() {
      destruido = true;
      rafs.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
      dust.replaceChildren();
    },
  };
}

export default function BannerConstruccion({ nombre, texto, kicker }: PropsBannerPropio) {
  return (
    <BannerPlano
      nombre={nombre}
      kicker={kicker}
      texto={texto}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial="#F2A900"
      crearMotor={crearMotor}
      decoracion="cinta"
      variables={
        {
          "--brillo": "radial-gradient(55% 120% at 70% 60%, color-mix(in srgb, var(--c) 32%, transparent), transparent 70%)",
          "--brillo-on": "0.6",
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
        {/* pluma de la grúa (celosía) */}
        <g>
          <path className={styles.ln} d="M40 8H780M40 20H780" style={{ strokeWidth: 1.5 }} />
          <path className={styles.cota} d={CELOSIA} />
          <text x="44" y="5" style={{ fontSize: 7 }}>
            PLUMA · 12 m
          </text>
        </g>

        {/* cotas del muro */}
        <g className={styles.bp}>
          <path className={styles.cota} d="M66 96V236M61 96h10M61 236h10" />
          <text transform="translate(58 182) rotate(-90)">1.40 m</text>
          <path className={styles.cota} d="M100 254H420M100 249v10M420 249v10" />
          <path d="M104 254l-5 -3v6z" fill="#e3262f" />
          <text x="242" y="251">
            3.20 m
          </text>
        </g>
        <text x="100" y="88">
          MURO B · BLOQUE 15×20×40
        </text>
        <text data-p="count" x="420" y="88" textAnchor="end">
          23 / 53
        </text>

        {/* cabillas de las columnas */}
        <g>
          {CABILLAS.map((x) => (
            <g key={x}>
              <line x1={x} y1={236} x2={x} y2={70} className={styles.ln} style={{ strokeWidth: 1.5 }} />
              <path d={rayasCabilla(x)} className={styles.cota} />
            </g>
          ))}
          <rect x="80" y="96" width="20" height="140" className={styles.dash} />
          <rect x="420" y="96" width="20" height="140" className={styles.dash} />
        </g>

        {/* muro: bloques */}
        <g>
          {MURO.map((b) => {
            const plan = b.r >= BASE_ROWS;
            const cls = `${styles.blq} ${plan ? styles.plan : ""}`;
            if (b.media) return <BloqueSvg key={`m${b.r}-${b.x}`} x={b.x} y={b.y} w={b.w} className={cls} data-media={b.r} />;
            if (b.slot !== undefined)
              return (
                <BloqueSvg key={`s${b.slot}`} x={b.x} y={b.y} w={b.w} className={cls} data-slot={b.slot} data-x={b.x} data-y={b.y} data-r={b.r} />
              );
            return <BloqueSvg key={`b${b.r}-${b.x}`} x={b.x} y={b.y} w={b.w} className={cls} />;
          })}
        </g>

        {/* piso */}
        <path className={styles.cota} d="M40 236H780" />
        <path className={styles.cota} d={RAYADO_PISO} />

        {/* saco de cemento */}
        <g transform="translate(510 0)">
          <path className={`${styles.ln} ${styles.saco}`} d="M6 236L2 196Q2 186 12 186H52Q62 186 62 196L58 236Z" />
          <path className={styles.dash} d="M8 192H56" />
          <text className={styles.sacoT} x="10" y="212" style={{ fontSize: 8 }}>
            CEMENTO
          </text>
          <text className={styles.sacoT} x="14" y="224" style={{ fontSize: 8 }}>
            42.5 kg
          </text>
        </g>

        {/* paleta de bloques */}
        <g>
          {PALETA.map(({ r, c }) => (
            <BloqueSvg
              key={`p${r}-${c}`}
              x={590 + 40 * c}
              y={226 - 20 * (r + 1)}
              w={40}
              className={styles.blq}
              {...(r === 3 ? { "data-pal": c } : {})}
            />
          ))}
        </g>
        <g>
          <path className={styles.ln} d="M586 226H754M586 236H754" style={{ stroke: "#c9a878" }} />
          <path className={styles.ln} d="M594 226v10M670 226v10M746 226v10" style={{ stroke: "#c9a878" }} />
          <path className={styles.pz} d="M598 146V226M742 146V226" stroke="#e3262f" strokeWidth="2.5" />
        </g>
        <text className={styles.bp} x="604" y="254" style={{ fontSize: 8 }}>
          PALETA · 90 u
        </text>

        {/* trolley + gancho + bloque cargado */}
        <g data-p="trolley" transform={`translate(${TX0} 0)`}>
          <rect x="-13" y="20" width="26" height="9" rx="2" className={styles.carro} />
          <circle cx="-6" cy="20" r="2.5" className={styles.rueda} />
          <circle cx="6" cy="20" r="2.5" className={styles.rueda} />
          <line data-p="cable" x1="0" y1="29" x2="0" y2={HY0} className={styles.cable} />
          <g data-p="hook" transform={`rotate(0 0 29) translate(0 ${HY0})`}>
            <rect x="-6" y="0" width="12" height="7" rx="1.5" className={styles.gancho} />
            <path d="M0 7v5a4 4 0 1 1-4 4" fill="none" stroke="#e3262f" strokeWidth="2.5" strokeLinecap="round" />
            <g data-p="carry" style={{ display: "none" }}>
              <path d="M0 14L-18 26M0 14L18 26" className={styles.eslinga} />
              <BloqueSvg x={-20} y={26} w={40} className={styles.blq} />
            </g>
          </g>
        </g>

        {/* polvo */}
        <g data-p="dust" className={styles.polvo} />
      </svg>
    </BannerPlano>
  );
}
