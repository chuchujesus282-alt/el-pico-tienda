"use client";

import { type PointerEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";
import ImagenProducto from "@/components/producto/ImagenProducto";

type Props = {
  src: string | null;
  alt: string;
};

const sinSuscripcion = () => () => {};
const ZOOM_LUPA = 2;
const ZOOM_PANTALLA = 2.5;

/** Posición del puntero dentro del elemento, en porcentaje (para transform-origin). */
function origen(e: { clientX: number; clientY: number; currentTarget: Element }) {
  const r = e.currentTarget.getBoundingClientRect();
  return `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
}

/**
 * Imagen grande del producto.
 * - Con mouse: lupa que amplía la zona bajo el cursor.
 * - Clic / toque: abre la imagen a pantalla completa, donde se puede acercar y recorrer.
 */
export default function GaleriaZoom({ src, alt }: Props) {
  const [lupa, setLupa] = useState<string | null>(null); // transform-origin mientras el mouse está encima
  const [abierta, setAbierta] = useState(false);
  const [acercada, setAcercada] = useState(false);
  const [origenGrande, setOrigenGrande] = useState("50% 50%");
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);

  useEffect(() => {
    if (!abierta) return;
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && setAbierta(false);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", alPresionar);
    cerrarRef.current?.focus();
    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", alPresionar);
    };
  }, [abierta]);

  const abrir = () => {
    setAcercada(false);
    setOrigenGrande("50% 50%");
    setAbierta(true);
  };

  return (
    <>
      <div className="group relative">
        <button
          type="button"
          onClick={abrir}
          onPointerMove={(e) => e.pointerType === "mouse" && setLupa(origen(e))}
          onPointerLeave={() => setLupa(null)}
          className="block w-full cursor-zoom-in overflow-hidden rounded-banner border border-gris-borde bg-pico-blanco shadow-tarjeta transition-shadow duration-300 hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-marino"
          aria-label={`Ampliar imagen: ${alt}`}
        >
          <div
            className="transition-transform duration-200 ease-out"
            style={lupa ? { transform: `scale(${ZOOM_LUPA})`, transformOrigin: lupa } : undefined}
          >
            <ImagenProducto src={src} alt={alt} sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw" />
          </div>
        </button>
        <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-chip bg-logo-marino/90 px-3 py-1.5 text-xs font-semibold text-pico-blanco shadow-tarjeta transition-opacity duration-200 group-hover:opacity-0">
          <Maximize2 className="size-3.5" aria-hidden />
          <span className="hidden md:inline">Pasa el mouse o haz clic para ampliar</span>
          <span className="md:hidden">Toca para ampliar</span>
        </span>
      </div>

      {/* Portal al <body>: la animación de entrada de la columna haría que "fixed" quede encerrado en ella. */}
      {montado && createPortal(
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
          abierta ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        inert={!abierta}
        role="dialog"
        aria-modal="true"
        aria-label={`Imagen ampliada: ${alt}`}
      >
        <div className="absolute inset-0 bg-logo-marino-oscuro/85" onClick={() => setAbierta(false)} aria-hidden />
        <div
          className={`relative w-full max-w-3xl transition-transform duration-300 ${abierta ? "scale-100" : "scale-95"}`}
        >
          <div className="absolute -top-12 right-0 flex gap-2">
            <button
              type="button"
              onClick={() => setAcercada((v) => !v)}
              className="flex size-10 items-center justify-center rounded-chip bg-pico-blanco text-logo-marino shadow-tarjeta hover:bg-logo-marino-claro"
              aria-label={acercada ? "Alejar" : "Acercar"}
            >
              {acercada ? <ZoomOut className="size-5" /> : <ZoomIn className="size-5" />}
            </button>
            <button
              ref={cerrarRef}
              type="button"
              onClick={() => setAbierta(false)}
              className="flex size-10 items-center justify-center rounded-chip bg-pico-blanco text-logo-marino shadow-tarjeta hover:bg-logo-marino-claro"
              aria-label="Cerrar imagen"
            >
              <X className="size-5" />
            </button>
          </div>
          <div
            className={`overflow-hidden rounded-banner bg-pico-blanco ${acercada ? "cursor-zoom-out" : "cursor-zoom-in"}`}
            onClick={(e) => {
              setOrigenGrande(origen(e));
              setAcercada((v) => !v);
            }}
            onPointerMove={(e: PointerEvent<HTMLDivElement>) => acercada && setOrigenGrande(origen(e))}
          >
            <div
              className="transition-transform duration-300 ease-out"
              style={{ transform: `scale(${acercada ? ZOOM_PANTALLA : 1})`, transformOrigin: origenGrande }}
            >
              <ImagenProducto src={src} alt={alt} sizes="(min-width: 768px) 768px, 100vw" />
            </div>
          </div>
          <p className="mt-3 text-center text-[13px] text-pico-blanco/80">
            {acercada ? "Mueve el cursor o el dedo para recorrer la imagen" : "Haz clic o toca la imagen para acercar"}
          </p>
        </div>
      </div>,
      document.body,
      )}
    </>
  );
}
