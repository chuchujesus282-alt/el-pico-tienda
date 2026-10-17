import IconoBase, { type PropsIcono } from "./IconoBase";

/** Buscar: lupa con el mango rojo; se inclina como quien busca. */
export default function IconoLupa(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <g className="ia-oscilar">
        <circle cx="13.5" cy="13.5" r="8" />
        <path d="M9.6 11.2a4.6 4.6 0 0 1 3.6-2.9" />
        <path className="ac-trazo" d="M19.6 19.6l7.4 7.4" strokeWidth="3" />
      </g>
    </IconoBase>
  );
}
