import type { ReactNode } from "react";
import { Montanas } from "@/components/layout/Logo";

/**
 * Fondo de las páginas de calculadoras (pedido de persona B: que no se vea plano): una franja arriba en un blanco
 * distinto al gris de la página (blanco que pasa a un azul muy claro), con las montañas del logo apenas marcadas y una
 * línea fina abajo, detrás del título; las tarjetas y los pasos quedan montados sobre su borde y eso les da
 * profundidad. `alto`: hasta dónde baja la franja.
 */
export default function FondoCalculadora({ children, alto = "h-[21rem] md:h-[23rem]" }: { children: ReactNode; alto?: string }) {
  return (
    <div className="relative isolate">
      <div
        className={`absolute inset-x-0 top-0 -z-10 overflow-hidden border-b border-pico-azul/10 bg-gradient-to-b from-pico-blanco via-pico-blanco/80 to-pico-azul-claro/70 print:hidden ${alto}`}
        aria-hidden
      >
        <Montanas className="absolute -right-16 -bottom-14 w-[26rem] fill-pico-azul/[0.045] md:-right-10 md:w-[40rem]" />
        <Montanas className="absolute top-8 -left-24 hidden w-72 -scale-x-100 fill-pico-azul/[0.03] lg:block" />
      </div>
      {children}
    </div>
  );
}
