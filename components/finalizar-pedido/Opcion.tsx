import type { ReactNode } from "react";

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
      className={`flex cursor-pointer items-start gap-3 rounded-tarjeta border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pico-azul ${
        marcada ? "border-pico-azul bg-pico-azul-claro" : "border-gris-borde bg-pico-blanco hover:border-pico-azul/40"
      }`}
    >
      <input
        type={tipo}
        name={nombre}
        value={valor}
        checked={marcada}
        onChange={alCambiar}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-pico-azul focus-visible:outline-none"
      />
      {icono && <span className="mt-px shrink-0 text-pico-azul">{icono}</span>}
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-pico-azul">{titulo}</span>
        {detalle && <span className="block text-[13px] leading-snug text-gris-texto">{detalle}</span>}
      </span>
    </label>
  );
}
