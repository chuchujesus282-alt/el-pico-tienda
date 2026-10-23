import IconoBase, { type PropsIcono } from "./IconoBase";

/** Cerrajería: candado con el ojo de la llave rojo; el arco salta como al abrirse. */
export default function IconoCandado(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path className="ia-saltar" d="M10.5 14.5V10a5.5 5.5 0 0 1 11 0v4.5" />
      <rect x="6.5" y="14.5" width="19" height="14" rx="2.5" />
      <path className="ac-relleno-borde" d="M16 19a1.8 1.8 0 0 0-1 3.3l-.6 2.7h3.2l-.6-2.7A1.8 1.8 0 0 0 16 19z" strokeWidth="1.2" />
    </IconoBase>
  );
}
