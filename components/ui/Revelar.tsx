"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

type Estado = "visible" | "oculto" | "revelado";

/**
 * Hace aparecer su contenido (sube y se aclara) cuando entra en pantalla al bajar.
 * - Del servidor llega visible: si el JavaScript no carga, nada queda escondido.
 * - Solo se esconde lo que está fuera de pantalla al cargar; lo de arriba no parpadea.
 * - Con "reducir movimiento" del sistema, no anima.
 * Ojo: no envuelvas aquí elementos `fixed` (modales, barras): la animación los encerraría.
 */
export default function Revelar({ children, className = "" }: Props) {
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
      className={`${estado === "oculto" ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"} ${
        estado === "visible" ? "" : "transition duration-700 ease-out"
      } ${className}`}
    >
      {children}
    </div>
  );
}
