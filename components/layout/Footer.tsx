import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Contenedor from "@/components/ui/Contenedor";
import { getCategorias } from "@/lib/catalogo";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import type { Categoria } from "@/types/catalogo";
import Logo, { Montanas } from "./Logo";

// Páginas informativas: las que aún no existen quedan con "#" hasta que se construyan.
const conocenos = [
  { texto: "Quiénes somos", href: "#" },
  { texto: "Ubícanos", href: "/ubicanos" },
  { texto: "Horario", href: "#" },
];
const ayuda = [
  { texto: "Cómo comprar", href: "#" },
  { texto: "Contacto", href: "#" },
  { texto: "Políticas de privacidad", href: "/politicas-de-privacidad" },
];

function TituloColumna({ children }: { children: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-pico-blanco uppercase">
      <span className="h-4 w-1 -skew-x-12 rounded-sm bg-pico-rojo" aria-hidden />
      {children}
    </h2>
  );
}

function Enlace({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1 text-sm text-pico-blanco/75 transition-colors hover:text-pico-blanco"
    >
      <ChevronRight className="size-3.5 text-pico-rojo transition-transform duration-200 motion-safe:group-hover:translate-x-1" aria-hidden />
      <span className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5">{children}</span>
    </Link>
  );
}

export default async function Footer() {
  let categorias: Categoria[] = [];
  try {
    categorias = await getCategorias();
  } catch {
    // Sin catálogo, el footer se muestra sin la columna de categorías.
  }

  return (
    <footer className="relative isolate mt-12 overflow-hidden bg-gradient-to-br from-pico-azul to-pico-azul-oscuro text-pico-blanco md:mt-16">
      {/* Montañas del logo, grandes y tenues, de fondo. */}
      <Montanas className="pointer-events-none absolute -right-16 -bottom-10 -z-10 w-[28rem] fill-pico-blanco/[0.04] md:w-[40rem]" />
      <div className="h-1 bg-pico-rojo" aria-hidden />

      <Contenedor className="grid gap-10 py-10 md:grid-cols-2 lg:grid-cols-[1.2fr_2fr_1fr_1fr] lg:py-14">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Logo tamano="grande" />
            <p className="leading-none">
              <span className="block text-[11px] font-semibold tracking-[0.22em] whitespace-nowrap text-pico-blanco/70 uppercase">
                Centro Ferretero
              </span>
              <span className="block text-3xl font-bold tracking-wide text-pico-blanco uppercase">El Pico</span>
            </p>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-pico-blanco/75">
            Tu ferretería de confianza en Caracas. Todo para construir, reparar y mejorar tu espacio.
          </p>
          <Boton href={enlaceWhatsApp("¡Hola, El Pico! Tengo una consulta.")} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-5 motion-safe:group-hover/boton:animate-sacudir" aria-hidden />
            Escríbenos por WhatsApp
          </Boton>
        </div>

        {categorias.length > 0 && (
          <div>
            <TituloColumna>Categorías</TituloColumna>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {categorias.map((c) => (
                <li key={c.slug}>
                  <Enlace href={`/categoria/${c.slug}`}>{c.nombre}</Enlace>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <TituloColumna>Conócenos</TituloColumna>
          <ul className="grid gap-2.5">
            {conocenos.map(({ texto, href }) => (
              <li key={texto}>
                <Enlace href={href}>{texto}</Enlace>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <TituloColumna>Ayuda</TituloColumna>
          <ul className="grid gap-2.5">
            {ayuda.map(({ texto, href }) => (
              <li key={texto}>
                <Enlace href={href}>{texto}</Enlace>
              </li>
            ))}
          </ul>
        </div>
      </Contenedor>

      <div className="border-t border-pico-blanco/10">
        <Contenedor className="flex flex-col gap-1 py-4 text-xs text-pico-blanco/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Centro Ferretero El Pico. Todos los derechos reservados.</span>
          <span className="tracking-[0.2em] uppercase">Caracas · Venezuela</span>
        </Contenedor>
      </div>
    </footer>
  );
}
