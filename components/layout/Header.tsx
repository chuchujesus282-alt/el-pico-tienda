import BuscadorConSugerencias from "@/components/busqueda/BuscadorConSugerencias";
import EnlaceCuenta from "@/components/cuenta/EnlaceCuenta";
import SelectorDireccion from "@/components/direcciones/SelectorDireccion";
import EnlaceFavoritos from "@/components/favoritos/EnlaceFavoritos";
import Contenedor from "@/components/ui/Contenedor";
import BotonCarrito from "./BotonCarrito";
import EnlaceCalculadoras from "./EnlaceCalculadoras";
import Logo from "./Logo";
import MarcaDesplazamiento from "./MarcaDesplazamiento";
import TasaBCV from "./TasaBCV";

/**
 * Header blanco: el logo (las montañas del rebranding) a la izquierda, el buscador como pieza
 * central (borde azul de marca) y a la derecha "Mi cuenta" y el carrito con su texto. En móvil
 * el logo y las píldoras van siempre en una sola fila y el buscador baja a la segunda.
 */
export default function Header() {
  return (
    // Desde 768px queda fijo arriba; al bajar la página (html[data-desplazado]) se vuelve translúcido con
    // desenfoque y una sombra más marcada, y el logo se achica un poco (solo transform: el alto no cambia).
    <header className="relative z-40 border-b border-pico-azul/10 bg-pico-azul-claro shadow-header transition-[background-color,box-shadow] duration-300 md:sticky md:top-0 [html[data-desplazado]_&]:bg-pico-azul-claro/85 [html[data-desplazado]_&]:shadow-tarjeta-hover [html[data-desplazado]_&]:backdrop-blur-md">
      <MarcaDesplazamiento />
      {/* En el teléfono es una cuadrícula: la primera fila (logo, tasa, dirección, calculadoras) nunca se parte, aunque
          la píldora de la tasa crezca o el iPhone tenga el texto/zoom más grande; el buscador va solo en la segunda. */}
      <Contenedor className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-2 gap-y-3 py-3 min-[400px]:gap-x-3 md:flex md:gap-x-6 md:py-4 lg:gap-x-8">
        <span className="origin-left transition-transform duration-300 ease-(--curva-suave) md:[html[data-desplazado]_&]:scale-[0.88]">
          <Logo placa={false} />
        </span>

        {/* Búsqueda inteligente con sugerencias en vivo (lib/recomendaciones/); Enter lleva a /buscar. */}
        <BuscadorConSugerencias className="order-last col-span-full w-full md:order-none md:max-w-[45rem] md:min-w-0 md:flex-1" />

        {/* Tasa BCV: píldora que crece con la cifra. En móvil va compacta, en la fila del logo. */}
        <TasaBCV className="ml-auto md:ml-0" />

        {/* "Entregar en": la dirección a la que va el pedido, gemela de la píldora de la tasa. */}
        <SelectorDireccion />

        <div className="flex items-center gap-1 md:ml-auto md:gap-2">
          {/* Calculadoras de proyectos: mismo estilo y protagonismo que "Mi cuenta" y el carrito. */}
          <EnlaceCalculadoras />
          {/* Favoritos, Mi cuenta y el carrito: en el teléfono viven en la barra inferior (BarraInferiorMovil). */}
          <EnlaceFavoritos className="hidden md:flex" />
          <EnlaceCuenta className="hidden md:flex" />
          <BotonCarrito />
        </div>
      </Contenedor>
    </header>
  );
}
