"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import BannerPlano, { type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerSeguridad.module.css";

/**
 * Banner de la categoría Seguridad industrial, estilo "plano técnico". Portado del prototipo banner-seguridad-v4.html
 * (pedido de persona B, en lugar del v5): ficha técnica del equipo de protección con 5 piezas en plano (casco, lentes,
 * mascarilla N95, guante de carnaza y bota punta de acero), cada una en su círculo punteado con su cota.
 * Activo (mouse encima; en el teléfono, al entrar a la categoría): una línea de inspección verde barre la lámina y, al
 * pasar por cada pieza, la colorea, la eleva con halo y sombra y le pone su check (clase global `ok` en la pieza y en su
 * casilla bajo la etiqueta); el contador sube INSPECCIÓN 1…5 / 5. Al terminar: APTO PARA OBRA, sello "EQUIPO COMPLETO"
 * y las piezas flotan (clase global `apto`). Al salir todo vuelve al plano.
 * Diferencias con el prototipo: solo el nombre en la etiqueta (sin kicker, "Equipos de" ni subtítulo, como toda la
 * familia), los ✓ dibujados (no dependen de la fuente), en reposo los círculos punteados giran despacio y la luz verde
 * (`fondo`) cubre todo el banner.
 */

const XS = [132, 268, 403, 537, 672];
const X0 = 64,
  X1 = 740;

function crearMotor(raiz: HTMLElement): Motor {
  const q = <T extends Element>(p: string) => raiz.querySelector<T>(`[data-p="${p}"]`)!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const banda = q<SVGRectElement>("banda"),
    linea = q<SVGPathElement>("linea"),
    estado = q<SVGTextElement>("estado");
  const piezas = XS.map((_, i) => q<SVGGElement>(`pieza${i}`));
  const casillas = [...raiz.querySelectorAll<HTMLElement>("[data-casilla]")];

  const ponerScan = (x: number) => {
    banda.setAttribute("x", (x - 60).toFixed(1));
    linea.setAttribute("d", `M${x.toFixed(1)} 44V210`);
  };
  let textoEstado = "";
  const ponerEstado = (t: string) => {
    if (t !== textoEstado) estado.textContent = textoEstado = t;
  };

  let gen = 0,
    destruido = false;
  const rafs = new Set<number>();
  const tween = (d: number, f: (t: number) => void) => {
    const g = gen;
    const dur = reduce ? 10 : d;
    return new Promise<boolean>((r) => {
      const s = performance.now();
      const k = (n: number) => {
        if (g !== gen || destruido) return r(false);
        const t = Math.min(1, (n - s) / dur);
        f(t);
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

  async function activar() {
    ++gen;
    raiz.classList.add("scan");
    let n = 0;
    const ok = await tween(1800, (p) => {
      const x = X0 + (X1 - X0) * p;
      ponerScan(x);
      while (n < XS.length && x >= XS[n]) {
        piezas[n].classList.add("ok");
        casillas[n]?.classList.add("ok");
        n++;
        ponerEstado(`INSPECCIÓN ${n} / 5`);
      }
    });
    if (!ok) return;
    raiz.classList.remove("scan");
    raiz.classList.add("apto");
    ponerEstado("APTO PARA OBRA");
  }
  function reposo() {
    gen++;
    raiz.classList.remove("scan", "apto");
    piezas.forEach((p) => p.classList.remove("ok"));
    casillas.forEach((c) => c.classList.remove("ok"));
    ponerEstado("INSPECCIÓN 0 / 5");
    ponerScan(X0);
  }

  return {
    encender: () => void activar(),
    apagar: reposo,
    destruir() {
      destruido = true;
      reposo();
      rafs.forEach((id) => cancelAnimationFrame(id));
    },
  };
}

/** Check verde de cada pieza (sale con `ok`). */
function Check({ s }: { s: typeof styles }) {
  return (
    <g transform="translate(40 -40)">
      <g className={s.chk}>
        <circle r="9" fill="#2fd27a" />
        <path d="M-4 0L-1 3L4 -3" className={s.visto} />
      </g>
    </g>
  );
}

/** Cada pieza del EPP: su círculo, halo, sombra, el dibujo (que se eleva al revisarse), su check y su rótulo. */
function PiezaEpp({ i, etiqueta, halo, som, children }: { i: number; etiqueta: string; halo: string; som: string; children: ReactNode }) {
  const s = styles;
  return (
    <g data-p={`pieza${i}`} className={s.item} transform={`translate(${XS[i]} 132)`}>
      <circle className={`${s.anillo} ${s.dash}`} r="56" />
      <circle className={s.halo} r="54" fill={halo} />
      <ellipse className={s.som} cx="0" cy="50" rx="34" ry="4" fill={som} />
      <g className={s.pieza} style={{ animationDelay: `${-0.5 * i}s` }}>
        {children}
      </g>
      <Check s={s} />
      <text x="0" y="74" textAnchor="middle">
        {etiqueta}
      </text>
    </g>
  );
}

export default function BannerSeguridad({ nombre }: PropsBannerPropio) {
  const p = `sg${useId().replace(/:/g, "")}`;
  const g = (n: string) => `${p}${n}`;
  const u = (n: string) => `url(#${p}${n})`;
  const s = styles;
  // Los degradados de cada material, para el CSS (los ids cambian por instancia).
  const materiales = {
    "--g-casco": u("casco"),
    "--g-mica": u("mica"),
    "--g-n95": u("n95"),
    "--g-carnaza": u("carnaza"),
    "--g-bota": u("bota"),
    "--g-acero": u("acero"),
  } as CSSProperties;
  const F = (m: string) => `${s.f} ${s[m]} ${s.ln}`;

  return (
    <BannerPlano
      nombre={nombre}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial="#2fd27a"
      crearMotor={crearMotor}
      decoracion="casillas"
      variables={
        {
          "--brillo-on": "0", // la luz va en `fondo`
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
      fondo={<div className={s.luz} aria-hidden />}
    >
      <svg viewBox="40 14 724 246" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false" className={s.svg} style={materiales}>
        <defs>
          <linearGradient id={g("casco")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe46a" />
            <stop offset="1" stopColor="#d9a400" />
          </linearGradient>
          <linearGradient id={g("mica")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#b9e4ff" stopOpacity=".85" />
            <stop offset="1" stopColor="#3f8fd0" stopOpacity=".7" />
          </linearGradient>
          <linearGradient id={g("n95")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#cfd7e0" />
          </linearGradient>
          <linearGradient id={g("carnaza")} x1="0" x2="1">
            <stop offset="0" stopColor="#b98444" />
            <stop offset=".5" stopColor="#ddb072" />
            <stop offset="1" stopColor="#b07a3c" />
          </linearGradient>
          <linearGradient id={g("bota")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a5636" />
            <stop offset="1" stopColor="#4a321d" />
          </linearGradient>
          <linearGradient id={g("acero")} x1="0" x2="1">
            <stop offset="0" stopColor="#8592a3" />
            <stop offset=".45" stopColor="#eef2f6" />
            <stop offset="1" stopColor="#8592a3" />
          </linearGradient>
          <radialGradient id={g("halo")}>
            <stop offset="0" stopColor="#2fd27a" stopOpacity=".22" />
            <stop offset="1" stopColor="#2fd27a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={g("som")}>
            <stop offset="0" stopColor="#000" stopOpacity=".4" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={g("scan")} x1="0" x2="1">
            <stop offset="0" stopColor="#2fd27a" stopOpacity="0" />
            <stop offset=".85" stopColor="#2fd27a" stopOpacity=".22" />
            <stop offset="1" stopColor="#2fd27a" stopOpacity="0" />
          </linearGradient>
        </defs>

        <text x={X0} y="30">
          FICHA TÉCNICA · EQUIPO DE PROTECCIÓN PERSONAL
        </text>
        <text data-p="estado" className={s.estado} x={X1} y="30" textAnchor="end">
          INSPECCIÓN 0 / 5
        </text>
        <path className={s.cota} d={`M${X0} 38H${X1}`} />
        {/* base de la lámina */}
        <path className={s.cota} d={`M${X0} 214H${X1}`} />
        <path className={s.cota} d="M64 210v8M200 210v8M336 210v8M470 210v8M604 210v8M740 210v8" />

        <PiezaEpp halo={u("halo")} som={u("som")} i={0} etiqueta="01 CASCO · ANSI Z89.1">
          <path className={s.cota} d="M-46 -62H38M-46 -66v8M38 -66v8" />
          <path d="M-42 -62l-5 -3v6z" fill="#e3262f" />
          <text x="-14" y="-66">
            Ø 30 cm
          </text>
          <path className={F("fCasco")} d="M-38 14A38 36 0 0 1 38 14Z" />
          <path className={F("fCasco")} d="M-42 14H52Q58 14 56 20H-42Z" />
          <path className={s.cota} d="M0 -22V14M-20 -14Q-24 0 -24 14M20 -14Q24 0 24 14" />
          <path d="M-30 20Q-26 44 0 46Q20 44 26 20" fill="none" stroke="rgba(190,215,245,.55)" strokeWidth="1.5" />
        </PiezaEpp>

        <PiezaEpp halo={u("halo")} som={u("som")} i={1} etiqueta="02 LENTES · Z87+">
          <path className={F("fNegro")} d="M-44 -6H44" style={{ strokeWidth: 3 }} />
          <path className={F("fMica")} d="M-40 -8H-4V6Q-4 18 -16 18H-30Q-40 18 -40 8Z" />
          <path className={F("fMica")} d="M40 -8H4V6Q4 18 16 18H30Q40 18 40 8Z" />
          <path className={s.ln} d="M-4 -2Q0 -6 4 -2" fill="none" />
          <path className={s.ln} d="M-44 -6L-52 2M44 -6L52 2" fill="none" />
          <path className={s.reflejo} d="M-32 -2L-22 -2M14 -2L24 -2" />
          <path className={s.cota} d="M-40 34H40M-40 30v8M40 30v8" />
          <text x="-14" y="46">
            14 cm
          </text>
        </PiezaEpp>

        <PiezaEpp halo={u("halo")} som={u("som")} i={2} etiqueta="03 MASCARILLA N95">
          <path className={s.ln} d="M-26 -10Q-44 -24 -46 -30M26 -10Q44 -24 46 -30M-26 12Q-44 20 -46 26M26 12Q44 20 46 26" fill="none" style={{ strokeWidth: 1.4 }} />
          <path className={F("fN95")} d="M-30 0Q-30 -30 0 -32Q30 -30 30 0Q30 28 0 30Q-30 28 -30 0Z" />
          <path className={s.cota} d="M-22 -14Q0 -22 22 -14M-26 4Q0 -2 26 4" />
          <circle className={F("fAcero")} cx="0" cy="12" r="8" style={{ strokeWidth: 1.4 }} />
          <path className={s.cota} d="M-4 9H4M-4 12H4M-4 15H4" />
        </PiezaEpp>

        <PiezaEpp halo={u("halo")} som={u("som")} i={3} etiqueta="04 GUANTE CARNAZA">
          <path
            className={F("fCarnaza")}
            d="M-16 40V8L-26 -4Q-30 -10 -24 -12Q-20 -13 -16 -8L-12 -2V-30Q-12 -35 -8 -35Q-4 -35 -4 -30V-6V-36Q-4 -41 0 -41Q4 -41 4 -36V-6V-33Q4 -38 8 -38Q12 -38 12 -33V-4V-26Q12 -30 16 -30Q20 -30 20 -26V12Q20 26 14 40Z"
          />
          <path className={F("fRojo")} d="M-18 40H16V52H-18Z" />
          <path className={s.cota} d="M-8 22H12" />
        </PiezaEpp>

        <PiezaEpp halo={u("halo")} som={u("som")} i={4} etiqueta="05 BOTA PUNTA ACERO">
          <path className={F("fBota")} d="M-30 34V-24Q-30 -32 -22 -32H-2Q4 -32 4 -24V2L26 10Q38 14 38 26V34Z" />
          <path className={F("fNegro")} d="M-32 34H40V42H-32Z" />
          <path className={F("fAcero")} d="M18 8Q36 12 38 26H18Z" style={{ strokeWidth: 1.4 }} />
          <path className={s.cota} d="M-24 -20H-4M-24 -10H-4M-24 0H-4" />
        </PiezaEpp>

        {/* sello al terminar (clase global `apto`) */}
        <g transform="translate(402 238)">
          <g className={s.sello}>
            <rect x="-82" y="-11" width="164" height="22" rx="4" fill="rgba(7,21,38,.85)" stroke="#2fd27a" strokeWidth="1.5" />
            <path d="M-66 0l4 4 7 -8" className={s.selloVisto} />
            <text x="8" y="4" textAnchor="middle" className={s.selloTxt}>
              EQUIPO COMPLETO
            </text>
          </g>
        </g>

        {/* línea de inspección (clase global `scan`) */}
        <g className={s.scan}>
          <rect data-p="banda" x={X0 - 60} y="44" width="60" height="166" fill={u("scan")} />
          <path data-p="linea" d={`M${X0} 44V210`} className={s.linea} />
        </g>
      </svg>
    </BannerPlano>
  );
}
