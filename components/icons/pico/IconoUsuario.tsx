import IconoBase, { type PropsIcono } from "./IconoBase";

/** Mi cuenta: cliente con casco de obra rojo, que se lo acomoda. */
export default function IconoUsuario(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <circle cx="16" cy="13" r="5" />
      <g className="ia-oscilar">
        <path className="ac-relleno-borde" d="M10.6 12.2a5.4 5.4 0 0 1 10.8 0z" />
        <path d="M9.2 12.4h13.6" />
      </g>
      <path d="M6.5 28c.8-5.2 4.6-8.5 9.5-8.5s8.7 3.3 9.5 8.5" />
    </IconoBase>
  );
}
