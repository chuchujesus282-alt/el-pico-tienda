import type { Metadata } from "next";
import EscenaPared from "@/components/calculadoras/EscenaPared";
import TarjetaCalculadora from "@/components/calculadoras/TarjetaCalculadora";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import Revelar from "@/components/ui/Revelar";
import { CALCULADORAS } from "@/lib/calculadoras/registro";
import IconoCarritoEnvio from "@/components/icons/pico/IconoCarritoEnvio";
import IconoCinta from "@/components/icons/pico/IconoCinta";
import IconoLista from "@/components/icons/pico/IconoLista";

// Calculadoras de proyectos — responsable: persona B (rama `calculadoras`).
// Las calculadoras salen de lib/calculadoras/registro.ts: agregar una ahí la muestra aquí sola.

export const metadata: Metadata = {
  title: "Calcula tu proyecto",
  description: "Calculadoras de materiales de construcción: bloques, concreto, friso, cabillas, pintura, cerámica, techos y más.",
};

// Cómo se usa, en tres pasos cortos (pastillas dentro del encabezado).
const pasos = [
  { icono: IconoCinta, titulo: "Mide tu obra" },
  { icono: IconoLista, titulo: "Ve el material" },
  { icono: IconoCarritoEnvio, titulo: "Pide en un clic" },
];

export default function PaginaCalculadoras() {
  return (
    <>
      {/* Encabezado compacto en azul de plano (como la tira del inicio): solo dice dónde estás. A la derecha, en
          pequeño, la pared de la cuenta dibujada a tiza con sus cotas; bajo el título, los tres pasos en pastillas. */}
      <EncabezadoPagina
        titulo="Calcula tu proyecto"
        descripcion={<span className="hidden sm:inline">Descubre cuánto material necesitas y llévate todo en un solo pedido.</span>}
        ruta={[{ texto: "Calculadoras" }]}
        tono="plano"
        compacto
        ilustracion={
          <div className="w-64 xl:w-72">
            <EscenaPared conLibreta={false} />
          </div>
        }
      >
        <ol aria-label="Cómo funciona" className="flex flex-wrap gap-1.5 md:gap-2">
          {pasos.map(({ icono: Icono, titulo }, i) => (
            <li
              key={titulo}
              className="grupo-icono flex h-8 items-center gap-1.5 rounded-chip bg-pico-blanco/10 pr-3 pl-1 text-xs font-semibold ring-1 ring-pico-blanco/15 md:h-9 md:text-sm"
            >
              <span className="flex size-6 items-center justify-center rounded-chip bg-amarillo-obra text-[11px] font-bold text-pico-azul-oscuro md:size-7" aria-hidden>
                {i + 1}
              </span>
              <Icono className="hidden size-5 md:block" />
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
