import IconoBase, { type PropsIcono } from "./IconoBase";

/** Ve el material: lista de materiales en su tablilla, con el check rojo que se dibuja. */
export default function IconoLista(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <rect x="6.5" y="5.5" width="19" height="23" rx="2.2" />
      <rect className="ico-tapa" x="12" y="3.5" width="8" height="4" rx="1.2" />
      <path className="ac-trazo ia-dibujar" pathLength={1} d="M10.5 14l2 2 3.5-3.8" />
      <path d="M18 14.5h4M10.5 20.5H22M10.5 25h7" />
    </IconoBase>
  );
}
