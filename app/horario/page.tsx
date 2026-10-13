import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import HorarioEnVivo from "@/components/horario/HorarioEnVivo";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import { HORARIO, formatearFranja } from "@/lib/horario";
import { TIENDA } from "@/lib/tienda";

// Horario — responsable: persona A (rama `horario`). Las horas se cambian en lib/horario.ts.

export const metadata: Metadata = {
  title: "Horario",
  description: `Lunes a viernes ${formatearFranja(HORARIO.semana.franja)}; sábados y feriados ${formatearFranja(
    HORARIO["sabado-feriado"].franja,
  )}; domingos ${formatearFranja(HORARIO.domingo.franja)}.`,
};

const hhmm = (minutos: number) => `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;

/** Horario en datos estructurados, para que Google lo muestre junto a la tienda. */
const datosEstructurados = {
  "@context": "https://schema.org",
  "@type": "HardwareStore",
  name: TIENDA.nombre,
  openingHoursSpecification: [
    { dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], franja: HORARIO.semana.franja },
    { dias: ["Saturday"], franja: HORARIO["sabado-feriado"].franja },
    { dias: ["Sunday"], franja: HORARIO.domingo.franja },
  ].map(({ dias, franja }) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: dias,
    opens: hhmm(franja.abre),
    closes: hhmm(franja.cierra),
  })),
};

export default function PaginaHorario() {
  return (
    <>
      <EncabezadoPagina
        titulo="Horario"
        descripcion="Abrimos todos los días. En feriado, el horario es el mismo de los sábados."
        ruta={[{ texto: "Horario" }]}
        icono={Clock}
      />
    <Contenedor className="py-6 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-2xl space-y-6">
        <HorarioEnVivo />

        <Link href="/ubicanos" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-pico-rojo hover:underline">
          <MapPin className="size-4" aria-hidden />
          ¿Cómo llegar? Ver la ubicación
          <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </Contenedor>
    </>
  );
}
