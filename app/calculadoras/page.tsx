import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, ChevronRight, House, ListChecks, Ruler, ShoppingCart } from "lucide-react";
import TarjetaCalculadora from "@/components/calculadoras/TarjetaCalculadora";
import Contenedor from "@/components/ui/Contenedor";
import Revelar from "@/components/ui/Revelar";
import { CALCULADORAS } from "@/lib/calculadoras/registro";

// Calculadoras de proyectos — responsable: persona B (rama `calculadoras`).
// Las calculadoras salen de lib/calculadoras/registro.ts: agregar una ahí la muestra aquí sola.

export const metadata: Metadata = {
  title: "Calcula tu proyecto",
  description: "Calculadoras de materiales de construcción: bloques, concreto, friso, cabillas, pintura, cerámica, techos y más.",
};

const pasos = [
  { icono: Ruler, titulo: "Ingresa las medidas", texto: "Largo, alto o área de lo que vas a construir." },
  { icono: ListChecks, titulo: "Revisa los materiales", texto: "Te decimos cuánto llevar de cada cosa." },
  { icono: ShoppingCart, titulo: "Agrega todo al carrito", texto: "En un clic, y envías tu pedido por WhatsApp." },
];

export default function PaginaCalculadoras() {
  return (
    <Contenedor className="space-y-8 py-6 md:space-y-10 md:py-8">
      <nav aria-label="Ruta de navegación" className="flex items-center gap-1.5 text-[13px] text-gris-texto">
        <Link href="/" className="inline-flex items-center gap-1 rounded-sm hover:text-pico-azul focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul">
          <House className="size-3.5" aria-hidden />
          Inicio
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="font-medium text-texto" aria-current="page">
          Calculadoras
        </span>
      </nav>

      <header className="relative isolate overflow-hidden rounded-banner bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro px-5 py-8 shadow-tarjeta-hover motion-safe:animate-aparecer md:px-16 md:py-14">
        <span className="absolute -right-6 -bottom-10 -z-10 motion-safe:animate-flotar lg:right-16" aria-hidden>
          <Calculator className="size-48 text-pico-blanco/10 md:size-80" strokeWidth={1.25} />
        </span>
        <span className="block h-1 w-10 -skew-x-12 rounded-sm bg-pico-rojo lg:w-14" aria-hidden />
        <h1 className="mt-3 max-w-2xl text-3xl leading-tight font-bold text-balance text-pico-blanco md:text-5xl">Calcula tu proyecto</h1>
        <p className="mt-3 max-w-xl text-sm text-pico-blanco/80 md:text-lg">
          Descubre cuánto material necesitas y llévate todo en un solo pedido.
        </p>
        <ol className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-3 md:mt-8">
          {pasos.map(({ icono: Icono, titulo, texto }, i) => (
            <li key={titulo} className="flex items-start gap-3 rounded-tarjeta bg-pico-blanco/10 p-3 ring-1 ring-pico-blanco/10">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-boton bg-pico-rojo text-pico-blanco">
                <Icono className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span>
                <span className="block text-sm leading-tight font-bold text-pico-blanco">
                  {i + 1}. {titulo}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-pico-blanco/75">{texto}</span>
              </span>
            </li>
          ))}
        </ol>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 2xl:grid-cols-5">
        {CALCULADORAS.map((calculadora, i) => (
          <li key={calculadora.slug}>
            <Revelar retraso={(i % 5) * 70} className="h-full">
              <TarjetaCalculadora calculadora={calculadora} />
            </Revelar>
          </li>
        ))}
      </ul>

      <p className="rounded-tarjeta border border-gris-borde bg-pico-blanco px-4 py-3 text-[13px] leading-relaxed text-gris-texto shadow-tarjeta md:px-5">
        <strong className="font-semibold text-pico-azul">Cálculos referenciales.</strong> Las cantidades pueden variar según la obra; consulta con tu
        maestro de obra o con nosotros.
      </p>
    </Contenedor>
  );
}
