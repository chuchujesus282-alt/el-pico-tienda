import type { Metadata } from "next";
import { MapPinned } from "lucide-react";
import ListaDirecciones from "@/components/direcciones/ListaDirecciones";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";

// Mis direcciones — responsable: persona B. Las direcciones viven en el navegador del cliente
// (components/direcciones/almacenDirecciones.ts); cuando haya cuentas, viajarán con ella.
// /mis-direcciones?bienvenida=María → recién creó su cuenta: se le da la bienvenida por su nombre.

export const metadata: Metadata = {
  title: "Mis direcciones",
  description: "Los lugares donde recibes tus pedidos, marcados en el mapa.",
  robots: { index: false },
};

/** Solo el primer nombre, limpio y corto (llega por la URL). */
function nombreBienvenida(valor: string | string[] | undefined): string | undefined {
  const texto = (Array.isArray(valor) ? valor[0] : valor)?.trim().split(/\s+/)[0];
  return texto ? texto.slice(0, 24) : undefined;
}

export default async function PaginaMisDirecciones({ searchParams }: PageProps<"/mis-direcciones">) {
  const { bienvenida } = await searchParams;
  return (
    <>
      <EncabezadoPagina
        titulo="Mis direcciones"
        ruta={[{ texto: "Mis direcciones" }]}
        icono={MapPinned}
        descripcion="Guarda los lugares donde recibes tus pedidos y elige uno en cada compra."
      />
      <Contenedor className="py-6 md:py-10">
        <ListaDirecciones bienvenida={nombreBienvenida(bienvenida)} />
      </Contenedor>
    </>
  );
}
