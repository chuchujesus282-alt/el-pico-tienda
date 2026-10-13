import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import HorarioEnVivo from "@/components/horario/HorarioEnVivo";
import Contenedor from "@/components/ui/Contenedor";
import TituloSeccion from "@/components/ui/TituloSeccion";
import { HORARIO, formatearFranja } from "@/lib/horario";
import { TIENDA } from "@/lib/tienda";
import { enlaceWhatsApp } from "@/lib/whatsapp";

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
    <Contenedor className="space-y-6 py-6 md:space-y-8 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados).replace(/</g, "\\u003c") }}
      />

      <div className="motion-safe:animate-aparecer">
        <TituloSeccion titulo="Horario" nivel="h1" className="mb-2" />
        <p className="max-w-2xl text-sm text-gris-texto md:text-base">
          Te esperamos en la tienda todos los días de la semana. Los pedidos por WhatsApp los respondemos en este mismo horario.
        </p>
      </div>

      <HorarioEnVivo />

      <div className="flex flex-col gap-3 rounded-tarjeta bg-pico-azul p-5 text-pico-blanco shadow-tarjeta sm:flex-row sm:items-center sm:justify-between md:p-6">
        <p className="text-base font-semibold">¿Vienes a retirar tu pedido o a comprar en persona?</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href="/ubicanos"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco"
          >
            <MapPin className="size-4" aria-hidden />
            Cómo llegar
            <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
          </Link>
          <a
            href={enlaceWhatsApp("¡Hola, El Pico! Tengo una pregunta.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco"
          >
            <MessageCircle className="size-4" aria-hidden />
            Escríbenos por WhatsApp
            <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
          </a>
        </div>
      </div>
    </Contenedor>
  );
}
