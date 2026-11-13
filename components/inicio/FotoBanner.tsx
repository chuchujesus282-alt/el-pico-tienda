import Image from "next/image";
import estilos from "./FotoBanner.module.css";

// Escena de FOTO QUIETA para un banner del carrusel central (hoy Herramientas "RINDEN" y Construcción "CONSTRUIR";
// pedidos de persona A). BannerInicio la monta cuando el banner trae `escenaFoto` (contenidoInicio.ts); el título,
// la descripción y el botón (con su efecto al pasar el cursor) son los de BannerInicio. Sin animación al pasar el
// cursor.
//
// La foto (1832×858, las del dueño) se ve ENTERA: ajustada al alto del banner y pegada a la derecha (cubriendo todo el
// ancho se veía con demasiado zoom). Lo que sobra a la izquierda lo llena la misma foto desenfocada.
// Para sumar otro banner con foto: la foto en public/banners/<categoría>/ y `escenaFoto` en su banner. Nada más.

export type EscenaFoto = {
  /** Ruta en public/ de una foto de 1832×858 (u otra con la misma proporción). */
  src: string;
  alt: string;
};

export default function FotoBanner({ src, alt, prioritario = false }: EscenaFoto & { prioritario?: boolean }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden bg-pico-azul-oscuro ${estilos.escena}`}>
      <Image src={src} alt="" aria-hidden fill sizes="1472px" className={`object-cover object-left ${estilos.relleno}`} />
      <div className={estilos.lienzo}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1536px) 1472px, 100vw"
          loading={prioritario ? "eager" : undefined}
          fetchPriority={prioritario ? "high" : undefined}
          className="object-cover"
        />
      </div>
    </div>
  );
}
