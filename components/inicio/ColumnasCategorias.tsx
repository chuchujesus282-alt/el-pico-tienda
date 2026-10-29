import { BannerVertical } from "./bannersPorCategoria";

// Columnas por cantidad de categorías, para que nunca quede una sola en la última fila. Con 6: 2×3 en el teléfono,
// 3×2 desde 768px y una fila de 6 desde 1536px (antes, 6 en fila quedan demasiado angostas).
const COLUMNAS: Record<number, string> = {
  4: "lg:grid-cols-4",
  6: "md:grid-cols-3 2xl:grid-cols-6",
};

/**
 * "Más categorías": las cuatro columnas verticales del día (lib/rotacionBanners.ts), más altas que una tarjeta de
 * producto para darle verticalidad a la página. Cada una es la variante vertical de su categoría
 * (bannersPorCategoria.tsx): la tarjeta animada si la tiene, si no `ColumnaCategoria`. Las columnas por fila dependen
 * de cuántas son (`COLUMNAS`). Todas en 320:470 (las animadas lo toman de `--alto-tarjeta` en el <li>; su prototipo
 * es 320:420 y el dibujo queda centrado en el alto extra), para que midan lo mismo.
 */
export default function ColumnasCategorias({ categorias }: { categorias: string[] }) {
  if (categorias.length === 0) return null;

  return (
    // Sin título a la vista (más espontáneo); el nombre queda para lectores de pantalla.
    <section aria-label="Más categorías">
      <ul className={`grid grid-cols-2 gap-3 md:gap-4 ${COLUMNAS[categorias.length] ?? "lg:grid-cols-3"}`}>
        {categorias.map((slug) => (
          <li key={slug} className="[--alto-tarjeta:470]">
            <BannerVertical slug={slug} />
          </li>
        ))}
      </ul>
    </section>
  );
}
