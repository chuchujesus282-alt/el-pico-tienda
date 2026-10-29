import { BannerHorizontal } from "./bannersPorCategoria";

/**
 * Fila de los dos banners horizontales del día (lib/rotacionBanners.ts), del mismo tamaño; cada uno lleva a su
 * categoría. Cada uno es la variante horizontal de su categoría (bannersPorCategoria.tsx): hoy Seguridad industrial
 * (el casco, `BannerTrabajaProtegido`) y Tornillería (el tornillo, `BannerTornilleria`) tienen la suya.
 */
export default function BannersPromocionales({ categorias }: { categorias: string[] }) {
  if (categorias.length === 0) return null;

  return (
    // auto-rows-fr: en el teléfono (uno debajo del otro) todos los banners miden lo mismo que el más alto.
    <div className="grid auto-rows-fr gap-3 md:grid-cols-2 md:gap-4">
      {categorias.map((slug, i) => (
        <BannerHorizontal key={slug} slug={slug} lugar={i === 0 ? 0 : 1} />
      ))}
    </div>
  );
}
