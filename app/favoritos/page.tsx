import type { Metadata } from "next";

import ListaFavoritos from "@/components/favoritos/ListaFavoritos";
import Contenedor from "@/components/ui/Contenedor";

// Favoritos — responsable: persona A (rama `inicio`). Se guardan en el navegador del cliente
// (components/favoritos/almacenFavoritos.ts) y, con la sesión abierta, también en su cuenta
// (components/cuenta/SincronizarCuenta.tsx).

export const metadata: Metadata = {
  title: "Mis favoritos",
  description: "Los productos que guardaste con el corazón para comprarlos después.",
  robots: { index: false },
};

export default function PaginaFavoritos() {
  return (
    <>
      {/* Sin el banner azul (pedido de persona B): el título "Tus favoritos" (TituloPagina) va dentro de ListaFavoritos,
          que sabe cuántos hay. */}
      <Contenedor className="py-6 md:py-10">
        <ListaFavoritos />
      </Contenedor>
    </>
  );
}
