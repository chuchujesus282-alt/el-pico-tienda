import Link from "next/link";
import Precio from "@/components/ui/Precio";
import type { Producto } from "@/types/catalogo";
import BotonAgregar from "./BotonAgregar";
import ImagenProducto from "./ImagenProducto";

type Props = {
  producto: Producto;
  className?: string;
};

/** La única tarjeta de producto del sitio. Toda la tarjeta enlaza al producto, excepto el botón. */
export default function ProductCard({ producto, className = "" }: Props) {
  return (
    <article
      className={`group flex h-full flex-col rounded-tarjeta border border-gris-borde bg-pico-blanco p-3 shadow-tarjeta transition duration-200 hover:-translate-y-0.5 hover:shadow-tarjeta-hover ${className}`}
    >
      <Link href={`/producto/${producto.id}`} className="flex flex-1 flex-col gap-1 rounded-boton">
        <ImagenProducto
          src={producto.imagen}
          alt={producto.nombre}
          sizes="(min-width: 1280px) 240px, (min-width: 768px) 30vw, 45vw"
          className="mb-2 rounded-boton"
        />
        {producto.marca && <p className="text-[13px] text-gris-texto">{producto.marca}</p>}
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium uppercase group-hover:text-pico-azul">
          {producto.nombre}
        </h3>
        <Precio valor={producto.precio} className="mt-auto pt-1" />
      </Link>
      <div className="mt-3">
        <BotonAgregar producto={producto} />
      </div>
    </article>
  );
}
