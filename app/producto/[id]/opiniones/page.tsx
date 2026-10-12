import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PanelOpiniones from "@/components/opiniones/PanelOpiniones";
import { fuentePaginas } from "@/components/producto-detalle/fuentes";
import RutaProducto from "@/components/producto-detalle/RutaProducto";
import { tituloProducto } from "@/lib/formato";
import ImagenProducto from "@/components/producto/ImagenProducto";
import Contenedor from "@/components/ui/Contenedor";
import Precio from "@/components/ui/Precio";
import { getCategorias, getProducto } from "@/lib/catalogo";
import { getOpiniones } from "@/lib/opiniones";

// Opiniones de un producto — responsable: persona B (rama `opiniones`).
// Lista + formulario. Sin base de datos, las opiniones nuevas se guardan en el navegador del cliente.

export async function generateMetadata({ params }: PageProps<"/producto/[id]/opiniones">): Promise<Metadata> {
  const { id } = await params;
  try {
    const producto = await getProducto(id);
    return { title: producto ? `Opiniones de ${tituloProducto(producto)}` : "Opiniones" };
  } catch {
    return { title: "Opiniones" };
  }
}

export default async function PaginaOpiniones({ params }: PageProps<"/producto/[id]/opiniones">) {
  const { id } = await params;
  const producto = await getProducto(id);
  if (!producto) notFound();

  const [categoria, opiniones] = await Promise.all([
    getCategorias()
      .then((cs) => cs.find((c) => c.slug === producto.categoriaSlug) ?? null)
      .catch(() => null),
    getOpiniones(producto.id).catch(() => []),
  ]);
  const titulo = tituloProducto(producto);
  const hrefProducto = `/producto/${encodeURIComponent(producto.id)}`;

  return (
    <div className={fuentePaginas}>
      <Contenedor className="py-6 md:py-8">
        <RutaProducto categoria={categoria} producto={{ titulo, href: hrefProducto }} actual="Opiniones" />

        {/* Producto al que pertenecen las opiniones */}
        <Link
          href={hrefProducto}
          className="group mt-4 flex items-center gap-4 rounded-banner border border-gris-borde bg-pico-blanco p-3 shadow-tarjeta transition duration-200 hover:shadow-tarjeta-hover motion-safe:animate-aparecer motion-safe:hover:-translate-y-0.5 md:mt-6 md:p-4"
        >
          <ImagenProducto src={producto.imagen} alt={titulo} sizes="96px" className="size-20 shrink-0 rounded-tarjeta md:size-24" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-gris-texto">Opiniones de</p>
            <h1 className="line-clamp-2 font-titulo text-xl leading-tight font-bold text-logo-marino md:text-2xl">{titulo}</h1>
            <Precio valor={producto.precio} tono="logo" className="font-titulo" />
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-logo-marino md:inline-flex">
            <ArrowLeft className="size-4 transition-transform motion-safe:group-hover:-translate-x-1" aria-hidden />
            Volver al producto
          </span>
        </Link>

        <div className="mt-6 md:mt-8">
          <PanelOpiniones productoId={producto.id} opiniones={opiniones} />
        </div>
      </Contenedor>
    </div>
  );
}
