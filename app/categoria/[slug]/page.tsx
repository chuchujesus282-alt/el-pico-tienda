import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BannerCalculadoras from "@/components/calculadoras/BannerCalculadoras";
import FiltrosActivos from "@/components/categoria/FiltrosActivos";
import FiltrosCategoria from "@/components/categoria/FiltrosCategoria";
import Paginacion from "@/components/categoria/Paginacion";
import PanelFiltrosMovil from "@/components/categoria/PanelFiltrosMovil";
import SelectorOrden from "@/components/categoria/SelectorOrden";
import SinResultados from "@/components/categoria/SinResultados";
import { hrefCategoria, leerEstado, OPCIONES_ORDEN } from "@/components/categoria/rutas";
import GrillaProductos from "@/components/producto/GrillaProductos";
import Contenedor from "@/components/ui/Contenedor";
import { bannerDeCategoria } from "@/components/categoria/banner/CategoriaBanner";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import { iconoDeCategoria } from "@/components/icons/pico/porCategoria";
import { getCategorias, getProductosPorCategoria } from "@/lib/catalogo";

// Página de categoría — responsable: persona B. Ver la sección "Página de categoría" en docs/guia-de-estilo.md.
// Si el catálogo falla, el error llega a error.tsx; mientras carga se muestra loading.tsx.

/** Categorías que muestran el banner de las calculadoras de obra al final. */
const CON_CALCULADORAS = new Set(["construccion", "pinturas", "ferreteria"]);

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

  // Cambia con cada filtro/orden/página: la grilla se vuelve a montar y repite su animación de entrada.
  // Banner propio de la categoría (plano técnico que reemplaza al encabezado, o fotos reales a la derecha); sin él, el plano con su ícono de siempre.
  const banner = bannerDeCategoria(slug);

  const claveVista = hrefCategoria(slug, estado, { pagina: estado.pagina });

  return (
    <div>
      {banner?.Propio ? (
        <banner.Propio
          nombre={categoria.nombre}
          texto={banner.texto}
          kicker={banner.kicker ?? ""}
        />
      ) : (
        <EncabezadoPagina
          etiqueta="Categoría"
          titulo={categoria.nombre}
          descripcion={banner?.texto}
          tituloPartes={banner?.tituloPartes}
          ruta={[{ texto: categoria.nombre }]}
          imagen={banner ? null : categoria.banner}
          icono={iconoDeCategoria(slug)}
          escena={banner?.Escena && <banner.Escena />}
        />
      )}

      <Contenedor className="py-6 md:py-10">
        <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
          <aside aria-label="Filtros" className="hidden lg:block">
            <div className="sticky top-6 rounded-banner border border-gris-borde bg-pico-blanco p-5 shadow-tarjeta motion-safe:animate-aparecer [animation-delay:120ms]">
              {filtros}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <PanelFiltrosMovil activos={filtrosActivos}>{filtros}</PanelFiltrosMovil>
              <p className="hidden text-sm text-gris-texto lg:block">
                {resultado.total > 0 ? (
                  <>
                    Mostrando <span className="font-semibold text-logo-marino">{resultado.productos.length}</span> de{" "}
                    <span className="font-semibold text-logo-marino">{resultado.total}</span>
                  </>
                ) : null}
              </p>
              <SelectorOrden
                actual={estado.orden}
                opciones={OPCIONES_ORDEN.map((o) => ({ ...o, href: hrefCategoria(slug, estado, { orden: o.valor }) }))}
              />
            </div>

            <FiltrosActivos slug={slug} estado={estado} />

            {resultado.productos.length > 0 ? (
              <div key={claveVista} className="motion-safe:animate-aparecer">
                <GrillaProductos productos={resultado.productos} titulo={`Productos de ${categoria.nombre}`} />
                <div className="mt-8">
                  <Paginacion slug={slug} estado={estado} totalPaginas={totalPaginas} />
                </div>
              </div>
            ) : (
              <SinResultados
                hrefLimpiar={hrefLimpiar ?? (estado.pagina > 1 ? hrefCategoria(slug, estado) : undefined)}
              />
            )}
          </div>
        </div>
      </Contenedor>

      {CON_CALCULADORAS.has(slug) && <BannerCalculadoras />}
    </div>
  );
}
