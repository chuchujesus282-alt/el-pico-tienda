import IconoBase, { type PropsIcono } from "./IconoBase";

/** Ubicación: pin con el centro rojo que da un saltito. */
export default function IconoUbicacion(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <g className="ia-saltar">
        <path d="M16 28.5s-8.5-7.7-8.5-14.3a8.5 8.5 0 0 1 17 0c0 6.6-8.5 14.3-8.5 14.3z" />
        <circle className="ac-relleno-borde" cx="16" cy="14" r="3" />
      </g>
    </IconoBase>
  );
}
