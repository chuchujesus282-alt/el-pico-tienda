import IconoBase, { type PropsIcono } from "./IconoBase";

/** Divisas: dos billetes de dólar en abanico; el de atrás se abre. */
export default function IconoBilletes(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <g transform="rotate(-12 6 22)">
        <g className="ia-abanico">
          <rect className="ico-tapa" x="6" y="8.5" width="20" height="12" rx="1.5" />
        </g>
      </g>
      <rect className="ico-tapa" x="5" y="12" width="22" height="13" rx="1.6" />
      <circle cx="16" cy="18.5" r="3.4" />
      <path d="M17.1 17.2c-.3-.5-.8-.7-1.3-.7-.7 0-1.2.4-1.2 1s.5.8 1.2 1 1.3.4 1.3 1-.5 1-1.2 1c-.6 0-1.1-.3-1.3-.7M16 15.8v.7M16 20.5v.7" strokeWidth="1.2" />
      <circle className="ac-relleno" cx="8.6" cy="15.4" r="1.1" />
      <circle className="ac-relleno" cx="23.4" cy="21.6" r="1.1" />
    </IconoBase>
  );
}
