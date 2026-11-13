import type { CSSProperties } from "react";
import Image from "next/image";
import estilos from "./FotoBanner.module.css";

// Escena de FOTO QUIETA para un banner del carrusel central (hoy Herramientas "RINDEN" y Construcción "AGUANTAN";
// pedidos de persona A). BannerInicio la monta cuando el banner trae `escenaFoto` (contenidoInicio.ts); el título,
// la descripción y el botón (con su efecto al pasar el cursor) son los de BannerInicio. Sin animación al pasar el
// cursor.
//
// La foto (las del dueño) se ve ENTERA: ajustada al alto del banner y pegada a la derecha (cubriendo todo el ancho se
// veía con demasiado zoom). Si la foto es más angosta que el banner, lo que sobra a la izquierda lo llena la misma foto
// desenfocada.
// Para sumar otro banner con foto: la foto en public/banners/<categoría>/ y `escenaFoto` en su banner (con `ancho` y
// `alto` si no mide 1832×858). Nada más.

export type EscenaFoto = {
  /** Ruta en public/ de la foto. */
  src: string;
  alt: string;
  /** Medidas de la foto (solo importa la proporción). Por defecto 1832×858. */
  ancho?: number;
  alto?: number;
  /**
   * Desenfoque de profundidad: la izquierda de la propia foto (detrás del texto) se va desenfocando de a poco, como
   * una cámara enfocada en los productos (Construcción, pedido de persona A: "más natural").
   */
  profundidad?: boolean;
};

export default function FotoBanner({
  src,
  alt,
  ancho = 1832,
  alto = 858,
  profundidad = false,
  prioritario = false,
}: EscenaFoto & { prioritario?: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-pico-azul-oscuro ${estilos.escena}`}
      style={{ "--foto-ancho": ancho, "--foto-alto": alto } as CSSProperties}
    >
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
        {profundidad && <div className={estilos.profundidad} />}
      </div>
    </div>
  );
}
