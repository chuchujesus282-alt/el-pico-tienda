import type { Metadata } from "next";
import TarjetaCalculadora from "@/components/calculadoras/TarjetaCalculadora";
import BannerCalculadoras from "@/components/propuestas/a/BannerCalculadoras";
import Contenedor from "@/components/ui/Contenedor";
import Revelar from "@/components/ui/Revelar";
import { CALCULADORAS } from "@/lib/calculadoras/registro";

// Propuesta A – "Banner con propósito" para /calculadoras. Misma estructura que la página real (banner + grilla de
// tarjetas reales), con el banner rediseñado para explicar en una frase qué resuelve y llevar la vista a la grilla.

export const metadata: Metadata = {
  title: "Propuesta A · Calcula tu proyecto",
  robots: { index: false },
};

const ID_GRILLA = "elige-tu-trabajo";

// Materiales distintos que pueden salir en los resultados (dato real del registro, no una cifra escrita a mano).
const totalMateriales = new Set(CALCULADORAS.flatMap((c) => c.materiales)).size;

export default function PropuestaA() {
  return (
    <>
      <BannerCalculadoras destino={ID_GRILLA} cantidad={CALCULADORAS.length} materiales={totalMateriales} />

      <Contenedor className="space-y-8 pt-5 pb-8 md:space-y-10 md:pt-8 md:pb-12">
        <section id={ID_GRILLA} aria-labelledby={`${ID_GRILLA}-titulo`} className="scroll-mt-4">
          {/* Rótulo corto de la grilla: retoma el "Elige tu trabajo" del banner para que la vista siga de uno a otro. */}
          <div className="mb-3 flex items-baseline justify-between gap-3 md:mb-4">
            <p id={`${ID_GRILLA}-titulo`} className="flex items-center gap-2 text-base font-bold text-pico-azul md:text-lg">
              <span className="block h-1 w-6 -skew-x-12 rounded-sm bg-pico-rojo" aria-hidden />
              Elige tu trabajo
            </p>
            <p className="hidden text-[13px] text-gris-texto sm:block">Pon tus medidas y ve la lista con precios</p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-5">
            {CALCULADORAS.map((calculadora, i) => (
              <li key={calculadora.slug}>
                <Revelar retraso={(i % 5) * 70} className="h-full">
                  <TarjetaCalculadora calculadora={calculadora} prioritaria={i < 2} />
                </Revelar>
              </li>
            ))}
          </ul>
        </section>

        <p className="rounded-tarjeta border border-gris-borde bg-pico-blanco px-4 py-3 text-[13px] leading-relaxed text-gris-texto shadow-tarjeta md:px-5">
          <strong className="font-semibold text-pico-azul">Cálculos referenciales.</strong> Las cantidades pueden variar según la obra; consulta con tu
          maestro de obra o con nosotros.
        </p>
      </Contenedor>
    </>
  );
}
