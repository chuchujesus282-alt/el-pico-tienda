import CarruselProductos from "@/components/producto/CarruselProductos";
import { getCompradosJuntos, getIndiceProductos } from "@/lib/catalogo";
import { relacionados } from "@/lib/recomendaciones/relacionados";
import type { Producto } from "@/types/catalogo";

type Props = {
  producto: Producto;
  titulo?: string;
  /** Enlace "Ver todo" (ej. la categoría del producto). */
  href?: string;
  className?: string;
};

/**
 * "También te puede servir" (Server Component) para la página de producto: entre 4 y 8 productos que
 * mezclan complementarios, similares y, cuando haya facturas, comprados juntos. Si el catálogo falla, no se muestra.
 */
export default async function ProductosRelacionados({ producto, titulo = "También te puede servir", href, className }: Props) {
  const [productos, juntos] = await Promise.all([
    getIndiceProductos().catch((): Producto[] => []),
    getCompradosJuntos(producto.id),
  ]);
  if (!productos.length) return null;

  return (
    <CarruselProductos titulo={titulo} productos={relacionados(producto, productos, { juntos })} href={href} className={className} />
  );
}
