import type { Metadata } from "next";
import ContenidoCarrito from "@/components/carrito/ContenidoCarrito";
import IconoCarrito from "@/components/icons/pico/IconoCarrito";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";

// Carrito como página propia — responsable: persona A. Es la pestaña "Carrito" de la barra inferior del teléfono
// (en escritorio el carrito sigue siendo el panel lateral, pero esta página también funciona ahí).

export const metadata: Metadata = {
  title: "Mi carrito",
  description: "Los productos de tu pedido, listos para finalizar la compra por WhatsApp.",
  robots: { index: false },
};

export default function PaginaCarrito() {
  return (
    <>
      <EncabezadoPagina titulo="Mi carrito" ruta={[{ texto: "Carrito" }]} icono={IconoCarrito} />
      <Contenedor className="py-6 md:py-10">
        <div className="mx-auto max-w-2xl">
          <ContenidoCarrito modo="pagina" />
        </div>
      </Contenedor>
    </>
  );
}
