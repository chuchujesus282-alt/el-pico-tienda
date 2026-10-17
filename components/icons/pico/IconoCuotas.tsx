import IconoBase, { type PropsIcono } from "./IconoBase";

/** Cashea: círculo dividido en cuatro cuotas; la primera, en rojo, ya pagada. */
export default function IconoCuotas(props: PropsIcono) {
  return (
    <IconoBase {...props}>
      <path className="ac-trazo ia-dibujar" pathLength={1} d="M16.87 6.04A10 10 0 0 1 25.96 15.13" />
      <path className="ia-dibujar ia-retraso-1" pathLength={1} d="M25.96 16.87A10 10 0 0 1 16.87 25.96" />
      <path className="ia-dibujar ia-retraso-2" pathLength={1} d="M15.13 25.96A10 10 0 0 1 6.04 16.87" />
      <path className="ia-dibujar ia-retraso-3" pathLength={1} d="M6.04 15.13A10 10 0 0 1 15.13 6.04" />
      <path d="M12.3 16.2l2.5 2.5 4.9-5" />
    </IconoBase>
  );
}
