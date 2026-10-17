import IconoBase, { type PropsIcono } from "./IconoBase";

/** Vehículos: llanta con su rin y el centro rojo; da la vuelta. */
export default function IconoLlanta(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <g className="ia-girar">
        <circle cx="16" cy="16" r="11.5" />
        <circle cx="16" cy="16" r="9.2" strokeDasharray="1.5 2.6" strokeWidth="1.2" />
        <circle cx="16" cy="16" r="5.5" />
        <path d="M16 10.5v3.3M16 18.2v3.3M10.5 16h3.3M18.2 16h3.3" strokeWidth="1.3" />
        <circle className="ac-relleno" cx="16" cy="16" r="1.8" />
      </g>
    </IconoBase>
  );
}
