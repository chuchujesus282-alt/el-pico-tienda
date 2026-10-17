import IconoBase, { type PropsIcono } from "./IconoBase";

/** Delivery: moto de reparto de perfil con la caja trasera en rojo; avanza y deja líneas de velocidad. */
export default function IconoMoto(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path className="ia-velocidad" d="M.8 20.5H3M1.6 24h1.8" />
      <g className="ia-avanzar">
        <circle cx="8.5" cy="23" r="3.5" />
        <circle cx="24.5" cy="23" r="3.5" />
        <rect className="ac-relleno-borde" x="4.5" y="9.5" width="8" height="7" rx="1.2" />
        <path d="M4.5 12.8h8" />
        <path d="M8.5 23l3-4.5" />
        <path d="M11 18.5h7.5" />
        <path d="M12 23h7.5l2.8-5.6" />
        <path d="M24.5 23l-3.2-10.5h-2.3" />
      </g>
    </IconoBase>
  );
}
