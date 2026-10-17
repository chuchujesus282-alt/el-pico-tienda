import IconoBase, { type PropsIcono } from "./IconoBase";

/** Techo con láminas: lámina ondulada con su tornillo rojo, que gira al fijarse. */
export default function IconoLamina(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path d="M3 13c1.44-2 2.89-2 4.33 0s2.89 2 4.33 0 2.89-2 4.34 0 2.89 2 4.33 0 2.89-2 4.33 0 2.89 2 4.34 0" />
      <path d="M3 24c1.44-2 2.89-2 4.33 0s2.89 2 4.33 0 2.89-2 4.34 0 2.89 2 4.33 0 2.89-2 4.33 0 2.89 2 4.34 0" />
      <path d="M3 13v11M29 13v11M7.33 13v11M24.66 13v11" />
      <g className="ia-girar">
        <circle className="ac-relleno-borde" cx="16" cy="7.2" r="2.2" />
        <path d="M15 7.2h2" strokeWidth="1.2" />
      </g>
      <path d="M16 9.4V13" />
    </IconoBase>
  );
}
