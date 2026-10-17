import IconoBase, { type PropsIcono } from "./IconoBase";

/** Mide tu obra: cinta métrica con la cinta roja que se estira. */
export default function IconoCinta(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <rect x="3.5" y="9" width="14" height="14" rx="4.5" />
      <circle cx="10.5" cy="16" r="2.6" />
      <g className="ia-estirar">
        <path className="ac-relleno-borde" d="M17.5 18h9.5v3h-9.5z" />
        <path d="M20.5 18v1.3M23.5 18v1.3" strokeWidth="1.2" />
      </g>
      <path d="M27.8 17v5" />
    </IconoBase>
  );
}
