import IconoBase, { type PropsIcono } from "./IconoBase";

/** Pide en un clic: carrito con la flecha roja de envío. */
export default function IconoCarritoEnvio(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path d="M3.5 6h3.2l2.8 13.5h13.2l3-9.5H8.2" />
      <circle cx="11.5" cy="24" r="1.9" />
      <circle cx="21" cy="24" r="1.9" />
      <path className="ac-trazo ia-deslizar" d="M12.5 14.7h6.5m-2.6-2.5 2.6 2.5-2.6 2.5" />
    </IconoBase>
  );
}
