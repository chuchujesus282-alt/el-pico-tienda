import IconoBase, { type PropsIcono } from "./IconoBase";

/** Privacidad: escudo con el check rojo que se dibuja. */
export default function IconoEscudo(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path d="M16 3.5l10 3.8v7.2c0 6.6-4.3 11.7-10 14-5.7-2.3-10-7.4-10-14V7.3z" />
      <path className="ac-trazo ia-dibujar" pathLength={1} d="M11.6 15.8l3.2 3.2 6-6.5" strokeWidth="2.2" />
    </IconoBase>
  );
}
