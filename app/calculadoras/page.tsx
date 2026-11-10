import type { Metadata } from "next";
import TarjetaCalculadora from "@/components/calculadoras/TarjetaCalculadora";
import Contenedor from "@/components/ui/Contenedor";
import Revelar from "@/components/ui/Revelar";
import TituloPagina from "@/components/ui/TituloPagina";
import { CALCULADORAS } from "@/lib/calculadoras/registro";

// Calculadoras de proyectos — responsable: persona B (rama `calculadoras`).
// Las calculadoras salen de lib/calculadoras/registro.ts: agregar una ahí la muestra aquí sola.

export const metadata: Metadata = {
  title: "Calcula tu proyecto",
  description: "Calculadoras de materiales de construcción: bloques, concreto, friso, cabillas, pintura, cerámica, techos y más.",
};

// Cómo se usa, en tres pasos cortos (bajo el título, unidos por una línea; en el teléfono, uno debajo del otro).
const pasos = ["Mide tu obra", "Ve el material", "Pide en un clic"];

export default function PaginaCalculadoras() {
  return (
    <>
    <Contenedor className="space-y-8 py-6 md:space-y-10 md:py-10">
      {/* Sin el banner azul (pedido de persona B): título liviano y los tres pasos. */}
      <TituloPagina
        titulo="Calcula tu proyecto"
        descripcion="Elige tu trabajo, pon las medidas y te decimos cuánto material llevar. Gratis y sin registrarte."
      >
        <ol aria-label="Cómo funciona" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
          {pasos.map((titulo, i) => (
            <li key={titulo} className="flex items-center sm:gap-0">
              {i > 0 && <span className="hidden h-px w-8 bg-pico-azul/20 sm:mx-2 sm:block lg:w-12" aria-hidden />}
              <span className="flex h-10 items-center gap-2.5 rounded-chip bg-pico-blanco pr-4 pl-1.5 text-sm font-semibold text-pico-azul shadow-tarjeta">
                <span className="flex size-7 items-center justify-center rounded-chip bg-pico-azul text-xs font-bold text-pico-blanco tabular-nums" aria-hidden>
                  {i + 1}
                </span>
                {titulo}
              </span>
            </li>
          ))}
        </ol>
      </TituloPagina>

      <ul className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {CALCULADORAS.map((calculadora, i) => (
          <li key={calculadora.slug}>
            <Revelar retraso={(i % 5) * 70} className="h-full">
              <TarjetaCalculadora calculadora={calculadora} prioritaria={i < 2} />
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
