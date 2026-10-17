import IconoBase, { type PropsIcono } from "./IconoBase";

/** Pintura: rodillo con una gota roja; al pasar el mouse pinta una franja. */
export default function IconoRodillo(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path className="ia-franja" d="M5.5 3.2h17" strokeWidth="2.4" />
      <rect className="ico-tapa" x="5" y="5.8" width="18" height="6.5" rx="2" />
      <path d="M23 9h2.3a1.5 1.5 0 0 1 1.5 1.5v3.3a1.5 1.5 0 0 1-1.5 1.5H15.75v3.4" />
      <rect x="13.9" y="18.7" width="3.7" height="9.3" rx="1.5" />
      <path className="ac-relleno ia-gota" d="M9 16s-2 2.3-2 3.6a2 2 0 0 0 4 0C11 18.3 9 16 9 16z" />
    </IconoBase>
  );
}
