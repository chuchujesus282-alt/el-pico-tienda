import { BannerCentral, tituloCentral } from "./bannersPorCategoria";
import CarruselBanners from "./CarruselBanners";

type Props = {
  /** Slugs de las categorías del carrusel central del día (lib/rotacionBanners.ts), en orden. */
  categorias: string[];
};

/**
 * Carrusel principal a todo el ancho del Contenedor (ya no lleva banners laterales). Cada diapositiva es la variante
 * central de su categoría (bannersPorCategoria.tsx); solo la primera carga su imagen con prioridad.
 * Alto: proporción 16:10 en móvil, 2:1 en tableta y 3:1 en escritorio, para que no crezca de más.
 */
export default function BloqueBanners({ categorias }: Props) {
  if (categorias.length === 0) return null;

  return (
    <CarruselBanners
      className="aspect-[16/10] shadow-tarjeta-hover md:aspect-[2/1] lg:aspect-[3/1] 2xl:aspect-[10/3]"
      etiquetas={categorias.map(tituloCentral)}
      diapositivas={categorias.map((slug, i) => (
        <BannerCentral key={slug} slug={slug} prioritario={i === 0} />
      ))}
    />
  );
}
