import IconoBase, { type PropsIcono } from "./IconoBase";

/** Carrito: carrito con una caja roja adentro que rebota. */
export default function IconoCarrito(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path d="M3.5 6h3.2l2.8 13.5h13.2l3-9.5H8.2" />
      <circle cx="11.5" cy="24" r="1.9" />
      <circle cx="21" cy="24" r="1.9" />
      <g className="ia-rebote">
        <rect className="ac-relleno-borde" x="12" y="10.3" width="6.5" height="5.2" rx=".7" />
        <path d="M15.25 10.3v2" strokeWidth="1.2" />
      </g>
    </IconoBase>
  );
}
