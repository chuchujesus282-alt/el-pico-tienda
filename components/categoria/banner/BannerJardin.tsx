"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/**
 * Banner de la categoría Hogar y jardín (va en `EncabezadoPagina` con la prop `escena`). Misma familia que los demás:
 * azul marino con el título a la izquierda y, a la derecha, cortada en diagonal, una foto real de un jardín con sus
 * canteros, con un borde de listón de madera en el corte. Una pala real está clavada en la grama (su base, tapada con
 * tierra) y una manguera fuera de cuadro riega los canteros: chorros de agua en arco que van y vienen, con gotas y
 * salpicaduras donde caen.
 * - Clic / Enter / toque: cierra o abre la llave.
 * - Mouse encima o foco con teclado: el chorro sale con más fuerza (más largo y con más gotas).
 * - "Reducir movimiento": el agua se ve quieta (sin correr ni barrer).
 * El agua es un SVG que ocupa la escena (se estira con ella; el trazo no se deforma). Fotos en public/banners/jardin/.
 */

const J = "/banners/jardin/";

/** Chorros: curvas de la boquilla (fuera de cuadro, arriba a la derecha) a las plantas del cantero. viewBox 0 0 100 100. */
const CHORROS = [
  { d: "M104 3 C 97 -7, 82 -3, 74 32", ancho: 1.5, retraso: 0 },
  { d: "M104 4 C 96 -5, 78 -1, 67 36", ancho: 1.2, retraso: 0.17 },
  { d: "M104 5 C 99 -2, 87 1, 81 30", ancho: 1.1, retraso: 0.33 },
  { d: "M104 2 C 95 -9, 74 -6, 61 33", ancho: 0.9, retraso: 0.5 },
  { d: "M104 6 C 100 1, 91 5, 87 36", ancho: 0.8, retraso: 0.24 },
];
/** Donde caen: gotas que rebotan y un anillo de salpicadura. */
const CAIDAS = [
  { x: 74, y: 32 },
  { x: 67, y: 36 },
  { x: 81, y: 30 },
  { x: 61, y: 33 },
  { x: 87, y: 36 },
];

export default function BannerJardin() {
  const raiz = useRef<HTMLDivElement>(null);
  const [abierta, setAbierta] = useState(true);
  const [tocado, setTocado] = useState(false);
  const [visible, setVisible] = useState(true);
  const puntero = useRef("");

  // Fuera de pantalla el agua se detiene (no gasta).
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={raiz}
      className="bp absolute inset-0 overflow-hidden"
      data-activo={tocado || undefined}
      data-agua={abierta ? "abierta" : "cerrada"}
      data-pausa={visible ? undefined : true}
    >
      {/* Jardín real, cortado en diagonal. La foto va contrarrestando el sesgo de la placa (no se deforma). */}
      <div className="bp-placa absolute -inset-y-6 -right-24 left-[56%] overflow-hidden shadow-tarjeta-hover md:left-[51%] xl:left-[49%]">
        <div className="absolute inset-0 -left-16 skew-x-12">
          <Image src={`${J}jardin.webp`} alt="" fill priority sizes="(min-width: 1280px) 760px, 55vw" className="object-cover object-[60%_62%]" />
        </div>
        {/* Luz de tarde desde la derecha y un poco de sombra abajo, para que el agua y la pala resalten. */}
        <div className="absolute inset-0 bg-[linear-gradient(200deg,color-mix(in_srgb,var(--color-amarillo-obra)_16%,transparent)_0%,transparent_45%,color-mix(in_srgb,var(--color-pico-azul-oscuro)_45%,transparent)_100%)]" />
      </div>
      {/* Borde del corte: listón de madera de los canteros. */}
      <div className="bp-placa bj-liston absolute -inset-y-6 left-[calc(56%-0.55rem)] w-[1.1rem] md:left-[calc(51%-0.55rem)] xl:left-[calc(49%-0.55rem)]" />

      <button
        type="button"
        aria-label={abierta ? "Cerrar el agua" : "Abrir el agua"}
        aria-pressed={abierta}
        onPointerDown={(e) => (puntero.current = e.pointerType)}
        onClick={() => {
          if (puntero.current === "touch") setTocado(true);
          puntero.current = "";
          setAbierta((a) => !a);
        }}
        className="bj-escena absolute inset-y-0 right-0 left-[55%] cursor-pointer focus-visible:outline-none md:left-[50%]"
      >
        {/* Agua: chorros en arco que barren de un lado a otro, gotas sueltas y salpicaduras al caer. */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="bj-agua absolute inset-0 size-full overflow-visible" aria-hidden>
          <g className="bj-barrido">
            {CHORROS.map((c, i) => (
              <g key={i} style={{ "--r": `${c.retraso}s` } as CSSProperties}>
                {/* Cuerpo del chorro (tenue) y el agua que corre por él (trazos que avanzan). */}
                <path d={c.d} className="bj-cuerpo" style={{ strokeWidth: c.ancho * 3 }} />
                <path d={c.d} pathLength={100} className="bj-corre" style={{ strokeWidth: c.ancho }} />
                <path d={c.d} pathLength={100} className="bj-gotas" style={{ strokeWidth: c.ancho * 1.4 }} />
              </g>
            ))}
            {CAIDAS.map((p, i) => (
              <g key={i} transform={`translate(${p.x} ${p.y})`} style={{ "--r": `${i * 0.13}s` } as CSSProperties}>
                <ellipse className="bj-anillo" rx="3.2" ry="1.1" />
                <circle className="bj-salto bj-salto-1" r="0.55" />
                <circle className="bj-salto bj-salto-2" r="0.45" />
                <circle className="bj-salto bj-salto-3" r="0.4" />
              </g>
            ))}
          </g>
        </svg>

        {/* Pala clavada en la grama: la base de la hoja queda dentro de un montoncito de tierra. */}
        <span className="absolute bottom-[5%] left-[36%] block aspect-[230/547] h-[56%] md:left-[18%] md:h-[64%] xl:left-[20%]">
          <span className="absolute -bottom-[1%] left-[30%] h-[5%] w-[110%] -translate-x-1/2 rounded-[50%] bg-pico-azul-oscuro/45 blur-md" />
          <Image src={`${J}pala.webp`} alt="" width={230} height={547} sizes="(min-width: 768px) 110px, 70px" className="bj-pala relative size-full object-contain drop-shadow-xl drop-shadow-pico-azul-oscuro/50" />
          <Image src={`${J}tierra.webp`} alt="" width={520} height={170} sizes="200px" className="absolute -bottom-[3%] left-[-42%] w-[150%] max-w-none" />
        </span>
      </button>

      <span className="sr-only" aria-live="polite">
        {abierta ? "" : "Agua cerrada"}
      </span>
    </div>
  );
}
