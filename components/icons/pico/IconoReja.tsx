import IconoBase, { type PropsIcono } from "./IconoBase";

/** Pintar rejas y metal: reja de barrotes con puntas de lanza; al pasar el mouse una franja roja de esmalte la pinta. */
export default function IconoReja(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path d="M4 10.5h24M4 25.5h24" />
      <path d="M8 27.5V8M13.3 27.5V8M18.7 27.5V8M24 27.5V8" />
      <path d="M8 4.5 6.6 8h2.8zM13.3 4.5 11.9 8h2.8zM18.7 4.5 17.3 8h2.8zM24 4.5 22.6 8h2.8z" strokeWidth="1.4" />
      <path className="ac-trazo ia-dibujar" pathLength={1} d="M5 18c3.5-1.6 7-1.6 11 0s7.5 1.6 11 0" strokeWidth="2.4" />
    </IconoBase>
  );
}
