import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BotonFavorito from "@/components/favoritos/BotonFavorito";
import Precio from "@/components/ui/Precio";
import { tituloProducto } from "@/lib/formato";
import type { Producto } from "@/types/catalogo";
import BotonAgregar from "./BotonAgregar";
import ImagenProducto from "./ImagenProducto";

type Props = {
  producto: Producto;
  /** Primeras tarjetas visibles de una grilla: su foto se descarga de inmediato. */
  prioritario?: boolean;
  className?: string;
};

/**
 * La única tarjeta de producto del sitio. Foto en su marco, la marca en versalitas, el nombre en dos líneas
 * de alto fijo (así todos los precios quedan alineados) y abajo el precio con "Agregar" al lado.
 * Toda la tarjeta enlaza al producto, excepto los botones.
 * Tarjeta de un grupo de medidas (`producto.variantes`, lib/agrupaciones.ts): "Desde" + el precio más bajo y, en vez de
 * "Agregar" y el corazón, "N medidas ›" (lleva a su página, donde se elige la medida y se marca favorita).
 */
export default function ProductCard({ producto, prioritario = false, className = "" }: Props) {
  const titulo = tituloProducto(producto);
  return (
    <article
      className={`group relative flex h-full flex-col rounded-2xl border border-gris-borde bg-pico-blanco p-3 shadow-tarjeta transition duration-300 ease-(--curva-suave) hover:border-pico-azul/20 hover:shadow-tarjeta-hover motion-safe:hover:-translate-y-1 ${className}`}
    >
      {/* Filete rojo que aparece arriba al pasar el mouse. */}
      <span
        className="absolute inset-x-5 top-0 h-[3px] origin-center scale-x-0 rounded-b-sm bg-pico-rojo transition-transform duration-300 ease-(--curva-suave) group-hover:scale-x-100"
        aria-hidden
      />
      <Link
        href={`/producto/${producto.id}`}
        className="flex flex-1 flex-col rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
      >
        <div className="mb-3 overflow-hidden rounded-xl">
          <ImagenProducto
            src={producto.imagen}
            alt={titulo}
            categoria={producto.categoriaSlug}
            subcategoria={producto.subcategoria}
            prioritario={prioritario}
            sizes="(min-width: 1536px) 240px, (min-width: 1024px) 20vw, (min-width: 768px) 30vw, 45vw"
            className="rounded-xl transition-transform duration-700 ease-(--curva-suave) motion-safe:group-hover:scale-[1.04]"
          />
        </div>
        <p className="h-4 truncate text-[11px] leading-4 font-semibold tracking-[0.14em] text-gris-texto uppercase">{producto.marca ?? ""}</p>
        <h3 className="mt-1 line-clamp-2 h-10 text-sm leading-5 font-medium text-texto transition-colors group-hover:text-pico-azul">{titulo}</h3>
      </Link>
      {producto.variantes ? (
        // Grupo de medidas (lib/agrupaciones.ts): "Desde" el más barato y se elige la medida en su página.
        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[11px] leading-none font-semibold text-gris-texto">Desde</span>
            <Precio valor={producto.precio} className="text-lg tabular-nums sm:text-xl" />
          </div>
          <Link
            href={`/producto/${producto.id}`}
            tabIndex={-1}
            aria-hidden
            className="inline-flex h-10 shrink-0 items-center gap-1 rounded-chip border-2 border-pico-rojo bg-pico-blanco px-3 text-sm font-semibold text-pico-rojo transition duration-300 ease-(--curva-suave) hover:bg-pico-rojo hover:text-pico-blanco sm:rounded-xl"
          >
            <span className="sm:hidden">{producto.variantes}</span>
            <span className="hidden sm:inline">{producto.variantes} medidas</span>
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Precio valor={producto.precio} className="text-lg tabular-nums sm:text-xl" />
            <BotonAgregar producto={producto} />
          </div>
          {/* Fuera del enlace (un botón no puede ir dentro de <a>), encima de la esquina de la foto. */}
          <BotonFavorito productoId={producto.id} titulo={titulo} />
        </>
      )}
    </article>
  );
}
