import IconoBase, { type PropsIcono } from "./IconoBase";

/** Cómo llegar: ruta roja que se dibuja desde un punto hasta el pin. */
export default function IconoRuta(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <circle cx="7.5" cy="24.5" r="2.2" />
      <path className="ac-trazo ia-dibujar" pathLength={1} d="M9.7 24.5h9a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7h4.8" />
      <path className="ia-saltar" d="M24 14s-3.5-3.2-3.5-5.9a3.5 3.5 0 0 1 7 0C27.5 10.8 24 14 24 14z" />
    </IconoBase>
  );
}
