import Image from "next/image";
import { Wrench } from "lucide-react";
import type { Categoria } from "@/types/catalogo";

type Props = {
  categoria: Categoria;
};

/** Banner a lo ancho de la categoría. Sin imagen, muestra un bloque azul de marca con el nombre. */
export default function BannerCategoria({ categoria }: Props) {
  const clases = "relative h-32 overflow-hidden rounded-banner md:h-44 lg:h-52";

  if (categoria.banner) {
    return (
      <div className={clases}>
        <Image
          src={categoria.banner}
          alt={categoria.nombre}
          fill
          priority
          sizes="(min-width: 1280px) 1232px, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${clases} flex items-center bg-pico-azul px-6 md:px-10`}>
      <Wrench
        className="absolute -right-6 -bottom-8 size-40 text-pico-azul-oscuro md:size-56"
        strokeWidth={1.5}
        aria-hidden
      />
      <p className="relative text-2xl font-bold text-pico-blanco md:text-4xl">{categoria.nombre}</p>
    </div>
  );
}
