import IconoBase, { type PropsIcono } from "./IconoBase";

/** Cerámica y porcelanato: cuatro baldosas con el separador rojo en la junta. */
export default function IconoBaldosas(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <rect x="4.5" y="4.5" width="10.5" height="10.5" rx="1" />
      <rect x="17" y="4.5" width="10.5" height="10.5" rx="1" />
      <rect x="4.5" y="17" width="10.5" height="10.5" rx="1" />
      <rect x="17" y="17" width="10.5" height="10.5" rx="1" />
      <path d="M7.2 11.8l4.4-4.4" />
      <path className="ac-trazo ia-pop" d="M16 12.8v6.4M12.8 16h6.4" strokeWidth="2.2" />
    </IconoBase>
  );
}
