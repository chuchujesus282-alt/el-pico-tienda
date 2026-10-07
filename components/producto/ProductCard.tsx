import Link from "next/link";
import Precio from "@/components/ui/Precio";
import { tituloProducto } from "@/lib/formato";
import type { Producto } from "@/types/catalogo";
import BotonAgregar from "./BotonAgregar";
import ImagenProducto from "./ImagenProducto";

type Props = {
  producto: Producto;
  className?: string;
};

/** La única tarjeta de producto del sitio. Toda la tarjeta enlaza al producto, excepto el botón. */
export default function ProductCard({ producto, className = "" }: Props) {
  const titulo = tituloProducto(producto);
  return (
    <article
      className={`group relative flex h-full flex-col rounded-tarjeta border border-gris-borde bg-pico-blanco p-3 shadow-tarjeta transition duration-300 hover:border-pico-azul/20 hover:shadow-tarjeta-hover motion-safe:hover:-translate-y-1 ${className}`}
    >
      {/* Filete rojo que aparece arriba al pasar el mouse. */}
      <span
        className="absolute inset-x-4 top-0 h-[3px] origin-center scale-x-0 rounded-b-sm bg-pico-rojo transition-transform duration-300 group-hover:scale-x-100"
        aria-hidden
      />
      <Link
        href={`/producto/${producto.id}`}
        className="flex flex-1 flex-col gap-1 rounded-boton focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
      >
        <div className="mb-2 overflow-hidden rounded-boton">
          <ImagenProducto
            src={producto.imagen}
            alt={titulo}
            sizes="(min-width: 1280px) 240px, (min-width: 768px) 30vw, 45vw"
            className="transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
          />
        </div>
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium transition-colors group-hover:text-pico-azul">
          {titulo}
        </h3>
        <Precio valor={producto.precio} className="mt-auto pt-1" />
      </Link>
      <div className="mt-3">
        <BotonAgregar producto={producto} />
      </div>
    </article>
  );
}
