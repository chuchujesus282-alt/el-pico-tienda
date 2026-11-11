import IconoBase, { type PropsIcono } from "./IconoBase";

/** Cerca de alambre de púas: tres postes y los hilos que se tienden, con las púas en rojo. */
export default function IconoCerca(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path d="M3.5 28h25" />
      <path d="M6 28V7.5M16 28V7.5M26 28V7.5" strokeWidth="2.2" />
      <path className="ia-dibujar" pathLength={1} d="M3.5 11h25" strokeWidth="1.2" />
      <path className="ia-dibujar ia-retraso-1" pathLength={1} d="M3.5 17h25" strokeWidth="1.2" />
      <path className="ia-dibujar ia-retraso-2" pathLength={1} d="M3.5 23h25" strokeWidth="1.2" />
      <g className="ac-trazo ia-pop ia-retraso-3" strokeWidth="1.4">
        <path d="M10 9.6l1.6 2.8M11.6 9.6 10 12.4M20.4 9.6l1.6 2.8M22 9.6l-1.6 2.8" />
        <path d="M10 15.6l1.6 2.8M11.6 15.6 10 18.4M20.4 15.6l1.6 2.8M22 15.6l-1.6 2.8" />
        <path d="M10 21.6l1.6 2.8M11.6 21.6 10 24.4M20.4 21.6l1.6 2.8M22 21.6l-1.6 2.8" />
      </g>
    </IconoBase>
  );
}
