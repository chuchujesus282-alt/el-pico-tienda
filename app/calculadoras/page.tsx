import type { Metadata } from "next";
import { Calculator, ListChecks, Ruler, ShoppingCart } from "lucide-react";
import TarjetaCalculadora from "@/components/calculadoras/TarjetaCalculadora";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import Revelar from "@/components/ui/Revelar";
import { CALCULADORAS } from "@/lib/calculadoras/registro";

// Calculadoras de proyectos — responsable: persona B (rama `calculadoras`).
// Las calculadoras salen de lib/calculadoras/registro.ts: agregar una ahí la muestra aquí sola.

export const metadata: Metadata = {
  title: "Calcula tu proyecto",
  description: "Calculadoras de materiales de construcción: bloques, concreto, friso, cabillas, pintura, cerámica, techos y más.",
};

// Cómo se usa, en tres pasos cortos (en móvil solo se ve el título).
const pasos = [
  { icono: Ruler, titulo: "Mide tu obra", texto: "Largo, alto o área" },
  { icono: ListChecks, titulo: "Ve el material", texto: "Te decimos cuánto llevar" },
  { icono: ShoppingCart, titulo: "Pide en un clic", texto: "Al carrito y por WhatsApp" },
];

export default function PaginaCalculadoras() {
  return (
    <>
      <EncabezadoPagina
        titulo="Calcula tu proyecto"
        descripcion="Descubre cuánto material necesitas y llévate todo en un solo pedido."
        ruta={[{ texto: "Calculadoras" }]}
        icono={Calculator}
      />

    <Contenedor className="space-y-8 py-8 md:space-y-10 md:py-12">
      <ol aria-label="Cómo funciona" className="grid grid-cols-3 divide-x divide-gris-borde rounded-banner border border-gris-borde bg-pico-blanco shadow-tarjeta">
        {pasos.map(({ icono: Icono, titulo, texto }, i) => (
          <li key={titulo} className="flex flex-col items-center gap-2.5 px-2 py-4 text-center sm:flex-row sm:justify-center sm:gap-4 sm:px-5 sm:py-5 sm:text-left md:py-6">
            <span className="relative flex size-11 shrink-0 items-center justify-center rounded-boton bg-pico-azul-claro text-pico-azul md:size-14">
              <Icono className="size-5 md:size-7" strokeWidth={1.75} aria-hidden />
              <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-chip bg-pico-rojo font-titulo text-xs font-bold text-pico-blanco ring-2 ring-pico-blanco">
                {i + 1}
              </span>
            </span>
            <span>
              <span className="block font-titulo text-sm leading-tight font-bold text-pico-azul sm:text-base md:text-lg">{titulo}</span>
              <span className="mt-0.5 hidden text-[13px] leading-snug text-gris-texto sm:block md:text-sm">{texto}</span>
            </span>
          </li>
        ))}
      </ol>

      <ul className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-5">
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
    </>
  );
}
