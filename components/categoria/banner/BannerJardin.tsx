"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/**
 * Banner de la categoría Hogar y jardín (va en `EncabezadoPagina` con la prop `escena`). Hermano del de Herramientas:
 * azul marino con el título a la izquierda y, con el mismo corte difuminado, una cerca de madera de jardín (tablas en
 * CSS) con herramientas colgadas en sus ganchos: la pala real, la paleta de trasplante real y una manguera enrollada
 * (dibujada, con su boquilla) que gotea. Al pie de la cerca, grama viva en canvas que se mece con el viento.
 * - Clic / Enter / toque: la manguera riega (un chorro corto que cae en la grama).
 * - Mouse encima o foco con teclado: sopla más viento y las herramientas se mecen un poco más.
 * - "Reducir movimiento": todo quieto. Fuera de pantalla, la grama no se dibuja.
 * Fotos en public/banners/jardin/; colores de los tokens `tablero*`, `grama*`, `agua`, `pico-*`.
 */

const J = "/banners/jardin/";

type Hoja = { x: number; y: number; alto: number; ancho: number; color: string; fase: number; inclina: number };

function rgb(nombre: string): number[] {
  const v = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  const n = parseInt(v.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const mezcla = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const css = (c: number[], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
function semilla(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Grama viva al pie de la cerca: hojas en canvas que se mecen; con el banner activo sopla más. */
function Grama({ raiz }: { raiz: React.RefObject<HTMLDivElement | null> }) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = lienzo.current;
    const cont = raiz.current;
    if (!canvas || !cont) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const grama = rgb("--color-grama");
    const claro = rgb("--color-grama-claro");
    const oscuro = rgb("--color-grama-oscuro");
    let W = 0;
    let H = 0;
    let hojas: Hoja[] = [];
    const armar = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const azar = semilla(11);
      hojas = [];
      const cuantas = Math.min(1600, Math.round((W * H) / 22));
      for (let i = 0; i < cuantas; i++) {
        const p = Math.pow(azar(), 0.7);
        const escala = 0.5 + p * 0.9;
        hojas.push({
          x: azar() * (W + 30) - 15,
          y: H * 0.35 + p * H * 0.68,
          alto: (0.3 + azar() * 0.5) * H * escala,
          ancho: (1.2 + azar() * 1.6) * escala,
          color: css(mezcla(mezcla(grama, claro, azar() * 0.7), oscuro, (1 - p) * 0.35 + azar() * 0.3)),
          fase: azar() * Math.PI * 2,
          inclina: (azar() - 0.5) * 0.5,
        });
      }
      hojas.sort((a, b) => a.y - b.y);
    };
    let t = 0;
    let previo = performance.now();
    let cuadro = 0;
    let visible = true;
    let fuerza = 0;
    const pintar = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - previo) / 1000);
      previo = ahora;
      t += dt;
      const activo = cont.closest("header")?.matches(":hover, :has(:focus-visible)") || cont.dataset.activo ? 1 : 0;
      fuerza += (activo - fuerza) * Math.min(1, dt * 3);
      const viento = 0.5 + fuerza * 0.7;
      ctx.clearRect(0, 0, W, H);
      // Tierra oscura bajo la grama, para que no se vea la cerca entre las hojas.
      const s = ctx.createLinearGradient(0, H * 0.4, 0, H);
      s.addColorStop(0, css(oscuro, 0));
      s.addColorStop(0.5, css(oscuro, 0.9));
      s.addColorStop(1, css(oscuro));
      ctx.fillStyle = s;
      ctx.fillRect(0, 0, W, H);
      for (const h of hojas) {
        const rafaga = Math.sin(t * 0.9 - h.x * 0.012) * 0.5 + 0.5;
        const doblez = (h.inclina + (rafaga * 0.5 + Math.sin(t * 2.3 + h.fase) * 0.12) * viento) * h.alto;
        ctx.beginPath();
        ctx.moveTo(h.x - h.ancho, h.y);
        ctx.quadraticCurveTo(h.x - h.ancho * 0.4, h.y - h.alto * 0.55, h.x - doblez, h.y - h.alto * (1 - Math.min(0.3, Math.abs(doblez) / h.alto) * 0.5));
        ctx.quadraticCurveTo(h.x + h.ancho * 0.4, h.y - h.alto * 0.55, h.x + h.ancho, h.y);
        ctx.fillStyle = h.color;
        ctx.fill();
      }
      if (!reducido && visible) cuadro = requestAnimationFrame(pintar);
    };
    const arrancar = () => {
      cancelAnimationFrame(cuadro);
      previo = performance.now();
      cuadro = requestAnimationFrame(pintar);
    };
    armar();
    arrancar();
    const ro = new ResizeObserver(() => {
      armar();
      if (reducido) pintar(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reducido) arrancar();
    });
    io.observe(cont);
    return () => {
      cancelAnimationFrame(cuadro);
      ro.disconnect();
      io.disconnect();
    };
  }, [raiz]);
  return <canvas ref={lienzo} className="absolute inset-x-0 bottom-0 h-[30%] w-full" aria-hidden />;
}

/** Manguera enrollada colgando de su gancho, con la punta y la boquilla abajo. viewBox 0 0 100 150. */
function Manguera() {
  // Vueltas del rollo: círculos que cuelgan del mismo punto (arriba), cada uno un poco corrido.
  const vueltas = [
    { cx: 50, cy: 40, r: 34 },
    { cx: 47, cy: 42, r: 35 },
    { cx: 53, cy: 43, r: 33 },
    { cx: 50, cy: 45, r: 34 },
  ];
  const capas = [
    { clase: "bj-tubo-sombra", ancho: 9, dy: 0 },
    { clase: "bj-tubo", ancho: 7, dy: -0.4 },
    { clase: "bj-tubo-luz", ancho: 3, dy: -1.6 },
    { clase: "bj-tubo-franja", ancho: 1.2, dy: 1.4 },
  ];
  const punta = "M78 66 C 88 90, 80 112, 66 124";
  return (
    <svg viewBox="0 0 100 150" className="bh-sombra size-full overflow-visible" aria-hidden>
      {capas.map((c) => (
        <g key={c.clase} className={c.clase} strokeWidth={c.ancho} transform={`translate(0 ${c.dy})`} fill="none" strokeLinecap="round">
          {vueltas.map((v, i) => (
            <circle key={i} cx={v.cx} cy={v.cy} r={v.r} />
          ))}
          <path d={punta} />
        </g>
      ))}
      {/* Trenzado del tubo (líneas finas cortadas). */}
      <g className="bj-trenza" fill="none" strokeWidth="5" strokeDasharray="0.8 2.2">
        {vueltas.map((v, i) => (
          <circle key={i} cx={v.cx} cy={v.cy} r={v.r} />
        ))}
        <path d={punta} />
      </g>
      {/* Boquilla: casquillo naranja y pico oscuro, apuntando abajo a la izquierda. */}
      <g transform="translate(66 124) rotate(128)">
        <rect className="bj-casquillo" x="-3" y="-6" width="12" height="12" rx="2.4" />
        <rect className="bj-pico" x="8" y="-4.2" width="11" height="8.4" rx="2" />
      </g>
    </svg>
  );
}

export default function BannerJardin() {
  const raiz = useRef<HTMLDivElement>(null);
  const [riego, setRiego] = useState(0);
  const [tocado, setTocado] = useState(false);
  const puntero = useRef("");

  return (
    <div ref={raiz} className="bp absolute inset-0 overflow-hidden" data-activo={tocado || undefined}>
      {/* Cerca de madera de jardín, con el mismo corte difuminado que los demás; grama viva al pie. */}
      <div className="bp-placa bp-difumina bj-cerca absolute -inset-y-6 -right-24 left-[56%] overflow-hidden md:left-[51%] xl:left-[49%]">
        <div className="bh-lampara absolute inset-0" />
        <div className="absolute inset-y-0 -left-16 right-0 skew-x-12">
          <Grama raiz={raiz} />
        </div>
        <div className="bp-funde absolute inset-y-0 left-0" />
      </div>

      <button
        type="button"
        aria-label="Regar con la manguera"
        onPointerDown={(e) => (puntero.current = e.pointerType)}
        onClick={() => {
          if (puntero.current === "touch") setTocado(true);
          puntero.current = "";
          setRiego((r) => r + 1);
        }}
        className="bj-escena absolute inset-y-0 right-0 left-[55%] cursor-pointer focus-visible:outline-none md:left-[50%]"
      >
        {/* Pala, colgada de su agarre (desde 768px). */}
        <span className="absolute top-[7%] left-[30%] hidden md:block">
          <span className="bh-gancho absolute -top-[3px] left-1/2 block h-3 w-1.5 -translate-x-1/2 rounded-b-full border-x-2 border-b-2 border-gris-borde" />
          <span className="bh-colgada absolute top-1 left-1/2 block h-[74cqh] origin-top" style={{ "--i": 0 } as CSSProperties}>
            <Image src={`${J}pala-entera.webp`} alt="" width={136} height={640} sizes="70px" className="bh-sombra h-full w-auto max-w-none -translate-x-1/2" />
          </span>
        </span>

        {/* Paleta de trasplante (desde 1280px). */}
        <span className="absolute top-[9%] left-[46%] hidden xl:block">
          <span className="bh-gancho absolute -top-[3px] left-1/2 block h-3 w-1.5 -translate-x-1/2 rounded-b-full border-x-2 border-b-2 border-gris-borde" />
          <span className="bh-colgada absolute top-1 left-1/2 block h-[44cqh] origin-top" style={{ "--i": 2 } as CSSProperties}>
            <Image src={`${J}palustre.webp`} alt="" width={199} height={640} sizes="60px" className="bh-sombra h-full w-auto max-w-none -translate-x-1/2" />
          </span>
        </span>

        {/* Manguera enrollada en su gancho; de la boquilla caen gotas (y un chorro al hacer clic). */}
        <span className="absolute top-[8%] right-[24cqh] md:right-[30cqh] xl:right-[34cqh]">
          <span className="bh-gancho absolute -top-[3px] left-1/2 block h-3 w-1.5 -translate-x-1/2 rounded-b-full border-x-2 border-b-2 border-gris-borde" />
          <span className="bh-colgada absolute top-1 left-1/2 block h-[58cqh] w-[39cqh] -translate-x-1/2 origin-top md:h-[66cqh] md:w-[44cqh]" style={{ "--i": 1 } as CSSProperties}>
            <Manguera />
            {/* Gotas: salen de la punta de la boquilla (abajo a la izquierda del dibujo). */}
            <span className="absolute top-[89%] left-[52%] block">
              {[0, 1, 2].map((i) => (
                <span key={i} className="bj-gota absolute block" style={{ "--i": i } as CSSProperties} />
              ))}
              {riego > 0 &&
                Array.from({ length: 22 }, (_, i) => <span key={`${riego}-${i}`} className="bj-chorro absolute block" style={{ "--i": i } as CSSProperties} />)}
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}
