"use client";

import { useId, type CSSProperties } from "react";
import BannerPlano, { type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerTornilleria.module.css";

/**
 * Banner de la categoría Tornillería, estilo "plano técnico". Portado del prototipo banner-tornilleria-v2.html (pedido de
 * persona B: "aplícalo y embellécelo"): una tabla de pino sobre la mesa con 5 tornillos (3 ya a ras, uno a medias y uno
 * parado), un taladro rojo de 20 V sostenido con guante y, a la derecha, tornillos sueltos con su cota.
 * Activo: el taladro aprieta el 4.º tornillo, se levanta, pasa al 5.º y lo aprieta (aserrín, el mandril gira, el
 * contador sube a 5 / 5 y se ilumina); al salir todo vuelve (450 ms).
 * Además del prototipo: sombra del taladro en la tabla, luz del taladro que se prende al girar, vibración leve, onda
 * cuando un tornillo queda a ras y las cabezas Phillips bajo la etiqueta (decoración `cabezas`).
 * Solo el nombre en la etiqueta, como toda la familia (sin "Todo para fijar en", kicker ni subtítulo del prototipo).
 * Clases globales en la raíz: `on` (BannerPlano), `gira` (el taladro está girando) y `listo` (5 / 5).
 */

const LEN = 50, // tornillo: cabeza en y=0, punta en y=LEN
  SURF = 178; // la cara de arriba de la tabla
const XS = [230, 290, 350, 420, 490],
  D0 = [1, 1, 1, 0.45, 0]; // cuánto entró cada tornillo (1 = a ras)
const X0 = XS[3]; // el taladro empieza sobre el 4.º

const cabeza = (depth: number) => SURF - LEN + depth * LEN - 1;
const f2 = (n: number) => n.toFixed(2);

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = (t: number) => 1 - Math.pow(1 - t, 3);
const lin = (t: number) => t;

function crearMotor(raiz: HTMLElement): Motor {
  const q = <T extends Element>(p: string) => raiz.querySelector<T>(`[data-p="${p}"]`)!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const taladro = q<SVGGElement>("taladro"),
    sombra = q<SVGEllipseElement>("sombra"),
    mandril = q<SVGGElement>("mandril"),
    cont = q<SVGTextElement>("cont"),
    aserrin = q<SVGGElement>("aserrin"),
    onda = q<SVGEllipseElement>("onda");
  const tornillos = XS.map((x, i) => ({
    x,
    g: q<SVGGElement>(`t${i}`),
    cruz: q<SVGGElement>(`cruz${i}`),
    depth: D0[i],
    rot: 0,
  }));
  type T = (typeof tornillos)[number];

  const dibujarTornillo = (s: T) => {
    s.g.setAttribute("transform", `translate(${s.x} ${f2(cabeza(s.depth))})`);
    // La cruz Phillips se angosta y ensancha: así se ve girar la cabeza.
    s.cruz.setAttribute("transform", `scale(${f2(Math.abs(Math.cos(s.rot)) * 0.8 + 0.2)} 1)`);
  };

  let dx = X0,
    dy = cabeza(D0[3]),
    lift = 0,
    ml = 0,
    hechos = 3;
  const dibujarTaladro = () => {
    taladro.setAttribute("transform", `translate(${f2(dx)} ${f2(dy - lift)})`);
    // La sombra en la tabla sigue al taladro y se achica y aclara cuando se levanta.
    const l = Math.min(1, lift / 30);
    sombra.setAttribute("cx", f2(dx + 6));
    sombra.setAttribute("rx", f2(24 - 8 * l));
    sombra.setAttribute("opacity", f2(0.5 - 0.28 * l)); // atributo: en reposo el CSS del plano la oculta
  };
  const girarMandril = () => {
    ml = (ml + 2.2) % 7;
    mandril.setAttribute("transform", `translate(${f2(ml - 3.5)} 0)`);
  };
  const contar = () => {
    cont.textContent = `TORNILLOS ${hechos} / 5`;
    raiz.classList.toggle("listo", hechos === 5);
  };

  function soltarAserrin(x: number) {
    if (reduce) return;
    for (let i = 0; i < 3; i++) {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", String(x));
      c.setAttribute("cy", String(SURF));
      c.setAttribute("r", f2(1 + Math.random() * 1.4));
      aserrin.appendChild(c);
      const vx = (Math.random() - 0.5) * 40,
        vy = -4 - Math.random() * 9;
      c.animate(
        [
          { transform: "translate(0,0)", opacity: 1 },
          { transform: `translate(${f2(vx)}px,${f2(vy + 10)}px)`, opacity: 0 },
        ],
        { duration: 480, easing: "ease-out" },
      ).onfinish = () => c.remove();
    }
  }
  function ondaEn(x: number) {
    if (reduce) return;
    onda.setAttribute("cx", String(x));
    onda.animate(
      [
        { opacity: 0.9, transform: "scale(0.4)" },
        { opacity: 0, transform: "scale(1.9)" },
      ],
      { duration: 700, easing: "cubic-bezier(.16,1,.3,1)" },
    );
  }

  // ---------- tiempo: cada encender/apagar sube `gen` y corta lo anterior ----------
  let gen = 0,
    destruido = false;
  const rafs = new Set<number>();
  const timers = new Set<number>();
  const tween = (d: number, f: (p: number) => void, e: (t: number) => number = ease) => {
    const g = gen;
    const dur = reduce ? 10 : d;
    return new Promise<boolean>((r) => {
      const s = performance.now();
      const k = (n: number) => {
        if (g !== gen || destruido) return r(false);
        const t = Math.min(1, (n - s) / dur);
        f(e(t));
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
  const esperar = (ms: number) => {
    const g = gen;
    return new Promise<boolean>((r) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        r(g === gen && !destruido);
      }, reduce ? 10 : ms);
      timers.add(id);
    });
  };

  async function atornillar(i: number) {
    const s = tornillos[i];
    raiz.classList.add("gira");
    const d0 = s.depth;
    const ok = await tween(
      900 * (1 - d0) + 150,
      (p) => {
        s.depth = d0 + (1 - d0) * p;
        s.rot += 0.5;
        girarMandril();
        dy = cabeza(s.depth);
        dibujarTornillo(s);
        dibujarTaladro();
        if (Math.random() < 0.5) soltarAserrin(s.x);
      },
      lin,
    );
    raiz.classList.remove("gira");
    if (!ok) return false;
    hechos = Math.max(hechos, i + 1);
    contar();
    ondaEn(s.x);
    return true;
  }
  async function moverA(i: number) {
    const s = tornillos[i];
    if (!(await tween(220, (p) => ((lift = 30 * p), dibujarTaladro()), out))) return false;
    const x0 = dx,
      y0 = dy;
    if (
      !(await tween(380, (p) => {
        dx = x0 + (s.x - x0) * p;
        dy = y0 + (cabeza(s.depth) - y0) * p;
        dibujarTaladro();
      }))
    )
      return false;
    return tween(200, (p) => ((lift = 30 * (1 - p)), dibujarTaladro()), out);
  }

  async function activar() {
    ++gen;
    if (!(await atornillar(3))) return;
    if (!(await esperar(120))) return;
    if (!(await moverA(4))) return;
    if (!(await atornillar(4))) return;
    await tween(260, (p) => ((lift = 24 * p), dibujarTaladro()), out);
  }
  async function reposo() {
    ++gen;
    raiz.classList.remove("gira", "listo");
    const st = tornillos.map((s) => s.depth),
      x0 = dx,
      y0 = dy,
      l0 = lift;
    const ok = await tween(450, (p) => {
      tornillos.forEach((s, i) => {
        s.depth = st[i] + (D0[i] - st[i]) * p;
        dibujarTornillo(s);
      });
      dx = x0 + (X0 - x0) * p;
      lift = l0 * (1 - p);
      dy = y0 + (cabeza(D0[3]) - y0) * p;
      dibujarTaladro();
    });
    if (ok) {
      hechos = 3;
      contar();
    }
  }

  return {
    encender: () => void activar(),
    apagar: () => void reposo(),
    destruir() {
      destruido = true;
      gen++;
      rafs.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
      raiz.classList.remove("gira", "listo");
    },
  };
}

/** Tornillo de madera: cabeza en y=0 (con la cruz Phillips `data-p=cruz{n}` que se angosta al girar), punta en y=LEN. */
function Tornillo({ zinc, cruz }: { zinc: string; cruz?: string }) {
  const s = styles;
  let rosca = "";
  for (let y = 10; y < LEN - 6; y += 5) rosca += `M-5 ${y + 2}L5 ${y - 1.5}`;
  return (
    <>
      <path d={`M-3.5 4H3.5V${LEN - 10}L0 ${LEN}L-3.5 ${LEN - 10}Z`} fill={`url(#${zinc})`} className={s.olFino} />
      <path d={rosca} className={s.rosca} />
      <ellipse cx="0" cy="1" rx="9" ry="3.4" fill={`url(#${zinc})`} className={s.olFino} />
      <ellipse cx="-3" cy="0" rx="3" ry="1" className={s.brilloCabeza} />
      <g data-p={cruz}>
        <path d="M-4.5 1H4.5M0 -0.6V2.6" className={s.cruz} />
      </g>
    </>
  );
}

export default function BannerTornilleria({ nombre }: PropsBannerPropio) {
  const p = `tn${useId().replace(/:/g, "")}`;
  const zinc = `${p}zinc`,
    rojo = `${p}rojo`,
    frente = `${p}frente`,
    sombraG = `${p}sombra`,
    clipMandril = `${p}mandril`,
    manga = `${p}manga`;
  const s = styles;
  return (
    <BannerPlano
      nombre={nombre}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial="#c4cdd8"
      crearMotor={crearMotor}
      plano
      decoracion="cabezas"
      variables={
        {
          "--brillo": "radial-gradient(48% 110% at 60% 74%, rgba(221,176,122,.2), rgba(196,205,216,.06) 50%, transparent 72%)",
          "--brillo-on": "1",
          "--etiqueta-pad": "2px 26px 0",
          "--etiqueta-sombra": "0 10px 24px -10px rgba(227, 38, 47, 0.6)",
        } as CSSProperties
      }
    >
      <svg viewBox="150 0 630 250" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false" className={s.svg}>
        <defs>
          <linearGradient id={zinc} x1="0" x2="1">
            <stop offset="0" stopColor="#9aa7b7" />
            <stop offset=".45" stopColor="#eef2f6" />
            <stop offset="1" stopColor="#8592a3" />
          </linearGradient>
          <linearGradient id={rojo} x1="0" x2="1">
            <stop offset="0" stopColor="#b81c24" />
            <stop offset=".4" stopColor="#ef3a42" />
            <stop offset="1" stopColor="#a8171f" />
          </linearGradient>
          <linearGradient id={frente} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c48d57" />
            <stop offset="1" stopColor="#a26e3e" />
          </linearGradient>
          <radialGradient id={sombraG}>
            <stop offset="0" stopColor="#000" stopOpacity=".5" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={manga} gradientUnits="userSpaceOnUse" x1="100" y1="-130" x2="240" y2="-290">
            <stop offset="0" stopColor="#24364f" />
            <stop offset=".55" stopColor="#24364f" stopOpacity=".85" />
            <stop offset="1" stopColor="#24364f" stopOpacity="0" />
          </linearGradient>
          <clipPath id={clipMandril}>
            <path d="M-14 -58H18L14 -26H-10Z" />
          </clipPath>
          {XS.map((x, i) => (
            <clipPath key={i} id={`${p}c${i}`}>
              <rect x={x - 20} y="0" width="40" height={SURF + 1} />
            </clipPath>
          ))}
        </defs>

        <text data-p="cont" className={s.cont} x="760" y="22" textAnchor="end">
          TORNILLOS 3 / 5
        </text>

        {/* mesa */}
        <path d="M150 214H780" className={s.mesa} />
        <path className={s.cota} d="M150 220H780" />

        {/* ===== tabla de pino ===== */}
        <ellipse cx="370" cy="216" rx="232" ry="8" fill={`url(#${sombraG})`} />
        <path d="M170 186L200 170H570L540 186Z" className={`${s.ol} ${s.maderaArriba}`} />
        <path d="M170 186H540V212H170Z" fill={`url(#${frente})`} className={s.ol} />
        <path d="M540 186L570 170V196L540 212Z" className={`${s.ol} ${s.maderaOscura}`} />
        {/* vetas, anillos en el canto, nudo y el filo con luz */}
        <path className={s.veta} d="M210 176Q300 172 380 176T560 174M196 181Q290 184 360 180T548 182" />
        <path className={s.vetaFrente} d="M180 196Q260 192 330 198T530 194M180 204Q290 208 400 202T532 206" />
        <path className={s.vetaFrente} d="M546 186Q556 190 552 200M552 182Q564 188 560 198" />
        <ellipse cx="300" cy="200" rx="7" ry="3" className={s.vetaFrente} />
        <path d="M172 186.6H539" className={s.filo} />
        <g className={s.bp}>
          <path className={s.cota} d="M170 236H540M170 231v10M540 231v10" />
          <path d="M174 236l-5 -3v6z" className={s.flecha} />
          <text x="330" y="232">
            40 cm
          </text>
          <text x="176" y="164" style={{ fontSize: 7 }}>
            TABLA PINO 1×8
          </text>
        </g>

        {/* sombra del taladro sobre la tabla (la mueve el motor) */}
        <ellipse data-p="sombra" cx={X0 + 6} cy={SURF + 1} rx="24" ry="4" fill={`url(#${sombraG})`} opacity=".5" />

        {/* ===== tornillos en la tabla (lo que entró queda oculto bajo la cara de arriba) ===== */}
        {XS.map((x, i) => (
          <g key={i} clipPath={`url(#${p}c${i})`}>
            <g data-p={`t${i}`} transform={`translate(${x} ${f2(cabeza(D0[i]))})`}>
              <Tornillo zinc={zinc} cruz={`cruz${i}`} />
            </g>
          </g>
        ))}
        <ellipse data-p="onda" className={s.onda} cx={XS[3]} cy={SURF} rx="14" ry="4" />
        <g data-p="aserrin" className={s.aserrin} />

        {/* ===== tornillos sueltos en la mesa ===== */}
        <g transform="translate(596 211) rotate(-84)">
          <Tornillo zinc={zinc} />
        </g>
        <g transform="translate(646 212) rotate(-92)">
          <Tornillo zinc={zinc} />
        </g>
        <g transform="translate(700 210) rotate(-104)">
          <Tornillo zinc={zinc} />
        </g>
        <g className={s.bp}>
          <path className={s.cota} d="M592 226H750" style={{ strokeDasharray: "2 3" }} />
          <text x="596" y="238">
            #8 × 1½&quot; · PUNTA BROCA
          </text>
        </g>

        {/* ===== taladro + guante (la punta, en 0,0, va sobre la cabeza del tornillo) ===== */}
        <g data-p="taladro" transform={`translate(${X0} ${f2(cabeza(D0[3]))})`}>
          <g className={s.vibra}>
            <g transform="scale(.78)">
              {/* brazo */}
              {/* la manga se desvanece hacia arriba: en ningún tamaño se ve dónde termina */}
              <path d="M60 -150L210 -300H330L150 -112Z" fill={`url(#${manga})`} />
              <path d="M60 -150L150 -112" className={s.ol} />
              <path d="M70 -158L120 -112" className={s.puno} />
              {/* batería + mango */}
              <rect x="28" y="-132" width="88" height="34" rx="9" className={`${s.ol} ${s.negro}`} />
              <rect x="108" y="-152" width="40" height="70" rx="6" className={`${s.ol} ${s.negro}`} />
              <rect x="108" y="-124" width="40" height="7" className={s.rojoPlano} />
              <circle cx="128" cy="-104" r="3.2" className={s.led} />
              <rect x="34" y="-98" width="12" height="13" rx="3" className={`${s.ol} ${s.rojoPlano}`} />
              {/* cuerpo del motor */}
              <rect x="-26" y="-178" width="56" height="112" rx="20" fill={`url(#${rojo})`} className={s.ol} />
              <path d="M-18 -168Q-21 -122 -18 -78" className={s.reflejo} />
              <path d="M-12 -164V-136M-2 -164V-136M8 -164V-136" className={s.rejilla} />
              <rect x="-20" y="-186" width="44" height="18" rx="7" className={`${s.ol} ${s.negro}`} />
              <text x="-14" y="-108" className={s.voltaje}>
                20V
              </text>
              {/* collar y mandril */}
              <rect x="-22" y="-70" width="48" height="12" rx="3" className={`${s.ol} ${s.negro}`} />
              <path d="M-14 -58H18L14 -26H-10Z" fill={`url(#${zinc})`} className={s.ol} />
              <g clipPath={`url(#${clipMandril})`}>
                <g data-p="mandril">
                  <path d="M-15 -54V-30M-8 -54V-30M-1 -54V-30M6 -54V-30M13 -54V-30M20 -54V-30" className={s.estrias} />
                </g>
              </g>
              {/* punta */}
              <rect x="-1" y="-26" width="6" height="26" fill={`url(#${zinc})`} className={s.olFino} />
              {/* guante */}
              <path d="M44 -142Q42 -152 56 -152H102Q114 -152 112 -140L110 -96Q108 -84 96 -84H58Q46 -84 46 -96Z" className={`${s.ol} ${s.guante}`} />
              <path d="M58 -98Q58 -88 66 -88M74 -98Q74 -88 82 -88M90 -98Q90 -88 98 -88" className={s.costura} />
              <path d="M46 -130Q30 -138 34 -150Q40 -160 58 -152" className={`${s.ol} ${s.guante}`} />
              <path d="M100 -152Q118 -176 132 -170L122 -140Z" className={`${s.ol} ${s.guanteOsc}`} />
              {/* arcos de velocidad mientras gira */}
              <g className={s.vel}>
                <path d="M-28 -36A26 10 0 0 0 30 -36" />
                <path d="M-22 -48A20 8 0 0 0 24 -48" style={{ opacity: 0.6 }} />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </BannerPlano>
  );
}
