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

// Cómo se usa, en tres pasos cortos, dentro del encabezado (en móvil solo se ve el título).
const pasos = [
  { icono: IconoCinta, titulo: "Mide tu obra", texto: "Largo, alto o área" },
  { icono: IconoLista, titulo: "Ve el material", texto: "Te decimos cuánto llevar" },
  { icono: IconoCarritoEnvio, titulo: "Pide en un clic", texto: "Al carrito y por WhatsApp" },
];

export default function PaginaCalculadoras() {
  return (
    <>
      {/* Encabezado en azul de plano (como la tira del inicio): a la derecha, la pared de la cuenta dibujada a tiza
          con la libreta de sus materiales; debajo del título, los tres pasos como una ruta. */}
      <EncabezadoPagina
        titulo="Calcula tu proyecto"
        descripcion="Descubre cuánto material necesitas y llévate todo en un solo pedido."
        ruta={[{ texto: "Calculadoras" }]}
        tono="plano"
        ilustracion={<EscenaPared />}
      >
        <ol aria-label="Cómo funciona" className="relative mt-2 grid grid-cols-3 gap-2 md:mt-4 md:max-w-xl md:gap-4">
          {/* Línea de tiza punteada que une los tres pasos. */}
          <span className="absolute top-5 right-[16%] left-[16%] border-t-2 border-dashed border-pico-blanco/30 md:right-auto md:left-5 md:w-[calc(100%-2.5rem)]" aria-hidden />
          {pasos.map(({ icono: Icono, titulo, texto }, i) => (
            <li key={titulo} className="grupo-icono relative flex flex-col items-center gap-2 text-center md:items-start md:text-left">
              <span className="relative flex size-10 items-center justify-center rounded-chip bg-pico-blanco text-pico-azul shadow-tarjeta ring-4 ring-pico-blanco/15">
                <Icono className="size-6" />
                <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-chip bg-amarillo-obra text-[11px] font-bold text-pico-azul-oscuro" aria-hidden>
                  {i + 1}
                </span>
              </span>
              <span>
                <span className="block text-[13px] leading-tight font-bold sm:text-sm md:text-base">{titulo}</span>
                <span className="mt-0.5 hidden text-[13px] leading-snug text-pico-blanco/75 sm:block">{texto}</span>
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
