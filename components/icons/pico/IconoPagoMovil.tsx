import IconoBase, { type PropsIcono } from "./IconoBase";

/** Pago móvil: teléfono con la moneda del pago en rojo y ondas que salen. */
export default function IconoPagoMovil(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <rect x="7.5" y="3.5" width="12.5" height="25" rx="2.6" />
      <path d="M12.1 6.5h3.3M12.5 25h2.5" />
      <circle className="ac-relleno-borde" cx="13.75" cy="15.5" r="3" />
      <path className="ia-onda" d="M23 12.5a4.5 4.5 0 0 1 0 6" />
      <path className="ia-onda ia-onda-2" d="M26.2 9.8a8.5 8.5 0 0 1 0 11.4" />
    </IconoBase>
  );
}
