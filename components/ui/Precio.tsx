import { formatearPrecio } from "@/lib/formato";

type Props = {
  valor: number; // USD
  tamano?: "normal" | "pequeno" | "grande";
  className?: string;
};

const tamanos = {
  pequeno: "text-sm",
  normal: "text-lg",
  grande: "text-2xl",
};

/** Todo precio del sitio se muestra con este componente. */
export default function Precio({ valor, tamano = "normal", className = "" }: Props) {
  return (
    <span className={`font-bold whitespace-nowrap text-pico-rojo ${tamanos[tamano]} ${className}`}>
      {formatearPrecio(valor)}
    </span>
  );
}
