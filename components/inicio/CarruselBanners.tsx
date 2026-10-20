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

// Flechas difuminadas a cada lado, por dentro del banner: vidrio esmerilado azul translúcido con aro blanco;
// al pasar el mouse se llenan de blanco. z-20: el banner activo va en z-10 y sin esto las tapa.
// En el teléfono no se muestran (taparían el texto): ahí se pasa deslizando con el dedo.
const claseFlecha = `absolute top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-chip bg-pico-azul-oscuro/25 text-pico-blanco ring-1 ring-pico-blanco/40 backdrop-blur-md transition duration-300 ease-(--curva-suave) hover:bg-pico-blanco hover:text-pico-azul motion-safe:active:scale-95 md:flex ${claseFoco}`;

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
  // El dedo se movió de lado: el toque fue un intento de deslizar, no de abrir el banner.
  const deslizo = useRef(false);

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

  // La barra del indicador actual se llena solo mientras el carrusel corre de verdad.
  const corriendo = !encima && !detenido && total > 1;

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
      onTouchStart={(e) => {
        inicioToque.current = e.touches[0].clientX;
        deslizo.current = false;
      }}
      onTouchCancel={() => (inicioToque.current = null)}
      onTouchEnd={(e) => {
        if (inicioToque.current === null) return;
        const distancia = e.changedTouches[0].clientX - inicioToque.current;
        inicioToque.current = null;
        deslizo.current = Math.abs(distancia) > 10;
        if (Math.abs(distancia) > 40) ir(indice + (distancia < 0 ? 1 : -1));
      }}
      // Un deslizamiento corto (que no llega a cambiar de banner) no debe abrir el enlace del banner.
      onClickCapture={(e) => {
        if (!deslizo.current) return;
        deslizo.current = false;
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Las diapositivas van apiladas en la misma celda: la actual aparece con un fundido y un desplazamiento
          corto; las demás se desvanecen hacia el lado contrario. data-activa dispara la cascada del texto. */}
      <div className="grid h-full">
        {diapositivas.map((diapositiva, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${total}: ${etiquetas[i] ?? ""}`}
            data-activa={i === indice ? "" : undefined}
            className={`h-full w-full transition duration-700 ease-(--curva-suave) [grid-area:1/1] motion-reduce:transition-none ${
              i === indice ? "z-10 translate-x-0 opacity-100" : `pointer-events-none opacity-0 ${i < indice ? "-translate-x-6" : "translate-x-6"}`
            }`}
            inert={i !== indice}
          >
            {diapositiva}
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button type="button" onClick={() => ir(indice - 1)} className={`${claseFlecha} left-3 lg:left-5`} aria-label="Banner anterior">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => ir(indice + 1)} className={`${claseFlecha} right-3 lg:right-5`} aria-label="Banner siguiente">
            <ChevronRight className="size-5" />
          </button>

          {/* Abajo a la derecha para no tapar el título ni el botón del banner. Cada indicador es una barra
              que se llena mientras dura su diapositiva. */}
          <div className="absolute right-3 bottom-3 z-20 flex items-center gap-0.5 rounded-chip bg-pico-azul-oscuro/50 px-1.5 backdrop-blur-sm">
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
                className={`group/punto flex h-8 w-9 items-center justify-center rounded-chip ${claseFoco}`}
              >
                <span className="relative h-1 w-7 overflow-hidden rounded-chip bg-pico-blanco/30 transition-colors group-hover/punto:bg-pico-blanco/50">
                  {i === indice && (
                    <span
                      key={`${indice}-${corriendo}`}
                      className={`absolute inset-0 origin-left rounded-chip bg-pico-blanco ${corriendo ? "motion-safe:animate-progreso" : ""}`}
                      style={{ animationDuration: `${INTERVALO_MS}ms` }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
