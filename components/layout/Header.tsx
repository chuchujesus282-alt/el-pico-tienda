import Link from "next/link";
import { Search, User } from "lucide-react";
import Contenedor from "@/components/ui/Contenedor";
import BotonCarrito from "./BotonCarrito";
import Logo from "./Logo";

/**
 * Header blanco: el logo (las montañas del rebranding) a la izquierda, el buscador como pieza
 * central (borde azul de marca) y a la derecha "Mi cuenta" y el carrito con su texto. En móvil
 * el buscador baja a una segunda fila.
 */
export default function Header() {
  return (
    <header className="relative z-10 border-b border-gris-borde bg-pico-blanco">
      <Contenedor className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3 md:flex-nowrap md:gap-x-10 md:py-4">
        <Logo placa={false} />

        {/* La página /buscar aún no existe: queda lista para cuando se construya. */}
        <form action="/buscar" role="search" className="order-last w-full md:order-none md:max-w-2xl md:flex-1">
          <label htmlFor="buscador" className="sr-only">
            Buscar productos
          </label>
          <div className="group flex h-12 items-center rounded-chip border-2 border-pico-azul bg-pico-blanco pr-1 pl-5 transition-shadow focus-within:shadow-tarjeta-hover focus-within:ring-4 focus-within:ring-pico-azul-claro">
            <Search
              className="mr-2 size-4 shrink-0 text-gris-texto transition-colors group-focus-within:text-pico-azul"
              aria-hidden
            />
            <input
              id="buscador"
              name="q"
              type="search"
              placeholder="¿Qué estás buscando? Ej. cemento, taladro…"
              className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-texto outline-none placeholder:text-gris-texto"
            />
            <button
              type="submit"
              className="group/buscar flex h-9 items-center justify-center gap-2 rounded-chip bg-pico-azul px-3 text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-pico-rojo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul md:px-5"
            >
              <Search
                className="size-4 transition-transform duration-300 motion-safe:group-hover/buscar:scale-110 motion-safe:group-hover/buscar:-rotate-12"
                aria-hidden
              />
              <span className="sr-only md:not-sr-only">Buscar</span>
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
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
