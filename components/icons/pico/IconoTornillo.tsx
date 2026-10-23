import IconoBase, { type PropsIcono } from "./IconoBase";

/** Tornillería: tornillo con la ranura roja en la cabeza; gira. */
export default function IconoTornillo(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <g className="ia-oscilar">
        <rect x="9.5" y="3.5" width="13" height="4.5" rx="1.5" />
        <path className="ac-trazo" d="M14 5.75h4" strokeWidth="1.5" />
        <path d="M12.5 8v14.5L16 28.5l3.5-6V8" />
        <path d="M12.5 11.5l7 2M12.5 15.5l7 2M12.5 19.5l7 2" strokeWidth="1.3" />
      </g>
    </IconoBase>
  );
}
