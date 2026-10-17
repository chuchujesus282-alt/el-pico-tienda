import IconoBase, { type PropsIcono } from "./IconoBase";

/** Pago combinado: dos caminos que se unen en un punto rojo y siguen juntos. */
export default function IconoCombinado(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <circle cx="7" cy="5.5" r="1.6" />
      <circle cx="25" cy="5.5" r="1.6" />
      <path className="ia-dibujar" pathLength={1} d="M7 7.2c0 5.8 9 6 9 11.3" />
      <path className="ia-dibujar" pathLength={1} d="M25 7.2c0 5.8-9 6-9 11.3" />
      <path d="M16 18.5V27m-3-3 3 3 3-3" />
      <circle className="ac-relleno ia-pop ia-retraso-2" cx="16" cy="18.5" r="2.3" />
    </IconoBase>
  );
}
