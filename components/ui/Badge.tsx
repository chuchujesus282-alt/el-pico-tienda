import type { ReactNode } from "react";

type Props = {
  variante?: "oferta" | "neutro";
  className?: string;
  children: ReactNode;
};

const estilos = {
  oferta: "bg-pico-rojo text-pico-blanco",
  neutro: "bg-pico-azul-claro text-pico-azul",
};

export default function Badge({ variante = "neutro", className = "", children }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-chip px-2.5 py-0.5 text-xs font-semibold ${estilos[variante]} ${className}`}
    >
      {children}
    </span>
  );
}
