import Image from "next/image";

// Escena del banner "Herramientas que RINDEN" del carrusel central: una foto QUIETA de un banco de trabajo con
// herramientas (pedido de persona A: sin animación al pasar el cursor; reemplazó al rotomartillo flotante de
// HerramientasAsomadas). La monta BannerInicio cuando banner.id === "herramientas"; el título, la descripción y el
// botón "Ver herramientas" (con su efecto al pasar el cursor) son los de BannerInicio.
// Foto del dueño en public/banners/herramientas/taller-organizado.webp (1832×858).
//
// Cubre todo el banner, nítida y sin relleno desenfocado a la izquierda. En los
// banners anchos se recorta arriba y abajo: va un poco por debajo del centro (63 %) para que quepan la punta del
// taladro arriba y el martillo, los destornilladores y la llave abajo.

const FOTO = "/banners/herramientas/taller-organizado.webp";

export default function HerramientasFoto({ prioritario = false }: { prioritario?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-pico-azul-oscuro">
      <Image
        src={FOTO}
        alt="Taladro, martillo, nivel, cinta métrica, destornilladores y caja de herramientas sobre un banco de trabajo"
        fill
        sizes="(min-width: 1536px) 1472px, 100vw"
        loading={prioritario ? "eager" : undefined}
        fetchPriority={prioritario ? "high" : undefined}
        className="object-cover object-[50%_63%]"
      />
    </div>
  );
}
