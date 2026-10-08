import Image from "next/image";
import Link from "next/link";
import CarruselProductos from "@/components/producto/CarruselProductos";
import type { Categoria, Producto } from "@/types/catalogo";

type Props = {
  categoria: Categoria;
  productos: Producto[];
  /** Banner configurado en contenidoInicio; el de la API tiene prioridad. */
  imagen: string | null;
};

/**
 * Carrusel de los productos de una categoría. El banner solo aparece si hay una imagen real:
 * sin ella, repetiría el nombre que ya dice el título del carrusel.
 */
export default function SeccionCategoria({ categoria, productos, imagen }: Props) {
  if (productos.length === 0) return null;
  const href = `/categoria/${categoria.slug}`;
  const banner = categoria.banner ?? imagen;

  return (
    <div className="space-y-4 md:space-y-6">
      {banner && (
        <Link
          href={href}
          className="relative block aspect-[3/1] overflow-hidden rounded-banner bg-gris-borde focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul md:aspect-[5/1]"
        >
          <Image src={banner} alt={categoria.nombre} fill sizes="(min-width: 1536px) 1472px, 100vw" className="object-cover" />
        </Link>
      )}
      <CarruselProductos titulo={categoria.nombre} productos={productos} href={href} />
    </div>
  );
}
