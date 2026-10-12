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
        // Placa del ícono: azul claro con degradado; al elegir, azul marino con brillo, un filete rojo
        // abajo (como los títulos) y un pequeño salto. Al pasar el mouse se inclina y el ícono se sacude.
        <span
          className={`relative flex size-9 shrink-0 items-center justify-center sm:size-11 overflow-hidden rounded-tarjeta ring-1 transition duration-300 ease-out ${
            marcada
              ? "bg-gradient-to-br from-logo-marino to-logo-marino-oscuro text-pico-blanco shadow-boton-hover ring-logo-marino motion-safe:scale-105"
              : "bg-gradient-to-br from-logo-marino-claro to-pico-blanco text-logo-marino ring-logo-marino/15 group-hover:ring-logo-marino/30 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:-rotate-6"
          }`}
        >
          {/* Reflejo suave en la mitad de arriba de la placa. */}
          <span
            className={`pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b ${
              marcada ? "from-pico-blanco/20" : "from-pico-blanco/70"
            } to-transparent`}
            aria-hidden
          />
          <span
            key={marcada ? "si" : "no"}
            className={`relative ${marcada ? "motion-safe:animate-latido" : "motion-safe:group-hover:animate-sacudir"}`}
          >
            {icono}
          </span>
          <span
            className={`absolute bottom-1 left-1/2 h-0.5 -translate-x-1/2 -skew-x-12 rounded-sm bg-logo-rojo transition-all duration-300 ${
              marcada ? "w-4 opacity-100" : "w-0 opacity-0 group-hover:w-3 group-hover:opacity-100"
            }`}
            aria-hidden
          />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] leading-tight font-semibold text-balance hyphens-auto text-logo-marino sm:text-sm">{titulo}</span>
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
