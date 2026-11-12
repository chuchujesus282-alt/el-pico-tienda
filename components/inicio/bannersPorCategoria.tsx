import type { ReactNode } from "react";
import { iconoDeCategoria } from "@/components/icons/pico/porCategoria";
import CategoryCardElectricidad from "@/components/tarjetas-categoria/CategoryCardElectricidad";
import CategoryCardJardin from "@/components/tarjetas-categoria/CategoryCardJardin";
import CategoryCardPlomeria from "@/components/tarjetas-categoria/CategoryCardPlomeria";
import CategoryCardSeguridad from "@/components/tarjetas-categoria/CategoryCardSeguridad";
import CategoryCardTornilleria from "@/components/tarjetas-categoria/CategoryCardTornilleria";
import CategoryCardVehiculos from "@/components/tarjetas-categoria/CategoryCardVehiculos";
import { categorias } from "@/lib/categorias";
import type { ComponenteIcono } from "@/types/icono";
import BannerInicio from "./BannerInicio";
import BannerTornilleria from "./BannerTornilleria";
import BannerTrabajaProtegido from "./BannerTrabajaProtegido";
import ColumnaCategoria from "./ColumnaCategoria";
import {
  bannersCentrales,
  bannersHorizontales,
  textosCategoria,
  type BannerInicio as DatosBanner,
  type VarianteBanner,
} from "./contenidoInicio";

// Registro de diseños de los banners del inicio: cada categoría puede tener su variante PROPIA en cada formato
// (central, horizontal, vertical). Lo que falta usa la GENÉRICA de ese formato (título, texto, botón y enlace a la
// categoría, con el estilo de los demás), así nunca queda un lugar vacío. Qué categoría va en qué lugar cada día lo
// dice lib/rotacionBanners.ts.
// Para sumar un diseño: créalo y ponlo aquí en su categoría y formato; nada más cambia.

export type FormatoBanner = "central" | "horizontal" | "vertical";

type Variantes = {
  /** Diapositiva del carrusel central (llena su celda). `prioritario`: solo la primera diapositiva. */
  central?: (props: { prioritario: boolean }) => ReactNode;
  /** Banner horizontal (fila de dos). */
  horizontal?: () => ReactNode;
  /** Columna vertical de 320:470 (fila de cuatro). */
  vertical?: () => ReactNode;
};

const SIZES_CENTRAL = "(min-width: 1536px) 1472px, 100vw";
const SIZES_HORIZONTAL = "(min-width: 1536px) 740px, (min-width: 768px) 50vw, 100vw";
// Se levantan igual que BannerInicio: 4px y sombra de tarjeta, en 200 ms.
const LEVANTAR_HORIZONTAL =
  "h-full rounded-[14px] shadow-tarjeta transition duration-200 hover:shadow-tarjeta-hover motion-safe:hover:-translate-y-1";
// Las tarjetas animadas se levantan al pasar el mouse igual que la columna genérica.
const LEVANTAR_VERTICAL = "transition duration-300 ease-(--curva-suave) motion-safe:hover:-translate-y-1";

function central(banner: DatosBanner): Variantes["central"] {
  return function Central({ prioritario }) {
    return <BannerInicio banner={banner} tamano="grande" prioritario={prioritario} sizes={SIZES_CENTRAL} className="h-full" />;
  };
}

type PropsTarjeta = { titulo: string; descripcion?: string; href: string; escalar?: boolean };

/** Tarjeta animada aprobada, escalada al ancho de la columna. */
function tarjeta(slug: string, Tarjeta: (props: PropsTarjeta) => ReactNode): Variantes["vertical"] {
  return function Vertical() {
    return (
      <div className={LEVANTAR_VERTICAL}>
        <Tarjeta titulo={nombreDe(slug)} descripcion={textosCategoria[slug]?.texto} href={`/categoria/${slug}`} escalar />
      </div>
    );
  };
}

export const bannersPorCategoria: Record<string, Variantes> = {
  // Construcción y Cerrajería: provisionales a propósito (solo texto sobre el azul), pero son las suyas.
  construccion: { central: central(bannersCentrales.construccion) },
  herramientas: { central: central(bannersCentrales.herramientas) }, // con HerramientasAsomadas
  pinturas: { central: central(bannersCentrales.pinturas) }, // con PinturaEnMovimiento
  cerrajeria: { central: central(bannersCentrales.cerrajeria) },
  tornilleria: {
    horizontal: function Tornilleria() {
      const b = bannersHorizontales.tornilleria;
      return (
        <div className={LEVANTAR_HORIZONTAL}>
          <BannerTornilleria titulo={b.titulo} descripcion={b.texto} textoBoton={b.textoBoton} href={b.href} />
        </div>
      );
    },
    vertical: tarjeta("tornilleria", CategoryCardTornilleria),
  },
  "seguridad-industrial": {
    horizontal: function Seguridad() {
      const b = bannersHorizontales["seguridad-industrial"];
      return (
        <div className={LEVANTAR_HORIZONTAL}>
          <BannerTrabajaProtegido titulo={b.titulo} descripcion={b.texto} textoBoton={b.textoBoton} href={b.href} />
        </div>
      );
    },
    vertical: tarjeta("seguridad-industrial", CategoryCardSeguridad),
  },
  electricidad: { vertical: tarjeta("electricidad", CategoryCardElectricidad) },
  griferia: { vertical: tarjeta("griferia", CategoryCardPlomeria) },
  "hogar-y-jardin": { vertical: tarjeta("hogar-y-jardin", CategoryCardJardin) },
  vehiculos: { vertical: tarjeta("vehiculos", CategoryCardVehiculos) },
};

function nombreDe(slug: string): string {
  return categorias.find((c) => c.slug === slug)?.nombre ?? slug;
}

/** Datos de un banner genérico: el nombre de la categoría como título y su texto y botón de `textosCategoria`. */
function datosGenericos(slug: string, variante: VarianteBanner, icono?: ComponenteIcono): DatosBanner {
  const textos = textosCategoria[slug];
  return {
    id: `generico-${slug}`, // nunca "herramientas" ni "pinturas": esos ids montan sus escenas en BannerInicio
    imagen: null,
    alt: `${nombreDe(slug)} en El Pico`,
    href: `/categoria/${slug}`,
    titulo: nombreDe(slug),
    texto: textos?.texto,
    textoBoton: textos?.textoBoton ?? "Ver categoría",
    variante,
    icono,
  };
}

/** "propia" si la categoría tiene su diseño en ese formato; "generica" si se ve la genérica. */
export function tipoDeVariante(slug: string, formato: FormatoBanner): "propia" | "generica" {
  return bannersPorCategoria[slug]?.[formato] ? "propia" : "generica";
}

/** Nombre de la diapositiva central (para los indicadores del carrusel). */
export function tituloCentral(slug: string): string {
  return bannersPorCategoria[slug]?.central ? (bannersCentrales[slug]?.titulo ?? nombreDe(slug)) : nombreDe(slug);
}

/** Diapositiva central. Genérica: solo texto sobre el azul, como las provisionales de Construcción y Cerrajería. */
export function BannerCentral({ slug, prioritario }: { slug: string; prioritario: boolean }) {
  const Propia = bannersPorCategoria[slug]?.central;
  if (Propia) return <Propia prioritario={prioritario} />;
  return (
    <BannerInicio banner={datosGenericos(slug, "azul")} tamano="grande" prioritario={prioritario} sizes={SIZES_CENTRAL} className="h-full" />
  );
}

/**
 * Banner horizontal. Genérico: BannerInicio con el plano del ícono de la categoría, en azul en el primer lugar y en
 * claro en el segundo (como la pareja casco/tornillo).
 */
export function BannerHorizontal({ slug, lugar }: { slug: string; lugar: 0 | 1 }) {
  const Propia = bannersPorCategoria[slug]?.horizontal;
  if (Propia) return <Propia />;
  return (
    <BannerInicio
      banner={datosGenericos(slug, lugar === 0 ? "azul" : "claro", iconoDeCategoria(slug))}
      sizes={SIZES_HORIZONTAL}
      // Alto mínimo y no proporción fija: si el texto no cabe, el banner crece en vez de cortarlo.
      className="min-h-48 md:min-h-60"
    />
  );
}

/** Columna vertical. Genérica: ColumnaCategoria (plano del ícono sobre azul, o su foto). */
export function BannerVertical({ slug }: { slug: string }) {
  const Propia = bannersPorCategoria[slug]?.vertical;
  if (Propia) return <Propia />;
  return <ColumnaCategoria categoria={{ slug, nombre: nombreDe(slug), banner: null }} />;
}
