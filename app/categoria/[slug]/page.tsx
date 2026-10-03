import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Contenedor from "@/components/ui/Contenedor";
import TituloSeccion from "@/components/ui/TituloSeccion";
import { getCategorias } from "@/lib/catalogo";

// Página de categoría — responsable: persona B. Ver la sección "Página de categoría" en docs/guia-de-estilo.md.

async function buscarCategoria(slug: string) {
  const categorias = await getCategorias();
  return categorias.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await buscarCategoria(slug);
  return { title: categoria?.nombre ?? "Categoría" };
}

export default async function PaginaCategoria({ params }: PageProps<"/categoria/[slug]">) {
  const { slug } = await params;
  const categoria = await buscarCategoria(slug);
  if (!categoria) notFound();

  return (
    <Contenedor className="py-8 md:py-12">
      <TituloSeccion titulo={categoria.nombre} nivel="h1" />
    </Contenedor>
  );
}
