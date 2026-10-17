import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { BannerInicio as DatosBanner, VarianteBanner } from "./contenidoInicio";
import HerramientasAsomadas from "./HerramientasAsomadas";

type Props = {
  banner: DatosBanner;
  /** Atributo sizes de next/image según el ancho que ocupa el banner. */
  sizes: string;
  /**
   * "grande" para el carrusel principal; "lateral" para los de al lado (compactos en móvil:
   * solo título, para que el primer producto suba); "normal" para los demás.
   */
  tamano?: "grande" | "lateral" | "normal";
  /** Carga la imagen de inmediato (solo el primer banner visible de la página). */
  prioritario?: boolean;
  className?: string;
};

// El rojo queda reservado para Agregar, precios y Enviar pedido: los banners llevan su
// llamado a la acción en blanco sobre azul, o en azul sobre azul claro.
const variantes: Record<VarianteBanner, { fondo: string; titulo: string; texto: string; icono: string; boton: string }> = {
  azul: {
    fondo: "bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro",
    titulo: "text-pico-blanco",
    texto: "text-pico-blanco/80",
    icono: "text-pico-blanco/10",
    boton: "bg-pico-blanco text-pico-azul group-hover:bg-pico-azul-claro",
  },
  oscuro: {
    fondo: "bg-gradient-to-br from-pico-azul-oscuro to-pico-azul",
    titulo: "text-pico-blanco",
    texto: "text-pico-blanco/80",
    icono: "text-pico-blanco/10",
    boton: "bg-pico-blanco text-pico-azul group-hover:bg-pico-azul-claro",
  },
  claro: {
    fondo: "bg-gradient-to-br from-pico-azul-claro to-pico-blanco",
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
  const lateral = tamano === "lateral";

  return (
    <Destino
      href={banner.href}
      className={`group relative block overflow-hidden rounded-banner ${
        // Los banners sueltos flotan y se elevan al pasar el mouse; el del carrusel ya lleva su sombra.
        grande ? "" : "shadow-tarjeta transition duration-200 hover:shadow-tarjeta-hover motion-safe:hover:-translate-y-1"
      } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul ${
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
        <div className={`relative flex h-full flex-col justify-center gap-2 ${
          grande ? "p-5 md:gap-3 md:px-16 md:py-10 lg:gap-4 lg:px-24 2xl:px-28" : lateral ? "p-4 sm:p-5 md:p-6" : "gap-3 p-6 md:p-10 lg:px-12"
        }`}>
          {Icono && (
            // El span se mece solo (flotar); el ícono, además, gira y crece al pasar el mouse.
            <span className={`absolute motion-safe:animate-flotar ${grande ? "-right-4 -bottom-6 lg:right-20 lg:-bottom-12 2xl:right-28" : "-right-4 -bottom-6"}`} aria-hidden>
              <Icono
                className={`transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-12 ${estilo.icono} ${
                  grande ? "size-40 md:size-72 lg:size-[22rem]" : lateral ? "size-20 sm:size-32 md:size-40" : "size-36 md:size-52 lg:size-60"
                }`}
                strokeWidth={1.25}
              />
            </span>
          )}
          {/* PRUEBA: herramientas que asoman por los bordes, solo en el banner de herramientas del carrusel. */}
          {grande && banner.id === "herramientas" && <HerramientasAsomadas />}
          {grande && banner.tituloPartes ? (
            // Título en dos tiempos: la frase en una línea y la palabra clave enorme, en mayúsculas, sobre un
            // bloque rojo inclinado (el filete de la marca hecho sello) que se estira al pasar el mouse.
            <p className={`relative font-bold ${estilo.titulo}`}>
              <span className="block text-lg leading-none md:text-3xl lg:text-4xl">{banner.tituloPartes[0]}</span>
              <span className="relative isolate mt-2 inline-block px-2.5 pt-1 text-5xl leading-[0.92] tracking-[-0.02em] uppercase md:mt-3 md:px-4 md:text-7xl lg:text-8xl">
                <span
                  className="absolute inset-0 -z-10 origin-left -skew-x-12 rounded-sm bg-pico-rojo shadow-boton-hover transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover:scale-x-[1.08]"
                  aria-hidden
                />
                {banner.tituloPartes[1]}
              </span>
            </p>
          ) : (
          <>
          <span
            className={`relative h-1 -skew-x-12 rounded-sm bg-pico-rojo transition-all duration-300 group-hover:w-14 ${
              grande ? "w-10 lg:w-14 lg:group-hover:w-20" : lateral ? "hidden w-8 sm:block" : "w-10 lg:w-12 lg:group-hover:w-16"
            }`}
            aria-hidden
          />
          <p
            className={`relative max-w-[80%] font-bold text-balance ${estilo.titulo} ${
              grande
                ? "text-2xl leading-tight md:text-4xl lg:max-w-[55%] lg:text-5xl"
                : lateral
                  ? "text-base leading-tight sm:text-xl"
                  : "text-2xl leading-tight md:text-3xl lg:text-4xl"
            }`}
          >
            {banner.titulo}
            {lateral && <ChevronRight className="ml-0.5 inline size-4 align-[-2px] sm:hidden" aria-hidden />}
          </p>
          </>
          )}
          {banner.texto && (
            // En el banner grande y en móvil se omite el texto: no cabe con el título y el botón.
            <p
              className={`relative max-w-[75%] text-sm ${estilo.texto} ${
                grande ? `hidden sm:line-clamp-2 md:text-base lg:max-w-[50%] lg:text-lg ${banner.tituloPartes ? "md:max-w-[50%]" : ""}` : lateral ? "hidden sm:line-clamp-2" : "line-clamp-3 md:text-base lg:text-lg"
              }`}
            >
              {banner.texto}
            </p>
          )}
          {grande && banner.etiquetas && banner.etiquetas.length > 0 && (
            <ul className="relative hidden flex-wrap gap-2 sm:flex">
              {banner.etiquetas.map((etiqueta) => (
                <li
                  key={etiqueta}
                  className="flex items-center gap-1.5 rounded-chip border border-pico-blanco/20 bg-pico-blanco/10 px-3 py-1 text-xs font-semibold tracking-[0.04em] text-pico-blanco backdrop-blur-sm lg:text-[13px]"
                >
                  <span className="size-1.5 rounded-chip bg-pico-rojo" aria-hidden />
                  {etiqueta}
                </li>
              ))}
            </ul>
          )}
          {banner.textoBoton && (
            // Es un span y no <Boton>: todo el banner ya es un enlace. Misma forma que Boton.
            <span
              className={`relative mt-1 h-10 w-fit items-center gap-1 rounded-boton px-4 text-sm font-semibold shadow-tarjeta transition duration-200 group-hover:shadow-boton-hover motion-safe:group-hover:-translate-y-0.5 ${estilo.boton} ${
                grande ? "inline-flex md:mt-2 lg:h-12 lg:px-6 lg:text-base" : lateral ? "hidden sm:inline-flex" : "inline-flex md:mt-2 md:h-12 md:px-6 md:text-base"
              }`}
            >
              {banner.textoBoton}
              <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </span>
          )}
        </div>
      )}
    </Destino>
  );
}
