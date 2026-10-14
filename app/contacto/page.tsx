import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Contenedor from "@/components/ui/Contenedor";
import EncabezadoPagina from "@/components/ui/EncabezadoPagina";
import { CONTACTO, enlaceLlamada } from "@/lib/tienda";
import { enlaceWhatsApp } from "@/lib/whatsapp";

// Contacto — responsable: persona A (rama `contacto`). Correo y teléfonos se cambian en lib/tienda.ts (CONTACTO).

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos por WhatsApp, llámanos o envíanos un correo. Te ayudamos a encontrar lo que necesitas.",
};

/** Una fila de la tarjeta: ícono, para qué sirve y el dato (o "Muy pronto" si aún no está). */
function Fila({ icono, titulo, detalle, children }: { icono: ReactNode; titulo: string; detalle: string; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-3 border-b border-gris-borde px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between md:px-6">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-chip bg-pico-azul-claro text-pico-rojo">{icono}</span>
        <div>
          <h2 className="text-base font-bold text-pico-azul">{titulo}</h2>
          <p className="text-sm text-gris-texto">{detalle}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 pl-15 sm:items-end sm:pl-0">{children}</div>
    </li>
  );
}

function MuyPronto() {
  return <span className="text-sm text-gris-texto italic">Muy pronto</span>;
}

/** Enlace del dato (número o correo): grande, azul y fácil de tocar en el teléfono. */
function Dato({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-base font-bold text-texto hover:text-pico-azul hover:underline">
      {children}
    </a>
  );
}

export default function PaginaContacto() {
  const { correo, telefonos } = CONTACTO;

  return (
    <>
      <EncabezadoPagina
        titulo="Contacto"
        descripcion="¿Tienes una duda o quieres saber si tenemos un producto? Escríbenos, llámanos o envíanos un correo."
        ruta={[{ texto: "Contacto" }]}
        icono={Phone}
      />
      <Contenedor className="py-6 md:py-10">
        <div className="mx-auto max-w-2xl space-y-6">
          <ul className="overflow-hidden rounded-tarjeta border border-gris-borde bg-pico-blanco shadow-tarjeta">
            <Fila
              icono={<MessageCircle className="size-5" aria-hidden />}
              titulo="WhatsApp"
              detalle="La forma más rápida. Te respondemos en horario de tienda."
            >
              <Boton href={enlaceWhatsApp("¡Hola, El Pico! Tengo una pregunta.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" aria-hidden />
                Escríbenos
              </Boton>
            </Fila>

            <Fila
              icono={<Phone className="size-5" aria-hidden />}
              titulo={telefonos.length > 1 ? "Teléfonos" : "Teléfono"}
              detalle="Llámanos en horario de tienda."
            >
              {telefonos.length > 0 ? (
                telefonos.map((t) => (
                  <span key={t.numero} className="flex items-baseline gap-2 sm:justify-end">
                    {telefonos.length > 1 && <span className="text-[13px] text-gris-texto">{t.etiqueta}</span>}
                    <Dato href={enlaceLlamada(t.numero)}>{t.numero}</Dato>
                  </span>
                ))
              ) : (
                <MuyPronto />
              )}
            </Fila>

            <Fila
              icono={<Mail className="size-5" aria-hidden />}
              titulo="Correo"
              detalle="Para cotizaciones, facturas o pedidos grandes."
            >
              {correo ? <Dato href={`mailto:${correo}`}>{correo}</Dato> : <MuyPronto />}
            </Fila>
          </ul>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/horario" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-pico-rojo hover:underline">
              <Clock className="size-4" aria-hidden />
              Ver el horario
              <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link href="/ubicanos" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-pico-rojo hover:underline">
              <MapPin className="size-4" aria-hidden />
              ¿Cómo llegar? Ver la ubicación
              <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>
      </Contenedor>
    </>
  );
}
