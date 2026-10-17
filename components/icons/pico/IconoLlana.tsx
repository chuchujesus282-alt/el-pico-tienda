import IconoBase, { type PropsIcono } from "./IconoBase";

/** Friso de paredes: llana con su asa y la mezcla roja que va dejando. */
export default function IconoLlana(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path className="ac-trazo" d="M4 25c2-1.4 4 1.4 6 0s4 1.4 6 0 4 1.4 6 0 4 1.4 6 0" />
      <g className="ia-deslizar">
        <rect x="5" y="15" width="21" height="4.5" rx="1.2" />
        <path d="M12 15v-2.4M19 15v-2.4" />
        <rect x="9.8" y="9.4" width="11.4" height="3.4" rx="1.7" />
      </g>
    </IconoBase>
  );
}
