import Image from "next/image";
import estilos from "./HerramientasFoto.module.css";

// Escena del banner "Herramientas que RINDEN" del carrusel central: una foto QUIETA de un taller organizado con
// herramientas (pedido de persona A: sin animación al pasar el cursor; reemplazó al rotomartillo flotante de
// HerramientasAsomadas). La monta BannerInicio cuando banner.id === "herramientas"; el título, la descripción y el
// botón "Ver herramientas" (con su efecto al pasar el cursor) son los de BannerInicio.
// Foto del dueño en public/banners/herramientas/taller-organizado.webp (1832×858).
//
// La foto se ve entera (ajustada al alto del banner, pegada a la derecha): cubriendo todo el ancho se veía con
// demasiado zoom. Lo que sobra a la izquierda lo llena la misma foto desenfocada.

const FOTO = "/banners/herramientas/taller-organizado.webp";

export default function HerramientasFoto({ prioritario = false }: { prioritario?: boolean }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden bg-pico-azul-oscuro ${estilos.escena}`}>
      <Image src={FOTO} alt="" aria-hidden fill sizes="1472px" className={`object-cover object-left ${estilos.relleno}`} />
      <div className={estilos.lienzo}>
        <Image
          src={FOTO}
          alt="Taladro, martillo, nivel, cinta métrica, destornilladores y caja de herramientas en un taller organizado"
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
