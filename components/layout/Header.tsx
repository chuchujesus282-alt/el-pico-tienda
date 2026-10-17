import Link from "next/link";
import BuscadorConSugerencias from "@/components/busqueda/BuscadorConSugerencias";
import IconoCalculadora from "@/components/icons/pico/IconoCalculadora";
import IconoUsuario from "@/components/icons/pico/IconoUsuario";
import SelectorDireccion from "@/components/direcciones/SelectorDireccion";
import EnlaceFavoritos from "@/components/favoritos/EnlaceFavoritos";
import Contenedor from "@/components/ui/Contenedor";
import BotonCarrito from "./BotonCarrito";
import Logo from "./Logo";
import MarcaDesplazamiento from "./MarcaDesplazamiento";
import TasaBCV from "./TasaBCV";

/**
 * Header blanco: el logo (las montañas del rebranding) a la izquierda, el buscador como pieza
 * central (borde azul de marca) y a la derecha "Mi cuenta" y el carrito con su texto. En móvil
 * el buscador baja a una segunda fila.
 */
export default function Header() {
  return (
    // Desde 768px queda fijo arriba; al bajar la página (html[data-desplazado]) se vuelve translúcido con
    // desenfoque y una sombra más marcada, y el logo se achica un poco (solo transform: el alto no cambia).
    <header className="relative z-40 border-b border-pico-azul/10 bg-pico-azul-claro shadow-header transition-[background-color,box-shadow] duration-300 md:sticky md:top-0 [html[data-desplazado]_&]:bg-pico-azul-claro/85 [html[data-desplazado]_&]:shadow-tarjeta-hover [html[data-desplazado]_&]:backdrop-blur-md">
      <MarcaDesplazamiento />
      <Contenedor className="flex flex-wrap items-center gap-x-3 gap-y-3 py-3 md:flex-nowrap md:gap-x-6 md:py-4 lg:gap-x-8">
        <span className="origin-left transition-transform duration-300 ease-(--curva-suave) md:[html[data-desplazado]_&]:scale-[0.88]">
          <Logo placa={false} />
        </span>

        {/* Búsqueda inteligente con sugerencias en vivo (lib/recomendaciones/); Enter lleva a /buscar. */}
        <BuscadorConSugerencias className="order-last w-full md:order-none md:max-w-[45rem] md:min-w-0 md:flex-1" />

        {/* Tasa BCV: píldora que crece con la cifra. En móvil va compacta, en la fila del logo. */}
        <TasaBCV className="ml-auto md:ml-0" />

        {/* "Entregar en": la dirección a la que va el pedido, gemela de la píldora de la tasa. */}
        <SelectorDireccion />

        <div className="flex items-center gap-1 md:ml-auto md:gap-2">
          {/* Calculadoras de proyectos: mismo estilo y protagonismo que "Mi cuenta" y el carrito. */}
          <Link
            href="/calculadoras"
            className="group grupo-icono flex items-center gap-2 rounded-boton p-2.5 text-sm font-semibold text-pico-azul transition-colors hover:bg-pico-azul-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
          >
            <IconoCalculadora className="size-7" />
            <span className="sr-only lg:not-sr-only">Calculadoras</span>
          </Link>
          {/* Favoritos, Mi cuenta y el carrito: en el teléfono viven en la barra inferior (BarraInferiorMovil). */}
          <EnlaceFavoritos className="hidden md:flex" />
          <Link
            href="/iniciar-sesion"
            className="group grupo-icono hidden items-center md:flex gap-2 rounded-boton p-2.5 text-sm font-semibold text-pico-azul transition-colors hover:bg-pico-azul-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
          >
            <IconoUsuario className="size-7" />
            <span className="sr-only lg:not-sr-only">Mi cuenta</span>
          </Link>
          <BotonCarrito />
        </div>
      </Contenedor>
    </header>
  );
}
