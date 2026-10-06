import CarruselProductos from "@/components/producto/CarruselProductos";
import AvisoCatalogo from "@/components/inicio/AvisoCatalogo";
import BannersPromocionales from "@/components/inicio/BannersPromocionales";
import BloqueBanners from "@/components/inicio/BloqueBanners";
import CarruselMarcas from "@/components/inicio/CarruselMarcas";
import ComoComprar from "@/components/inicio/ComoComprar";
import SeccionCategoria from "@/components/inicio/SeccionCategoria";
import {
  bannersLaterales,
  bannersPrincipales,
  bannersPromocionales,
  marcasDeProductos,
  seccionesCategoria,
} from "@/components/inicio/contenidoInicio";
import type { BannerInicio } from "@/components/inicio/contenidoInicio";
import Contenedor from "@/components/ui/Contenedor";
import { getCategorias, getProductosDestacados, getProductosPorCategoria } from "@/lib/catalogo";
import type { Categoria, Producto } from "@/types/catalogo";

// Página principal — responsable: persona A. Ver la distribución en docs/guia-de-estilo.md.
// Header, barra de categorías y Footer vienen de app/layout.tsx.

/** Si una consulta al catálogo falla, solo se oculta esa sección; la página no se rompe. */
async function seguro<T>(promesa: Promise<T>, respaldo: T): Promise<T> {
  try {
    return await promesa;
  } catch {
    return respaldo;
  }
}

/** Quita los banners que apuntan a una categoría que el catálogo no tiene (si se pudo consultar). */
function soloCategoriasExistentes(banners: BannerInicio[], categorias: Categoria[]): BannerInicio[] {
  if (categorias.length === 0) return banners;
  const slugs = new Set(categorias.map((c) => c.slug));
  return banners.filter((b) => {
    const slug = b.href.match(/^\/categoria\/([^/?#]+)/)?.[1];
    return !slug || slugs.has(slug);
  });
}

const sinProductos: Producto[] = [];

export default async function Inicio() {
  const [categorias, interesar, recomendados, productosPorSeccion] = await Promise.all([
    seguro(getCategorias(), []),
    seguro(getProductosDestacados("te-puede-interesar"), sinProductos),
    seguro(getProductosDestacados("recomendados"), sinProductos),
    Promise.all(
      seccionesCategoria.map((s) =>
        seguro(
          getProductosPorCategoria(s.slug, { porPagina: 10 }).then((r) => r.productos),
          sinProductos,
        ),
      ),
    ),
  ]);

  const todos = [...interesar, ...recomendados, ...productosPorSeccion.flat()];
  const principales = soloCategoriasExistentes(bannersPrincipales, categorias);
  const laterales = soloCategoriasExistentes(bannersLaterales, categorias);
  const promocionales = soloCategoriasExistentes(bannersPromocionales, categorias);

  return (
    <Contenedor className="space-y-8 pt-4 md:space-y-12 md:pt-6">
      <h1 className="sr-only">Centro Ferretero El Pico</h1>

      <div className="space-y-3 md:space-y-4">
        <BloqueBanners principales={principales} laterales={laterales} />
        <ComoComprar />
      </div>

      {todos.length === 0 ? (
        <AvisoCatalogo />
      ) : (
        <>
          <CarruselProductos titulo="Te puede interesar" productos={interesar} />

          <BannersPromocionales banners={promocionales} />

          <CarruselProductos titulo="Nuestros recomendados" productos={recomendados} />

          <CarruselMarcas titulo="Marcas que encuentras aquí" marcas={marcasDeProductos(todos)} />

          {seccionesCategoria.map((seccion, i) => {
            const categoria = categorias.find((c) => c.slug === seccion.slug);
            if (!categoria) return null;
            return (
              <SeccionCategoria
                key={seccion.slug}
                categoria={categoria}
                productos={productosPorSeccion[i]}
                banner={seccion.banner}
              />
            );
          })}
        </>
      )}
    </Contenedor>
  );
}
