import IconoBase, { type PropsIcono } from "./IconoBase";

/** Horario: reloj con el centro rojo; las agujas dan la vuelta. */
export default function IconoReloj(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <circle cx="16" cy="16" r="11.5" />
      <path d="M16 5.6v1.4M26.4 16H25M16 26.4V25M5.6 16H7" />
      <path className="ia-aguja" d="M16 16V9.5" />
      <path d="M16 16l4.4 2.8" />
      <circle className="ac-relleno" cx="16" cy="16" r="1.7" />
    </IconoBase>
  );
}
