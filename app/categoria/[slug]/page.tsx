import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BannerCalculadoras from "@/components/calculadoras/BannerCalculadoras";
import BuscarEnCategoria from "@/components/categoria/BuscarEnCategoria";
import RegistrarEvento from "@/components/eventos/RegistrarEvento";
import FiltrosActivos from "@/components/categoria/FiltrosActivos";
import FiltrosCategoria from "@/components/categoria/FiltrosCategoria";
import Paginacion from "@/components/categoria/Paginacion";
import PanelFiltrosMovil from "@/components/categoria/PanelFiltrosMovil";
import SelectorOrden from "@/components/categoria/SelectorOrden";
import SinCatalogo from "@/components/categoria/SinCatalogo";
import SinResultados from "@/components/categoria/SinResultados";
import { hrefCategoria, leerEstado, OPCIONES_ORDEN } from "@/components/categoria/rutas";
import GrillaProductos from "@/components/producto/GrillaProductos";
import Contenedor from "@/components/ui/Contenedor";
import { bannerDeCategoria } from "@/components/categoria/banner/CategoriaBanner";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import { iconoDeCategoria } from "@/components/icons/pico/porCategoria";
import { getCategorias, getProductosPorCategoria } from "@/lib/catalogo";
import { ErrorSaint } from "@/lib/saint";
import type { ResultadoCategoria } from "@/types/catalogo";

// Página de categoría — responsable: persona B. Ver la sección "Página de categoría" en docs/guia-de-estilo.md.
// Si el catálogo falla, el error llega a error.tsx; mientras carga se muestra loading.tsx.
// Datos (persona A): las categorías de lib/categoriasSaint.ts (hoy Herramientas) traen los productos reales de Saint
// vía lib/catalogo.ts; filtro, búsqueda (?q=), orden y página se resuelven en el servidor y solo llegan 24 productos.

/** Categorías que muestran el banner de las calculadoras de obra al final. */
const CON_CALCULADORAS = new Set(["construccion", "pinturas", "tornilleria"]);

/** Banner propio de la categoría (plano técnico que reemplaza al encabezado, o fotos reales a la derecha); sin él, el plano con su ícono de siempre. */
function EncabezadoCategoria({ slug, nombre, banner: imagen }: { slug: string; nombre: string; banner: string | null }) {
  const banner = bannerDeCategoria(slug);
  return banner?.Propio ? (
    <banner.Propio nombre={nombre} />
  ) : (
    <EncabezadoPagina
      etiqueta="Categoría"
      titulo={nombre}
      descripcion={banner?.texto}
      tituloPartes={banner?.tituloPartes}
      ruta={[{ texto: nombre }]}
      imagen={banner ? null : imagen}
      icono={iconoDeCategoria(slug)}
      escena={banner?.Escena && <banner.Escena />}
    />
  );
}

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

  // Si Saint no responde (y no hay lista guardada), la página sigue con su banner y muestra el aviso en lugar de la
  // grilla (SinCatalogo). Los demás errores siguen llegando a error.tsx.
  let resultado: ResultadoCategoria;
  try {
    resultado = await getProductosPorCategoria(slug, {
      pagina: estado.pagina,
      marca: estado.marca,
      subcategoria: estado.subcategoria,
      orden: estado.orden,
      q: estado.q,
    });
  } catch (error) {
    if (!(error instanceof ErrorSaint)) throw error;
    console.error(`[categoria] ${error.message}`);
    return (
      <div>
        <EncabezadoCategoria slug={slug} nombre={categoria.nombre} banner={categoria.banner} />
        <Contenedor className="py-10 md:py-14">
          <SinCatalogo hrefReintentar={hrefCategoria(slug, estado, { pagina: estado.pagina })} />
        </Contenedor>
      </div>
    );
  }

  const totalPaginas = Math.ceil(resultado.total / resultado.porPagina);
  const filtrosActivos = [estado.marca, estado.subcategoria].filter(Boolean).length;
  const hrefLimpiar =
    filtrosActivos || estado.q
      ? hrefCategoria(slug, estado, { marca: undefined, subcategoria: undefined, q: undefined })
      : undefined;

  const filtros = (
    <FiltrosCategoria
      slug={slug}
      estado={estado}
      subcategorias={resultado.subcategorias}
      marcas={resultado.marcas}
      cantidades={resultado.cantidades}
    />
  );

  // Cambia con cada filtro/orden/página: la grilla se vuelve a montar y repite su animación de entrada.
  const claveVista = hrefCategoria(slug, estado, { pagina: estado.pagina });

  return (
    <div>
      <EncabezadoCategoria slug={slug} nombre={categoria.nombre} banner={categoria.banner} />
      {/* Evento para análisis (persona A, lib/eventos/): no dibuja nada. */}
      <RegistrarEvento evento={{ tipo: "categoria_vista", categoria: slug, subcategoria: estado.subcategoria }} />

      <Contenedor className="py-6 md:py-10">
        <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
          <aside aria-label="Filtros" className="hidden lg:block">
            <div className="sticky top-6 rounded-banner border border-gris-borde bg-pico-blanco p-5 shadow-tarjeta motion-safe:animate-aparecer [animation-delay:120ms]">
              {filtros}
            </div>
          </aside>

          <div className="min-w-0">
            <BuscarEnCategoria slug={slug} nombre={categoria.nombre} estado={estado} />
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
