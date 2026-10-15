"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";

const sinSuscripcion = () => () => {};
/** A partir de cuántos píxeles bajados aparece la flecha. */
const DESDE_PX = 600;

/**
 * Flecha flotante que lleva al principio de la página. Mismo tamaño (56px) y misma columna que la bola del carrito
 * (`BotonCarritoFlotante`), justo encima; sube con ella en las páginas que tienen barra fija abajo.
 */
export default function BotonSubir() {
  const { abierto } = useCarrito();
  const ruta = usePathname();
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  const [bajado, setBajado] = useState(false);

  useEffect(() => {
    const revisar = () => setBajado(window.scrollY > DESDE_PX);
    revisar();
    window.addEventListener("scroll", revisar, { passive: true });
    return () => window.removeEventListener("scroll", revisar);
  }, []);

  if (!montado) return null;
  const mostrar = bajado && !abierto;
  // Misma regla que la bola del carrito: en producto y calculadoras (móvil) hay una barra fija abajo.
  const sobreBarra = ruta.startsWith("/producto/") || ruta.startsWith("/calculadoras/");

  const subir = () => {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducir ? "auto" : "smooth" });
  };

  return createPortal(
    <button
      type="button"
      onClick={subir}
      inert={!mostrar}
      aria-label="Volver al principio de la página"
      className={`group fixed derecha-flotante z-40 flex size-14 cursor-pointer items-center justify-center rounded-chip border-2 border-pico-azul bg-pico-blanco text-pico-azul shadow-tarjeta-hover transition duration-300 hover:bg-pico-azul hover:text-pico-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul md:bottom-[calc(5.25rem+env(safe-area-inset-bottom))] ${
        sobreBarra ? "bottom-[calc(10.25rem+env(safe-area-inset-bottom))]" : "bottom-[calc(4.5rem+env(safe-area-inset-bottom))]"
      } ${mostrar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0 motion-reduce:translate-y-0"}`}
    >
      <ArrowUp className="size-6 transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5" aria-hidden />
    </button>,
    document.body,
  );
}
