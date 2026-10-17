import type { Producto } from "@/types/catalogo";
import Revelar from "@/components/ui/Revelar";
import ProductCard from "./ProductCard";
import ProductCardEsqueleto from "./ProductCardEsqueleto";

type Props = {
  productos: Producto[];
  /** Muestra esqueletos en lugar de productos. */
  cargando?: boolean;
  cantidadEsqueletos?: number;
  /** Encabezado solo para lectores de pantalla (h2): las tarjetas son h3 y no deben quedar bajo el h1 sin un h2. */
  titulo?: string;
  className?: string;
};

/** Tarjetas que suelen verse sin bajar (2 filas en móvil, 1 en escritorio): su foto carga primero. */
const PRIORITARIAS = 4;

/** Grilla de productos: 2 columnas móvil, 3 tablet, 4 escritorio. */
export default function GrillaProductos({
  productos,
  cargando = false,
  cantidadEsqueletos = 8,
  titulo,
  className = "",
}: Props) {
  return (
    <>
      {titulo && <h2 className="sr-only">{titulo}</h2>}
      <ul className={`grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 2xl:grid-cols-5 ${className}`}>
      {cargando
        ? Array.from({ length: cantidadEsqueletos }, (_, i) => (
            <li key={i}>
              <ProductCardEsqueleto />
            </li>
          ))
        : productos.map((producto, i) => (
            <li key={producto.id}>
              {/* Aparecen en cascada por fila al bajar (50ms entre tarjetas). */}
              <Revelar className="h-full" retraso={(i % 5) * 50}>
                <ProductCard producto={producto} prioritario={i < PRIORITARIAS} />
              </Revelar>
            </li>
          ))}
      </ul>
    </>
  );
}
