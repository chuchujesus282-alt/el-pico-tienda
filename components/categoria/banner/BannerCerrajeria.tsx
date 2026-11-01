"use client";

import { useId, type CSSProperties } from "react";
import BannerPlano, { type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerCerrajeria.module.css";

/**
 * Banner de la categoría Cerrajería, estilo "plano técnico". Portado del prototipo banner-cerrajeria-v7.html: una reja
 * de hierro de dos hojas (barrotes con puntas de lanza y volutas) entre dos pilares, cerrada con un candado de latón en
 * su portacandado, y un llavero de El Pico colgado de un clavo.
 * Activo: la llave sale del llavero (que se mece), vuela hasta el candado, entra y gira; el estado pasa a ABIERTO (clase
 * global `abierto`: los pines bajo la etiqueta se alinean y la línea de corte se prende en verde), el arco salta y se
 * voltea, el candado cae colgando y la hoja derecha se abre sobre su bisagra. Al salir todo vuelve en orden.
 * Diferencias con el prototipo: solo el nombre en la etiqueta (sin kicker, "Protege tu casa con" ni subtítulo), el ● del
 * estado dibujado (no depende de la fuente), en reposo el llavero se mece apenas y las luces (`fondo`) cubren todo el
 * banner.
 */

const LLAVE_REPOSO = { x: 414, y: 164, r: 174 };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = (t: number) => 1 - Math.pow(1 - t, 3);
const back = (t: number) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);
const f2 = (n: number) => n.toFixed(2);

function crearMotor(raiz: HTMLElement): Motor {
  const q = <T extends Element>(p: string) => raiz.querySelector<T>(`[data-p="${p}"]`)!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const llave = q<SVGGElement>("llave"),
    cabeza = q<SVGGElement>("cabeza"),
    arco = q<SVGGElement>("arco"),
    candado = q<SVGGElement>("candado"),
    hojaR = q<SVGGElement>("hojaR"),
    placaR = q<SVGGElement>("placaR"),
    llavero = q<SVGGElement>("llavero"),
    estado = q<SVGTextElement>("estado");

  const S = { kx: LLAVE_REPOSO.x, ky: LLAVE_REPOSO.y, kr: LLAVE_REPOSO.r, giro: 0, alza: 0, vuelta: 0, lx: 0, ly: 0, lr: 0, reja: 0, mece: 0 };
  function draw() {
    llave.setAttribute("transform", `translate(${f2(S.kx + S.lx)} ${f2(S.ky + S.ly)}) rotate(${f2(S.kr + S.lr)}) scale(.72)`);
    // la cabeza de la llave se angosta al girar
    cabeza.setAttribute("transform", `translate(0 42) scale(${Math.max(0.25, Math.abs(Math.cos((S.giro * Math.PI) / 2))).toFixed(3)} 1) translate(0 -42)`);
    const k = Math.cos(S.vuelta * Math.PI);
    arco.setAttribute("transform", `translate(0 ${f2(-S.alza)}) translate(541 0) scale(${k.toFixed(3)} 1) translate(-541 0)`);
    candado.setAttribute("transform", `translate(${f2(S.lx)} ${f2(S.ly)}) rotate(${f2(S.lr)} 550 177)`);
    // la hoja derecha gira sobre su bisagra (pilar derecho, x=634)
    const e = `translate(634 0) scale(${(1 - 0.72 * S.reja).toFixed(3)} 1) translate(-634 0)`;
    hojaR.setAttribute("transform", e);
    placaR.setAttribute("transform", e);
    llavero.setAttribute("transform", `translate(420 104) rotate(${f2(S.mece)})`);
  }

  let gen = 0,
    destruido = false;
  const rafs = new Set<number>();
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
  const ponerEstado = (abierto: boolean) => {
    raiz.classList.toggle("abierto", abierto);
    estado.textContent = abierto ? "ABIERTO" : "CERRADO";
  };

  async function activar() {
    ++gen;
    // 1. la llave sale del llavero (que se mece) y vuela hasta quedar bajo el candado, punta arriba
    const x0 = S.kx,
      y0 = S.ky,
      r0 = S.kr;
    void tween(1200, (_, t) => ((S.mece = 9 * Math.exp(-3 * t) * Math.sin(t * 13)), draw()), (t) => t);
    if (
      !(await tween(700, (p) => {
        S.kx = x0 + (550 - x0) * p;
        S.ky = y0 + (212 - y0) * p - 46 * Math.sin(Math.PI * p);
        S.kr = r0 + (360 - r0) * p;
        draw();
      }))
    )
      return;
    S.kr = 0;
    // 2. entra por abajo en el candado
    if (!(await tween(260, (p) => ((S.ky = 212 - 20 * p), draw()), out))) return;
    // 3. gira
    if (!(await tween(360, (p) => ((S.giro = p), draw()), back))) return;
    ponerEstado(true);
    // 4. el arco salta y se voltea
    if (!(await tween(200, (p) => ((S.alza = 10 * p), draw()), out))) return;
    if (!(await tween(380, (p) => ((S.vuelta = p), draw())))) return;
    // 5. el candado (con la llave) cae colgando
    if (!(await tween(380, (p) => ((S.lx = -12 * p), (S.ly = 8 * p), (S.lr = -10 * p), draw()), back))) return;
    // 6. la reja se abre
    await tween(700, (p) => ((S.reja = p), draw()), out);
  }
  async function reposo() {
    ++gen;
    ponerEstado(false);
    const a = { ...S };
    if (!(await tween(380, (p) => ((S.reja = a.reja * (1 - p)), draw())))) return;
    if (
      !(await tween(320, (p) => {
        const k = 1 - p;
        S.lx = a.lx * k;
        S.ly = a.ly * k;
        S.lr = a.lr * k;
        S.vuelta = a.vuelta * k;
        S.alza = a.alza * k;
        S.giro = a.giro * k;
        S.mece = a.mece * k;
        draw();
      }))
    )
      return;
    const b = { ...S };
    // la llave vuelve al llavero (por el camino corto)
    const vuelta = ((((LLAVE_REPOSO.r - b.kr) % 360) + 540) % 360) - 180; // giro más corto, entre -180 y 180
    const rFin = b.kr + vuelta;
    await tween(500, (p) => {
      S.kx = b.kx + (LLAVE_REPOSO.x - b.kx) * p;
      S.ky = b.ky + (LLAVE_REPOSO.y - b.ky) * p;
      S.kr = b.kr + (rFin - b.kr) * p;
      draw();
    });
  }

  draw();
  return {
    encender: () => void activar(),
    apagar: () => void reposo(),
    destruir() {
      destruido = true;
      gen++;
      rafs.forEach((id) => cancelAnimationFrame(id));
      raiz.classList.remove("abierto");
    },
  };
}

/** Hoja de reja entre x0 y x1: barrotes con puntas de lanza, travesaños y volutas arriba. */
function Hoja({ x0, x1, hierro, hierroV }: { x0: number; x1: number; hierro: string; hierroV: string }) {
  const s = styles;
  const barrotes: number[] = [];
  for (let x = x0 + 8; x < x1 - 4; x += 13) barrotes.push(x);
  const volutas: number[] = [];
  for (let x = x0 + 14; x < x1 - 10; x += 26) volutas.push(x);
  return (
    <>
      {barrotes.map((x) => (
        <g key={x}>
          <rect x={x - 2.2} y="84" width="4.4" height="132" fill={`url(#${hierro})`} />
          <path d={`M${x} 72L${x + 4} 82L${x + 2.2} 84H${x - 2.2}L${x - 4} 82Z`} fill="#3e4d62" className={s.ol} style={{ strokeWidth: 1 }} />
        </g>
      ))}
      {[86, 150, 212].map((y) => (
        <rect key={y} x={x0} y={y - 4} width={x1 - x0} height="8" rx="1.5" fill={`url(#${hierroV})`} className={s.ol} style={{ strokeWidth: 1.1 }} />
      ))}
      {volutas.map((x) => (
        <path key={x} d={`M${x} 112Q${x + 6} 98 ${x + 12} 112Q${x + 18} 126 ${x + 24} 112`} fill="none" stroke="#3e4d62" strokeWidth="2.2" />
      ))}
      <rect x={x0} y="82" width={x1 - x0} height="136" fill="none" stroke="#0b1d33" strokeWidth="1.4" />
    </>
  );
}

/** Llave con la punta en el origen, la hoja hacia +y y la cabeza abajo (`data-p` en la cabeza, para girarla). */
function Llave({ acero, cromo, cabeza }: { acero: string; cromo: string; cabeza?: string }) {
  const s = styles;
  return (
    <>
      <path d="M-3 0L3 3V30H-3Z" fill={`url(#${acero})`} className={s.ol} style={{ strokeWidth: 1 }} />
      <path d="M3 6h3v3h-3M3 13h3v3h-3M3 20h3v3h-3" fill={`url(#${acero})`} className={s.ol} style={{ strokeWidth: 0.8 }} />
      <rect x="-6" y="29" width="12" height="4" rx="1.2" fill={`url(#${cromo})`} className={s.ol} style={{ strokeWidth: 1 }} />
      <g data-p={cabeza}>
        <path d="M0 32A11 10 0 1 1 0 52A11 10 0 1 1 0 32Z" fill={`url(#${cromo})`} className={s.ol} style={{ strokeWidth: 1 }} />
        <circle cx="0" cy="46" r="2.6" fill="#0f2a4a" className={s.ol} style={{ strokeWidth: 0.9 }} />
      </g>
    </>
  );
}

export default function BannerCerrajeria({ nombre }: PropsBannerPropio) {
  const p = `cj${useId().replace(/:/g, "")}`;
  const g = (n: string) => `${p}${n}`;
  const u = (n: string) => `url(#${p}${n})`;
  const s = styles;
  return (
    <BannerPlano
      nombre={nombre}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial="#d4a843"
      crearMotor={crearMotor}
      plano
      decoracion="pines"
      variables={
        {
          "--brillo-on": "0", // las luces van en `fondo`
          "--etiqueta-pad": "2px 26px 0",
          "--etiqueta-sombra": "0 10px 24px -10px rgba(227, 38, 47, 0.6)",
        } as CSSProperties
      }
      fondo={
        <>
          <div className={s.luz} aria-hidden />
          <div className={s.luzAbierto} aria-hidden />
        </>
      }
    >
      {/* encuadre ajustado a la reja (el del prototipo, 250 8 510 252, dejaba la escena pequeña en el banner) */}
      <svg viewBox="384 20 316 234" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false" className={s.svg}>
        <defs>
          <linearGradient id={g("hierro")} x1="0" x2="1">
            <stop offset="0" stopColor="#1b2533" />
            <stop offset=".45" stopColor="#3e4d62" />
            <stop offset="1" stopColor="#18212e" />
          </linearGradient>
          <linearGradient id={g("hierroV")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a5a70" />
            <stop offset="1" stopColor="#1b2533" />
          </linearGradient>
          <linearGradient id={g("laton")} x1="0" x2="1">
            <stop offset="0" stopColor="#a77f2a" />
            <stop offset=".32" stopColor="#ecca6e" />
            <stop offset=".6" stopColor="#d4a843" />
            <stop offset="1" stopColor="#8f6a1e" />
          </linearGradient>
          <linearGradient id={g("acero")} x1="0" x2="1">
            <stop offset="0" stopColor="#7f8b99" />
            <stop offset=".42" stopColor="#eef2f6" />
            <stop offset=".62" stopColor="#c4cdd8" />
            <stop offset="1" stopColor="#7f8b99" />
          </linearGradient>
          <linearGradient id={g("cromo")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3f6f9" />
            <stop offset=".55" stopColor="#b9c3cf" />
            <stop offset="1" stopColor="#7f8b99" />
          </linearGradient>
          <radialGradient id={g("sombra")}>
            <stop offset="0" stopColor="#000" stopOpacity=".42" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={g("piso")} x1="0" x2="1">
            <stop offset="0" stopColor="#c3ccd8" stopOpacity="0" />
            <stop offset=".2" stopColor="#c3ccd8" stopOpacity=".7" />
            <stop offset=".8" stopColor="#c3ccd8" stopOpacity=".7" />
            <stop offset="1" stopColor="#c3ccd8" stopOpacity="0" />
          </linearGradient>
        </defs>

        <text x="420" y="34">
          LÁMINA · REJA DE 2 HOJAS CON PORTACANDADO
        </text>
        <circle cx="636" cy="31.5" r="2.6" className={s.estadoPunto} />
        <text data-p="estado" className={s.estado} x="690" y="34" textAnchor="end">
          CERRADO
        </text>

        {/* piso */}
        <ellipse cx="540" cy="228" rx="150" ry="6" fill={u("sombra")} />
        <path d="M300 226H770" stroke={u("piso")} strokeWidth="1.5" />

        {/* pilares */}
        <rect x="430" y="66" width="16" height="160" rx="2" fill={u("hierro")} className={s.ol} />
        <rect x="426" y="60" width="24" height="8" rx="2" fill={u("hierroV")} className={s.ol} />
        <rect x="634" y="66" width="16" height="160" rx="2" fill={u("hierro")} className={s.ol} />
        <rect x="630" y="60" width="24" height="8" rx="2" fill={u("hierroV")} className={s.ol} />

        {/* clavo con el llavero, en el pilar izquierdo */}
        <circle cx="420" cy="104" r="3" fill={u("cromo")} className={s.ol} />
        <path d="M420 104H430" stroke="#7f8b99" strokeWidth="2.4" />
        <g data-p="llavero" transform="translate(420 104)">
          <g className={s.mece}>
            <circle cx="0" cy="14" r="11" fill="none" stroke="#0b1d33" strokeWidth="4" />
            <circle cx="0" cy="14" r="11" fill="none" stroke={u("acero")} strokeWidth="2.2" />
            <g transform="translate(5 62) rotate(188) scale(.72)">
              <Llave acero={g("acero")} cromo={g("cromo")} />
            </g>
            <g transform="translate(-3 26) rotate(6)">
              <rect x="-8" y="0" width="16" height="22" rx="4" fill="#e3262f" className={s.ol} />
              <circle cx="0" cy="5" r="2" fill="#0b1d33" />
              <text x="0" y="17" textAnchor="middle" className={s.llaveroTxt}>
                PICO
              </text>
            </g>
          </g>
        </g>

        {/* hojas: la izquierda fija, la derecha abre */}
        <g>
          <Hoja x0={446} x1={540} hierro={g("hierro")} hierroV={g("hierroV")} />
        </g>
        <g data-p="hojaR">
          <Hoja x0={540} x1={634} hierro={g("hierro")} hierroV={g("hierroV")} />
        </g>

        {/* portacandado: armella en la hoja izquierda + placa en la derecha */}
        <rect x="520" y="136" width="18" height="14" rx="2" fill={u("cromo")} className={s.ol} />
        <g data-p="placaR">
          <rect x="542" y="136" width="18" height="14" rx="2" fill={u("cromo")} className={s.ol} />
          <path d="M546 136V128Q546 124 550 124Q554 124 554 128V136" fill="none" stroke={u("acero")} strokeWidth="3" />
        </g>

        {/* llave que viaja (detrás del cuerpo del candado para que "entre") */}
        <g data-p="llave" transform={`translate(${LLAVE_REPOSO.x} ${LLAVE_REPOSO.y}) rotate(${LLAVE_REPOSO.r}) scale(.72)`}>
          <Llave acero={g("acero")} cromo={g("cromo")} cabeza="cabeza" />
        </g>

        {/* candado */}
        <g data-p="candado">
          <g data-p="arco">
            <path d="M541 166V146A9 9 0 0 1 559 146V166" fill="none" stroke="#0b1d33" strokeWidth="7" />
            <path d="M541 166V146A9 9 0 0 1 559 146V166" fill="none" stroke={u("acero")} strokeWidth="4.5" />
          </g>
          <rect x="532" y="160" width="36" height="34" rx="6" fill={u("laton")} className={s.ol} />
          <rect x="536" y="163" width="28" height="7" rx="3" fill="#f5da92" opacity=".5" />
          <path d="M547 178H553" stroke="#8f6a1e" strokeWidth="1.2" />
          <rect x="548" y="192" width="4" height="2.5" rx="1" fill="#0b1d33" />
        </g>

        {/* cotas */}
        <g opacity=".85">
          <path className={s.cota} d="M446 244H634M446 239v10M634 239v10" />
          <path d="M450 244l-5 -3v6z" fill="#e3262f" />
          <text x="520" y="240">
            1.20 m
          </text>
          <path className={s.cota} d="M662 66V226M657 66h10M657 226h10" />
          <text transform="translate(676 160) rotate(-90)">1.00 m</text>
        </g>
      </svg>
    </BannerPlano>
  );
}
