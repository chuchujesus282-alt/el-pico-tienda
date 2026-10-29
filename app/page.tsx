import CarruselProductos from "@/components/producto/CarruselProductos";
import TePuedeInteresar from "@/components/recomendaciones/TePuedeInteresar";
import BannerCalculadoras from "@/components/inicio/BannerCalculadorasInicio";
import AvisoCatalogo from "@/components/inicio/AvisoCatalogo";
import BannersPromocionales from "@/components/inicio/BannersPromocionales";
import BloqueBanners from "@/components/inicio/BloqueBanners";
import CarruselMarcas from "@/components/inicio/CarruselMarcas";
import ColumnasCategorias from "@/components/inicio/ColumnasCategorias";
import NotaPedido from "@/components/inicio/NotaPedido";
import SeccionCategoria from "@/components/inicio/SeccionCategoria";
import { marcasDeProductos, seccionesCategoria } from "@/components/inicio/contenidoInicio";
import Contenedor from "@/components/ui/Contenedor";
import Revelar from "@/components/ui/Revelar";
import { getCategorias, getProductosDestacados } from "@/lib/catalogo";
import { elegirIndice, permiteForzarDia, porFormato, repartoDelIndice, rotacionActiva } from "@/lib/rotacionBanners";
import type { Producto } from "@/types/catalogo";

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

const sinProductos: Producto[] = [];

// Sin `revalidate`: el inicio ya se arma en cada visita (el índice de Saint se pide con no-store), así que el día de
// la rotación de banners se calcula siempre al momento y cambia justo a la medianoche de Caracas. Si algún día esta
// página pasa a ser estática, agrega `export const revalidate = 3600` para que no se quede en un día.
export default async function Inicio({ searchParams }: PageProps<"/">) {
  // Rotación de banners (lib/rotacionBanners.ts), calculada aquí en el servidor: el navegador recibe ya el reparto
  // del día, sin parpadeos. ?bannerDay=0..4 fuerza un día, solo fuera de producción.
  const forzado = permiteForzarDia() ? (await searchParams).bannerDay : undefined;
  const banners = porFormato(repartoDelIndice(elegirIndice({ fecha: new Date(), activa: rotacionActiva(), forzado })));

  // Productos reales de Saint: los códigos de datos/destacados.json y, si faltan, la mezcla automática del día
  // (lib/destacados.ts). Mientras no haya "Más vendidos", esto reemplaza a los productos de ejemplo de antes.
  const [categorias, interesar, recomendados, productosPorSeccion] = await Promise.all([
    seguro(getCategorias(), []),
    seguro(getProductosDestacados("te-puede-interesar"), sinProductos), // cliente nuevo; en el navegador se personaliza
    seguro(getProductosDestacados("recomendados"), sinProductos),
    Promise.all(seccionesCategoria.map((s) => seguro(getProductosDestacados(s.slug), sinProductos))),
  ]);

  const todos = [...interesar, ...recomendados, ...productosPorSeccion.flat()];

  const secciones = seccionesCategoria.flatMap((seccion, i) => {
    const categoria = categorias.find((c) => c.slug === seccion.slug);
    if (!categoria) return [];
    return [
      <Revelar key={seccion.slug}>
        <SeccionCategoria categoria={categoria} productos={productosPorSeccion[i]} imagen={seccion.imagen} />
      </Revelar>,
    ];
  });

  // Ritmo: banner + nota van juntos (llegada); entre secciones, aire amplio. Los banners se
  // intercalan con los productos en vez de apilarse, y el de calculadoras sigue a Construcción
  // (la primera sección), donde están los materiales que calcula.
  return (
    <Contenedor className="space-y-10 pt-4 md:space-y-14 md:pt-6">
      <h1 className="sr-only">Centro Ferretero El Pico</h1>

      <div className="space-y-3 motion-safe:animate-aparecer md:space-y-4">
        <BloqueBanners categorias={banners.central} />
        <NotaPedido />
      </div>

      {todos.length === 0 ? (
        <AvisoCatalogo />
      ) : (
        <>
          <Revelar>
            <TePuedeInteresar inicial={interesar} />
          </Revelar>

          <Revelar>
            <BannersPromocionales categorias={banners.horizontal} />
          </Revelar>

          <Revelar>
            <CarruselProductos titulo="Nuestros recomendados" productos={recomendados} />
          </Revelar>

          <Revelar>
            <CarruselMarcas titulo="Marcas que encuentras aquí" marcas={marcasDeProductos(todos)} />
          </Revelar>

          {/* Las columnas verticales del día, lejos de los horizontales: abren la parte de la página por categorías. */}
          <Revelar>
            <ColumnasCategorias categorias={banners.vertical} />
          </Revelar>

          {secciones[0]}

          <Revelar>
            <BannerCalculadoras />
          </Revelar>

          {secciones.slice(1)}
        </>
      )}
    </Contenedor>
  );
}
