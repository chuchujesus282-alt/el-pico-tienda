import Link from "next/link";
import { Calculator, User } from "lucide-react";
import BuscadorConSugerencias from "@/components/busqueda/BuscadorConSugerencias";
import Contenedor from "@/components/ui/Contenedor";
import BotonCarrito from "./BotonCarrito";
import Logo from "./Logo";
import TasaBCV from "./TasaBCV";

/**
 * Header blanco: el logo (las montañas del rebranding) a la izquierda, el buscador como pieza
 * central (borde azul de marca) y a la derecha "Mi cuenta" y el carrito con su texto. En móvil
 * el buscador baja a una segunda fila.
 */
export default function Header() {
  return (
    <header className="relative z-10 border-b border-gris-borde bg-pico-blanco">
      <Contenedor className="flex flex-wrap items-center gap-x-3 gap-y-3 py-3 md:flex-nowrap md:gap-x-6 md:py-4 lg:gap-x-8">
        <Logo placa={false} />

        {/* Búsqueda inteligente con sugerencias en vivo (lib/recomendaciones/); Enter lleva a /buscar. */}
        <BuscadorConSugerencias className="order-last w-full md:order-none md:max-w-[45rem] md:min-w-0 md:flex-1" />

        {/* Tasa BCV: píldora que crece con la cifra. En móvil va compacta, en la fila del logo. */}
        <TasaBCV className="ml-auto md:ml-0" />

        <div className="flex items-center gap-1 md:ml-auto md:gap-2">
          {/* Calculadoras de proyectos: acceso discreto (en gris y más pequeño que "Mi cuenta" y el carrito). En móvil se llega por el inicio y el footer. */}
          <Link
            href="/calculadoras"
            className="group hidden items-center gap-1.5 rounded-boton p-2 text-[13px] font-medium text-gris-texto transition-colors hover:bg-pico-azul-claro hover:text-pico-azul focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul md:flex"
          >
            <Calculator className="size-5 transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5" aria-hidden />
            <span className="sr-only xl:not-sr-only">Calculadoras</span>
          </Link>
          <Link
            href="/iniciar-sesion"
            className="group flex items-center gap-2 rounded-boton p-2 text-sm font-semibold text-pico-azul transition-colors hover:bg-pico-azul-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
          >
            <User className="size-6 transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5" aria-hidden />
            <span className="sr-only lg:not-sr-only">Mi cuenta</span>
          </Link>
          <BotonCarrito />
        </div>
      </Contenedor>
    </header>
  );
}
