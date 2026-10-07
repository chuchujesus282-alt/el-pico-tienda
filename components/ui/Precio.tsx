import { formatearPrecio } from "@/lib/formato";

type Props = {
  valor: number; // USD
  tamano?: "normal" | "pequeno" | "grande";
  /** "logo" usa el rojo del rebranding (solo página de producto por ahora). */
  tono?: "marca" | "logo";
  className?: string;
};

const tamanos = {
  pequeno: "text-sm",
  normal: "text-lg",
  grande: "text-2xl",
};

const tonos = {
  marca: "text-pico-rojo",
  logo: "text-logo-rojo",
};

/** Todo precio del sitio se muestra con este componente. */
export default function Precio({ valor, tamano = "normal", tono = "marca", className = "" }: Props) {
  return (
    <span className={`font-bold whitespace-nowrap ${tonos[tono]} ${tamanos[tamano]} ${className}`}>
      {formatearPrecio(valor)}
    </span>
  );
}
