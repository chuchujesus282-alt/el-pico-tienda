import IconoBase, { type PropsIcono } from "./IconoBase";

/** Calculadoras: calculadora con la tecla de igual en rojo. */
export default function IconoCalculadora(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <rect x="7" y="3.5" width="18" height="25" rx="3" />
      <rect x="10" y="6.5" width="12" height="5.5" rx="1" />
      <path d="M17.5 9.25H20" />
      <g>
        <circle className="ico-solido" cx="11.5" cy="16.2" r="1.15" />
        <circle className="ico-solido" cx="16" cy="16.2" r="1.15" />
        <circle className="ico-solido" cx="20.5" cy="16.2" r="1.15" />
        <circle className="ico-solido" cx="11.5" cy="20.6" r="1.15" />
        <circle className="ico-solido" cx="16" cy="20.6" r="1.15" />
        <circle className="ico-solido" cx="11.5" cy="25" r="1.15" />
        <circle className="ico-solido" cx="16" cy="25" r="1.15" />
      </g>
      <rect className="ac-relleno ia-pop" x="19.2" y="19.2" width="2.6" height="7.2" rx="1.3" />
    </IconoBase>
  );
}
