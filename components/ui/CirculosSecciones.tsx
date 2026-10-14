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
  secciones: SeccionCirculo[];
  /** Va sobre una franja azul marino: título y nombres en blanco. */
  sobreAzul?: boolean;
  className?: string;
};

/**
 * Fila de círculos con secciones específicas (subcategorías o tipos de producto). En móvil y tableta
 * es una fila deslizable que deja ver parte del siguiente círculo; en escritorio se reparte en una o
 * dos filas parejas a todo el ancho. Hoy solo va en el inicio ("Lo más buscado").
 */
export default function CirculosSecciones({ titulo, secciones, sobreAzul = false, className = "" }: Props) {
  if (secciones.length === 0) return null;

  return (
    <div className={className}>
      {titulo && <TituloSeccion titulo={titulo} sobreAzul={sobreAzul} />}
      <ul className="sin-scrollbar -mx-[var(--margen-pagina)] flex snap-x snap-mandatory scroll-px-[var(--margen-pagina)] gap-3 overflow-x-auto px-[var(--margen-pagina)] pt-2 pb-1 lg:mx-0 lg:grid lg:grid-cols-7 lg:gap-x-2 lg:gap-y-6 lg:overflow-visible lg:px-0 2xl:grid-cols-[repeat(14,minmax(0,1fr))]">
        {secciones.map((seccion, i) => {
          const Icono = seccion.icono;
          return (
            <li key={seccion.href} className="w-[5.5rem] shrink-0 snap-start lg:w-auto">
              <Revelar retraso={Math.min(i, 13) * 45} className="h-full">
                <Link
                  href={seccion.href}
                  className={`group flex h-full flex-col items-center gap-2.5 rounded-tarjeta text-center focus-visible:outline-2 focus-visible:outline-offset-4 ${sobreAzul ? "focus-visible:outline-pico-blanco" : "focus-visible:outline-pico-azul"}`}
                >
                  <span
                    className={`relative flex size-20 items-center justify-center overflow-hidden rounded-chip border-2 transition duration-300 ease-out group-hover:border-pico-rojo group-hover:shadow-tarjeta-hover motion-safe:group-hover:-translate-y-1 lg:size-24 ${
                      sobreAzul ? "border-pico-blanco/20 bg-pico-blanco" : "border-gris-borde bg-gris-fondo"
                    }`}
                  >
                    {seccion.imagen ? (
                      <Image
                        src={seccion.imagen}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-contain p-3 transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.07]"
                      />
                    ) : (
                      <Icono
                        className="size-9 text-pico-azul transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.07] lg:size-11"
                        strokeWidth={1.25}
                        aria-hidden
                      />
                    )}
                  </span>
                  <span
                    className={`text-[13px] leading-tight font-semibold text-balance transition-colors lg:text-sm ${
                      sobreAzul ? "text-pico-blanco/90 group-hover:text-pico-blanco" : "text-pico-azul group-hover:text-pico-rojo"
                    }`}
                  >
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
