import IconoBase, { type PropsIcono } from "./IconoBase";

/** Electricidad: bombillo con el filamento rojo encendido y sus rayos. */
export default function IconoBombillo(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path className="ia-onda" d="M16 1.4v1.9M26.3 5.7l-1.3 1.3M5.7 5.7 7 7" strokeWidth="1.5" />
      <path d="M12 21.5a8 8 0 1 1 8 0V24h-8z" />
      <path d="M12.5 26.6h7M13.8 29.1h4.4" />
      <path className="ac-trazo ia-pop" d="M13.5 14.5l1.25 2.5L16 14.5l1.25 2.5 1.25-2.5" />
    </IconoBase>
  );
}
