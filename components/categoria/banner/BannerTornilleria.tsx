"use client";

import { useId, type CSSProperties } from "react";
import BannerPlano, { type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerTornilleria.module.css";

/**
 * Banner de la categoría Tornillería, estilo "plano técnico". Portado del prototipo aprobado banner-tornilleria-v1.html:
 * tablón de pino en corte con un tornillo de madera #10 × 2½" y su destornillador, arandelas y clavos, un perno
 * hexagonal ⅜" × 3" con su tuerca y un tarugo de 8 mm, con sus cotas.
 * Activo: el destornillador baja a la cabeza, el tornillo gira y se hunde en la madera (la rosca avanza, salen virutas,
 * TORQUE 0 → 4,8 N·m) mientras la tuerca baja girando por el perno (clase global `vivo`: la rosca bajo la etiqueta
 * gira); al final el destornillador se retira. Al salir todo vuelve (420 ms). Tiempos y colores del prototipo.
 * Diferencias con el prototipo: el tornillo y los hilos se dibujan en el servidor (el prototipo los armaba con JS; el
 * motor solo cambia atributos), solo el nombre en la etiqueta (sin "Todo para fijar en", kicker ni subtítulo) y, en
 * reposo, el tarugo flota apenas.
 */

const CX = 190,
  LEN = 100,
  PITCH = 8;
const T0 = -10,
  T1 = 80; // y del tornillo: arriba / clavado

/** Hilos del tornillo (avanzan con `fase`). */
function hilosTornillo(fase: number) {
  const d: string[] = [];
  for (let y = 30 + (((fase % PITCH) + PITCH) % PITCH); y < LEN - 14; y += PITCH) {
    const w = y > LEN - 30 ? 7 - ((y - (LEN - 30)) / 16) * 4 : 9.5;
    d.push(`M${(CX - w).toFixed(2)} ${(y + 3).toFixed(2)}L${(CX + w).toFixed(2)} ${(y - 3).toFixed(2)}`);
  }
  return d.join("");
}
/** Hilos del perno (bajan con `fase`). */
function hilosPerno(fase: number) {
  let d = "";
  for (let y = 74 + (((fase % 7) + 7) % 7); y < 212; y += 7) d += `M526 ${(y + 2.5).toFixed(2)}L554 ${(y - 2.5).toFixed(2)}`;
  return d;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = (t: number) => 1 - Math.pow(1 - t, 3);
const lin = (t: number) => t;

function crearMotor(raiz: HTMLElement): Motor {
  const q = <T extends Element>(p: string) => raiz.querySelector<T>(`[data-p="${p}"]`)!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tornillo = q<SVGGElement>("tornillo"),
    destor = q<SVGGElement>("destor"),
    hoyo = q<SVGRectElement>("hoyo"),
    torque = q<SVGTextElement>("torque"),
    tuerca = q<SVGGElement>("tuerca"),
    caraT = q<SVGPathElement>("caraT"),
    perno = q<SVGPathElement>("hilosP"),
    viruta = q<SVGGElement>("viruta");
  const hilosT = [...raiz.querySelectorAll<SVGPathElement>('[data-p="hilosT"]')];

  const S = { ty: T0, dy: 0, tq: 0, ny: 50, nr: 0 };
  let fase = 0,
    faseP = 0;
  // Cada parte se dibuja por separado: el tornillo, la tuerca y el torque cambian en momentos distintos, y así cada
  // cuadro solo toca lo que se movió (el texto del torque, solo cuando cambia su décima).
  const hilos = { t: "", p: "" };
  const drawHilos = () => {
    const d = hilosTornillo(fase);
    if (d === hilos.t) return;
    hilos.t = d;
    hilosT.forEach((h) => h.setAttribute("d", d));
  };
  const drawPerno = () => {
    const d = hilosPerno(faseP);
    if (d === hilos.p) return;
    hilos.p = d;
    perno.setAttribute("d", d);
  };
  function drawTornillo() {
    tornillo.setAttribute("transform", `translate(0 ${(S.ty + 60).toFixed(2)})`);
    destor.setAttribute("transform", `translate(0 ${(S.ty + 60 + S.dy).toFixed(2)})`);
    hoyo.setAttribute("height", Math.max(0, S.ty + 60 + LEN - 150 - 6).toFixed(2));
  }
  let torqueTexto = "";
  function drawTorque() {
    const texto = `TORQUE ${S.tq.toFixed(1)} N·m`;
    if (texto !== torqueTexto) torque.textContent = torqueTexto = texto;
  }
  function drawTuerca() {
    tuerca.setAttribute("transform", `translate(0 ${S.ny.toFixed(2)})`);
    const k = Math.abs(Math.cos(((S.nr * Math.PI) / 180) * 3));
    caraT.setAttribute("d", `M${(540 - 14 * k).toFixed(2)} 0H${(540 + 14 * k).toFixed(2)}V20H${(540 - 14 * k).toFixed(2)}Z`);
  }
  const draw = () => (drawTornillo(), drawTorque(), drawTuerca());

  // Virutas de madera: salen del hoyo y se borran solas.
  function virutas() {
    if (reduce) return;
    for (let i = 0; i < 2; i++) {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "path");
      c.setAttribute("d", "M0 0q3 -3 6 0");
      c.setAttribute("transform", "translate(190 150)");
      viruta.appendChild(c);
      const dx = (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 30),
        dy = -6 - Math.random() * 16;
      c.animate(
        [
          { transform: "translate(190px,150px) rotate(0deg)", opacity: 1 },
          { transform: `translate(${190 + dx}px,${150 + dy + 10}px) rotate(${Math.random() * 360}deg)`, opacity: 0 },
        ],
        { duration: 500, easing: "ease-out" },
      ).onfinish = () => c.remove();
    }
  }

  // ---------- tiempo: cada encender/apagar sube `gen` y corta lo anterior ----------
  let gen = 0,
    destruido = false,
    chispero = 0;
  const rafs = new Set<number>();
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
  const pararVirutas = () => {
    clearInterval(chispero);
    chispero = 0;
  };

  async function activar() {
    const g = ++gen;
    raiz.classList.add("on");
    // 1. el destornillador baja hasta la cabeza
    raiz.classList.remove("ajustado");
    S.dy = -40;
    drawTornillo();
    if (!(await tween(320, (p) => ((S.dy = -40 * (1 - p)), drawTornillo()), out))) return;
    raiz.classList.add("vivo");
    // 2. el tornillo gira y se hunde en la madera (la rosca avanza), virutas
    chispero = window.setInterval(() => {
      if (g !== gen || destruido) return pararVirutas();
      if (S.ty + 60 + LEN > 150) virutas();
    }, 70);
    // en paralelo: la tuerca baja girando por el perno
    const tuercaBaja = tween(
      1300,
      (p) => {
        S.ny = 50 + 144 * p;
        S.nr = 720 * p;
        faseP = -p * 80;
        drawPerno();
        drawTuerca();
      },
      lin,
    );
    const ok = await tween(
      1400,
      (p) => {
        S.ty = T0 + (T1 - T0) * p;
        fase = p * 72;
        S.tq = 4.8 * Math.pow(p, 1.6);
        drawHilos();
        drawTornillo();
        drawTorque();
      },
      lin,
    );
    pararVirutas();
    if (!ok || !(await tuercaBaja)) return;
    raiz.classList.remove("vivo");
    // Ajustado: onda en la cabeza del tornillo y el torque se ilumina (clase global `ajustado`).
    raiz.classList.add("ajustado");
    // 3. el destornillador se retira
    await tween(320, (p) => ((S.dy = -46 * p), drawTornillo()), out);
  }

  async function reposo() {
    const g = ++gen;
    pararVirutas();
    // `on` se queda hasta que todo vuelve (BannerPlano ya la quitó; el prototipo la quita al final).
    raiz.classList.add("on");
    raiz.classList.remove("vivo", "ajustado");
    const s = { ...S };
    const ok = await tween(420, (p) => {
      S.ty = s.ty + (T0 - s.ty) * p;
      S.dy = s.dy * (1 - p);
      S.ny = s.ny + (50 - s.ny) * p;
      S.tq = s.tq * (1 - p);
      fase = 72 * (1 - p);
      drawHilos();
      draw();
    });
    if (ok && g === gen) raiz.classList.remove("on");
  }

  return {
    encender: () => void activar(),
    apagar: () => void reposo(),
    destruir() {
      destruido = true;
      gen++;
      pararVirutas();
      rafs.forEach((id) => cancelAnimationFrame(id));
      raiz.classList.remove("vivo", "ajustado");
    },
  };
}

/** El tornillo de madera: cabeza plana Phillips, vástago y la rosca (origen: la cabeza arriba en y=0). */
function Tornillo({ s }: { s: typeof styles }) {
  return (
    <>
      <path className={`${s.fill} ${s.fZinc} ${s.ln}`} d={`M${CX - 17} 0H${CX + 17}L${CX + 7} 12H${CX - 7}Z`} />
      <path d={`M${CX - 6} 3H${CX + 6}M${CX} 0V8`} stroke="#0b1d33" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path className={`${s.fill} ${s.fZinc} ${s.ln}`} d={`M${CX - 7} 12H${CX + 7}V${LEN - 18}L${CX} ${LEN}L${CX - 7} ${LEN - 18}Z`} />
      <path data-p="hilosT" className={s.hilo} d={hilosTornillo(0)} />
    </>
  );
}

export default function BannerTornilleria({ nombre }: PropsBannerPropio) {
  const id = useId().replace(/:/g, "");
  const encima = `encima-${id}`,
    dentro = `dentro-${id}`,
    clipPerno = `perno-${id}`,
    mango = `mango-${id}`;
  const s = styles;
  const F = s.fill;
  return (
    <BannerPlano
      nombre={nombre}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial="#b9c3cf"
      crearMotor={crearMotor}
      decoracion="rosca"
      variables={
        {
          "--brillo": "radial-gradient(55% 120% at 62% 60%, rgba(185,195,207,.16), rgba(184,137,90,.08) 45%, transparent 72%)",
          "--brillo-on": "1",
          "--etiqueta-pad": "2px 26px 0",
          "--etiqueta-sombra": "0 10px 24px -10px rgba(227, 38, 47, 0.6)",
        } as CSSProperties
      }
    >
      <svg viewBox="0 0 780 260" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false" className={s.svg}>
        <defs>
          <clipPath id={encima}>
            <rect x="0" y="0" width="780" height="150" />
          </clipPath>
          <clipPath id={dentro}>
            <rect x="40" y="150" width="300" height="98" />
          </clipPath>
          <clipPath id={clipPerno}>
            <rect x="500" y="0" width="80" height="260" />
          </clipPath>
          <clipPath id={mango}>
            <rect x="178" y="-58" width="24" height="38" rx="5" />
          </clipPath>
        </defs>

        <text data-p="torque" className={s.torque} x="760" y="24" textAnchor="end">
          TORQUE 0.0 N·m
        </text>

        {/* ===== 1. tablón de madera en corte + tornillo ===== */}
        <rect className={`${F} ${s.fMadera} ${s.ln}`} x="40" y="150" width="300" height="98" rx="2" />
        <path className={s.veta} d="M48 166Q120 158 190 168T332 162M48 190Q130 198 210 188T332 194M48 216Q110 210 170 218T332 214M48 236Q120 232 200 238T332 234" />
        <text className={s.bp} x="44" y="258" style={{ fontSize: 7 }}>
          TABLA PINO 2&quot; · CORTE
        </text>
        <g className={s.bp}>
          <path className={s.cota} d="M224 50V150M219 50h10M219 150h10" />
          <text transform="translate(236 108) rotate(-90)" style={{ fontSize: 7 }}>
            2½&quot;
          </text>
          <text x="112" y="40" style={{ fontSize: 7 }}>
            TORNILLO MADERA #10 × 2½&quot;
          </text>
        </g>
        {/* hoyo del tornillo dentro de la madera */}
        <rect data-p="hoyo" x="180" y="150" width="20" height="0" fill="#5c3d20" />
        {/* tornillo (se mueve en y): encima de la madera, y lo de adentro, translúcido */}
        <g data-p="tornillo" transform="translate(0 50)">
          <g clipPath={`url(#${encima})`}>
            <Tornillo s={s} />
          </g>
          <g clipPath={`url(#${dentro})`} opacity=".55">
            <Tornillo s={s} />
          </g>
        </g>
        {/* punta de destornillador */}
        <g data-p="destor" transform="translate(0 50)">
          <rect className={`${F} ${s.fZinc} ${s.ln}`} x="184" y="-20" width="12" height="46" rx="2" />
          <path className={`${F} ${s.fZinc} ${s.ln}`} d="M184 26H196L192 36H188Z" />
          <rect className={`${F} ${s.fRojo} ${s.ln}`} x="176" y="-60" width="28" height="42" rx="6" />
          {/* estrías del mango: corren de lado mientras atornilla, como si el mango girara */}
          <g clipPath={`url(#${mango})`}>
            <path className={`${s.cota} ${s.estrias}`} d="M174 -54V-24M182 -54V-24M190 -54V-24M198 -54V-24M206 -54V-24" style={{ stroke: "#0b1d33" }} />
          </g>
        </g>
        {/* ajustado: onda que sale de la cabeza del tornillo ya a ras de la madera */}
        <ellipse className={s.onda} cx="190" cy="150" rx="22" ry="6" />
        <g data-p="viruta" className={s.viruta} />

        {/* ===== 2. arandelas + clavos ===== */}
        <g transform="translate(380 196)">
          {[22, 14, 6].map((cy) => (
            <g key={cy}>
              <ellipse className={`${F} ${s.fZinc} ${s.ln}`} cx="0" cy={cy} rx="26" ry="7" />
              <ellipse className={s.ln} cx="0" cy={cy} rx="9" ry="2.6" fill="#0f2a4a" style={{ strokeWidth: 1 }} />
            </g>
          ))}
        </g>
        <text className={s.bp} x="352" y="244" style={{ fontSize: 7 }}>
          ARANDELA ½&quot;
        </text>
        <g>
          <g transform="translate(430 226) rotate(-8)">
            <path className={`${F} ${s.fZinc} ${s.ln}`} d="M0 0H62L70 -3L62 -6H0Z" />
            <rect className={`${F} ${s.fZinc} ${s.ln}`} x="-4" y="-9" width="4" height="12" rx="1" />
          </g>
          <g transform="translate(434 214) rotate(-14)">
            <path className={`${F} ${s.fZinc} ${s.ln}`} d="M0 0H52L59 -2.5L52 -5H0Z" />
            <rect className={`${F} ${s.fZinc} ${s.ln}`} x="-4" y="-8" width="4" height="11" rx="1" />
          </g>
        </g>
        <text className={s.bp} x="438" y="196" style={{ fontSize: 7 }}>
          CLAVO 2&quot;
        </text>

        {/* ===== 3. perno + tuerca ===== */}
        <rect className={`${F} ${s.fZinc} ${s.ln}`} x="508" y="214" width="64" height="12" rx="1" />
        <path className={s.cota} d="M524 214V226M540 214V226M556 214V226" />
        <g clipPath={`url(#${clipPerno})`}>
          <rect className={`${F} ${s.fZinc} ${s.ln}`} x="528" y="70" width="24" height="144" />
          <path data-p="hilosP" className={s.hilo} d={hilosPerno(0)} />
        </g>
        <g className={s.bp}>
          <path className={s.cota} d="M500 70H580" style={{ strokeDasharray: "2 3" }} />
          <text x="586" y="150" style={{ fontSize: 7 }}>
            PERNO HEX
          </text>
          <text x="586" y="160" style={{ fontSize: 7 }}>
            ⅜&quot; × 3&quot;
          </text>
          <path className={s.cota} d="M596 70V214M591 70h10M591 214h10" />
        </g>
        {/* tuerca (se mueve) */}
        <g data-p="tuerca" transform="translate(0 50)">
          <path className={`${F} ${s.fZincOsc} ${s.ln}`} d="M512 0H568V20H512Z" />
          <path className={s.cota} d="M526 0V20M554 0V20" style={{ stroke: "#0b1d33" }} />
          <path data-p="caraT" className={`${F} ${s.fZinc} ${s.ln}`} d="M526 0H554V20H526Z" />
        </g>
        <text className={s.bp} x="610" y="54" style={{ fontSize: 7 }}>
          TUERCA ⅜&quot;
        </text>

        {/* ===== 4. tarugo (en reposo flota apenas) ===== */}
        <g transform="translate(690 120)">
          <g className={s.flota}>
            <path className={`${F} ${s.fRojo} ${s.ln}`} d="M-8 0H8L6 80L0 90L-6 80Z" />
            <path className={s.cota} d="M-8 14H8M-8 28H8M-8 42H8M-7 56H7M-6 70H6" style={{ stroke: "#0b1d33" }} />
            <rect className={`${F} ${s.fRojo} ${s.ln}`} x="-13" y="-6" width="26" height="7" rx="2" />
          </g>
        </g>
        <text className={s.bp} x="664" y="236" style={{ fontSize: 7 }}>
          TARUGO 8 mm
        </text>
      </svg>
    </BannerPlano>
  );
}
