import { MessageCircle, PackageSearch } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { enlaceWhatsApp } from "@/lib/whatsapp";

/**
 * Se muestra cuando no llegó ningún producto (catálogo caído o vacío): la venta sigue por WhatsApp.
 * Sin botón de "reintentar": la portada se guarda unos minutos en caché y recargar mostraría lo mismo.
 */
export default function AvisoCatalogo() {
  return (
    <section
      role="status"
      className="flex flex-col items-center gap-3 rounded-tarjeta border border-gris-borde bg-pico-blanco px-6 py-10 text-center"
    >
      <PackageSearch className="size-12 text-gris-borde" strokeWidth={1.5} aria-hidden />
      <h2 className="text-xl font-bold text-pico-azul">No pudimos cargar los productos</h2>
      <p className="max-w-md text-sm text-gris-texto">
        El catálogo no está disponible en este momento; vuelve en unos minutos. Si lo necesitas ya, escríbenos por
        WhatsApp y armamos tu pedido contigo.
      </p>
      <Boton
        href={enlaceWhatsApp("¡Hola, El Pico! Quiero hacer un pedido.")}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2"
      >
        <MessageCircle className="size-5" aria-hidden />
        Pedir por WhatsApp
      </Boton>
    </section>
  );
}
