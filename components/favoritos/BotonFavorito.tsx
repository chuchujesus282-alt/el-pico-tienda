"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { Heart } from "lucide-react";
import { useFavoritos } from "./almacenFavoritos";

type Props = {
  productoId: string;
  /** Nombre del producto para el lector de pantalla. */
  titulo: string;
  /**
   * "tarjeta": corazón redondo sobre la foto de `ProductCard` (por defecto).
   * "chip": píldora "Guardar" junto a "Compartir" en la página de producto.
   */
  variante?: "tarjeta" | "chip";
  className?: string;
};

/** Ocho partículas rojas que salen del corazón al marcarlo (.particula en globals.css; quietas sin movimiento). */
function Estallido() {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angulo) => (
        <span key={angulo} className="particula" style={{ "--angulo": `${angulo}deg` } as CSSProperties} />
      ))}
    </span>
  );
}

/** Marca o quita un producto de los favoritos del cliente (se guardan en su navegador). */
export default function BotonFavorito({ productoId, titulo, variante = "tarjeta", className = "" }: Props) {
  const { esFavorito, alternar } = useFavoritos();
  const activo = esFavorito(productoId);
  // Cuenta los toques para que el corazón vuelva a "latir" cada vez que se marca.
  const [toques, setToques] = useState(0);

  const alTocar = () => {
    if (alternar(productoId)) setToques((t) => t + 1);
  };

  const corazon = (
    <Heart
      // Claves con prefijo propio: el corazón y el estallido son hermanos, y si compartieran la misma clave
      // (ej. las dos "1") React no sabría cuál quitar y se quedarían corazones viejos al desmarcar.
      key={activo ? `corazon-${toques}` : "corazon-vacio"}
      className={`transition-colors duration-200 ${variante === "chip" ? "size-3.5" : "size-[18px]"} ${
        activo ? "fill-pico-rojo text-pico-rojo motion-safe:animate-latido" : ""
      }`}
      aria-hidden
    />
  );

  if (variante === "chip") {
    return (
      <button
        type="button"
        onClick={alTocar}
        aria-pressed={activo}
        aria-label={activo ? `Quitar ${titulo} de favoritos` : `Guardar ${titulo} en favoritos`}
        className={`area-tactil inline-flex cursor-pointer items-center gap-1.5 rounded-chip border px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-marino ${
          activo
            ? "border-pico-rojo/40 bg-pico-blanco text-pico-rojo"
            : "border-gris-borde bg-pico-blanco text-logo-marino hover:border-logo-marino hover:bg-logo-marino-claro"
        } ${className}`}
      >
        <span className="relative flex">
          {corazon}
          {activo && toques > 0 && <Estallido key={`estallido-${toques}`} />}
        </span>
        {activo ? "Guardado" : "Guardar"}
      </button>
    );
  }

  return (
    // El contenedor va posicionado (absolute) y el botón lleva area-tactil: se ve de 40px y se toca en 44px.
    <div className={`absolute top-5 right-5 z-10 ${className}`}>
      <button
        type="button"
        onClick={alTocar}
        aria-pressed={activo}
        aria-label={activo ? `Quitar ${titulo} de favoritos` : `Guardar ${titulo} en favoritos`}
        className={`area-tactil flex size-10 cursor-pointer items-center justify-center rounded-chip border bg-pico-blanco shadow-tarjeta transition duration-200 hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:active:scale-90 ${
          activo ? "border-pico-rojo/40 text-pico-rojo" : "border-pico-azul/15 text-pico-azul hover:border-pico-rojo/40 hover:text-pico-rojo"
        }`}
      >
        {corazon}
        {activo && toques > 0 && <Estallido key={`estallido-${toques}`} />}
      </button>
    </div>
  );
}
