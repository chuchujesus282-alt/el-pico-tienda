import type { Metadata } from "next";
import Link from "next/link";
import { House, MessageCircle, SearchX } from "lucide-react";
import Contenedor from "@/components/ui/Contenedor";
import { enlaceWhatsApp } from "@/lib/whatsapp";

// Página no encontrada de toda la tienda (enlace roto o dirección mal escrita). El producto
// inexistente tiene la suya en app/producto/[id]/not-found.tsx.

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NoEncontrada() {
  return (
    <Contenedor className="py-12 md:py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-banner border border-gris-borde bg-pico-blanco px-6 py-12 text-center shadow-tarjeta motion-safe:animate-aparecer">
        <span className="flex size-20 items-center justify-center rounded-chip bg-pico-azul-claro">
          <SearchX className="size-10 text-pico-azul" strokeWidth={1.5} aria-hidden />
        </span>
        <h1 className="text-2xl font-bold text-pico-azul">No encontramos esta página</h1>
        <p className="max-w-sm text-sm text-gris-texto">
          Puede que el enlace esté mal escrito o que la página ya no exista. Usa el buscador de arriba, vuelve al inicio o
          escríbenos y te ayudamos.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-boton bg-pico-azul px-5 text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-pico-azul-oscuro hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-0.5"
          >
            <House className="size-4" aria-hidden />
            Volver al inicio
          </Link>
          <a
            href={enlaceWhatsApp("¡Hola, El Pico! Llegué a una página que no existe en la tienda web y necesito ayuda.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-boton border-2 border-pico-azul px-5 text-sm font-semibold text-pico-azul transition duration-200 hover:bg-pico-azul-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
          >
            <MessageCircle className="size-4" aria-hidden />
            Escríbenos
            <span className="sr-only"> (se abre WhatsApp en una pestaña nueva)</span>
          </a>
        </div>
      </div>
    </Contenedor>
  );
}
