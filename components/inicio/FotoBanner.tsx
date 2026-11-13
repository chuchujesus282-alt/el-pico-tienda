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
//
// NITIDEZ (persona A la veía "poco HD"): la foto se sirve TAL CUAL, sin next/image. El webp (el nuestro y el que
// genera next/image) borra la textura fina de estas fotos aun a calidad 100; AVIF y JPEG la conservan. Por eso va en
// <picture>: AVIF (calidad 80, liviano) para los navegadores que lo leen y JPEG (calidad 92, 4:4:4) de respaldo.
// Para sumar otro banner con foto: desde el PNG original, `<nombre>.avif` y `<nombre>.jpg` en public/banners/<categoría>/
// y `escenaFoto` en su banner (con `ancho` y `alto` si no mide 1832×858). Nada más.

export type EscenaFoto = {
  /** Ruta en public/ de la foto en JPEG (la de respaldo). */
  src: string;
  /** La misma foto en AVIF (la que ven casi todos). */
  avif?: string;
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
  avif,
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
      {/* El relleno va desenfocado: aquí la nitidez no importa y next/image lo sirve liviano. */}
      <Image src={src} alt="" aria-hidden fill sizes="1472px" className={`object-cover object-left ${estilos.relleno}`} />
      <div className={estilos.lienzo}>
        <picture>
          {avif && <source type="image/avif" srcSet={avif} />}
          {/* <img> y no next/image: se sirve tal cual para no perder nitidez (ver arriba). */}
          <img
            src={src}
            alt={alt}
            width={ancho}
            height={alto}
            decoding="async"
            loading={prioritario ? "eager" : "lazy"}
            fetchPriority={prioritario ? "high" : "auto"}
            className="absolute inset-0 size-full object-cover"
          />
        </picture>
        {profundidad && <div className={estilos.profundidad} />}
      </div>
    </div>
  );
}
