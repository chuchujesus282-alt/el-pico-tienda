import CarruselProductos from "@/components/producto/CarruselProductos";
import type { Categoria, Producto } from "@/types/catalogo";
import BannerInicio from "./BannerInicio";
import type { SeccionCategoriaInicio } from "./contenidoInicio";

type Props = {
  categoria: Categoria;
  productos: Producto[];
  banner: SeccionCategoriaInicio["banner"];
};

/** Banner de la categoría + carrusel de sus productos. Si la API trae banner propio, se usa ese. */
export default function SeccionCategoria({ categoria, productos, banner }: Props) {
  if (productos.length === 0) return null;
  const href = `/categoria/${categoria.slug}`;

  return (
    <div className="space-y-4 md:space-y-6">
      <BannerInicio
        banner={{
          ...banner,
          id: categoria.slug,
          href,
          titulo: categoria.nombre,
          alt: categoria.nombre,
          imagen: categoria.banner ?? banner.imagen,
        }}
        sizes="(min-width: 1280px) 1232px, 100vw"
        className="aspect-[2/1] md:aspect-[4/1] lg:aspect-[5/1]"
      />
      <CarruselProductos titulo={categoria.nombre} productos={productos} href={href} />
    </div>
  );
}
