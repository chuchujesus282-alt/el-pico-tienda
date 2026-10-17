"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowUp } from "lucide-react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";

const sinSuscripcion = () => () => {};

/**
 * Flecha flotante que lleva al principio de la página, justo encima de la bola del carrito (`BotonCarritoFlotante`).
 * Es su gemela: mismo diseño (blanca con borde e ícono rojos), misma animación (cae desde arriba con rebote) y la
 * controla el mismo `BotonCarrito` del header, así que las dos aparecen y desaparecen a la vez.
 * Solo desde 768px: en el teléfono la pestaña "Inicio" de la barra inferior (`BarraInferiorMovil`) hace este trabajo.
 * Lleva alrededor un anillo rojo que se completa según cuánto de la página se ha leído (se actualiza directo en
 * el SVG, sin volver a dibujar el componente en cada scroll).
 */
export default function BotonSubir({ visible }: { visible: boolean }) {
  const { abierto } = useCarrito();
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  const anillo = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let cuadro = 0;
    const medir = () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const leido = total > 0 ? Math.min(1, window.scrollY / total) : 0;
        anillo.current?.style.setProperty("stroke-dashoffset", String(1 - leido));
      });
    };
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [montado]);

  if (!montado) return null;

  const mostrar = visible && !abierto;

  const subir = () => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducir ? "auto" : "smooth" });
  };

  // Portal al <body>: así "fixed" no queda encerrado en un contenedor con animación.
  return createPortal(
    <button
      type="button"
      onClick={subir}
      inert={!mostrar}
      aria-label="Volver al principio de la página"
      className={`group fixed derecha-flotante z-40 flex size-14 cursor-pointer items-center justify-center rounded-chip border-2 border-pico-rojo bg-pico-blanco text-pico-rojo shadow-tarjeta-hover transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-rojo bottom-[calc(5.25rem+env(safe-area-inset-bottom))] max-md:hidden ${
        mostrar
          ? "scale-100 opacity-100"
          : "pointer-events-none -translate-y-24 scale-90 opacity-0 motion-reduce:translate-y-0 motion-reduce:scale-100"
      }`}
    >
      {/* Anillo de lectura, por fuera del borde. */}
      <svg viewBox="0 0 66 66" className="pointer-events-none absolute -inset-[7px] size-[calc(100%+14px)] -rotate-90" aria-hidden>
        <circle cx="33" cy="33" r="31.5" fill="none" strokeWidth="2.5" className="stroke-pico-rojo/15" />
        <circle
          ref={anillo}
          cx="33"
          cy="33"
          r="31.5"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
          className="stroke-pico-rojo"
        />
      </svg>
      <ArrowUp className="size-6 transition-transform duration-300 ease-(--curva-suave) motion-safe:group-hover:-translate-y-0.5" aria-hidden />
    </button>,
    document.body,
  );
}
