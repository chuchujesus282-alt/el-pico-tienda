import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CalculadoraProyecto from "@/components/calculadoras/CalculadoraProyecto";
import type { ProductosPorCodigo } from "@/components/calculadoras/proyecto";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import { codigosDeProductos } from "@/lib/calculadoras/materiales";
import { CALCULADORAS, obtenerCalculadora } from "@/lib/calculadoras/registro";
import { getProducto } from "@/lib/catalogo";

// Una calculadora — responsable: persona B (rama `calculadoras`).
// La página (servidor) trae del catálogo los productos que usa la calculadora; el cálculo corre en el navegador.

export function generateStaticParams() {
  return CALCULADORAS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/calculadoras/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const calculadora = obtenerCalculadora(slug);
  return calculadora ? { title: `Calculadora: ${calculadora.titulo}`, description: calculadora.descripcion } : { title: "Calculadora no encontrada" };
}

export default async function PaginaCalculadora({ params }: PageProps<"/calculadoras/[slug]">) {
  const { slug } = await params;
  const calculadora = obtenerCalculadora(slug);
  if (!calculadora) notFound();

  // Precio e imagen actuales de cada producto. Si uno falla o ya no existe, ese material
  // sale como "Consultar disponibilidad" y lo demás sigue funcionando.
  const codigos = codigosDeProductos([...calculadora.materiales, ...calculadora.herramientas]);
  const encontrados = await Promise.all(codigos.map((codigo) => getProducto(codigo).catch(() => null)));
  const productos: ProductosPorCodigo = {};
  for (const producto of encontrados) if (producto) productos[producto.id] = producto;

  return (
    <>
      <EncabezadoPagina
        titulo={calculadora.titulo}
        descripcion={calculadora.descripcion}
        ruta={[{ texto: "Calculadoras", href: "/calculadoras" }, { texto: calculadora.titulo }]}
        icono={calculadora.icono}
      />
    <Contenedor className="py-6 md:py-10">
      <CalculadoraProyecto slug={slug} productos={productos} />
    </Contenedor>
    </>
  );
}
