import IconoBase, { type PropsIcono } from "./IconoBase";

/** Impermeabilización: rollo de manto asfáltico desenrollándose y la llama roja del soplete. */
export default function IconoManto(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <g className="ia-deslizar-inv">
        <circle className="ico-tapa" cx="9" cy="19" r="5.5" />
        <path d="M9 16.5a2.5 2.5 0 1 1-2.5 2.5" />
      </g>
      <path d="M9 24.5h19.5v-2.6H14" />
      <path className="ac-relleno ia-pop" d="M23.6 19.6c-1.6 0-2.7-1.2-2.7-2.6 0-1.5 1-2.2 1.5-3.6.5 1 1 1.4 1.6 1.6.1-1.6.9-2.9 2.1-3.6-.1 1.6.6 2.6 1.3 3.6.4.6.7 1.3.7 2 0 1.5-1.2 2.6-2.7 2.6z" />
      <path d="M27 15.5l2.2-2.2" />
    </IconoBase>
  );
}
