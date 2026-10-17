import type { ComponenteIcono } from "@/types/icono";

type Props = {
  Icono: ComponenteIcono;
  /** "claro": líneas blancas para fondos azules; "oscuro": líneas azules para fondos claros. */
  tono?: "claro" | "oscuro";
  /** Medidas que se leen en las cotas, como en un plano de arquitectura. */
  medidas?: [string, string];
  className?: string;
};

/**
 * Ilustración tipo plano técnico para banners y encabezados: el ícono propio en línea fina, con un círculo
 * de construcción punteado, ejes, cotas con sus medidas y un punto de referencia en rojo. Varias opacidades
 * del mismo color para que se lea como dibujo técnico y no como un ícono agrandado.
 */
export default function Plano({ Icono, tono = "claro", medidas = ["1.20 m", "0.90 m"], className = "" }: Props) {
  const color = tono === "claro" ? "text-pico-blanco" : "text-pico-azul";
  return (
    <span className={`plano-dibujo relative block aspect-square ${color} ${className}`} aria-hidden>
      <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeLinecap="round" className="absolute inset-0 size-full">
        <circle cx="100" cy="100" r="80" strokeOpacity=".16" strokeDasharray="2 6" strokeWidth=".9" />
        <path d="M100 6v22M100 172v22M6 100h22M172 100h22" strokeOpacity=".25" strokeWidth=".9" />
        <g strokeOpacity=".4" strokeWidth=".9">
          <path d="M34 186h132M34 180v12M166 180v12M34 186l7-2.6M34 186l7 2.6M166 186l-7-2.6M166 186l-7 2.6" />
          <path d="M186 34v132M180 34h12M180 166h12M186 34l-2.6 7M186 34l2.6 7M186 166l-2.6-7M186 166l2.6-7" />
        </g>
        <text x="100" y="181" textAnchor="middle" fontSize="8.5" fill="currentColor" fillOpacity=".6" stroke="none" letterSpacing="1.2">
          {medidas[0]}
        </text>
        <text x="181" y="100" textAnchor="middle" fontSize="8.5" fill="currentColor" fillOpacity=".6" stroke="none" letterSpacing="1.2" transform="rotate(-90 181 100)">
          {medidas[1]}
        </text>
        <circle cx="34" cy="186" r="2.6" className="fill-pico-rojo" stroke="none" />
        <path d="M24 24h14M24 24v14" strokeOpacity=".3" strokeWidth=".9" />
      </svg>
      <Icono className={`absolute top-[16%] left-[16%] size-[68%] ${tono === "claro" ? "text-pico-blanco/55" : "text-pico-azul/45"}`} />
    </span>
  );
}
