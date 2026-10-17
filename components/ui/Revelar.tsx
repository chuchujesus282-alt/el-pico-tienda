"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Retraso de la animación en ms (opcional), para que varias piezas aparezcan en cascada. */
  retraso?: number;
};

type Estado = "visible" | "oculto" | "revelado";

/**
 * Hace aparecer su contenido (sube 16px y se aclara) cuando entra en pantalla al bajar, una sola vez.
 * Expone data-estado ("visible" | "oculto" | "revelado") para que las piezas de adentro coreografíen su entrada
 * (ej. el título de sección dibuja su barra roja antes del texto).
 * - Del servidor llega visible: si el JavaScript no carga, nada queda escondido.
 * - Solo se esconde lo que está fuera de pantalla al cargar; lo de arriba no parpadea.
 * - Con "reducir movimiento" del sistema, no anima.
 * Ojo: no envuelvas aquí elementos `fixed` (modales, barras): la animación los encerraría.
 */
export default function Revelar({ children, className = "", retraso = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<Estado>("visible");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // ya está a la vista

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setEstado("revelado");
          observador.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    // Se esconde en un callback (no en el cuerpo del efecto) para no encadenar renders.
    const id = requestAnimationFrame(() => setEstado((e) => (e === "visible" ? "oculto" : e)));
    observador.observe(el);
    return () => {
      cancelAnimationFrame(id);
      observador.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      data-estado={estado}
      style={estado === "revelado" && retraso ? { transitionDelay: `${retraso}ms` } : undefined}
      className={`${estado === "oculto" ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"} ${
        estado === "visible" ? "" : "transition duration-700 ease-(--curva-suave)"
      } ${className}`}
    >
      {children}
    </div>
  );
}
