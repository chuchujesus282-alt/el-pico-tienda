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
    // auto-rows-fr: en el teléfono (uno debajo del otro) todos los banners miden lo mismo que el más alto.
    <div className="grid auto-rows-fr gap-3 md:grid-cols-2 md:gap-4">
      {banners.map((banner) =>
        banner.id === "seguridad" ? (
          // Se levanta igual que BannerInicio (Tornillería): 4px y sombra de tarjeta, en 200 ms.
          <div
            key={banner.id}
            className="h-full rounded-[14px] shadow-tarjeta transition duration-200 hover:shadow-tarjeta-hover motion-safe:hover:-translate-y-1"
          >
            <BannerTrabajaProtegido
              titulo={banner.titulo}
              descripcion={banner.texto}
              textoBoton={banner.textoBoton}
              href={banner.href}
            />
          </div>
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
