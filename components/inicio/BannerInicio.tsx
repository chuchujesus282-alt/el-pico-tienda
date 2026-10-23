import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import Plano from "@/components/icons/pico/Plano";
import type { BannerInicio as DatosBanner, VarianteBanner } from "./contenidoInicio";
import CerraduraSegura from "./CerraduraSegura";
import HerramientasAsomadas from "./HerramientasAsomadas";
import ObraEnConcreto from "./ObraEnConcreto";
import PinturaEnMovimiento from "./PinturaEnMovimiento";

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
      className={`group grupo-icono relative block overflow-hidden rounded-banner ${
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
        <div className={`relative flex h-full flex-col justify-center gap-2 ${grande ? "hero-cascada " : ""}${
          grande ? "p-5 md:gap-3 md:px-16 md:py-10 lg:gap-4 lg:px-24 2xl:px-28" : lateral ? "p-4 sm:p-5 md:p-6" : "gap-3 p-6 md:p-10 lg:px-12"
        }`}>
          {Icono && (
            // Plano técnico del ícono a la derecha (entero, sin cortarse); flota apenas y sus piezas se animan al pasar el mouse.
            <span
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 motion-safe:animate-flotar ${
                grande ? "right-4 hidden sm:block lg:right-20 2xl:right-28" : lateral ? "right-2 hidden sm:block" : "-right-2 md:right-4"
              }`}
              aria-hidden
            >
              <Plano
                Icono={Icono}
                tono={banner.variante === "claro" ? "oscuro" : "claro"}
                className={`transition-transform duration-700 ease-(--curva-suave) group-hover:scale-105 ${
                  grande ? "w-48 md:w-64 lg:w-80" : lateral ? "w-28 md:w-36" : "w-36 opacity-60 sm:opacity-100 md:w-48 lg:w-56"
                }`}
              />
            </span>
          )}
          {/* Placa amarilla con el rotomartillo flotante, solo en el banner de herramientas del carrusel. */}
          {grande && banner.id === "herramientas" && <HerramientasAsomadas />}
          {/* Placa de concreto con la paleta de bloques flotante, solo en el banner de construcción del carrusel. */}
          {grande && banner.id === "obra" && <ObraEnConcreto prioritario={prioritario} />}
          {/* Pared blanca con un rodillo que pinta una franja de color, solo en el banner de pinturas del carrusel. */}
          {grande && banner.id === "pinturas" && <PinturaEnMovimiento />}
          {/* Placa de acero con un candado de latón que se abre, solo en el banner de cerrajería del carrusel. */}
          {grande && banner.id === "cerrajeria" && <CerraduraSegura />}
          {grande && banner.tituloPartes ? (
            // Título en dos tiempos: la frase en una línea y la palabra clave enorme, en mayúsculas, sobre un
            // bloque rojo inclinado (el filete de la marca hecho sello). Al pasar el mouse crecen juntos, barra y palabra,
            // desde la izquierda y con el mismo rebote.
            <p className={`relative font-bold ${estilo.titulo}`}>
              <span className="block text-lg leading-none md:text-3xl lg:text-4xl">{banner.tituloPartes[0]}</span>
              <span
                className={`relative isolate mt-2 inline-block origin-left px-2.5 pt-1 leading-[0.92] tracking-[-0.02em] text-[var(--color-sello-texto,var(--color-pico-blanco))] uppercase transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover:scale-[1.08] md:mt-3 md:px-4 ${
                  banner.tituloPartes[1].length > 8 ? "text-3xl md:text-5xl lg:text-6xl" : "text-5xl md:text-7xl lg:text-8xl"
                }`}
              >
                {/* Rojo de la marca con letra blanca, salvo que el banner defina --color-sello y --color-sello-texto
                    (pinturas: sello blanco con la palabra en el color de la pintura de turno). */}
                <span
                  className="absolute inset-0 -z-10 -skew-x-12 rounded-sm bg-[var(--color-sello,var(--color-pico-rojo))] shadow-boton-hover transition-colors duration-500"
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
                    ? "text-3xl leading-[1.05] tracking-tight md:text-5xl lg:max-w-[55%] lg:text-6xl"
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
                grande
                  ? `hidden sm:line-clamp-2 md:text-base lg:max-w-[50%] lg:text-lg ${banner.tituloPartes ? "md:max-w-[50%]" : ""}`
                  : lateral
                    ? "hidden sm:line-clamp-2"
                    : "line-clamp-3 md:text-base lg:text-lg"
              }`}
            >
              {banner.texto}
            </p>
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
