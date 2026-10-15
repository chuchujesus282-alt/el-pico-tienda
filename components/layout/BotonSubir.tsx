"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";

const sinSuscripcion = () => () => {};

/**
 * Flecha flotante que lleva al principio de la página, justo encima de la bola del carrito (`BotonCarritoFlotante`).
 * Es su gemela: mismo diseño (blanca con borde e ícono rojos), misma animación (cae desde arriba con rebote) y la
 * controla el mismo `BotonCarrito` del header, así que las dos aparecen y desaparecen a la vez.
 */
export default function BotonSubir({ visible }: { visible: boolean }) {
  const { abierto } = useCarrito();
  const ruta = usePathname();
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  if (!montado) return null;

  const mostrar = visible && !abierto;
  // Misma regla que la bola del carrito: en producto y calculadoras (móvil) hay una barra fija abajo.
  const sobreBarra = ruta.startsWith("/producto/") || ruta.startsWith("/calculadoras/");

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
      className={`group fixed derecha-flotante z-40 flex size-14 cursor-pointer items-center justify-center rounded-chip border-2 border-pico-rojo bg-pico-blanco text-pico-rojo shadow-tarjeta-hover transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-rojo md:bottom-[calc(5.25rem+env(safe-area-inset-bottom))] ${
        sobreBarra ? "bottom-[calc(10.25rem+env(safe-area-inset-bottom))]" : "bottom-[calc(4.5rem+env(safe-area-inset-bottom))]"
      } ${
        mostrar
          ? "scale-100 opacity-100"
          : "pointer-events-none -translate-y-24 scale-90 opacity-0 motion-reduce:translate-y-0 motion-reduce:scale-100"
      }`}
    >
      <ArrowUp className="size-6 motion-safe:group-hover:animate-sacudir" aria-hidden />
    </button>,
    document.body,
  );
}
