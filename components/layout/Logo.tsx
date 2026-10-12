import Link from "next/link";

type Props = {
  /** "normal" para el header; "grande" para el footer. */
  tamano?: "normal" | "grande";
  /**
   * Sin placa: montañas rojas (sobre fondo blanco, como en el header).
   * Con placa: cuadro rojo con montañas blancas (sobre fondos azules, como en el footer).
   */
  placa?: boolean;
  className?: string;
};

const tamanos = {
  normal: "h-11 md:h-14",
  grande: "h-16 md:h-20",
};

/**
 * Isotipo del rebranding: las dos montañas (la izquierda calada, la derecha sólida), con las
 * proporciones del logo oficial. Es SVG: nítido en cualquier tamaño y toma el color con `fill-*`.
 */
export function Montanas({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="263 263 1474 999" className={className} aria-hidden>
      {/* Contorno de las dos montañas unidas, con el hueco triangular de la izquierda. */}
      <path
        fillRule="evenodd"
        d="M263 1262 L763 421 L988 800 L1250 263 L1737 1262 Z M482 1137 L763 665 L1043 1137 Z"
      />
    </svg>
  );
}

/** Logo de la tienda (solo las montañas): lleva al inicio. */
export default function Logo({ tamano = "normal", placa = true, className = "" }: Props) {
  return (
    <Link
      href="/"
      aria-label="Centro Ferretero El Pico, ir al inicio"
      className={`group flex aspect-square shrink-0 items-center justify-center rounded-tarjeta transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${
        placa
          ? "bg-pico-rojo p-2.5 shadow-tarjeta hover:shadow-tarjeta-hover focus-visible:outline-pico-blanco md:p-3"
          : "focus-visible:outline-pico-azul"
      } ${tamanos[tamano]} ${className}`}
    >
      <Montanas
        className={`w-full transition-transform duration-300 ease-out motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-105 ${
          placa ? "fill-pico-blanco" : "fill-pico-rojo"
        }`}
      />
    </Link>
  );
}
