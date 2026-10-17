import type { ReactNode } from "react";
import CheckDibujado from "@/components/icons/pico/CheckDibujado";
import PlacaIcono from "@/components/icons/pico/PlacaIcono";

type Props = {
  tipo: "radio" | "checkbox";
  nombre: string;
  valor: string;
  marcada: boolean;
  alCambiar: () => void;
  icono?: ReactNode;
  titulo: string;
  detalle?: ReactNode;
  className?: string;
};

/**
 * Opción seleccionable en forma de tarjeta. El input real (radio o checkbox) sigue ahí para el teclado y los
 * lectores de pantalla, pero oculto: se ve un indicador propio (círculo con punto, o casilla con ✓).
 * Elegida: borde azul de 2px, fondo azul claro, el ícono invertido con su "pop" y un check que se dibuja en
 * la esquina. Todas miden lo mismo (`h-full` con un mínimo común) y el contenido va centrado en vertical.
 */
export default function Opcion({ tipo, nombre, valor, marcada, alCambiar, icono, titulo, detalle, className = "" }: Props) {
  return (
    <label
      className={`group grupo-icono relative flex h-full min-h-16 cursor-pointer items-center gap-3 rounded-2xl border-2 px-3 py-3 transition duration-300 ease-(--curva-suave) has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pico-azul/60 motion-safe:hover:-translate-y-0.5 ${
        marcada
          ? "border-pico-azul bg-pico-azul-claro shadow-tarjeta"
          : "border-gris-borde bg-pico-blanco hover:border-pico-azul/40 hover:shadow-tarjeta-hover"
      } ${className}`}
    >
      <input type={tipo} name={nombre} value={valor} checked={marcada} onChange={alCambiar} className="peer sr-only" />
      {/* Indicador propio: círculo (radio) o casilla (checkbox). En el teléfono se omite: la tarjeta ya cambia. */}
      <span
        className={`hidden size-5 shrink-0 items-center justify-center border-2 transition duration-300 ease-(--curva-suave) sm:flex ${
          tipo === "radio" ? "rounded-chip" : "rounded-md"
        } ${marcada ? "border-pico-azul bg-pico-azul text-pico-blanco" : "border-gris-texto/40 bg-pico-blanco group-hover:border-pico-azul/60"}`}
        aria-hidden
      >
        {marcada &&
          (tipo === "radio" ? (
            <span className="size-2 rounded-chip bg-pico-blanco motion-safe:animate-pop" />
          ) : (
            <CheckDibujado className="size-3.5" grosor={3.5} />
          ))}
      </span>
      {icono && (
        // Placa del ícono propio: azul claro; al elegir, azul marino con el ícono en blanco y su "pop".
        // Al pasar el mouse, el ícono hace su animación (la moto avanza, el camión rebota…).
        <PlacaIcono activo={marcada}>{icono}</PlacaIcono>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] leading-tight font-semibold text-balance hyphens-auto text-pico-azul sm:text-sm">{titulo}</span>
        {detalle && <span className="mt-0.5 block text-[13px] leading-snug text-gris-texto">{detalle}</span>}
      </span>
      {marcada && (
        <span
          className="absolute -top-2.5 -right-2.5 flex size-6 items-center justify-center rounded-chip bg-pico-azul text-pico-blanco shadow-tarjeta ring-2 ring-pico-blanco motion-safe:animate-pop"
          aria-hidden
        >
          <CheckDibujado className="size-3.5" />
        </span>
      )}
    </label>
  );
}
