import BannerInicio from "./BannerInicio";
import CarruselBanners from "./CarruselBanners";
import type { BannerInicio as DatosBanner } from "./contenidoInicio";

type Props = {
  principales: DatosBanner[];
};

/**
 * Carrusel principal a todo el ancho del Contenedor (ya no lleva banners laterales).
 * Alto: proporción 16:10 en móvil, 2:1 en tableta y 3:1 en escritorio, para que no crezca de más.
 */
export default function BloqueBanners({ principales }: Props) {
  if (principales.length === 0) return null;

  return (
    <CarruselBanners
      className="aspect-[16/10] shadow-tarjeta md:aspect-[2/1] lg:aspect-[3/1] 2xl:aspect-[10/3]"
      etiquetas={principales.map((b) => b.titulo)}
      diapositivas={principales.map((banner, i) => (
        <BannerInicio
          key={banner.id}
          banner={banner}
          tamano="grande"
          prioritario={i === 0}
          sizes="(min-width: 1536px) 1472px, 100vw"
          className="h-full"
        />
      ))}
    />
  );
}
