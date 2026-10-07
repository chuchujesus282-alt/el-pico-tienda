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
      className={`group flex h-full flex-col rounded-tarjeta border border-gris-borde bg-pico-blanco p-3 shadow-tarjeta transition duration-200 hover:-translate-y-0.5 hover:shadow-tarjeta-hover ${className}`}
    >
      <Link href={`/producto/${producto.id}`} className="flex flex-1 flex-col gap-1 rounded-boton">
        <ImagenProducto
          src={producto.imagen}
          alt={titulo}
          sizes="(min-width: 1280px) 240px, (min-width: 768px) 30vw, 45vw"
          className="mb-2 rounded-boton"
        />
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium group-hover:text-pico-azul">
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
