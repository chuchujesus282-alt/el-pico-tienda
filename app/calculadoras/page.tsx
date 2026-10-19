import type { Metadata } from "next";
import TarjetaCalculadora from "@/components/calculadoras/TarjetaCalculadora";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import Revelar from "@/components/ui/Revelar";
import LibretaMateriales from "@/components/calculadoras/LibretaMateriales";
import { CALCULADORAS } from "@/lib/calculadoras/registro";

// Calculadoras de proyectos — responsable: persona B (rama `calculadoras`).
// Las calculadoras salen de lib/calculadoras/registro.ts: agregar una ahí la muestra aquí sola.

export const metadata: Metadata = {
  title: "Calcula tu proyecto",
  description: "Calculadoras de materiales de construcción: bloques, concreto, friso, cabillas, pintura, cerámica, techos y más.",
};

// Cómo se usa, en tres pasos cortos (pastillas bajo la descripción; en el teléfono se omiten).
const pasos = ["Mide tu obra", "Ve el material", "Pide en un clic"];

/**
 * La libreta amarilla de materiales (la de la tira del inicio) ocupando el lado derecho del encabezado, girada 70° y
 * desvaneciéndose hacia la izquierda para dejar el texto limpio. Decorativa: desde 640px.
 */
function LibretaDeFondo() {
  return (
    <div className="absolute inset-y-0 right-0 hidden w-[35%] [mask-image:linear-gradient(to_left,black_45%,transparent_100%)] sm:block lg:w-[55%]">
      <div className="absolute top-[80%] left-1/2 w-[22rem] -translate-1/2 scale-[1.5] rotate-[70deg] md:scale-[1.7] lg:scale-[2]">
        <LibretaMateriales />
      </div>
    </div>
  );
}

export default function PaginaCalculadoras() {
  return (
    <>
      {/* Encabezado de sección compacto, del mismo azul que el resto de la tienda. A la derecha, la libreta amarilla
          de materiales girada y desvanecida hacia el texto; bajo la descripción, los tres pasos en pastillas. */}
      <EncabezadoPagina
        titulo="Calcula tu proyecto"
        descripcion="Elige tu trabajo, pon las medidas y te decimos cuánto material llevar. Gratis y sin registrarte."
        ruta={[{ texto: "Calculadoras" }]}
        compacto
        fondo={<LibretaDeFondo />}
      >
        <ol aria-label="Cómo funciona" className="hidden flex-wrap gap-2 sm:flex">
          {pasos.map((titulo, i) => (
            <li key={titulo} className="flex h-8 items-center gap-1.5 rounded-chip bg-pico-blanco/10 pr-3 pl-1 text-xs font-semibold ring-1 ring-pico-blanco/15">
              <span className="flex size-6 items-center justify-center rounded-chip bg-pico-rojo text-[11px] font-bold text-pico-blanco" aria-hidden>
                {i + 1}
              </span>
              {titulo}
            </li>
          ))}
        </ol>
      </EncabezadoPagina>

    <Contenedor className="space-y-8 py-8 md:space-y-10 md:py-12">
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
