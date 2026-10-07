"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

type Props = {
  /** Banners ya renderizados (uno por diapositiva). */
  diapositivas: ReactNode[];
  /** Texto accesible de cada diapositiva, en el mismo orden. */
  etiquetas: string[];
  className?: string;
};

const INTERVALO_MS = 6000;

const claseFoco = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco";

const claseFlecha = `absolute top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-chip bg-pico-blanco/90 text-pico-azul shadow-tarjeta transition duration-200 hover:bg-pico-rojo hover:text-pico-blanco motion-safe:hover:scale-110 md:flex ${claseFoco}`;

/**
 * Carrusel del banner principal. Pasa solo, salvo que el usuario lo pause, lo navegue a mano
 * o prefiera movimiento reducido; también se detiene mientras el mouse o el foco están encima.
 */
export default function CarruselBanners({ diapositivas, etiquetas, className = "" }: Props) {
  const total = diapositivas.length;
  const [indice, setIndice] = useState(0);
  const [encima, setEncima] = useState(false);
  const [detenido, setDetenido] = useState(false);
  const inicioToque = useRef<number | null>(null);

  /** Navegación manual: el usuario toma el control y el carrusel deja de pasar solo. */
  const ir = (nuevo: number) => {
    setDetenido(true);
    setIndice((nuevo + total) % total);
  };

  useEffect(() => {
    if (encima || detenido || total < 2) return;
    const temporizador = setTimeout(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setIndice((i) => (i + 1) % total);
    }, INTERVALO_MS);
    return () => clearTimeout(temporizador);
  }, [indice, encima, detenido, total]);

  if (total === 0) return null;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Promociones destacadas"
      className={`relative overflow-hidden rounded-banner ${className}`}
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onFocus={() => setEncima(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setEncima(false)}
      onTouchStart={(e) => (inicioToque.current = e.touches[0].clientX)}
      onTouchCancel={() => (inicioToque.current = null)}
      onTouchEnd={(e) => {
        if (inicioToque.current === null) return;
        const distancia = e.changedTouches[0].clientX - inicioToque.current;
        inicioToque.current = null;
        if (Math.abs(distancia) > 40) ir(indice + (distancia < 0 ? 1 : -1));
      }}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${indice * 100}%)` }}
      >
        {diapositivas.map((diapositiva, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${total}: ${etiquetas[i] ?? ""}`}
            className="h-full w-full shrink-0"
            inert={i !== indice}
          >
            {diapositiva}
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button type="button" onClick={() => ir(indice - 1)} className={`${claseFlecha} left-3`} aria-label="Banner anterior">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" onClick={() => ir(indice + 1)} className={`${claseFlecha} right-3`} aria-label="Banner siguiente">
            <ChevronRight className="size-4" />
          </button>

          {/* Abajo a la derecha para no tapar el título ni el botón del banner. */}
          <div className="absolute right-3 bottom-3 flex items-center rounded-chip bg-pico-azul-oscuro/60 px-1">
            <button
              type="button"
              onClick={() => setDetenido((d) => !d)}
              className={`flex size-8 items-center justify-center rounded-chip text-pico-blanco ${claseFoco}`}
              aria-label={detenido ? "Reanudar carrusel" : "Pausar carrusel"}
            >
              {detenido ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            </button>
            {diapositivas.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => ir(i)}
                aria-label={`Ir al banner ${i + 1}`}
                aria-current={i === indice ? "true" : undefined}
                className={`group/punto flex h-8 items-center justify-center rounded-chip ${i === indice ? "w-9" : "w-6"} ${claseFoco}`}
              >
                <span
                  className={`h-2 rounded-chip transition-all ${
                    i === indice ? "w-6 bg-pico-rojo" : "w-2 bg-pico-blanco/50 group-hover/punto:bg-pico-blanco/80"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
