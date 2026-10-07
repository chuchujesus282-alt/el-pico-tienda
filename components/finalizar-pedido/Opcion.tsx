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
};

/** Opción seleccionable con su círculo (radio) o casilla (checkbox), en forma de tarjeta. */
export default function Opcion({ tipo, nombre, valor, marcada, alCambiar, icono, titulo, detalle }: Props) {
  return (
    <label
      className={`group relative flex cursor-pointer items-start gap-3 rounded-tarjeta border-2 p-3 transition duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-logo-marino motion-safe:hover:-translate-y-0.5 ${
        marcada
          ? "border-logo-marino bg-logo-marino-claro shadow-tarjeta"
          : "border-gris-borde bg-pico-blanco hover:border-logo-marino/40 hover:shadow-tarjeta"
      }`}
    >
      <input
        type={tipo}
        name={nombre}
        value={valor}
        checked={marcada}
        onChange={alCambiar}
        className="mt-1 size-4 shrink-0 cursor-pointer accent-logo-marino focus-visible:outline-none"
      />
      {icono && (
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-boton transition-colors duration-200 ${
            marcada ? "bg-logo-marino text-pico-blanco" : "bg-logo-marino-claro text-logo-marino group-hover:bg-logo-marino/10"
          }`}
        >
          {icono}
        </span>
      )}
      <span className="min-w-0 self-center">
        <span className="block text-sm font-semibold text-logo-marino">{titulo}</span>
        {detalle && <span className="block text-[13px] leading-snug text-gris-texto">{detalle}</span>}
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
