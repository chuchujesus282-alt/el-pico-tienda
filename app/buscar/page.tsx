import type { Metadata } from "next";
import Link from "next/link";
import SinResultados from "@/components/busqueda/SinResultados";
import GrillaProductos from "@/components/producto/GrillaProductos";
import RegistrarSenal from "@/components/recomendaciones/RegistrarSenal";
import Contenedor from "@/components/ui/Contenedor";
import TituloSeccion from "@/components/ui/TituloSeccion";
import { getCategorias, getIndiceProductos } from "@/lib/catalogo";
import { buscar, crearIndice } from "@/lib/recomendaciones/busqueda";
import type { Categoria, Producto } from "@/types/catalogo";

// Resultados de búsqueda (/buscar?q=…) — responsable: persona A. Usa la búsqueda inteligente de lib/recomendaciones/.

async function leerConsulta(searchParams: PageProps<"/buscar">["searchParams"]): Promise<string> {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : (q ?? "")).trim().slice(0, 100);
}

export async function generateMetadata({ searchParams }: PageProps<"/buscar">): Promise<Metadata> {
  const consulta = await leerConsulta(searchParams);
  return { title: consulta ? `Resultados para “${consulta}”` : "Buscar productos", robots: { index: false } };
}

export default async function PaginaBuscar({ searchParams }: PageProps<"/buscar">) {
  const consulta = await leerConsulta(searchParams);

  let productos: Producto[];
  let categorias: Categoria[] = [];
  try {
    [productos, categorias] = await Promise.all([getIndiceProductos(), getCategorias().catch(() => [])]);
  } catch {
    return (
      <Contenedor className="py-8 md:py-12">
        <TituloSeccion titulo="Buscar productos" nivel="h1" />
        <p className="rounded-tarjeta border border-gris-borde bg-pico-blanco p-6 text-center text-sm text-gris-texto">
          No pudimos conectar con el catálogo en este momento. Intenta de nuevo en unos minutos.
        </p>
      </Contenedor>
    );
  }

  const resultado = buscar(crearIndice(productos), consulta);
  const categoria = categorias.find((c) => c.slug === resultado.categoriaCercana) ?? null;
  const cantidad = resultado.productos.length;

  return (
    <Contenedor className="space-y-6 py-6 md:py-10">
      {consulta && <RegistrarSenal senales={[{ tipo: "busqueda", termino: consulta }]} />}

      <div>
        <TituloSeccion titulo={consulta ? `Resultados para “${consulta}”` : "Buscar productos"} nivel="h1" className="mb-1" />
        {cantidad > 0 && (
          <p className="text-[13px] text-gris-texto">
            {cantidad} {cantidad === 1 ? "producto" : "productos"}
          </p>
        )}
      </div>

      {resultado.tipo === "parcial" && (
        <p className="rounded-boton bg-pico-azul-claro px-4 py-3 text-sm text-texto">
          No encontramos todo lo que escribiste; estos productos se parecen.
          {resultado.sugerencia && (
            <>
              {" "}
              ¿Quisiste decir{" "}
              <Link
                href={`/buscar?q=${encodeURIComponent(resultado.sugerencia)}`}
                className="font-semibold text-pico-rojo underline-offset-2 hover:underline"
              >
                {resultado.sugerencia}
              </Link>
              ?
            </>
          )}
        </p>
      )}

      {cantidad > 0 ? (
        <GrillaProductos productos={resultado.productos} />
      ) : (
        <SinResultados
          consulta={consulta}
          sugerencia={resultado.sugerencia}
          categoria={categoria}
          productos={resultado.alternativos}
        />
      )}
    </Contenedor>
  );
}
