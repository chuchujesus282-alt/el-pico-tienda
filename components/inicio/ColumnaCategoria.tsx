import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Plano from "@/components/icons/pico/Plano";
import { iconoDeCategoria } from "@/components/icons/pico/porCategoria";
import type { Categoria } from "@/types/catalogo";
import { textosCategoria } from "./contenidoInicio";

// Cuadrícula técnica tenue del relleno sin foto. Escrita completa para que Tailwind la encuentre.
const CUADRICULA =
  "bg-[linear-gradient(var(--color-pico-blanco)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-blanco)_1px,transparent_1px)] bg-[size:32px_32px]";

/**
 * Banner vertical GENÉRICO (columna de 320:470) para una categoría que todavía no tiene su tarjeta animada: foto de
 * `textosCategoria[slug].imagenColumna` o, sin ella, el plano técnico de su ícono sobre azul. Mismo diseño que tenía
 * la columna fija de ColumnasCategorias.
 */
export default function ColumnaCategoria({ categoria }: { categoria: Categoria }) {
  const datos = textosCategoria[categoria.slug];
  const imagen = datos?.imagenColumna ?? null;

  return (
    <Link
      href={`/categoria/${categoria.slug}`}
      className="group grupo-icono relative flex aspect-[320/470] flex-col justify-end overflow-hidden rounded-banner bg-gradient-to-b from-pico-azul to-pico-azul-oscuro shadow-tarjeta transition duration-300 ease-(--curva-suave) hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-1"
    >
      {imagen ? (
        <Image
          src={imagen}
          alt=""
          fill
          sizes="(min-width: 1536px) 400px, (min-width: 1024px) 25vw, 50vw"
          className="object-cover transition-transform duration-700 ease-(--curva-suave) group-hover:scale-105"
        />
      ) : (
        // Relleno provisional: cuadrícula de plano y el ícono de la categoría como dibujo técnico, arriba.
        <>
          <span className={`absolute inset-0 opacity-[0.06] ${CUADRICULA}`} aria-hidden />
          <span className="absolute inset-x-0 top-[8%] flex justify-center" aria-hidden>
            <Plano
              Icono={iconoDeCategoria(categoria.slug)}
              className="w-[68%] transition-transform duration-700 ease-(--curva-suave) group-hover:scale-105"
            />
          </span>
        </>
      )}

      {/* Velo para que el texto siempre se lea, sobre foto o sobre el relleno. */}
      <span className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-pico-azul-oscuro/95 via-pico-azul-oscuro/60 to-transparent" aria-hidden />

      <span className="relative flex flex-col gap-1.5 p-4 md:gap-2 md:p-5 lg:p-6">
        <span
          className="h-1 w-8 -skew-x-12 rounded-sm bg-pico-rojo transition-all duration-300 group-hover:w-14"
          aria-hidden
        />
        <span className="text-lg leading-tight font-bold text-pico-blanco md:text-xl lg:text-2xl">{categoria.nombre}</span>
        {/* Siempre dos líneas de alto (aunque el texto quepa en una): así los nombres de las cuatro quedan alineados. */}
        <span className="hidden min-h-[2.75em] text-sm leading-snug text-pico-blanco/75 sm:line-clamp-2">{datos?.texto}</span>
        <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-pico-blanco">
          Ver categoría
          <ArrowRight className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" aria-hidden />
        </span>
      </span>
    </Link>
  );
}
