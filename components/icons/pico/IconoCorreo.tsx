import IconoBase, { type PropsIcono } from "./IconoBase";

/** Correo: sobre con el sello rojo que late. */
export default function IconoCorreo(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <rect x="4" y="7.5" width="24" height="17" rx="2.2" />
      <path d="M4.8 9 16 17l11.2-8" />
      <circle className="ac-relleno ia-pop" cx="16" cy="17" r="1.8" />
    </IconoBase>
  );
}
