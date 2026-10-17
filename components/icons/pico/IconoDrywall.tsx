import IconoBase, { type PropsIcono } from "./IconoBase";

/** Drywall: lámina de yeso con sus tornillos rojos y el perfil metálico al lado. */
export default function IconoDrywall(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <rect x="4.5" y="4" width="15" height="24" rx="1" />
      <path d="M8 4v24" strokeDasharray="1.5 2.5" strokeWidth="1" />
      <g className="ia-pop">
        <circle className="ac-relleno" cx="16.5" cy="8" r="1.3" />
        <circle className="ac-relleno" cx="16.5" cy="16" r="1.3" />
        <circle className="ac-relleno" cx="16.5" cy="24" r="1.3" />
      </g>
      <path d="M23 4v24M23 4h4.5v3M23 28h4.5v-3" />
    </IconoBase>
  );
}
