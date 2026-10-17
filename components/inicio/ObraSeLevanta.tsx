"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

// PRUEBA — Modelo A (rama `prueba/animacion-herramientas`): banner "Todo para tu obra en un solo lugar".
// Concreto encofrado de fondo y, a la derecha, una pila de bloques reales que SE LEVANTA sola la primera vez
// que el banner se ve (es el primero del carrusel: lo primero que ve el cliente), con polvo al asentarse el
// último bloque. Al pasar el cursor, los bloques de arriba brincan y vuelven a asentarse. Delante, el saco de
// cemento y el palustre. Fotos generadas con Higgsfield (public/banners/obra/).
// Solo la monta BannerInicio cuando banner.id === "obra".

/** Bloques de la pila, en unidades del ancho de la composición (cqw). La fila de abajo ya está en reposo. */
const BLOQUES = [
  { x: 0, y: 0, fila: 0 },
  { x: 25, y: 0, fila: 0 },
  { x: 50, y: 0, fila: 0 },
  { x: 12.5, y: 15, fila: 1 },
  { x: 37.5, y: 15, fila: 1 },
  { x: 25, y: 30, fila: 2 },
];
const ANCHO_BLOQUE = 30;
const RETRASO_MS = 140;

export default function ObraSeLevanta() {
  const capa = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [levantada, setLevantada] = useState(false);

  useEffect(() => {
    const el = capa.current;
    if (!el) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setVisible(true);
        observador.disconnect();
      },
      { threshold: 0.5 },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  // Un instante después de verse, para que el cliente alcance a ver cómo se levanta.
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setLevantada(true), 250);
    return () => clearTimeout(t);
  }, [visible]);

  const ultimo = (BLOQUES.length - 1) * RETRASO_MS;

  return (
    <div ref={capa} className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Concreto encofrado: gris cálido con poros finos y las juntas horizontales de las tablas del encofrado. */}
      <div className="absolute inset-0 bg-gradient-to-br from-pico-blanco via-concreto to-concreto-oscuro" />
      <div className="absolute inset-0 bg-[radial-gradient(var(--color-concreto-oscuro)_1px,transparent_1.6px)] bg-[size:9px_9px] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(var(--color-pico-blanco)_1px,transparent_1.4px)] bg-[size:13px_13px] bg-[position:4px_6px] opacity-40" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_calc(25%-2px),var(--color-concreto-oscuro)_calc(25%-2px),var(--color-concreto-oscuro)_25%)] opacity-50" />
      {/* Nivel láser: una línea roja fina que cruza el muro a la altura de la pila. */}
      <div className="absolute top-[38%] right-0 left-[52%] h-px bg-gradient-to-r from-transparent via-pico-rojo/70 to-transparent md:top-[34%]" />

      {/* Composición: pila de bloques, saco y palustre. Medidas en cqw (ancho de la composición). */}
      <div className="absolute right-[2%] bottom-[9%] w-[50%] [container-type:inline-size] md:right-[4%] md:bottom-[8%] md:w-[46%] lg:right-[6%] lg:w-[42%]">
        <div className="relative h-[56cqw]">
          {/* Sombra de la pila en el piso. */}
          <span className="absolute -bottom-[2cqw] left-[2cqw] h-[5cqw] w-[90cqw] rounded-chip bg-pico-azul-oscuro/30 blur-lg" />

          {BLOQUES.map((b, i) => {
            const cae = b.fila > 0;
            return (
              <span
                key={i}
                className={`absolute block transition duration-700 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none ${
                  cae && !levantada ? "-translate-y-[150cqw] opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100" : "translate-y-0 opacity-100"
                }`}
                style={{ left: `${b.x}cqw`, bottom: `${b.y}cqw`, width: `${ANCHO_BLOQUE}cqw`, transitionDelay: `${i * RETRASO_MS}ms` }}
              >
                {/* Brinco al pasar el cursor (solo los de arriba), cada uno con su retraso. */}
                <span
                  className={`block ${cae ? "motion-safe:group-hover:animate-brinco" : ""}`}
                  style={{ animationDelay: `${(i - 3) * 70}ms` }}
                >
                  {visible && (
                    <Image
                      src="/banners/obra/bloque.webp"
                      alt=""
                      width={520}
                      height={417}
                      sizes="(min-width: 1536px) 210px, (min-width: 1024px) 13vw, (min-width: 768px) 14vw, 15vw"
                      className="h-auto w-full drop-shadow-lg drop-shadow-pico-azul-oscuro/30"
                    />
                  )}
                </span>
              </span>
            );
          })}

          {/* Polvo cuando se asienta el último bloque (una vez). */}
          {levantada && (
            <span
              className="absolute bottom-[29cqw] left-[40cqw] block h-[10cqw] w-[44cqw] rounded-chip bg-pico-blanco/80 opacity-0 blur-md motion-safe:animate-polvo"
              style={{ animationDelay: `${ultimo + 420}ms` } as CSSProperties}
            />
          )}

          {visible && (
            <>
              {/* Saco de cemento delante de la pila, a la derecha. */}
              <span className="absolute -bottom-[1cqw] left-[68cqw] block w-[27cqw] transition-transform duration-500 ease-out motion-safe:group-hover:-rotate-3">
                <Image
                  src="/banners/obra/saco-cemento.webp"
                  alt=""
                  width={463}
                  height={760}
                  sizes="(min-width: 1536px) 190px, (min-width: 1024px) 12vw, 14vw"
                  className="h-auto w-full drop-shadow-xl drop-shadow-pico-azul-oscuro/35"
                />
              </span>
              {/* Palustre apoyado, a la izquierda. */}
              <span className="absolute bottom-0 -left-[8cqw] block w-[22cqw] -rotate-[28deg] transition-transform duration-500 ease-out motion-safe:group-hover:-rotate-[38deg]">
                <Image
                  src="/herramientas/palustre.webp"
                  alt=""
                  width={600}
                  height={516}
                  sizes="(min-width: 1024px) 10vw, 12vw"
                  className="h-auto w-full drop-shadow-lg drop-shadow-pico-azul-oscuro/35"
                />
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
