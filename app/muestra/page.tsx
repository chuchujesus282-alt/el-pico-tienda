import type { Metadata } from "next";
import CarruselProductos from "@/components/producto/CarruselProductos";
import GrillaProductos from "@/components/producto/GrillaProductos";
import Badge from "@/components/ui/Badge";
import Boton from "@/components/ui/Boton";
import Contenedor from "@/components/ui/Contenedor";
import Precio from "@/components/ui/Precio";
import TituloSeccion from "@/components/ui/TituloSeccion";
import { getProductosDestacados, getProductosPorCategoria } from "@/lib/catalogo";

// VITRINA TEMPORAL para revisar los componentes compartidos. Bórrala (carpeta app/muestra) cuando ya no haga falta.

export const metadata: Metadata = { title: "Muestra de componentes", robots: { index: false } };

export default async function Muestra() {
  const [interesar, recomendados, herramientas] = await Promise.all([
    getProductosDestacados("te-puede-interesar"),
    getProductosDestacados("recomendados"),
    getProductosPorCategoria("herramientas", { porPagina: 4 }),
  ]);

  return (
    <Contenedor className="space-y-8 py-8 md:space-y-12 md:py-12">
      <TituloSeccion titulo="Muestra de componentes (temporal)" nivel="h1" />

      <section className="space-y-4 rounded-tarjeta border border-gris-borde bg-pico-blanco p-4 md:p-6">
        <TituloSeccion titulo="Piezas base" />
        <div className="flex flex-wrap items-center gap-3">
          <Boton>Primario</Boton>
          <Boton variante="secundario">Secundario</Boton>
          <Badge variante="oferta">Oferta</Badge>
          <Badge>Nuevo</Badge>
          <Precio valor={1289.5} />
        </div>
      </section>

      <CarruselProductos titulo="Te puede interesar" productos={interesar} href="/categoria/herramientas" />
      <CarruselProductos titulo="Nuestros recomendados" productos={recomendados} href="/categoria/plomeria" />

      <section>
        <TituloSeccion titulo="GrillaProductos" href="/categoria/herramientas" />
        <GrillaProductos productos={herramientas.productos} />
      </section>

      <section>
        <TituloSeccion titulo="GrillaProductos cargando" />
        <GrillaProductos productos={[]} cargando cantidadEsqueletos={4} />
      </section>
    </Contenedor>
  );
}
