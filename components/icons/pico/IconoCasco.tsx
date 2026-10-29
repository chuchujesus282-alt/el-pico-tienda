import IconoBase, { type PropsIcono } from "./IconoBase";

/**
 * Seguridad industrial: el casco del banner del inicio (BannerTrabajaProtegido) a escala: cúpula con la franja roja
 * al centro, nervaduras a los lados y el ala curva.
 */
export default function IconoCasco(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <g className="ia-balanceo">
        <path className="ac-relleno" d="M13.9 20.8V9Q16 8.3 18.1 9v11.8z" />
        <path d="M6.5 20.8C6.5 12.7 10.9 8.6 16 8.6s9.5 4.1 9.5 12.2" />
        <path d="M11.2 10.3c-1.3 2.7-1.7 6.5-1.5 10.2M20.8 10.3c1.3 2.7 1.7 6.5 1.5 10.2" strokeWidth="1.2" />
        <path d="M3.4 21.2Q16 19.2 28.6 21.2q.5 1.7-1.4 2.2Q16 21.7 4.8 23.4q-1.9-.5-1.4-2.2z" />
      </g>
    </IconoBase>
  );
}
