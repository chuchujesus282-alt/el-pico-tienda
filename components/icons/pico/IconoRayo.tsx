import IconoBase, { type PropsIcono } from "./IconoBase";

/** Comprar ahora: rayo rojo, directo al pedido. */
export default function IconoRayo(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path className="ac-relleno-borde ia-pop" d="M18 3.5 7.5 18H15l-2 10.5L24.5 14H17z" />
    </IconoBase>
  );
}
