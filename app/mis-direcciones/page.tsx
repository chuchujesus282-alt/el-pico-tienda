import type { Metadata } from "next";

import ListaDirecciones from "@/components/direcciones/ListaDirecciones";
import Contenedor from "@/components/ui/Contenedor";

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
      {/* Sin el banner azul (pedido de persona B): el título "Tus direcciones" (TituloPagina) va dentro de ListaDirecciones. */}
      <Contenedor className="py-6 md:py-10">
        <ListaDirecciones bienvenida={nombreBienvenida(bienvenida)} />
      </Contenedor>
    </>
  );
}
