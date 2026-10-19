import Image from "next/image";
import Link from "next/link";
import { ChevronRight, House, Search } from "lucide-react";
import type { ReactNode } from "react";
import Plano from "@/components/icons/pico/Plano";
import type { ComponenteIcono } from "@/types/icono";
import Contenedor from "./Contenedor";

export type Miga = { texto: string; href?: string };

type Props = {
  /** Título de la página (h1). Sin título, la franja queda delgada y solo muestra la ruta. */
  titulo?: string;
  /** Texto pequeño sobre el título (ej. "Categoría"). */
  etiqueta?: string;
  descripcion?: ReactNode;
  /** Ruta de navegación después de "Inicio". El último elemento es la página actual. */
  ruta?: Miga[];
  /** Ícono propio (components/icons/pico): se dibuja a la derecha como un plano técnico, con cotas. */
  icono?: ComponenteIcono;
  /** Imagen de fondo opcional (ej. banner de la categoría). */
  imagen?: string | null;
  /** Contenido extra bajo el título (ej. cantidad de productos, pasos). */
  children?: ReactNode;
  /**
   * Lupa arriba a la derecha, SOLO en el teléfono: ahí el header con el buscador solo sale en Inicio y /buscar, así
   * que la lupa lleva a /buscar. Por defecto sí; /buscar la quita porque ya tiene el buscador encima.
   */
  lupa?: boolean;
  /** Ilustración propia a la derecha (desde 1024px; antes no cabe junto al título), en lugar del plano del ícono. */
  ilustracion?: ReactNode;
  /** Más bajo (menos aire y título más chico): para secciones donde el encabezado solo dice dónde estás. */
  compacto?: boolean;
  /** Capa decorativa detrás del texto (la pieza decide su posición con `absolute`). Se recorta a la tarjeta. */
  fondo?: ReactNode;
  /** "plano": azul cobalto de plano de obra con cuadrícula (el de la tira de calculadoras del inicio). Por defecto, marino. */
  tono?: "marino" | "plano";
  /**
   * Escena a la derecha (banner de cada categoría, components/categoria/banner/): una capa a todo el recuadro donde la
   * pieza decide qué va y dónde; el texto le deja la mitad derecha libre y queda centrado en vertical. Sin ella, nada cambia.
   */
  escena?: ReactNode;
  /**
   * Título en dos tiempos, como el banner "Herramientas que RINDEN" del inicio: la frase en una línea y la palabra
   * clave enorme, en mayúsculas, sobre el sello rojo inclinado. Reemplaza al acento rojo y a la etiqueta; el h1 se lee
   * completo ("Dale color con Pinturas"). Sin ella, el título de siempre.
   */
  tituloPartes?: [string, string];
};

/**
 * Encabezado de página: tarjeta azul marino redondeada (separada de la barra de categorías), con la ruta de navegación, el acento
 * rojo corto y el título. Lo usan todas las páginas interiores para que el sitio se vea parejo.
 */
export default function EncabezadoPagina({
  titulo,
  etiqueta,
  descripcion,
  ruta,
  icono: Icono,
  imagen,
  children,
  lupa = true,
  compacto = false,
  fondo,
  tono = "marino",
  ilustracion,
  escena,
  tituloPartes,
}: Props) {
  return (
    // Tarjeta redondeada sobre el fondo gris, con aire arriba: así no se pega a la barra azul de categorías.
    <Contenedor className="pt-4 md:pt-6">
    <header className={`grupo-icono group/encabezado relative isolate overflow-hidden rounded-banner ${tono === "plano" ? "tira-plano" : "bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro"} text-pico-blanco shadow-tarjeta-hover print:rounded-none print:bg-none print:text-texto print:shadow-none`}>
      {fondo && (
        <div className="pointer-events-none absolute inset-0 -z-10 print:hidden" aria-hidden>
          {fondo}
        </div>
      )}
      {imagen && (
        <>
          <Image src={imagen} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-pico-azul-oscuro/90 via-pico-azul/70 to-pico-azul/20" />
        </>
      )}
      {escena && <div className="absolute inset-0 print:hidden">{escena}</div>}
      {Icono && !imagen && !ilustracion && !escena && (
        // Plano técnico del ícono, entero (sin cortarse), centrado en vertical a la derecha.
        <span className="pointer-events-none absolute top-1/2 right-4 -z-10 hidden -translate-y-1/2 opacity-80 sm:block md:right-12 lg:right-16 print:hidden" aria-hidden>
          <Plano Icono={Icono} className="w-40 md:w-52 lg:w-60" />
        </span>
      )}

      {lupa && (
        <Link
          href="/buscar"
          aria-label="Buscar productos"
          className={`absolute right-3 z-10 flex size-11 items-center justify-center rounded-chip bg-pico-blanco/10 text-pico-blanco ring-1 ring-pico-blanco/15 transition-colors hover:bg-pico-blanco/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco md:hidden print:hidden ${
            titulo ? "top-3" : "inset-y-0 my-auto"
          }`}
        >
          <Search className="size-5" aria-hidden />
        </Link>
      )}

      <div
        className={`${!titulo ? "px-5 py-3 md:px-10 lg:px-12" : compacto ? "px-5 py-4 md:px-10 md:py-5 lg:px-12" : "px-5 py-6 md:px-10 md:py-9 lg:px-12"} ${lupa && !escena ? "max-md:pr-16" : ""} ${
          escena
            ? // Encima de la escena (z-10) sin taparla: solo la ruta y el título reciben el mouse.
              "pointer-events-none relative z-10 flex min-h-[12rem] flex-col justify-center pr-[46%]! *:pointer-events-auto md:min-h-[15rem] md:pr-[51%]! xl:min-h-[17rem]"
            : ""
        } ${
          ilustracion ? "lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12" : ""
        }`}
      >
        <div className={ilustracion ? "min-w-0" : "contents"}>
        {ruta && (
          <nav aria-label="Ruta de navegación" className="text-[13px] text-pico-blanco/70 print:hidden">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link
                  href="/"
                  className="area-tactil inline-flex items-center gap-1 rounded-sm transition-colors hover:text-pico-blanco hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco"
                >
                  <House className="size-3.5" aria-hidden />
                  Inicio
                </Link>
              </li>
              {ruta.map((miga, i) => (
                <li key={`${miga.texto}-${i}`} className="flex min-w-0 items-center gap-1" aria-current={i === ruta.length - 1 ? "page" : undefined}>
                  <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                  {miga.href && i < ruta.length - 1 ? (
                    <Link
                      href={miga.href}
                      className="area-tactil rounded-sm transition-colors hover:text-pico-blanco hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco"
                    >
                      {miga.texto}
                    </Link>
                  ) : (
                    <span className="line-clamp-1 font-medium text-pico-blanco">{miga.texto}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {titulo && (
          <div className={`motion-safe:animate-aparecer ${ruta ? (compacto ? "mt-3" : "mt-4 md:mt-5") : ""}`}>
            {tituloPartes ? (
              // La palabra crece junto con su sello al pasar el mouse por el encabezado, desde la izquierda y con rebote.
              <h1 className="font-bold">
                <span className="block text-xl leading-none md:text-3xl lg:text-4xl">{tituloPartes[0]} </span>
                <span className="relative isolate mt-2 inline-block origin-left px-2.5 pt-1 text-[2rem] leading-[0.92] tracking-[-0.02em] uppercase transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/encabezado:scale-[1.06] motion-reduce:transition-none sm:text-5xl md:mt-3 md:px-4 md:text-6xl lg:text-7xl">
                  <span className="absolute inset-0 -z-10 -skew-x-12 rounded-sm bg-pico-rojo shadow-boton-hover" aria-hidden />
                  {tituloPartes[1]}
                </span>
              </h1>
            ) : (
              <>
                <span className="block h-1 w-10 -skew-x-12 rounded-sm bg-pico-rojo lg:w-14 print:hidden" aria-hidden />
                {etiqueta && <span className="mt-3 block text-xs font-semibold tracking-[0.25em] text-pico-blanco/70 uppercase">{etiqueta}</span>}
                <h1
                  className={`max-w-4xl leading-tight font-bold text-balance ${compacto ? "text-2xl md:text-4xl" : "text-3xl md:text-5xl"} ${etiqueta ? "mt-1" : compacto ? "mt-2" : "mt-3"}`}
                >{titulo}</h1>
              </>
            )}
            {descripcion && <p className={`${tituloPartes ? "mt-3 md:mt-4" : "mt-2"} max-w-2xl text-sm text-pico-blanco/80 md:text-base print:text-gris-texto`}>{descripcion}</p>}
            {children && <div className="mt-4">{children}</div>}
          </div>
        )}
        </div>
        {ilustracion && <div className="hidden justify-center lg:flex print:hidden">{ilustracion}</div>}
      </div>
    </header>
    </Contenedor>
  );
}
