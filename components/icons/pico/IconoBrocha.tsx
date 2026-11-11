import IconoBase, { type PropsIcono } from "./IconoBase";

/** Barnizar madera: brocha sobre una tabla con sus vetas; la franja roja de barniz se dibuja al pasar el mouse. */
export default function IconoBrocha(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <rect x="3.5" y="19.5" width="25" height="8" rx="1.5" />
      <path d="M7 23.5c3-1 5 1 8 0s5 1 9 0" strokeWidth="1" />
      <path className="ac-trazo ia-dibujar" pathLength={1} d="M5.5 21.6h12" strokeWidth="2.2" />
      <g className="ia-deslizar">
        <path d="M19 4.5h5a1 1 0 0 1 1 1v4h-7v-4a1 1 0 0 1 1-1z" />
        <path d="M17 9.5h9v3.3a1.7 1.7 0 0 1-1.7 1.7h-5.6a1.7 1.7 0 0 1-1.7-1.7z" />
        <path d="M18.5 14.5v2.5M21.5 14.5v3M24.5 14.5v2.5" strokeWidth="1.4" />
      </g>
    </IconoBase>
  );
}
