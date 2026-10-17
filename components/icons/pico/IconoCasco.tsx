import IconoBase, { type PropsIcono } from "./IconoBase";

/** Seguridad industrial: casco de obra con la cresta roja. */
export default function IconoCasco(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <g className="ia-balanceo">
        <path d="M5.5 21.5a10.5 10.5 0 0 1 21 0" />
        <path className="ac-relleno-borde" d="M14 11.3v10.2h4V11.3a10.6 10.6 0 0 0-4 0z" />
        <path d="M3 21.5h26v1.3a1.7 1.7 0 0 1-1.7 1.7H4.7A1.7 1.7 0 0 1 3 22.8z" />
      </g>
    </IconoBase>
  );
}
