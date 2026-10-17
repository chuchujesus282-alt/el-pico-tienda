import IconoBase, { type PropsIcono } from "./IconoBase";

/** Herramientas: taladro con la broca roja, que vibra. */
export default function IconoTaladro(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <rect x="3.5" y="8" width="16" height="8.5" rx="3" />
      <path d="M7 10.8v2.8M9.5 10.8v2.8" strokeWidth="1.3" />
      <path d="M19.5 10.2h3v4h-3" />
      <path className="ac-trazo ia-deslizar" d="M22.5 12.2h6.3" strokeWidth="2" />
      <path d="M8 16.5 6.8 27h6l1.4-10.5M13.8 19.2h1.6M5.6 27h8.6" />
    </IconoBase>
  );
}
