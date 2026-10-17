import IconoBase, { type PropsIcono } from "./IconoBase";

/** Pick-up: fachada de la ferretería con toldo a rayas (rayas en rojo) que se mece. */
export default function IconoTienda(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <rect x="5" y="3.5" width="22" height="4.5" rx="1.2" />
      <path d="M10 5.75h12" />
      <g className="ia-balanceo">
        <path className="ac-relleno" d="M4 8h4l.67 5H5zM12 8h4v5h-3.67zM20 8h4l-.67 5h-3.66z" />
        <path d="M4 8h24l-1 5H5z" />
        <path d="M5 13a1.83 1.5 0 0 0 3.67 0a1.83 1.5 0 0 0 3.67 0a1.83 1.5 0 0 0 3.66 0a1.83 1.5 0 0 0 3.67 0a1.83 1.5 0 0 0 3.67 0a1.83 1.5 0 0 0 3.66 0" />
      </g>
      <path d="M6 16v12h20V16" />
      <path d="M3.5 28h25" />
      <path d="M13.5 28v-7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7" />
      <rect x="7.5" y="18" width="4" height="4" rx=".6" />
      <rect x="20.5" y="18" width="4" height="4" rx=".6" />
    </IconoBase>
  );
}
