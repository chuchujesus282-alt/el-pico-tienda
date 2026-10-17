import IconoBase, { type PropsIcono } from "./IconoBase";

/** Hogar y jardín: pala con la hoja roja que cava. */
export default function IconoPala(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <g className="ia-cavar">
        <path d="M12 3.5h8M16 3.5v14M14 17.5h4" />
        <path className="ac-relleno-borde" d="M10.8 18.5h10.4v4.6c0 2.6-2.2 4.4-5.2 5.9-3-1.5-5.2-3.3-5.2-5.9z" />
      </g>
    </IconoBase>
  );
}
