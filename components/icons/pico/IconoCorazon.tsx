import IconoBase, { type PropsIcono } from "./IconoBase";

/** Favoritos: corazón con un destello rojo; late al pasar el mouse. */
export default function IconoCorazon(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path className="ia-pop" d="M16 26.5S5 20.2 5 12.6A5.6 5.6 0 0 1 16 10a5.6 5.6 0 0 1 11 2.6c0 7.6-11 13.9-11 13.9z" />
      <path className="ac-trazo ia-pop ia-retraso-1" d="M26.5 3.5v3M25 5h3" strokeWidth="1.5" />
    </IconoBase>
  );
}
