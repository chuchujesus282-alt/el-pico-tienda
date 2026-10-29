import IconoBase, { type PropsIcono } from "./IconoBase";

/**
 * Vehículos: la llanta de la tarjeta de Vehículos (CategoryCardVehiculos) a escala: neumático con su banda de
 * rodadura, rin de 5 rayos y la tapa roja al centro; da la vuelta.
 */
export default function IconoLlanta(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <g className="ia-girar">
        <circle cx="16" cy="16" r="12.5" />
        <circle cx="16" cy="16" r="10.6" strokeDasharray="1.5 2.6" strokeWidth="1.2" />
        <circle cx="16" cy="16" r="8.5" />
        <path
          d="M16 12.8V7.5M19 15l5.1-1.6M17.9 18.6l3.1 4.3M14.1 18.6 11 22.9M13 15l-5.1-1.6"
          strokeWidth="1.4"
        />
        <circle className="ac-relleno" cx="16" cy="16" r="2.7" />
      </g>
    </IconoBase>
  );
}
