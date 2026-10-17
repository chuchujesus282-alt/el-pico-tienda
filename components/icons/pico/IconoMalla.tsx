import IconoBase, { type PropsIcono } from "./IconoBase";

/** Cabillas para losas: malla de cabillas que se dibuja, con los amarres en rojo. */
export default function IconoMalla(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path className="ia-dibujar" pathLength={1} d="M4 9.5h24" />
      <path className="ia-dibujar ia-retraso-1" pathLength={1} d="M4 16h24" />
      <path className="ia-dibujar ia-retraso-2" pathLength={1} d="M4 22.5h24" />
      <path className="ia-dibujar" pathLength={1} d="M9.5 4v24" />
      <path className="ia-dibujar ia-retraso-1" pathLength={1} d="M16 4v24" />
      <path className="ia-dibujar ia-retraso-2" pathLength={1} d="M22.5 4v24" />
      <g className="ia-pop ia-retraso-3">
        <circle className="ac-relleno" cx="9.5" cy="9.5" r="1.4" />
        <circle className="ac-relleno" cx="16" cy="9.5" r="1.4" />
        <circle className="ac-relleno" cx="22.5" cy="9.5" r="1.4" />
        <circle className="ac-relleno" cx="9.5" cy="16" r="1.4" />
        <circle className="ac-relleno" cx="16" cy="16" r="1.4" />
        <circle className="ac-relleno" cx="22.5" cy="16" r="1.4" />
        <circle className="ac-relleno" cx="9.5" cy="22.5" r="1.4" />
        <circle className="ac-relleno" cx="16" cy="22.5" r="1.4" />
        <circle className="ac-relleno" cx="22.5" cy="22.5" r="1.4" />
      </g>
    </IconoBase>
  );
}
