import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, House } from "lucide-react";
import AccionesCompra from "@/components/producto-detalle/AccionesCompra";
import CodigoCompartir from "@/components/producto-detalle/CodigoCompartir";
import { fuentePaginas } from "@/components/producto-detalle/fuentes";
import GaleriaZoom from "@/components/producto-detalle/GaleriaZoom";
import ResumenEstrellas from "@/components/producto-detalle/ResumenEstrellas";
import RutaProducto from "@/components/producto-detalle/RutaProducto";
import SeccionCalificaciones from "@/components/producto-detalle/SeccionCalificaciones";
import CarruselProductos from "@/components/producto/CarruselProductos";
import Contenedor from "@/components/ui/Contenedor";
import Precio from "@/components/ui/Precio";
import { getCategorias, getProducto, getProductosPorCategoria } from "@/lib/catalogo";
import { tituloProducto } from "@/lib/formato";
import { getOpiniones } from "@/lib/opiniones";
import { resumirOpiniones } from "@/lib/resumirOpiniones";
import type { Categoria, Producto } from "@/types/catalogo";

// Página de producto — responsable: persona B (rama `producto`).
// Si el catálogo falla al buscar el producto, el error llega a error.tsx; mientras carga se muestra loading.tsx.

async function buscarCategoria(slug: string): Promise<Categoria | null> {
  try {
    return (await getCategorias()).find((c) => c.slug === slug) ?? null;
  } catch {
    return null; // sin la categoría la página igual funciona (la ruta muestra solo Inicio)
  }
}

async function buscarRelacionados(producto: Producto): Promise<Producto[]> {
  try {
    const { productos } = await getProductosPorCategoria(producto.categoriaSlug, { porPagina: 11 });
    return productos.filter((p) => p.id !== producto.id).slice(0, 10);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps<"/producto/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const producto = await getProducto(id);
    return { title: producto ? tituloProducto(producto) : "Producto" };
  } catch {
    return { title: "Producto" };
  }
}

export default async function PaginaProducto({ params }: PageProps<"/producto/[id]">) {
  const { id } = await params;
  const producto = await getProducto(id);
  if (!producto) notFound();

  const [categoria, relacionados, opiniones] = await Promise.all([
    buscarCategoria(producto.categoriaSlug),
    buscarRelacionados(producto),
    getOpiniones(producto.id).catch(() => []),
  ]);
  const titulo = tituloProducto(producto);

  const resumen = resumirOpiniones(opiniones);
  const enlaceSecundario =
    "group inline-flex items-center gap-1.5 rounded-boton text-sm font-semibold text-logo-marino hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-logo-marino";

  return (
    <div className={fuentePaginas}>
      <Contenedor className="py-6 md:py-8">
        <RutaProducto categoria={categoria} actual={titulo} />

        <article className="mt-4 grid gap-6 md:mt-6 md:grid-cols-2 md:gap-8 lg:gap-12">
          <div className="motion-safe:animate-aparecer md:sticky md:top-6 md:self-start">
            <GaleriaZoom src={producto.imagen} alt={titulo} />
          </div>

          <div className="flex flex-col gap-5 motion-safe:animate-aparecer motion-safe:[animation-delay:120ms]">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {producto.marca && (
                  <span className="rounded-chip bg-logo-marino px-3 py-1 font-titulo text-xs font-bold tracking-[0.12em] text-pico-blanco uppercase">
                    {producto.marca}
                  </span>
                )}
                <CodigoCompartir codigo={producto.id} titulo={titulo} />
              </div>
              <h1 className="font-titulo text-[1.75rem] leading-tight font-bold text-logo-marino md:text-4xl">{titulo}</h1>
              <ResumenEstrellas resumen={resumen} href="#calificaciones" />
            </div>

            {producto.descripcion && (
              <div>
                <h2 className="font-titulo text-base font-bold text-logo-marino">Descripción</h2>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-texto">{producto.descripcion}</p>
              </div>
            )}

            <div className="relative overflow-hidden rounded-tarjeta border border-gris-borde bg-pico-blanco p-4 md:p-5">
              <span className="absolute inset-y-0 left-0 w-1 bg-logo-rojo" aria-hidden />
              <Precio valor={producto.precio} tamano="grande" tono="logo" className="font-titulo md:text-4xl" />
              <p className="mt-1 text-[13px] text-gris-texto">Precio referencial en dólares. No cobramos en la web.</p>
            </div>

            <AccionesCompra producto={producto} />

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gris-borde pt-4">
              {categoria && (
                <Link href={`/categoria/${categoria.slug}`} className={enlaceSecundario}>
                  <ArrowLeft className="size-4 transition-transform motion-safe:group-hover:-translate-x-1" aria-hidden />
                  Ver más de {categoria.nombre}
                </Link>
              )}
              <Link href="/" className={enlaceSecundario}>
                <House className="size-4" aria-hidden />
                Volver al inicio
              </Link>
            </div>
          </div>
        </article>

        <SeccionCalificaciones resumen={resumen} className="mt-10 md:mt-14" />

        <CarruselProductos
          titulo="También te puede interesar"
          productos={relacionados}
          href={categoria ? `/categoria/${categoria.slug}` : undefined}
          className="mt-10 md:mt-14"
        />
      </Contenedor>
    </div>
  );
}
