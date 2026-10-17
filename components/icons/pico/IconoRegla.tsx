import IconoBase, { type PropsIcono } from "./IconoBase";

/** Contrapiso: regla de nivelar con su burbuja roja, deslizándose sobre el piso. */
export default function IconoRegla(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path d="M3 24.5h26" />
      <path d="M6 28.5l3-4M11.5 28.5l3-4M17 28.5l3-4M22.5 28.5l3-4" />
      <g className="ia-deslizar">
        <rect x="4" y="16" width="24" height="3.2" rx="1" />
        <rect className="ac-relleno" x="13.5" y="16.9" width="5" height="1.4" rx=".7" />
        <path d="M9 16v-3.5M23 16v-3.5M7.5 12.5h3M21.5 12.5h3" />
      </g>
    </IconoBase>
  );
}
