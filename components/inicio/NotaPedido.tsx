import { ChevronRight, MessageCircle } from "lucide-react";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { mensajeAsesoria } from "./contenidoInicio";

/**
 * Franja bajo los banners: aclara que los precios son referenciales y que el pedido se cierra
 * por WhatsApp (no se cobra en la web), y ofrece asesoría. Sin tarjeta: solo filetes arriba y abajo.
 */
export default function NotaPedido() {
  return (
    <div className="flex flex-col gap-2 border-y border-gris-borde py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <p className="text-[13px] leading-snug text-gris-texto md:text-sm">
        <strong className="font-semibold text-pico-azul">Precios referenciales en dólares.</strong> Envías tu pedido por
        WhatsApp y te confirmamos disponibilidad y forma de pago.
      </p>
      <a
        href={enlaceWhatsApp(mensajeAsesoria)}
        target="_blank"
        rel="noopener noreferrer"
        className="group -mx-2 inline-flex w-fit shrink-0 items-center gap-2 rounded-boton px-2 py-1.5 text-sm font-semibold text-pico-azul transition-colors hover:bg-pico-azul-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul sm:mx-0"
      >
        <span className="flex size-7 items-center justify-center rounded-chip bg-pico-rojo text-pico-blanco transition-transform motion-safe:group-hover:scale-110">
          <MessageCircle className="size-4 motion-safe:group-hover:animate-sacudir" aria-hidden />
        </span>
        ¿No sabes qué necesitas? Pregúntanos
        <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        <span className="sr-only"> (se abre WhatsApp en una pestaña nueva)</span>
      </a>
    </div>
  );
}
