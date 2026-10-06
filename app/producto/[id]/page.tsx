import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, House } from "lucide-react";
import AccionesCompra from "@/components/producto-detalle/AccionesCompra";
import OpcionesEntrega from "@/components/producto-detalle/OpcionesEntrega";
import RutaProducto from "@/components/producto-detalle/RutaProducto";
import { tituloProducto } from "@/components/producto-detalle/tituloProducto";
import CarruselProductos from "@/components/producto/CarruselProductos";
import ImagenProducto from "@/components/producto/ImagenProducto";
import Boton from "@/components/ui/Boton";
import Contenedor from "@/components/ui/Contenedor";
import Precio from "@/components/ui/Precio";
import { getCategorias, getProducto, getProductosPorCategoria } from "@/lib/catalogo";
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

  const [categoria, relacionados] = await Promise.all([
    buscarCategoria(producto.categoriaSlug),
    buscarRelacionados(producto),
  ]);
  const titulo = tituloProducto(producto);

  return (
    <Contenedor className="py-6 md:py-8">
      <RutaProducto categoria={categoria} actual={titulo} />

      <article className="mt-4 grid gap-6 md:mt-6 md:grid-cols-2 md:gap-8 lg:gap-12">
        <div className="md:sticky md:top-6 md:self-start">
          <ImagenProducto
            src={producto.imagen}
            alt={titulo}
            sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
            className="rounded-tarjeta border border-gris-borde shadow-tarjeta"
          />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <p className="text-[13px] text-gris-texto">
              {producto.marca && <span className="font-semibold uppercase text-pico-azul">{producto.marca}</span>}
              {producto.marca && " · "}
              Cód. {producto.id}
            </p>
            <h1 className="mt-1 text-2xl leading-tight font-bold text-pico-azul md:text-3xl">{titulo}</h1>
          </div>

          {producto.descripcion && (
            <div>
              <h2 className="text-sm font-bold text-pico-azul">Descripción</h2>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-texto">{producto.descripcion}</p>
            </div>
          )}

          <div className="border-y border-gris-borde py-4">
            <Precio valor={producto.precio} tamano="grande" className="md:text-3xl" />
            <p className="mt-1 text-[13px] text-gris-texto">Precio referencial en dólares. No cobramos en la web.</p>
          </div>

          <AccionesCompra producto={producto} />

          <OpcionesEntrega />

          <div className="flex flex-wrap gap-3">
            <Boton href="/" variante="secundario">
              <House className="size-4" aria-hidden />
              Volver al inicio
            </Boton>
            {categoria && (
              <Boton href={`/categoria/${categoria.slug}`} variante="secundario">
                <ArrowLeft className="size-4" aria-hidden />
                Ver más de {categoria.nombre}
              </Boton>
            )}
          </div>
        </div>
      </article>

      <CarruselProductos
        titulo="También te puede interesar"
        productos={relacionados}
        href={categoria ? `/categoria/${categoria.slug}` : undefined}
        className="mt-10 md:mt-14"
      />
    </Contenedor>
  );
}
