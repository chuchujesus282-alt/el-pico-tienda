import Link from "next/link";
import { SearchX } from "lucide-react";
import Contenedor from "@/components/ui/Contenedor";
import IconoCalculadora from "@/components/icons/pico/IconoCalculadora";

/** Calculadora inexistente (enlace viejo o mal escrito). */
export default function CalculadoraNoEncontrada() {
  return (
    <Contenedor className="py-12 md:py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-banner border border-gris-borde bg-pico-blanco px-6 py-12 text-center shadow-tarjeta motion-safe:animate-aparecer">
        <span className="flex size-20 items-center justify-center rounded-chip bg-pico-azul-claro">
          <SearchX className="size-10 text-pico-azul" strokeWidth={1.5} aria-hidden />
        </span>
        <h1 className="font-titulo text-2xl font-bold text-pico-azul">No encontramos esta calculadora</h1>
        <p className="max-w-sm text-[13px] text-gris-texto">Puede que el enlace haya cambiado. Mira todas las calculadoras disponibles.</p>
        <Link
          href="/calculadoras"
          className="mt-2 inline-flex h-11 items-center gap-2 rounded-boton bg-pico-azul px-5 text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-pico-azul-oscuro hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-0.5"
        >
          <IconoCalculadora className="size-5" />
          Ver calculadoras
        </Link>
      </div>
    </Contenedor>
  );
}
