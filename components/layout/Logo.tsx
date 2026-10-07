import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo-el-pico.webp";

type Props = {
  /** "normal" para el header; "grande" para el footer. */
  tamano?: "normal" | "grande";
  /**
   * El logo oficial es rojo con el texto calado (transparente). Sobre azul se apagaría, así que
   * por defecto va en una placa blanca; sobre fondo blanco (header) se usa sin placa.
   */
  placa?: boolean;
  className?: string;
};

const tamanos = {
  normal: { alto: "h-12 md:h-16", ancho: 69, altoPx: 64 },
  grande: { alto: "h-24", ancho: 94, altoPx: 88 },
};

export default function Logo({ tamano = "normal", placa = true, className = "" }: Props) {
  const { alto, ancho, altoPx } = tamanos[tamano];
  return (
    <Link
      href="/"
      className={`flex w-fit shrink-0 rounded-boton focus-visible:outline-2 focus-visible:outline-offset-2 ${
        placa ? "bg-pico-blanco p-1 focus-visible:outline-pico-blanco" : "focus-visible:outline-pico-azul"
      } ${alto} ${className}`}
    >
      <Image
        src={logo}
        alt="Centro Ferretero El Pico, ir al inicio"
        width={ancho}
        height={altoPx}
        loading={tamano === "normal" ? "eager" : undefined}
        className="h-full w-auto"
      />
    </Link>
  );
}
