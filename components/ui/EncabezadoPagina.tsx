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
  /** "plano": el mismo azul marino con la cuadrícula de tiza de un plano de obra (el de la tira de calculadoras del inicio). Por defecto, marino liso. */
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
  /**
   * La tarjeta azul (banner). SOLO las categorías de productos la llevan (pedido de persona B); sin ella, el
   * encabezado es liviano: la ruta en gris, la raya roja, el título azul y la descripción, sin caja.
   */
  banner?: boolean;
  /** Encabezado liviano sobre un fondo azul (ej. FondoCalculadora): ruta, título y descripción en blanco. */
  sobreOscuro?: boolean;
};

/** Ruta de navegación ("Inicio › Herramientas › …") en claro (sobre la tarjeta azul) u oscuro (sobre el fondo gris). */
function Ruta({ ruta, claro }: { ruta: Miga[]; claro: boolean }) {
  const enlace = `area-tactil rounded-sm transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 ${
    claro ? "hover:text-pico-blanco focus-visible:outline-pico-blanco" : "hover:text-pico-azul focus-visible:outline-pico-azul"
  }`;
  return (
    <nav aria-label="Ruta de navegación" className={`text-xs md:text-[13px] print:hidden ${claro ? "text-pico-blanco/70" : "text-gris-texto"}`}>
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className={`inline-flex items-center gap-1 ${enlace}`}>
            <House className="size-3.5" aria-hidden />
            Inicio
          </Link>
        </li>
        {ruta.map((miga, i) => (
          <li key={`${miga.texto}-${i}`} className="flex min-w-0 items-center gap-1" aria-current={i === ruta.length - 1 ? "page" : undefined}>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden />
            {miga.href && i < ruta.length - 1 ? (
              <Link href={miga.href} className={enlace}>
                {miga.texto}
              </Link>
            ) : (
              <span className={`line-clamp-1 font-medium ${claro ? "text-pico-blanco" : "text-pico-azul"}`}>{miga.texto}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Encabezado liviano (sin banner): el de todas las páginas que no son categorías de productos. */
function EncabezadoLiviano({
  titulo,
  descripcion,
  ruta,
  children,
  lupa,
  sobreOscuro = false,
}: Pick<Props, "titulo" | "descripcion" | "ruta" | "children" | "lupa" | "sobreOscuro">) {
  return (
    <Contenedor className="pt-5 md:pt-8">
      <header className="relative">
        {lupa && (
          // En el teléfono el header con el buscador solo sale en Inicio y /buscar: la lupa lleva a /buscar.
          <Link
            href="/buscar"
            aria-label="Buscar productos"
            className={`area-tactil absolute top-0 right-0 flex size-9 items-center justify-center rounded-chip transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 md:hidden print:hidden ${
              sobreOscuro
                ? "bg-pico-blanco/10 text-pico-blanco ring-1 ring-pico-blanco/15 focus-visible:outline-pico-blanco"
                : "bg-pico-blanco text-pico-azul shadow-tarjeta hover:text-pico-rojo focus-visible:outline-pico-azul"
            }`}
          >
            <Search className="size-[18px]" aria-hidden />
          </Link>
        )}
        <div className={lupa ? "max-md:pr-12" : ""}>
          {ruta && <Ruta ruta={ruta} claro={sobreOscuro} />}
          {titulo && (
            <div className={ruta ? "mt-3 md:mt-4" : ""}>
              <span className="mb-3 block h-1.5 w-12 origin-left -skew-x-[18deg] rounded-[2px] bg-pico-rojo motion-safe:animate-trazo print:hidden" aria-hidden />
              <h1
                className={`max-w-4xl text-[1.75rem] leading-tight font-bold tracking-tight text-balance motion-safe:animate-aparecer md:text-4xl ${
                  sobreOscuro ? "text-pico-blanco" : "text-pico-azul"
                }`}
              >
                {titulo}
              </h1>
              {descripcion && (
                <p className={`mt-2 max-w-[60ch] text-[15px] leading-relaxed md:text-base ${sobreOscuro ? "text-pico-blanco/75" : "text-gris-texto"}`}>
                  {descripcion}
                </p>
              )}
              {children && <div className="mt-4">{children}</div>}
            </div>
          )}
        </div>
      </header>
    </Contenedor>
  );
}

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
  banner = false,
  sobreOscuro = false,
}: Props) {
  if (!banner)
    return (
      <EncabezadoLiviano titulo={titulo} descripcion={descripcion} ruta={ruta} lupa={lupa} sobreOscuro={sobreOscuro}>
        {children}
      </EncabezadoLiviano>
    );
  return (
    // Tarjeta redondeada sobre el fondo gris, con aire arriba: así no se pega a la barra azul de categorías.
    // En el teléfono todo más compacto (menos aire, título y lupa más chicos): el encabezado solo dice dónde estás y
    // no se come media pantalla (pedido de persona B, menos ruido). Desde 768px, igual que siempre.
    <Contenedor className="pt-3 md:pt-6">
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
          className={`area-tactil absolute right-3 z-10 flex size-9 items-center justify-center rounded-chip bg-pico-blanco/10 text-pico-blanco ring-1 ring-pico-blanco/15 transition-colors hover:bg-pico-blanco/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco md:hidden print:hidden ${
            titulo ? "top-3" : "inset-y-0 my-auto"
          }`}
        >
          <Search className="size-[18px]" aria-hidden />
        </Link>
      )}

      <div
        className={`${!titulo ? "px-4 py-2.5 md:px-10 md:py-3 lg:px-12" : compacto ? "px-4 py-3.5 md:px-10 md:py-5 lg:px-12" : "px-4 py-4 md:px-10 md:py-9 lg:px-12"} ${lupa && !escena ? "max-md:pr-14" : ""} ${
          escena
            ? // Encima de la escena (z-10) sin taparla: solo la ruta y el título reciben el mouse.
              "pointer-events-none relative z-10 flex min-h-[12rem] flex-col justify-center pr-[46%]! *:pointer-events-auto md:min-h-[15rem] md:pr-[51%]! xl:min-h-[17rem]"
            : ""
        } ${
          ilustracion ? "lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12" : ""
        }`}
      >
        <div className={ilustracion ? "min-w-0" : "contents"}>
        {ruta && <Ruta ruta={ruta} claro />}

        {titulo && (
          <div className={`motion-safe:animate-aparecer ${ruta ? (compacto ? "mt-2.5 md:mt-3" : "mt-3 md:mt-5") : ""}`}>
            {tituloPartes ? (
              // La palabra crece junto con su sello al pasar el mouse por el encabezado, desde la izquierda y con rebote.
              <h1 className="font-bold">
                <span className="block text-lg leading-none whitespace-nowrap sm:text-xl md:text-3xl lg:text-4xl">{tituloPartes[0]} </span>
                <span
                  className={`relative isolate mt-2 inline-block origin-left px-2.5 pt-1 leading-[0.92] whitespace-nowrap tracking-[-0.02em] uppercase transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/encabezado:scale-[1.06] motion-reduce:transition-none md:mt-3 md:px-4 ${
                    // Palabras largas ("Construcción") un paso más chicas, para que quepan junto a la escena.
                    tituloPartes[1].length > 9
                      ? "text-[1.2rem] sm:text-4xl md:text-[2.6rem] lg:text-5xl xl:text-6xl"
                      : "text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl"
                  }`}
                >
                  <span className="absolute inset-0 -z-10 -skew-x-12 rounded-sm bg-pico-rojo shadow-boton-hover" aria-hidden />
                  {tituloPartes[1]}
                </span>
              </h1>
            ) : (
              <>
                <span className="block h-1 w-10 -skew-x-12 rounded-sm bg-pico-rojo lg:w-14 print:hidden" aria-hidden />
                {etiqueta && <span className="mt-3 block text-xs font-semibold tracking-[0.25em] text-pico-blanco/70 uppercase">{etiqueta}</span>}
                <h1
                  className={`max-w-4xl leading-tight font-bold text-balance ${compacto ? "text-[1.375rem] md:text-4xl" : "text-[1.625rem] md:text-5xl"} ${etiqueta ? "mt-1" : compacto ? "mt-2" : "mt-2.5 md:mt-3"}`}
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
