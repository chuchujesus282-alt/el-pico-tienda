import type { Metadata } from "next";
import { Heart } from "lucide-react";
import ListaFavoritos from "@/components/favoritos/ListaFavoritos";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";

// Favoritos — responsable: persona A (rama `inicio`). Se guardan en el navegador del cliente
// (components/favoritos/almacenFavoritos.ts); cuando haya cuentas, podrán viajar con ella.

export const metadata: Metadata = {
  title: "Mis favoritos",
  description: "Los productos que guardaste con el corazón para comprarlos después.",
  robots: { index: false },
};

export default function PaginaFavoritos() {
  return (
    <>
      <EncabezadoPagina
        titulo="Mis favoritos"
        ruta={[{ texto: "Favoritos" }]}
        icono={Heart}
        descripcion="Lo que guardaste con el corazón, listo para cuando lo necesites."
      />
      <Contenedor className="py-6 md:py-10">
        <ListaFavoritos />
      </Contenedor>
    </>
  );
}
