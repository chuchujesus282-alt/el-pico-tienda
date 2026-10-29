import IconoBase, { type PropsIcono } from "./IconoBase";

/**
 * Grifería: el codo de la tarjeta de Grifería (CategoryCardPlomeria, codo A en reposo) a escala: entra por la
 * izquierda, baja, y la llave de paso roja va arriba; la llave gira.
 */
export default function IconoTuberia(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path d="M3.25 6.5v9" />
      <path d="M3.75 8h14.5a9 9 0 0 1 9 9v9" />
      <path d="M3.75 14h14.5a3 3 0 0 1 3 3v9" />
      <path d="M19.75 26.75h9" />
      <path d="M10.75 7.5v-2" />
      <path className="ac-trazo ia-oscilar" d="M8.5 5.25H13" strokeWidth="2.4" />
    </IconoBase>
  );
}
