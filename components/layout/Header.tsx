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
    <>
    {/* Desde 768px queda fijo arriba; al bajar la página (html[data-desplazado]) se vuelve translúcido con
        desenfoque y una sombra más marcada, y el logo se achica un poco (solo transform: el alto no cambia).
        En el teléfono se va con la página: lo único que queda fijo arriba es la barra del buscador (abajo). */}
    <header className="relative z-40 bg-pico-azul-claro transition-[background-color,box-shadow] duration-300 md:sticky md:top-0 md:border-b md:border-pico-azul/10 md:shadow-header md:[html[data-desplazado]_&]:bg-pico-azul-claro/85 md:[html[data-desplazado]_&]:shadow-tarjeta-hover md:[html[data-desplazado]_&]:backdrop-blur-md">
      <MarcaDesplazamiento />
      {/* En el teléfono es una cuadrícula: la primera fila (logo, tasa, dirección) nunca se parte, aunque la píldora de
          la tasa crezca o el iPhone tenga el texto/zoom más grande; el buscador va solo en la segunda. */}
      <Contenedor className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 pt-3 pb-1 min-[400px]:gap-x-3 md:flex md:gap-x-6 md:py-4 lg:gap-x-8">
        <span className="origin-left transition-transform duration-300 ease-(--curva-suave) md:[html[data-desplazado]_&]:scale-[0.88]">
          <Logo placa={false} />
        </span>

        {/* Búsqueda inteligente con sugerencias en vivo (lib/recomendaciones/); Enter lleva a /buscar. En el teléfono
            va aparte, en la barra fija de abajo. */}
        <BuscadorConSugerencias className="hidden md:block md:max-w-[45rem] md:min-w-0 md:flex-1" />

        {/* Tasa BCV: píldora que crece con la cifra. En móvil va compacta, en la fila del logo. */}
        <TasaBCV className="ml-auto md:ml-0" />

        {/* "Entregar en": la dirección a la que va el pedido, gemela de la píldora de la tasa. */}
        <SelectorDireccion />

        {/* Calculadoras, favoritos, Mi cuenta y el carrito: en el teléfono viven en la barra inferior
            (BarraInferiorMovil), así que todo este grupo es solo desde 768px. */}
        <div className="hidden items-center gap-1 md:ml-auto md:flex md:gap-2">
          {/* Calculadoras de proyectos: mismo estilo y protagonismo que "Mi cuenta" y el carrito. */}
          <EnlaceCalculadoras />
          <EnlaceFavoritos className="hidden md:flex" />
          <EnlaceCuenta className="hidden md:flex" />
          <BotonCarrito />
        </div>
      </Contenedor>
    </header>
    {/* Teléfono: solo el buscador, compacto, queda pegado arriba al bajar (como en las apps de tiendas). La tasa y la
        dirección se quedan en el header de arriba y se van con la página (la calculadora está en la barra inferior). */}
    <div className="sticky top-0 z-40 bg-pico-azul-claro/90 py-2 backdrop-blur-md transition-shadow duration-300 md:hidden [html[data-desplazado]_&]:shadow-header">
      <Contenedor>
        <BuscadorConSugerencias compacto />
      </Contenedor>
    </div>
    </>
  );
}
