import IconoBase, { type PropsIcono } from "./IconoBase";

/** Escríbenos: globo de chat con tres puntos rojos, como quien escribe. */
export default function IconoMensaje(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path d="M16 4.5c6.6 0 11.5 4.6 11.5 10.4S22.6 25.3 16 25.3c-1.6 0-3.1-.3-4.5-.8L5 27l1.7-5.4C5.3 19.7 4.5 17.4 4.5 15 4.5 9.1 9.4 4.5 16 4.5z" />
      <circle className="ac-relleno ia-pop" cx="11.5" cy="15" r="1.4" />
      <circle className="ac-relleno ia-pop ia-retraso-1" cx="16" cy="15" r="1.4" />
      <circle className="ac-relleno ia-pop ia-retraso-2" cx="20.5" cy="15" r="1.4" />
    </IconoBase>
  );
}
