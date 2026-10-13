import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, House } from "lucide-react";
import CalculadoraProyecto from "@/components/calculadoras/CalculadoraProyecto";
import type { ProductosPorCodigo } from "@/components/calculadoras/proyecto";
import Contenedor from "@/components/ui/Contenedor";
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

  const Icono = calculadora.icono;

  return (
    <Contenedor className="py-6 md:py-8">
      <nav aria-label="Ruta de navegación" className="mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-gris-texto print:hidden">
        <Link href="/" className="inline-flex items-center gap-1 rounded-sm hover:text-pico-azul focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul">
          <House className="size-3.5" aria-hidden />
          Inicio
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link href="/calculadoras" className="rounded-sm hover:text-pico-azul focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul">
          Calculadoras
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="font-medium text-texto" aria-current="page">
          {calculadora.titulo}
        </span>
      </nav>

      <header className="mb-6 flex items-center gap-4 motion-safe:animate-aparecer">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-tarjeta bg-gradient-to-br from-pico-azul to-pico-azul-oscuro text-pico-blanco shadow-tarjeta">
          <Icono className="size-7" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h1 className="font-titulo text-3xl leading-tight font-bold text-pico-azul md:text-4xl">{calculadora.titulo}</h1>
          <p className="mt-0.5 text-sm text-gris-texto">{calculadora.descripcion}</p>
        </div>
      </header>

      <CalculadoraProyecto slug={slug} productos={productos} />
    </Contenedor>
  );
}
