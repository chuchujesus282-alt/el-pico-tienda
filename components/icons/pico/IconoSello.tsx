import IconoBase, { type PropsIcono } from "./IconoBase";

/** Confirmado: sello con el check rojo que se dibuja. */
export default function IconoSello(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <circle cx="16" cy="16" r="11.5" />
      <circle cx="16" cy="16" r="8.5" strokeDasharray="2 2.4" strokeWidth="1" />
      <path className="ac-trazo ia-dibujar" pathLength={1} d="M11.6 16.2l3 3 5.9-6.4" strokeWidth="2.2" />
    </IconoBase>
  );
}
