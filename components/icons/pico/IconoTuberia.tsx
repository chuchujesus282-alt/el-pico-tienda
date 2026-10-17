import IconoBase, { type PropsIcono } from "./IconoBase";

/** Plomería: codo de tubería con la llave de paso roja que gira. */
export default function IconoTuberia(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path d="M4 13.5h7.5a2 2 0 0 0 2-2V4" />
      <path d="M4 20h7.5a8.5 8.5 0 0 0 8.5-8.5V4" />
      <path d="M3 12v9.5M12 3h9.5" />
      <path d="M7.75 13.5V10" />
      <path className="ac-trazo ia-oscilar" d="M5 9.4h5.5" strokeWidth="2.4" />
    </IconoBase>
  );
}
