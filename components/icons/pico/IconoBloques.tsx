import IconoBase, { type PropsIcono } from "./IconoBase";

/** Bloques para paredes: pared con juntas de mortero; el bloque rojo cae en su sitio. */
export default function IconoBloques(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <rect x="4" y="6.5" width="24" height="19" rx="1.2" />
      <path d="M4 12.83h24M4 19.17h24" />
      <path d="M12 6.5v6.33M20 6.5v6.33M8 12.83v6.34M16 12.83v6.34M24 12.83v6.34M12 19.17v6.33M20 19.17v6.33" />
      <rect className="ac-relleno-borde ia-caer" x="16" y="12.83" width="8" height="6.34" rx=".5" />
      <path d="M2.5 28.5h27" />
    </IconoBase>
  );
}
