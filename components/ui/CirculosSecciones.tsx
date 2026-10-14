import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import Revelar from "./Revelar";
import TituloSeccion from "./TituloSeccion";

export type SeccionCirculo = {
  nombre: string;
  /** Subcategoría (`/categoria/…?subcategoria=…`) o búsqueda (`/buscar?q=…`). */
  href: string;
  /** Ícono lineal de respaldo mientras no haya imagen. */
  icono: LucideIcon;
  /** Imagen del producto recortada (sin fondo), en public/ o URL absoluta. Si existe, reemplaza al ícono. */
  imagen?: string | null;
};

type Props = {
  titulo?: string;
  subtitulo?: string;
  secciones: SeccionCirculo[];
  className?: string;
};

/**
 * Fila de círculos con secciones específicas (subcategorías o tipos de producto). En móvil y tableta
 * es una fila deslizable que deja ver parte del siguiente círculo; en escritorio se reparte en una o
 * dos filas parejas a todo el ancho. Hoy solo va en el inicio ("Lo más buscado").
 * Cada círculo lleva un aro: gris en reposo; al pasar el mouse el aro se pone rojo y el círculo se llena de azul.
 */
export default function CirculosSecciones({ titulo, subtitulo, secciones, className = "" }: Props) {
  if (secciones.length === 0) return null;

  return (
    <div className={className}>
      {titulo && <TituloSeccion titulo={titulo} subtitulo={subtitulo} />}
      <ul className="sin-scrollbar -mx-[var(--margen-pagina)] flex snap-x snap-mandatory scroll-px-[var(--margen-pagina)] gap-3 overflow-x-auto px-[var(--margen-pagina)] pt-2 pb-2 lg:mx-0 lg:grid lg:grid-cols-7 lg:gap-x-2 lg:gap-y-7 lg:overflow-visible lg:px-0 2xl:grid-cols-[repeat(14,minmax(0,1fr))]">
        {secciones.map((seccion, i) => {
          const Icono = seccion.icono;
          return (
            <li key={seccion.href} className="w-[5.5rem] shrink-0 snap-start lg:w-auto">
              <Revelar retraso={Math.min(i, 13) * 45} className="h-full">
                <Link
                  href={seccion.href}
                  className="group flex h-full flex-col items-center gap-3 rounded-tarjeta text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pico-azul"
                >
                  {/* Aro exterior + círculo interior. */}
                  <span className="rounded-chip border-2 border-gris-borde p-1 transition duration-300 ease-out group-hover:border-pico-rojo motion-safe:group-hover:-translate-y-1.5">
                    <span className="relative flex size-[4.5rem] items-center justify-center overflow-hidden rounded-chip bg-gradient-to-br from-pico-azul-claro to-gris-fondo shadow-tarjeta transition duration-300 ease-out group-hover:from-pico-azul group-hover:to-pico-azul-oscuro group-hover:shadow-boton-hover lg:size-[5.5rem]">
                      {seccion.imagen ? (
                        <Image
                          src={seccion.imagen}
                          alt=""
                          fill
                          sizes="88px"
                          className="object-contain p-3 transition-transform duration-300 ease-out motion-safe:group-hover:scale-110"
                        />
                      ) : (
                        <Icono
                          className="size-8 text-pico-azul transition duration-300 ease-out group-hover:text-pico-blanco motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-6 lg:size-10"
                          strokeWidth={1.25}
                          aria-hidden
                        />
                      )}
                    </span>
                  </span>
                  <span className="text-[13px] leading-tight font-semibold text-balance text-pico-azul transition-colors group-hover:text-pico-rojo lg:text-sm">
                    {seccion.nombre}
                  </span>
                </Link>
              </Revelar>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
