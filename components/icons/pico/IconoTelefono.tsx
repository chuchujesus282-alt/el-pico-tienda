import IconoBase, { type PropsIcono } from "./IconoBase";

/** Llámanos: auricular de teléfono con el timbre rojo sonando. */
export default function IconoTelefono(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path d="M7 5h4.2l2.1 5.2-2.6 1.9a14 14 0 0 0 7.2 7.2l1.9-2.6 5.2 2.1V23a2 2 0 0 1-2.2 2C12.6 24.2 7.8 19.4 5 8.2A2 2 0 0 1 7 5z" />
      <path className="ac-trazo ia-onda" d="M19.5 4.5a8 8 0 0 1 8 8" />
      <path className="ac-trazo ia-onda ia-onda-2" d="M19.5 8.5a4 4 0 0 1 4 4" />
    </IconoBase>
  );
}
