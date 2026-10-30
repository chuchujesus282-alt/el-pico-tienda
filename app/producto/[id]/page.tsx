import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, House } from "lucide-react";
import IconoCamion from "@/components/icons/pico/IconoCamion";
import IconoMoto from "@/components/icons/pico/IconoMoto";
import IconoTienda from "@/components/icons/pico/IconoTienda";
import PlacaIcono from "@/components/icons/pico/PlacaIcono";
import type { ComponenteIcono } from "@/types/icono";
import BotonFavorito from "@/components/favoritos/BotonFavorito";
import { FORMAS_RETIRO, type FormaRetiro } from "@/components/finalizar-pedido/pedido";
import { CalificacionesProducto, EstrellasProducto } from "@/components/opiniones/CalificacionesVivas";
import AccionesCompra from "@/components/producto-detalle/AccionesCompra";
import BloquePrecio from "@/components/producto-detalle/BloquePrecio";
import CodigoCompartir from "@/components/producto-detalle/CodigoCompartir";
import CompraConVariantes from "@/components/producto-detalle/CompraConVariantes";
import GaleriaZoom from "@/components/producto-detalle/GaleriaZoom";
import ProductosRelacionados from "@/components/recomendaciones/ProductosRelacionados";
import RegistrarSenal from "@/components/recomendaciones/RegistrarSenal";
import RegistrarEvento from "@/components/eventos/RegistrarEvento";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import { getCategorias, getGrupo, getProducto } from "@/lib/catalogo";
import { descripcionProducto, tituloProducto } from "@/lib/formato";
import { getOpiniones } from "@/lib/opiniones";
import type { Categoria } from "@/types/catalogo";

// Página de producto — responsable: persona B (rama `producto`).
// Si el catálogo falla al buscar el producto, el error llega a error.tsx; mientras carga se muestra loading.tsx.

async function buscarCategoria(slug: string): Promise<Categoria | null> {
  try {
    return (await getCategorias()).find((c) => c.slug === slug) ?? null;
  } catch {
    return null; // sin la categoría la página igual funciona (la ruta muestra solo Inicio)
  }
}

export async function generateMetadata({ params }: PageProps<"/producto/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const producto = await getProducto(id);
    return { title: producto ? tituloProducto(producto) : "Producto" };
  } catch {
    return { title: "Producto" };
  }
}

const ICONOS_RETIRO: Record<FormaRetiro, ComponenteIcono> = { pickup: IconoTienda, delivery: IconoMoto, flete: IconoCamion };

export default async function PaginaProducto({ params, searchParams }: PageProps<"/producto/[id]">) {
  const { id } = await params;
  const { medida } = await searchParams;
  const [encontrado, conGrupo] = await Promise.all([getProducto(id), getGrupo(id)]);
  if (!encontrado) notFound();

  // Producto con medidas (lib/agrupaciones.ts): la página es la del grupo y se elige la medida. Se abre marcada la
  // medida de la dirección (?medida=CODIGO), o la del código pedido, o la primera.
  const grupo = conGrupo?.grupo;
  const pedida = typeof medida === "string" && grupo?.variantes.some((v) => v.id === medida) ? medida : undefined;
  const seleccion = pedida ?? conGrupo?.seleccion;
  const producto = grupo ? grupo.tarjeta : encontrado;
  const elegida = grupo?.variantes.find((v) => v.id === seleccion)?.producto ?? encontrado;

  const [categoria, opiniones] = await Promise.all([
    buscarCategoria(producto.categoriaSlug),
    getOpiniones(producto.id).catch(() => []),
  ]);
  const titulo = tituloProducto(producto);
  const descripcion = grupo ? null : descripcionProducto(producto);

  const enlaceSecundario =
    "group inline-flex items-center gap-1.5 rounded-boton text-sm font-semibold text-logo-marino hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-logo-marino";

  return (
    <div>
      <EncabezadoPagina
        ruta={[...(categoria ? [{ texto: categoria.nombre, href: `/categoria/${categoria.slug}` }] : []), { texto: titulo }]}
      />
      <Contenedor className="py-6 md:py-8">
        <article className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-12">
          <div className="motion-safe:animate-aparecer md:sticky md:top-6 md:self-start">
            <GaleriaZoom src={producto.imagen} alt={titulo} categoria={producto.categoriaSlug} subcategoria={producto.subcategoria} />
          </div>

          <div className="flex flex-col gap-5 motion-safe:animate-aparecer motion-safe:[animation-delay:120ms]">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {producto.marca && (
                  <span className="rounded-chip bg-logo-marino px-3 py-1 font-titulo text-xs font-bold tracking-[0.12em] text-pico-blanco uppercase">
                    {producto.marca}
                  </span>
                )}
                {grupo ? (
                  // Código y favorito van con la medida elegida (CompraConVariantes).
                  <span className="rounded-chip bg-logo-marino-claro px-3 py-1 text-xs font-semibold text-logo-marino">
                    {grupo.variantes.length} medidas
                  </span>
                ) : (
                  <>
                    <CodigoCompartir codigo={producto.id} titulo={titulo} />
                    <BotonFavorito productoId={producto.id} titulo={titulo} variante="chip" />
                  </>
                )}
              </div>
              <h1 className="font-titulo text-[1.75rem] leading-tight font-bold text-logo-marino md:text-4xl">{titulo}</h1>
              {/* Descripción de Saint (el color, el modelo o "Ref. …"), completa. En un grupo de medidas va la de la
                  medida elegida, en CompraConVariantes. */}
              {descripcion && (
                <p className="-mt-1 font-titulo text-xl leading-snug font-semibold text-pico-azul-medio md:text-2xl">{descripcion}</p>
              )}
              <EstrellasProducto productoId={producto.id} opiniones={opiniones} />
            </div>

            {grupo && seleccion ? (
              // Precio de la medida elegida + barra de medidas + cantidad y "Agregar al carrito".
              <CompraConVariantes variantes={grupo.variantes} seleccionInicial={seleccion} />
            ) : (
              <>
                <BloquePrecio producto={producto} />
                <AccionesCompra producto={producto} />
              </>
            )}

            {/* Cómo lo recibes: las mismas tres formas que se eligen al finalizar el pedido. */}
            <ul className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Formas de recibir tu pedido">
              {FORMAS_RETIRO.map(({ valor, etiqueta, detalle }) => {
                const Icono = ICONOS_RETIRO[valor];
                return (
                  <li
                    key={valor}
                    className="group grupo-icono flex flex-col items-center gap-2 rounded-tarjeta border border-gris-borde bg-pico-blanco px-2 py-3 text-center shadow-tarjeta transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-tarjeta-hover motion-safe:hover:-translate-y-0.5 sm:px-3"
                  >
                    <PlacaIcono>
                      <Icono />
                    </PlacaIcono>
                    <span>
                      <span className="block text-sm font-bold text-pico-azul">{etiqueta}</span>
                      <span className="mt-0.5 hidden text-xs leading-snug text-gris-texto sm:block">{detalle}</span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gris-borde pt-4">
              {categoria && (
                <Link href={`/categoria/${categoria.slug}`} className={enlaceSecundario}>
                  <ArrowLeft className="size-4 transition-transform motion-safe:group-hover:-translate-x-1" aria-hidden />
                  Ver más de {categoria.nombre}
                </Link>
              )}
              <Link href="/" className={enlaceSecundario}>
                <House className="size-4" aria-hidden />
                Volver al inicio
              </Link>
            </div>
          </div>
        </article>

        <CalificacionesProducto productoId={producto.id} opiniones={opiniones} className="mt-10 md:mt-14" />

        {/* "También te puede servir": complementarios + similares (lib/recomendaciones/). */}
        <ProductosRelacionados
          producto={elegida}
          href={categoria ? `/categoria/${categoria.slug}` : undefined}
          className="mt-10 md:mt-14"
        />
        {/* En un grupo cuenta como vista la medida que se abrió (es la que existe en el catálogo). */}
        <RegistrarSenal senales={[{ tipo: "visto", id: elegida.id }]} />
        {/* Evento para análisis (persona A, lib/eventos/): no dibuja nada. En un grupo, la medida que se abrió. */}
        <RegistrarEvento evento={{ tipo: "producto_visto", producto: elegida.id }} />
      </Contenedor>
    </div>
  );
}
