import { Search, User } from "lucide-react";
import Contenedor from "@/components/ui/Contenedor";
import BotonCarrito from "./BotonCarrito";
import Logo from "./Logo";

/** Header azul: logo, buscador, "Mi cuenta" y carrito. En móvil el buscador baja a una segunda fila. */
export default function Header() {
  return (
    <header className="bg-pico-azul">
      <Contenedor className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3 md:flex-nowrap md:py-4">
        <Logo />

        {/* La página /buscar aún no existe: queda lista para cuando se construya. */}
        <form action="/buscar" role="search" className="order-last w-full md:order-none md:flex-1">
          <label htmlFor="buscador" className="sr-only">
            Buscar productos
          </label>
          <div className="flex h-11 items-center rounded-chip bg-pico-blanco pr-1 pl-4">
            <input
              id="buscador"
              name="q"
              type="search"
              placeholder="¿Qué estás buscando? Ej. cemento, taladro…"
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-texto outline-none placeholder:text-gris-texto"
            />
            <button
              type="submit"
              className="flex size-9 items-center justify-center rounded-chip bg-pico-rojo text-pico-blanco hover:bg-pico-rojo-oscuro"
              aria-label="Buscar"
            >
              <Search className="size-4" />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-3">
          {/* Fase 1: aún no hay cuentas de cliente; solo visual. */}
          <span
            className="flex items-center gap-2 rounded-boton p-2 text-sm font-medium text-pico-blanco"
            title="Muy pronto"
          >
            <User className="size-6 md:size-5" aria-hidden />
            <span className="hidden md:inline">Mi cuenta</span>
          </span>
          <BotonCarrito />
        </div>
      </Contenedor>
    </header>
  );
}
