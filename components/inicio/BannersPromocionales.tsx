import BannerInicio from "./BannerInicio";
import BannerTrabajaProtegido from "./BannerTrabajaProtegido";
import type { BannerInicio as DatosBanner } from "./contenidoInicio";

/**
 * Fila de banners promocionales del mismo tamaño; cada uno lleva a una categoría. El de seguridad es el banner animado
 * del casco (`BannerTrabajaProtegido`, con los textos de `contenidoInicio`); los demás, `BannerInicio`.
 */
export default function BannersPromocionales({ banners }: { banners: DatosBanner[] }) {
  if (banners.length === 0) return null;

  return (
    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
      {banners.map((banner) =>
        banner.id === "seguridad" ? (
          <BannerTrabajaProtegido
            key={banner.id}
            titulo={banner.titulo}
            descripcion={banner.texto}
            textoBoton={banner.textoBoton}
            href={banner.href}
          />
        ) : (
          <BannerInicio
            key={banner.id}
            banner={banner}
            sizes="(min-width: 1536px) 740px, (min-width: 768px) 50vw, 100vw"
            // Alto mínimo y no proporción fija: si el texto no cabe, el banner crece en vez de cortarlo.
            className="min-h-48 md:min-h-60"
          />
        ),
      )}
    </div>
  );
}
