import BannerInicio from "./BannerInicio";
import type { BannerInicio as DatosBanner } from "./contenidoInicio";

/** Fila de banners promocionales del mismo tamaño; cada uno lleva a una categoría. */
export default function BannersPromocionales({ banners }: { banners: DatosBanner[] }) {
  if (banners.length === 0) return null;

  return (
    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
      {banners.map((banner) => (
        <BannerInicio
          key={banner.id}
          banner={banner}
          sizes="(min-width: 1536px) 740px, (min-width: 768px) 50vw, 100vw"
          className="aspect-[2/1] lg:aspect-[5/2]"
        />
      ))}
    </div>
  );
}
