import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BannerCategoria from "@/components/categoria/BannerCategoria";
import Breadcrumb from "@/components/categoria/Breadcrumb";
import FiltrosCategoria from "@/components/categoria/FiltrosCategoria";
import Paginacion from "@/components/categoria/Paginacion";
import PanelFiltrosMovil from "@/components/categoria/PanelFiltrosMovil";
import SelectorOrden from "@/components/categoria/SelectorOrden";
import SinResultados from "@/components/categoria/SinResultados";
import { hrefCategoria, leerEstado, OPCIONES_ORDEN } from "@/components/categoria/rutas";
import GrillaProductos from "@/components/producto/GrillaProductos";
import Contenedor from "@/components/ui/Contenedor";
import TituloSeccion from "@/components/ui/TituloSeccion";
import { getCategorias, getProductosPorCategoria } from "@/lib/catalogo";

// Página de categoría — responsable: persona B. Ver la sección "Página de categoría" en docs/guia-de-estilo.md.
// Si el catálogo falla, el error llega a error.tsx; mientras carga se muestra loading.tsx.

async function buscarCategoria(slug: string) {
  const categorias = await getCategorias();
  return categorias.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  try {
    const categoria = await buscarCategoria(slug);
    return { title: categoria?.nombre ?? "Categoría" };
  } catch {
    return { title: "Categoría" };
  }
}

export default async function PaginaCategoria({ params, searchParams }: PageProps<"/categoria/[slug]">) {
  const { slug } = await params;
  const estado = leerEstado(await searchParams);

  const categoria = await buscarCategoria(slug);
  if (!categoria) notFound();

  const resultado = await getProductosPorCategoria(slug, {
    pagina: estado.pagina,
    marca: estado.marca,
    subcategoria: estado.subcategoria,
    orden: estado.orden,
  });

  const totalPaginas = Math.ceil(resultado.total / resultado.porPagina);
  const filtrosActivos = [estado.marca, estado.subcategoria].filter(Boolean).length;
  const hrefLimpiar = filtrosActivos
    ? hrefCategoria(slug, estado, { marca: undefined, subcategoria: undefined })
    : undefined;

  const filtros = (
    <FiltrosCategoria
      slug={slug}
      estado={estado}
      subcategorias={resultado.subcategorias}
      marcas={resultado.marcas}
    />
  );

  return (
    <Contenedor className="py-6 md:py-8">
      <Breadcrumb actual={categoria.nombre} />

      <div className="mt-4">
        <BannerCategoria categoria={categoria} />
      </div>

      <div className="mt-8 md:mt-12">
        <TituloSeccion
          titulo={categoria.nombre}
          nivel="h1"
          acciones={
            <span className="text-[13px] text-gris-texto">
              {`${resultado.total} ${resultado.total === 1 ? "producto" : "productos"}`}
            </span>
          }
        />

        <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-6">
          <aside aria-label="Filtros" className="hidden lg:block">
            <div className="rounded-tarjeta border border-gris-borde bg-pico-blanco p-4 shadow-tarjeta">{filtros}</div>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3 lg:justify-end">
              <PanelFiltrosMovil activos={filtrosActivos}>{filtros}</PanelFiltrosMovil>
              <SelectorOrden
                actual={estado.orden}
                opciones={OPCIONES_ORDEN.map((o) => ({ ...o, href: hrefCategoria(slug, estado, { orden: o.valor }) }))}
              />
            </div>

            {resultado.productos.length > 0 ? (
              <>
                <GrillaProductos productos={resultado.productos} />
                <div className="mt-8">
                  <Paginacion slug={slug} estado={estado} totalPaginas={totalPaginas} />
                </div>
              </>
            ) : (
              <SinResultados
                hrefLimpiar={hrefLimpiar ?? (estado.pagina > 1 ? hrefCategoria(slug, estado) : undefined)}
              />
            )}
          </div>
        </div>
      </div>
    </Contenedor>
  );
}
