import IconoBase, { type PropsIcono } from "./IconoBase";

/** Concreto para vaciados: trompo mezclador con su franja roja; el tambor se mece. */
export default function IconoMezcladora(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <g className="ia-oscilar">
        <path d="M7.5 9.5l12.6-4.2c2.4-.8 5 .6 5.6 3.1l1.1 4.6c.6 2.5-.9 5-3.4 5.6L10.8 21.4z" />
        <ellipse cx="9.15" cy="15.45" rx="1.8" ry="6.2" transform="rotate(-15 9.15 15.45)" />
        <path className="ac-trazo" d="M15 6.9l2.7 12.4" strokeWidth="2.2" />
      </g>
      <path d="M14 20.4 11.5 28M22.2 18.6l2.4 9.4M8.5 28h18M27.2 11.6h2.3" />
    </IconoBase>
  );
}
