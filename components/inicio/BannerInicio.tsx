import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { BannerInicio as DatosBanner, VarianteBanner } from "./contenidoInicio";

type Props = {
  banner: DatosBanner;
  /** Atributo sizes de next/image según el ancho que ocupa el banner. */
  sizes: string;
  /** "grande" para el carrusel principal; "normal" para los demás. */
  tamano?: "grande" | "normal";
  /** Carga la imagen de inmediato (solo el primer banner visible de la página). */
  prioritario?: boolean;
  className?: string;
};

// El rojo queda reservado para Agregar, precios y Enviar pedido: los banners llevan su
// llamado a la acción en blanco sobre azul, o en azul sobre azul claro.
const variantes: Record<VarianteBanner, { fondo: string; titulo: string; texto: string; icono: string; boton: string }> = {
  azul: {
    fondo: "bg-pico-azul",
    titulo: "text-pico-blanco",
    texto: "text-pico-blanco/80",
    icono: "text-pico-blanco/10",
    boton: "bg-pico-blanco text-pico-azul group-hover:bg-pico-azul-claro",
  },
  oscuro: {
    fondo: "bg-pico-azul-oscuro",
    titulo: "text-pico-blanco",
    texto: "text-pico-blanco/80",
    icono: "text-pico-blanco/10",
    boton: "bg-pico-blanco text-pico-azul group-hover:bg-pico-azul-claro",
  },
  claro: {
    fondo: "bg-pico-azul-claro",
    titulo: "text-pico-azul",
    texto: "text-pico-azul/75",
    icono: "text-pico-azul/10",
    boton: "bg-pico-azul text-pico-blanco group-hover:bg-pico-azul-oscuro",
  },
};

/** Enlace interno con next/link; externo (ej. WhatsApp) en pestaña nueva. */
function Destino({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
        <span className="sr-only"> (se abre en una pestaña nueva)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/**
 * Banner enlazado de la página principal. Con `imagen` la muestra a sangre; sin ella,
 * arma el banner con los colores de marca (título, texto y llamado a la acción).
 */
export default function BannerInicio({ banner, sizes, tamano = "normal", prioritario = false, className = "" }: Props) {
  const estilo = variantes[banner.variante ?? "azul"];
  const Icono = banner.icono;
  const grande = tamano === "grande";

  return (
    <Destino
      href={banner.href}
      className={`group relative block overflow-hidden rounded-banner focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul ${
        banner.imagen ? "bg-gris-borde" : estilo.fondo
      } ${className}`}
    >
      {banner.imagen ? (
        <Image
          src={banner.imagen}
          alt={banner.alt}
          fill
          sizes={sizes}
          loading={prioritario ? "eager" : undefined}
          fetchPriority={prioritario ? "high" : undefined}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className={`relative flex h-full flex-col justify-center gap-2 p-5 ${grande ? "md:gap-3 md:px-16 md:py-10" : "md:p-6"}`}>
          {Icono && (
            <Icono
              className={`absolute -right-4 -bottom-6 transition-transform duration-300 group-hover:-rotate-6 ${estilo.icono} ${
                grande ? "size-40 md:size-72" : "size-32 md:size-40"
              }`}
              strokeWidth={1.25}
              aria-hidden
            />
          )}
          <p
            className={`relative max-w-[80%] font-extrabold tracking-tight text-balance ${estilo.titulo} ${
              grande ? "text-2xl leading-tight md:text-4xl" : "text-xl leading-tight"
            }`}
          >
            {banner.titulo}
          </p>
          {banner.texto && (
            // En el banner grande y en móvil se omite el texto: no cabe con el título y el botón.
            <p
              className={`relative max-w-[75%] text-sm ${estilo.texto} ${
                grande ? "hidden sm:line-clamp-2 md:text-base" : "line-clamp-2"
              }`}
            >
              {banner.texto}
            </p>
          )}
          {banner.textoBoton && (
            // Es un span y no <Boton>: todo el banner ya es un enlace. Misma forma que Boton.
            <span
              className={`relative mt-1 inline-flex h-10 w-fit items-center gap-1 rounded-boton px-4 text-sm font-semibold transition-colors ${estilo.boton} ${
                grande ? "md:mt-2" : ""
              }`}
            >
              {banner.textoBoton}
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          )}
        </div>
      )}
    </Destino>
  );
}
