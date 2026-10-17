import IconoBase, { type PropsIcono } from "./IconoBase";

/**
 * USDT: ESPACIO RESERVADO. Falta el logo oficial de Tether (tether.to no lo deja descargar directo);
 * cuando lo tengamos, se reemplaza por el logo como en IconoZelle. No dibujar un logo inventado.
 */
export default function IconoUsdt(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <circle cx="16" cy="16" r="11.5" strokeDasharray="2.5 2.5" />
      <text x="16" y="18.6" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor" stroke="none" letterSpacing=".4">
        USDT
      </text>
    </IconoBase>
  );
}
