import type { ReactNode } from "react";
import { Montanas } from "@/components/layout/Logo";

/**
 * Fondo de las páginas de calculadoras (pedido de persona B: que no se vea todo claro ni plano): una franja azul marino
 * arriba, con las montañas del logo muy tenues y el filete rojo abajo, detrás del título; las tarjetas y los pasos
 * blancos quedan montados encima de su borde y eso les da profundidad. `alto`: hasta dónde baja la franja.
 */
export default function FondoCalculadora({ children, alto = "h-[21rem] md:h-[23rem]" }: { children: ReactNode; alto?: string }) {
  return (
    <div className="relative isolate">
      <div className={`absolute inset-x-0 top-0 -z-10 overflow-hidden bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro print:hidden ${alto}`} aria-hidden>
        <Montanas className="absolute -right-16 -bottom-14 w-[26rem] fill-pico-blanco/[0.05] md:-right-10 md:w-[40rem]" />
        <Montanas className="absolute top-8 -left-24 hidden w-72 -scale-x-100 fill-pico-blanco/[0.035] lg:block" />
        <span className="absolute inset-x-0 bottom-0 h-1 bg-pico-rojo/90" />
      </div>
      {children}
    </div>
  );
}
