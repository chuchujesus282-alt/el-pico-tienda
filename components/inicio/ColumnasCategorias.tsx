import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Plano from "@/components/icons/pico/Plano";
import { iconoDeCategoria } from "@/components/icons/pico/porCategoria";
import CategoryCardElectricidad from "@/components/tarjetas-categoria/CategoryCardElectricidad";
import CategoryCardPlomeria from "@/components/tarjetas-categoria/CategoryCardPlomeria";
import CategoryCardJardin from "@/components/tarjetas-categoria/CategoryCardJardin";
import CategoryCardVehiculos from "@/components/tarjetas-categoria/CategoryCardVehiculos";
import type { Categoria } from "@/types/catalogo";
import { columnasCategorias } from "./contenidoInicio";

// Cuadrícula técnica tenue del relleno sin foto. Escrita completa para que Tailwind la encuentre.
const CUADRICULA =
  "bg-[linear-gradient(var(--color-pico-blanco)_1px,transparent_1px),linear-gradient(90deg,var(--color-pico-blanco)_1px,transparent_1px)] bg-[size:32px_32px]";

// Las tarjetas animadas se levantan al pasar el mouse igual que las columnas (`Columna`).
const LEVANTAR = "transition duration-300 ease-(--curva-suave) motion-safe:hover:-translate-y-1";

// Columnas por cantidad de categorías, para que nunca quede una sola en la última fila. Con 6: 2×3 en el teléfono,
// 3×2 desde 768px y una fila de 6 desde 1536px (antes, 6 en fila quedan demasiado angostas).
const COLUMNAS: Record<number, string> = {
  4: "lg:grid-cols-4",
  6: "md:grid-cols-3 2xl:grid-cols-6",
};

/**
 * "Más categorías": las categorías que no tienen banner en el inicio (y las marcadas con `aunqueTengaBanner`), en
 * columnas verticales (más altas que una tarjeta de producto) para darle verticalidad a la página. Las columnas
 * por fila dependen de cuántas son (`COLUMNAS`). Todas en 320:470 (las animadas lo toman de `--alto-tarjeta` en el
 * <li>; su prototipo es 320:420 y el dibujo queda centrado en el alto extra), para que midan lo mismo.
 * Foto y texto de cada una en `columnasCategorias`; sin foto, el plano técnico de su ícono sobre azul.
 */
export default function ColumnasCategorias({ categorias }: { categorias: Categoria[] }) {
  if (categorias.length === 0) return null;

  return (
    // Sin título a la vista (más espontáneo); el nombre queda para lectores de pantalla.
    <section aria-label="Más categorías">
      <ul className={`grid grid-cols-2 gap-3 md:gap-4 ${COLUMNAS[categorias.length] ?? "lg:grid-cols-3"}`}>
        {categorias.map((categoria) => (
          <li key={categoria.slug} className="[--alto-tarjeta:470]">
            {categoria.slug === "electricidad" ? (
              // Tarjeta aprobada (bombillo de línea que se enrosca y prende), escalada al ancho de la columna.
              <div className={LEVANTAR}>
                <CategoryCardElectricidad
                  titulo={categoria.nombre}
                  descripcion={columnasCategorias[categoria.slug]?.texto}
                  href={`/categoria/${categoria.slug}`}
                  escalar
                />
              </div>
            ) : categoria.slug === "plomeria" ? (
              // Tarjeta aprobada (tubería de línea que se arma y por la que corre el agua), escalada al ancho de la columna.
              <div className={LEVANTAR}>
                <CategoryCardPlomeria
                  titulo={categoria.nombre}
                  descripcion={columnasCategorias[categoria.slug]?.texto}
                  href={`/categoria/${categoria.slug}`}
                  escalar
                />
              </div>
            ) : categoria.slug === "hogar-y-jardin" ? (
              // Tarjeta aprobada (pala de línea que cava una montaña de tierra), escalada al ancho de la columna.
              <div className={LEVANTAR}>
                <CategoryCardJardin
                  titulo={categoria.nombre}
                  descripcion={columnasCategorias[categoria.slug]?.texto}
                  href={`/categoria/${categoria.slug}`}
                  escalar
                />
              </div>
            ) : categoria.slug === "vehiculos" ? (
              // Tarjeta aprobada (rueda de línea que gira, sale y vuelve rodando), escalada al ancho de la columna.
              <div className={LEVANTAR}>
                <CategoryCardVehiculos
                  titulo={categoria.nombre}
                  descripcion={columnasCategorias[categoria.slug]?.texto}
                  href={`/categoria/${categoria.slug}`}
                  escalar
                />
              </div>
            ) : (
              <Columna categoria={categoria} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Columna({ categoria }: { categoria: Categoria }) {
  const datos = columnasCategorias[categoria.slug];
  const imagen = datos?.imagen ?? null;

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
