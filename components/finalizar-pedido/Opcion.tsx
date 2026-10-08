import type { ReactNode } from "react";
import { Check } from "lucide-react";

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
 * Opción seleccionable con su círculo (radio) o casilla (checkbox), en forma de tarjeta.
 * Todas miden lo mismo: ocupan el alto completo de su fila (`h-full`) con un mínimo común,
 * y el contenido queda centrado en vertical, tenga o no `detalle`.
 */
export default function Opcion({ tipo, nombre, valor, marcada, alCambiar, icono, titulo, detalle, className = "" }: Props) {
  return (
    <label
      className={`group relative flex h-full min-h-16 cursor-pointer items-center gap-2.5 rounded-tarjeta border-2 px-2.5 py-3 sm:gap-3 sm:px-3 transition duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-logo-marino motion-safe:hover:-translate-y-0.5 ${
        marcada
          ? "border-logo-marino bg-logo-marino-claro shadow-tarjeta"
          : "border-gris-borde bg-pico-blanco hover:border-logo-marino/40 hover:shadow-tarjeta-hover"
      } ${className}`}
    >
      <input
        type={tipo}
        name={nombre}
        value={valor}
        checked={marcada}
        onChange={alCambiar}
        // En móvil el círculo se oculta (sigue accesible): la tarjeta marcada ya cambia de color y lleva ✓.
        className="size-4 shrink-0 cursor-pointer accent-logo-marino focus-visible:outline-none max-sm:sr-only"
      />
      {icono && (
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-boton transition duration-300 ${
            marcada
              ? "bg-logo-marino text-pico-blanco motion-safe:scale-105"
              : "bg-logo-marino-claro text-logo-marino group-hover:bg-logo-marino/10 motion-safe:group-hover:-rotate-6"
          }`}
        >
          {icono}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-tight font-semibold text-balance break-words text-logo-marino">{titulo}</span>
        {detalle && <span className="mt-0.5 block text-[13px] leading-snug text-gris-texto">{detalle}</span>}
      </span>
      {marcada && (
        <span
          className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-chip bg-logo-marino text-pico-blanco shadow-tarjeta motion-safe:animate-latido"
          aria-hidden
        >
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
    </label>
  );
}
