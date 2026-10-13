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

const pasos = [
  { icono: Ruler, titulo: "Ingresa las medidas", texto: "Largo, alto o área de lo que vas a construir." },
  { icono: ListChecks, titulo: "Revisa los materiales", texto: "Te decimos cuánto llevar de cada cosa." },
  { icono: ShoppingCart, titulo: "Agrega todo al carrito", texto: "En un clic, y envías tu pedido por WhatsApp." },
];

export default function PaginaCalculadoras() {
  return (
    <>
      <EncabezadoPagina
        titulo="Calcula tu proyecto"
        descripcion="Descubre cuánto material necesitas y llévate todo en un solo pedido."
        ruta={[{ texto: "Calculadoras" }]}
        icono={Calculator}
      >
        <ol className="grid max-w-3xl gap-3 sm:grid-cols-3">
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
      </EncabezadoPagina>

    <Contenedor className="space-y-8 py-8 md:space-y-10 md:py-12">

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
