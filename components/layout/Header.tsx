import { Search, User } from "lucide-react";
import Contenedor from "@/components/ui/Contenedor";
import BotonCarrito from "./BotonCarrito";
import Logo from "./Logo";

/**
 * Header blanco: el logo manda a la izquierda, el buscador es la pieza central (borde azul de
 * marca) y a la derecha "Mi cuenta" y el carrito con su texto. En móvil el buscador baja a una
 * segunda fila.
 */
export default function Header() {
  return (
    <header className="bg-pico-blanco">
      <Contenedor className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3 md:flex-nowrap md:gap-x-10 md:py-4">
        <Logo placa={false} />

        {/* La página /buscar aún no existe: queda lista para cuando se construya. */}
        <form action="/buscar" role="search" className="order-last w-full md:order-none md:max-w-2xl md:flex-1">
          <label htmlFor="buscador" className="sr-only">
            Buscar productos
          </label>
          <div className="flex h-12 items-center rounded-chip border-2 border-pico-azul bg-pico-blanco pr-1 pl-5 transition-shadow focus-within:ring-4 focus-within:ring-pico-azul-claro">
            <input
              id="buscador"
              name="q"
              type="search"
              placeholder="¿Qué estás buscando? Ej. cemento, taladro…"
              className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-texto outline-none placeholder:text-gris-texto"
            />
            <button
              type="submit"
              className="flex h-9 items-center justify-center gap-2 rounded-chip bg-pico-azul px-3 text-sm font-semibold text-pico-blanco transition-colors hover:bg-pico-azul-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul md:px-5"
            >
              <Search className="size-4" aria-hidden />
              <span className="sr-only md:not-sr-only">Buscar</span>
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          {/* Fase 1: aún no hay cuentas de cliente; solo visual. */}
          <span
            className="flex items-center gap-2 rounded-boton p-2 text-sm font-semibold text-pico-azul"
            title="Muy pronto"
          >
            <User className="size-6" aria-hidden />
            <span className="hidden lg:inline">Mi cuenta</span>
          </span>
          <BotonCarrito />
        </div>
      </Contenedor>
    </header>
  );
}
