import IconoBase, { type PropsIcono } from "./IconoBase";

/** Transferencia bancaria: fachada de banco con flechas de ida (roja) y vuelta. */
export default function IconoBanco(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path d="M4.5 10.5 16 4.5l11.5 6z" />
      <path d="M8 12.8v5.4M13 12.8v5.4M19 12.8v5.4M24 12.8v5.4" />
      <path d="M4.5 19.8h23" />
      <path className="ac-trazo ia-deslizar" d="M8 23.6h14m-2.6-2.4 2.6 2.4-2.6 2.4" />
      <path className="ia-deslizar-inv" d="M24 28.4H10m2.6-2.4L10 28.4l2.6 2.4" />
    </IconoBase>
  );
}
