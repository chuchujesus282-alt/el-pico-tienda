import BannerInicio from "./BannerInicio";
import CarruselBanners from "./CarruselBanners";
import type { BannerInicio as DatosBanner } from "./contenidoInicio";

type Props = {
  principales: DatosBanner[];
  laterales: DatosBanner[];
};

const sizesLateral = "(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

/** Carrusel grande (~2/3) y dos banners apilados a la derecha (~1/3). En móvil, uno debajo del otro. */
export default function BloqueBanners({ principales, laterales }: Props) {
  if (principales.length === 0 && laterales.length === 0) return null;

  // Sin carrusel, los laterales ocupan todo el ancho en una fila.
  if (principales.length === 0) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
        {laterales.map((banner) => (
          <BannerInicio key={banner.id} banner={banner} sizes={sizesLateral} className="aspect-[2/1] lg:aspect-[5/2]" />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 md:gap-4 ${laterales.length > 0 ? "lg:grid-cols-3" : ""}`}>
      <CarruselBanners
        className={`aspect-[16/10] md:aspect-[2/1] ${laterales.length > 0 ? "lg:col-span-2" : "lg:aspect-[3/1]"}`}
        etiquetas={principales.map((b) => b.titulo)}
        diapositivas={principales.map((banner, i) => (
          <BannerInicio
            key={banner.id}
            banner={banner}
            tamano="grande"
            prioritario={i === 0}
            sizes="(min-width: 1280px) 820px, (min-width: 1024px) 66vw, 100vw"
            className="h-full"
          />
        ))}
      />
      {laterales.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-1 lg:grid-rows-2">
          {laterales.map((banner) => (
            <BannerInicio
              key={banner.id}
              banner={banner}
              sizes={sizesLateral}
              className="aspect-[2/1] sm:aspect-[16/10] lg:aspect-auto"
            />
          ))}
        </div>
      )}
    </div>
  );
}
