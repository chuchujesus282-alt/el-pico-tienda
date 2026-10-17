import type { Metadata } from "next";
import { MapPinPlus } from "lucide-react";
import FormularioDireccion from "@/components/direcciones/FormularioDireccion";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";

// Agregar o editar una dirección — responsable: persona B.
// /mis-direcciones/nueva                          → dirección nueva.
// /mis-direcciones/nueva?editar=ID                → edita esa dirección.
// /mis-direcciones/nueva?volver=/finalizar-pedido → al guardar vuelve ahí (solo rutas internas).

export const metadata: Metadata = { title: "Agregar dirección", robots: { index: false } };

function primero(valor: string | string[] | undefined): string | undefined {
  return (Array.isArray(valor) ? valor[0] : valor)?.trim() || undefined;
}

/** Solo rutas de la tienda: "//otro-sitio.com" o "https://…" no se aceptan. */
function rutaInterna(valor: string | undefined): string | undefined {
  return valor && valor.startsWith("/") && !valor.startsWith("//") && !valor.includes("\\") ? valor : undefined;
}

export default async function PaginaNuevaDireccion({ searchParams }: PageProps<"/mis-direcciones/nueva">) {
  const parametros = await searchParams;
  const editar = primero(parametros.editar);
  return (
    <>
      <EncabezadoPagina
        titulo={editar ? "Editar dirección" : "Agregar dirección"}
        ruta={[{ texto: "Mis direcciones", href: "/mis-direcciones" }, { texto: editar ? "Editar" : "Agregar" }]}
        icono={MapPinPlus}
        descripcion="Marca el punto en el mapa, ponle un nombre y dile al repartidor cómo llegar."
      />
      <Contenedor className="py-6 md:py-10">
        <FormularioDireccion editarId={editar} volver={rutaInterna(primero(parametros.volver))} />
      </Contenedor>
    </>
  );
}
