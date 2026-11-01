"use client";

import { useId, type CSSProperties } from "react";
import BannerPlano, { azar, type Motor } from "@/components/categoria/banner-plano/BannerPlano";
import type { PropsBannerPropio } from "./CategoriaBanner";
import styles from "./BannerHogarJardin.module.css";

/**
 * Banner de la categoría Hogar y jardín, estilo "plano técnico". Portado del prototipo banner-jardin-v3.html: grama con
 * los bordes difuminados, un rastrillo y una pala apoyados, un banco de madera con tres materos (helecho, planta con
 * flor y suculenta) y, a la derecha, el carrete de manguera con su pistola.
 * Activo: el carrete gira, la pistola riega en arco sobre los materos (chorro y gotas), las plantas se mecen y crecen,
 * la flor se abre y una mariposa revolotea sobre ellas (clases globales `riego` y `vivo`). Al salir todo vuelve.
 * Diferencias con el prototipo: solo el nombre en la etiqueta (sin kicker, "Hogar y" ni subtítulo, como toda la
 * familia), la grama sale igual en el servidor y en el navegador (`azar`, sin Math.random), en reposo las plantas se
 * mecen apenas y las luces (`fondo`) cubren todo el banner.
 */

/** Briznas de grama (fijas por semilla). */
const BRIZNAS = (() => {
  let d = "";
  for (let i = 0, x = 44; x < 780; x += 6, i++) {
    const h = 6 + azar(i, 7) * 9,
      l = azar(i, 8) * 6 - 3;
    d += `M${x} 216q${l.toFixed(2)} ${(-h / 2).toFixed(2)} ${(l * 1.4).toFixed(2)} ${(-h).toFixed(2)}`;
  }
  return d;
})();

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = (t: number) => 1 - Math.pow(1 - t, 3);
const back = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
const lin = (t: number) => t;

const escalaPlanta = (crece: number, i: number) => (0.86 + 0.16 * crece + (i === 1 ? 0.04 * crece : 0)).toFixed(3);
const transformPetalos = (abre: number) => `scale(${abre.toFixed(3)}) rotate(${((1 - abre) * 90).toFixed(1)})`;

function crearMotor(raiz: HTMLElement): Motor {
  const q = <T extends Element>(p: string) => raiz.querySelector<T>(`[data-p="${p}"]`)!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const plantas = [q<SVGGElement>("p0"), q<SVGGElement>("p1"), q<SVGGElement>("p2")],
    petalos = q<SVGGElement>("petalos"),
    centro = q<SVGCircleElement>("centro"),
    carrete = q<SVGGElement>("carrete"),
    mariposa = q<SVGGElement>("mariposa"),
    gotas = q<SVGGElement>("gotas");

  let crece = 0,
    abre = 0.35,
    rot = 0;
  function dibujarPlantas() {
    plantas.forEach((p, i) => (p.style.scale = escalaPlanta(crece, i)));
    petalos.setAttribute("transform", transformPetalos(abre));
    centro.setAttribute("r", (2.5 + 1.5 * abre).toFixed(2));
  }

  function gota() {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    c.setAttribute("cx", (440 + Math.random() * 80).toFixed(1));
    c.setAttribute("cy", (96 + Math.random() * 10).toFixed(1));
    c.setAttribute("rx", "1.4");
    c.setAttribute("ry", "2.4");
    gotas.appendChild(c);
    c.animate(
      [
        { transform: "translateY(0)", opacity: 1 },
        { transform: `translateY(${(40 + Math.random() * 20).toFixed(0)}px)`, opacity: 0 },
      ],
      { duration: 520, easing: "ease-in" },
    ).onfinish = () => c.remove();
  }

  let gen = 0,
    destruido = false,
    giroRaf = 0,
    regador = 0;
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
  const esperar = (ms: number) => {
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
  const girar = () => {
    rot -= 6;
    carrete.setAttribute("transform", `translate(690 172) rotate(${rot})`);
    giroRaf = requestAnimationFrame(girar);
  };
  const pararGiro = () => {
    cancelAnimationFrame(giroRaf);
    giroRaf = 0;
  };
  const pararRiego = () => {
    clearInterval(regador);
    regador = 0;
  };

  async function activar() {
    const g = ++gen;
    if (!reduce && !giroRaf) giroRaf = requestAnimationFrame(girar);
    if (!(await esperar(250))) return;
    raiz.classList.add("riego");
    if (!reduce)
      regador = window.setInterval(() => {
        if (g !== gen || destruido) return pararRiego();
        gota();
        gota();
      }, 60);
    if (!(await tween(1300, (p) => ((crece = p), dibujarPlantas()), out))) return;
    if (!(await tween(520, (p) => ((abre = 0.35 + 0.65 * p), dibujarPlantas()), back))) return;
    pararGiro();
    raiz.classList.add("vivo");
    // la mariposa revolotea de un lado a otro sobre las plantas
    while (g === gen) {
      if (
        !(await tween(
          2600,
          (_, t) => mariposa.setAttribute("transform", `translate(${(520 - 110 * t).toFixed(1)} ${(60 + 18 * Math.sin(t * Math.PI * 3)).toFixed(1)})`),
          lin,
        ))
      )
        return;
      if (
        !(await tween(
          2600,
          (_, t) =>
            mariposa.setAttribute(
              "transform",
              `translate(${(410 + 110 * t).toFixed(1)} ${(60 + 18 * Math.sin(t * Math.PI * 3)).toFixed(1)}) scale(-1 1)`,
            ),
          lin,
        ))
      )
        return;
    }
  }
  async function reposo() {
    ++gen;
    raiz.classList.remove("riego", "vivo");
    pararGiro();
    pararRiego();
    const a = { crece, abre };
    await tween(450, (p) => {
      crece = a.crece * (1 - p);
      abre = a.abre + (0.35 - a.abre) * p;
      dibujarPlantas();
    });
  }

  return {
    encender: () => void activar(),
    apagar: () => void reposo(),
    destruir() {
      destruido = true;
      gen++;
      pararGiro();
      pararRiego();
      rafs.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((id) => clearTimeout(id));
      raiz.classList.remove("riego", "vivo");
      gotas.replaceChildren();
    },
  };
}

export default function BannerHogarJardin({ nombre }: PropsBannerPropio) {
  const p = `hj${useId().replace(/:/g, "")}`;
  const g = (n: string) => `${p}${n}`;
  const u = (n: string) => `url(#${p}${n})`;
  const s = styles;
  const hoja = "M0 -26Q-30 -40 -40 -22M0 -26Q-22 -58 -32 -60M0 -26Q-4 -66 2 -74M0 -26Q20 -60 32 -62M0 -26Q30 -42 40 -26";
  return (
    <BannerPlano
      nombre={nombre}
      ariaLabel={`Categoría ${nombre}`}
      colorInicial="#5fbf5a"
      crearMotor={crearMotor}
      plano
      decoracion="pasto"
      variables={
        {
          "--brillo-on": "0", // las luces van en `fondo`
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
      fondo={
        <>
          <div className={s.luz} aria-hidden />
          <div className={s.luzAgua} aria-hidden />
        </>
      }
    >
      <svg viewBox="40 0 740 260" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false" className={s.svg}>
        <defs>
          <linearGradient id={g("grama")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4fae49" />
            <stop offset="1" stopColor="#2b6e33" />
          </linearGradient>
          <linearGradient id={g("barro")} x1="0" x2="1">
            <stop offset="0" stopColor="#a9502b" />
            <stop offset=".45" stopColor="#d4733f" />
            <stop offset="1" stopColor="#9a4523" />
          </linearGradient>
          <linearGradient id={g("madera")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c99561" />
            <stop offset="1" stopColor="#9a6c3e" />
          </linearGradient>
          <linearGradient id={g("manguera")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6fd06a" />
            <stop offset="1" stopColor="#2f8a3a" />
          </linearGradient>
          <linearGradient id={g("acero")} x1="0" x2="1">
            <stop offset="0" stopColor="#8592a3" />
            <stop offset=".45" stopColor="#e8edf3" />
            <stop offset="1" stopColor="#8592a3" />
          </linearGradient>
          <radialGradient id={g("sombra")}>
            <stop offset="0" stopColor="#000" stopOpacity=".38" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={g("fadeX")} x1="0" x2="1">
            <stop offset="0" stopColor="#000" />
            <stop offset=".22" stopColor="#fff" />
            <stop offset=".94" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <linearGradient id={g("fadeY")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset=".55" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id={g("mX")}>
            <rect x="40" y="190" width="740" height="70" fill={u("fadeX")} />
          </mask>
          <mask id={g("mY")}>
            <rect x="40" y="190" width="740" height="70" fill={u("fadeY")} />
          </mask>
        </defs>

        {/* grama (con los bordes difuminados) */}
        <g mask={u("mX")}>
          <g mask={u("mY")}>
            <rect x="40" y="214" width="740" height="46" fill={u("grama")} />
            <path d={BRIZNAS} fill="none" stroke="#6fcf62" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </g>

        {/* rastrillo apoyado */}
        <g transform="translate(236 36) rotate(171)">
          <path d="M0 -10V-188" stroke="#0b1d33" strokeWidth="8" strokeLinecap="round" opacity=".3" />
          <path d="M0 -10V-188" stroke="#c99561" strokeWidth="5" strokeLinecap="round" />
          <rect x="-4" y="-26" width="8" height="16" rx="1.5" fill={u("acero")} className={s.ol} />
          <path d="M-30 -10H30Q32 -10 32 -8V-6H-32V-8Q-32 -10 -30 -10Z" fill="#2f8a3a" className={s.ol} />
          <path d="M-28 -6V4M-20 -6V4M-12 -6V4M-4 -6V4M4 -6V4M12 -6V4M20 -6V4M28 -6V4" stroke="#2f8a3a" strokeWidth="2.6" strokeLinecap="round" />
        </g>
        {/* pala apoyada */}
        <g transform="translate(286 220) rotate(16)">
          <path d="M0 -40V-170" stroke="#0b1d33" strokeWidth="9" strokeLinecap="round" opacity=".35" />
          <path d="M0 -40V-170" stroke="#c99561" strokeWidth="7" strokeLinecap="round" />
          <path d="M-12 -170H12V-186Q12 -192 6 -192H-6Q-12 -192 -12 -186Z" fill="none" stroke="#2a2f38" strokeWidth="4" />
          <rect x="-4" y="-56" width="8" height="18" fill={u("acero")} className={s.ol} />
          <path d="M-16 -40H16V-10Q16 6 0 12Q-16 6 -16 -10Z" fill="#e3262f" className={s.ol} />
          <path d="M-8 -34V-6" stroke="#ff7a80" strokeWidth="2" opacity=".6" strokeLinecap="round" />
        </g>

        {/* banco de madera */}
        <ellipse cx="455" cy="222" rx="170" ry="6" fill={u("sombra")} />
        <rect x="318" y="166" width="276" height="12" rx="2" fill={u("madera")} className={s.ol} />
        <rect x="318" y="178" width="276" height="5" fill="#7a5534" />
        <path d="M334 183V220M578 183V220" stroke="#7a5534" strokeWidth="8" strokeLinecap="round" />
        <path d="M334 204H578" stroke="#7a5534" strokeWidth="4" />

        {/* matero 1: helecho */}
        <g transform="translate(372 166)">
          <g data-p="p0" className={s.mece} style={{ scale: escalaPlanta(0, 0) }}>
            <path d={hoja} fill="none" stroke="#2f7d3a" strokeWidth="7" strokeLinecap="round" />
            <path d={hoja} fill="none" stroke="#5cbf55" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 2" />
          </g>
          <path d="M-26 -30H26L20 0H-20Z" fill={u("barro")} className={s.ol} />
          <rect x="-29" y="-36" width="58" height="8" rx="2" fill="#b85c32" className={s.ol} />
        </g>

        {/* matero 2: planta grande con flor */}
        <g transform="translate(462 166)">
          <g data-p="p1" className={`${s.mece} ${s.meceB}`} style={{ scale: escalaPlanta(0, 1) }}>
            <path d="M0 -40V-118" stroke="#2f7d3a" strokeWidth="4" strokeLinecap="round" />
            <path
              d="M0 -60C-30 -70 -38 -96 -34 -102C-14 -96 -4 -80 0 -60Z M0 -78C26 -84 40 -108 36 -116C14 -110 4 -96 0 -78Z M0 -50C22 -50 38 -66 40 -76C20 -76 6 -66 0 -50Z M0 -44C-20 -42 -40 -54 -44 -64C-24 -66 -8 -58 0 -44Z"
              fill="#5cbf55"
              className={s.ol}
              style={{ strokeWidth: 1.2 }}
            />
            <g transform="translate(0 -122)">
              <g data-p="petalos" transform={transformPetalos(0.35)}>
                {[0, 72, 144, 216, 288].map((r, i) => (
                  <ellipse key={r} cx="0" cy="-11" rx="7" ry="11" fill={i % 2 ? "#ef3a42" : "#e3262f"} transform={`rotate(${r})`} />
                ))}
              </g>
              <circle data-p="centro" r="3.03" fill="#ffcf5a" />
            </g>
          </g>
          <path d="M-34 -42H34L26 0H-26Z" fill={u("barro")} className={s.ol} />
          <rect x="-38" y="-50" width="76" height="10" rx="2" fill="#b85c32" className={s.ol} />
          <path d="M-30 -22H30" stroke="#8f3f1e" strokeWidth="1.5" opacity=".6" />
        </g>

        {/* matero 3: suculenta */}
        <g transform="translate(548 166)">
          <g data-p="p2" className={`${s.mece} ${s.meceC}`} style={{ scale: escalaPlanta(0, 2) }}>
            <path
              d="M0 -24C-14 -30 -20 -44 -16 -50C-6 -44 -2 -34 0 -24Z M0 -24C14 -30 20 -44 16 -50C6 -44 2 -34 0 -24Z M0 -24C-6 -36 -4 -54 0 -58C4 -54 6 -36 0 -24Z M0 -24C-18 -24 -26 -32 -28 -38C-16 -38 -6 -32 0 -24Z M0 -24C18 -24 26 -32 28 -38C16 -38 6 -32 0 -24Z"
              fill="#7fc9a0"
              className={s.ol}
              style={{ strokeWidth: 1.2 }}
            />
          </g>
          <path d="M-22 -26H22L18 0H-18Z" fill={u("barro")} className={s.ol} />
          <rect x="-24" y="-30" width="48" height="7" rx="2" fill="#b85c32" className={s.ol} />
        </g>

        {/* carrete de manguera */}
        <ellipse cx="690" cy="223" rx="62" ry="5" fill={u("sombra")} />
        <path d="M650 214L664 120M730 214L716 120" stroke="#2a2f38" strokeWidth="5" strokeLinecap="round" />
        <path d="M664 120Q690 104 716 120" fill="none" stroke="#2a2f38" strokeWidth="5" strokeLinecap="round" />
        <circle cx="650" cy="214" r="9" fill="#1c222c" className={s.ol} />
        <circle cx="730" cy="214" r="9" fill="#1c222c" className={s.ol} />
        <g data-p="carrete" transform="translate(690 172)">
          <circle r="36" fill="#e3262f" className={s.ol} />
          <circle r="29" fill={u("manguera")} className={s.ol} />
          <circle r="23" fill="none" stroke="#2f8a3a" strokeWidth="2" />
          <circle r="17" fill="none" stroke="#2f8a3a" strokeWidth="2" />
          <circle r="10" fill="#e3262f" className={s.ol} />
          <path d="M-6 0H6M0 -6V6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* pistola apoyada sobre el carrete, conectada por el mango */}
        <path d="M719 168C742 160 738 140 726 132" fill="none" stroke={u("manguera")} strokeWidth="7" strokeLinecap="round" />
        <g transform="translate(722 108) rotate(-4)">
          <path d="M2 -6H-30Q-36 -6 -36 0Q-36 6 -30 6H2Q6 6 6 0Q6 -6 2 -6Z" fill="#ffb020" className={s.ol} />
          <rect x="-50" y="-4.5" width="15" height="9" rx="2" fill={u("acero")} className={s.ol} />
          <rect x="-54" y="-3.5" width="5" height="7" rx="1.5" fill="#2a2f38" />
          <path d="M-2 6L2 26Q2 28 4 28H10Q12 28 11 25L6 6Z" fill="#ffb020" className={s.ol} />
          <path d="M-16 6Q-18 20 -4 22" fill="none" stroke="#2a2f38" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <text x="636" y="246">
          MANGUERA ½&quot; · 20 m
        </text>

        {/* agua */}
        <path className={s.chorro} d="M666 104Q570 26 470 96" />
        <path className={s.chorro2} d="M666 108Q578 46 492 104" />
        <g data-p="gotas" className={s.gotas} />

        {/* mariposa */}
        <g data-p="mariposa" className={s.mariposa} transform="translate(520 60)">
          <path className={s.ala} d="M0 0C-10 -12 -18 -8 -16 0C-18 8 -10 10 0 2Z" fill="#ffcf5a" stroke="#0b1d33" strokeWidth="1" />
          <path className={`${s.ala} ${s.alaD}`} d="M0 0C10 -12 18 -8 16 0C18 8 10 10 0 2Z" fill="#ffcf5a" stroke="#0b1d33" strokeWidth="1" />
          <path d="M0 -4V6" stroke="#0b1d33" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </BannerPlano>
  );
}
