import type { Producto } from "@/types/catalogo";
import ProductCard from "./ProductCard";
import ProductCardEsqueleto from "./ProductCardEsqueleto";

type Props = {
  productos: Producto[];
  /** Muestra esqueletos en lugar de productos. */
  cargando?: boolean;
  cantidadEsqueletos?: number;
  className?: string;
};

/** Grilla de productos: 2 columnas móvil, 3 tablet, 4 escritorio. */
export default function GrillaProductos({ productos, cargando = false, cantidadEsqueletos = 8, className = "" }: Props) {
  return (
    <ul className={`grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 2xl:grid-cols-5 ${className}`}>
      {cargando
        ? Array.from({ length: cantidadEsqueletos }, (_, i) => (
            <li key={i}>
              <ProductCardEsqueleto />
            </li>
          ))
        : productos.map((producto) => (
            <li key={producto.id}>
              <ProductCard producto={producto} />
            </li>
          ))}
    </ul>
  );
}
