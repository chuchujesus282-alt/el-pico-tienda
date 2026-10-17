import IconoBase, { type PropsIcono } from "./IconoBase";

/** Flete: camión de estacas cargado con sacos de cemento y cabillas; la carga rebota. */
export default function IconoCamion(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path d="M21 21.5V12.5h5l3 5v4" />
      <path d="M22.8 14.3h2.6l1.8 3h-4.4z" />
      <path d="M3 21.5h26" />
      <path d="M3 21.5V15M11.5 21.5V15M20 21.5V15M3 15h17" />
      <g className="ia-rebote">
        <path d="M3.5 10.6l16-2.2M3.5 12.4l16-2.2" />
        <rect className="ac-relleno-borde" x="4.5" y="16.5" width="6.2" height="4.4" rx="1.6" />
        <rect className="ac-relleno-borde" x="12.3" y="16.5" width="6.2" height="4.4" rx="1.6" />
      </g>
      <circle className="ico-tapa" cx="8" cy="24.5" r="2.6" />
      <circle className="ico-tapa" cx="24.5" cy="24.5" r="2.6" />
    </IconoBase>
  );
}
