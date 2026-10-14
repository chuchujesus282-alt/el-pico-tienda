import CarruselProductos from "@/components/producto/CarruselProductos";
import TePuedeInteresar from "@/components/recomendaciones/TePuedeInteresar";
import BannerCalculadoras from "@/components/calculadoras/BannerCalculadoras";
import AvisoCatalogo from "@/components/inicio/AvisoCatalogo";
import BloqueBanners from "@/components/inicio/BloqueBanners";
import CarruselMarcas from "@/components/inicio/CarruselMarcas";
import NotaPedido from "@/components/inicio/NotaPedido";
import SeccionCategoria from "@/components/inicio/SeccionCategoria";
import { SECCIONES_DESTACADAS } from "@/components/inicio/seccionesDestacadas";
import {
  bannersPrincipales,
  marcasDeProductos,
  seccionesCategoria,
} from "@/components/inicio/contenidoInicio";
import type { BannerInicio } from "@/components/inicio/contenidoInicio";
import CirculosSecciones from "@/components/ui/CirculosSecciones";
import Contenedor from "@/components/ui/Contenedor";
import Franja from "@/components/ui/Franja";
import Revelar from "@/components/ui/Revelar";
import { getCategorias, getMasVendidos, getProductosDestacados, getProductosPorCategoria } from "@/lib/catalogo";
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
    seguro(getMasVendidos(10), sinProductos), // cliente nuevo; en el navegador se personaliza
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

  // Secciones por categoría que sí tienen productos, para alternar bien el color de sus franjas.
  const seccionesVisibles = seccionesCategoria.flatMap((seccion, i) => {
    const categoria = categorias.find((c) => c.slug === seccion.slug);
    return categoria && productosPorSeccion[i].length > 0 ? [{ seccion, categoria, productos: productosPorSeccion[i] }] : [];
  });

  // La página se arma con franjas a todo el ancho que alternan gris y blanco (ver components/ui/Franja.tsx).
  return (
    <>
      <h1 className="sr-only">Centro Ferretero El Pico</h1>

      <Contenedor className="pt-4 motion-safe:animate-aparecer md:pt-6">
        <BloqueBanners principales={principales} />
      </Contenedor>

      <Contenedor className="pt-3 pb-6 md:pt-4 md:pb-8">
        <NotaPedido />
      </Contenedor>

      <Franja tono="blanco" compacta>
        <CirculosSecciones titulo="Lo más buscado" secciones={SECCIONES_DESTACADAS} />
      </Franja>

      {todos.length === 0 ? (
        <Franja>
          <AvisoCatalogo />
        </Franja>
      ) : (
        <>
          <Franja>
            <Revelar>
              <TePuedeInteresar inicial={interesar} />
            </Revelar>
          </Franja>

          <BannerCalculadoras />

          <Franja>
            <Revelar>
              <CarruselProductos titulo="Nuestros recomendados" productos={recomendados} />
            </Revelar>
          </Franja>

          <Franja tono="blanco">
            <Revelar>
              <CarruselMarcas titulo="Marcas que encuentras aquí" marcas={marcasDeProductos(todos)} />
            </Revelar>
          </Franja>

          {seccionesVisibles.map(({ seccion, categoria, productos }, i) => (
            <Franja key={seccion.slug} tono={i % 2 === 0 ? "gris" : "blanco"}>
              <Revelar>
                <SeccionCategoria categoria={categoria} productos={productos} imagen={seccion.imagen} />
              </Revelar>
            </Franja>
          ))}
        </>
      )}
    </>
  );
}
