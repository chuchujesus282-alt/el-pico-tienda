import type { Metadata } from "next";
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

// Cómo se usa, en tres pasos cortos: a la derecha del encabezado desde 1024px, en pastillas en tableta.
const pasos = [
  { icono: IconoCinta, titulo: "Mide tu obra", texto: "Largo, alto o área" },
  { icono: IconoLista, titulo: "Ve el material", texto: "Te decimos cuánto llevar" },
  { icono: IconoCarritoEnvio, titulo: "Pide en un clic", texto: "Al carrito y por WhatsApp" },
];

/** Los tres pasos como lista numerada, para el lado derecho del encabezado (lo que hay que saber antes de elegir). */
function PasosLista() {
  return (
    <ol aria-label="Cómo funciona" className="w-72 space-y-2.5 rounded-tarjeta bg-pico-blanco/[0.06] p-4 ring-1 ring-pico-blanco/10">
      {pasos.map(({ icono: Icono, titulo, texto }, i) => (
        <li key={titulo} className="grupo-icono flex items-center gap-3">
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-chip bg-pico-blanco text-pico-azul">
            <Icono className="size-6" />
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-chip bg-pico-rojo text-[11px] font-bold text-pico-blanco ring-2 ring-pico-azul" aria-hidden>
              {i + 1}
            </span>
          </span>
          <span className="min-w-0">
            <span className="block text-sm leading-tight font-bold">{titulo}</span>
            <span className="block text-[13px] leading-snug text-pico-blanco/75">{texto}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function PaginaCalculadoras() {
  return (
    <>
      {/* Encabezado de sección: compacto y del mismo azul que el resto de la tienda (no debe parecer un anuncio), sin
          imágenes decorativas: las fotos reales de cada trabajo ya están en las tarjetas, que así quedan a la vista. A la
          derecha, lo único que aporta algo antes de elegir: cómo funciona, en tres pasos. */}
      <EncabezadoPagina
        titulo="Calcula tu proyecto"
        descripcion="Elige tu trabajo, pon las medidas y te decimos cuánto material llevar. Gratis y sin registrarte."
        ruta={[{ texto: "Calculadoras" }]}
        compacto
        ilustracion={<PasosLista />}
      >
        {/* En tableta, los mismos pasos en una línea de pastillas (en el teléfono se omiten: las tarjetas van primero). */}
        <ol aria-label="Cómo funciona" className="hidden flex-wrap gap-2 sm:flex lg:hidden">
          {pasos.map(({ titulo }, i) => (
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
