import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Contenedor from "@/components/ui/Contenedor";
import { getCategorias } from "@/lib/catalogo";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import type { Categoria } from "@/types/catalogo";
import Logo from "./Logo";

// Páginas informativas pendientes: los enlaces se activan cuando existan.
const conocenos = ["Quiénes somos", "Ubícanos", "Horario"];
const ayuda = ["Cómo comprar", "Contacto", "Políticas de privacidad"];

function TituloColumna({ children }: { children: string }) {
  return <h2 className="mb-3 text-sm font-bold tracking-widest text-pico-blanco uppercase">{children}</h2>;
}

function Enlace({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm text-pico-blanco/80 hover:text-pico-blanco">
      <ChevronRight className="size-3.5" aria-hidden />
      {children}
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
    <footer className="mt-12 bg-pico-azul text-pico-blanco md:mt-16">
      <Contenedor className="grid gap-8 py-10 md:grid-cols-2 lg:grid-cols-[1.2fr_2fr_1fr_1fr] lg:py-12">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-pico-blanco/80">
            Tu ferretería de confianza en Caracas. Todo para construir, reparar y mejorar tu espacio.
          </p>
          <Boton href={enlaceWhatsApp("¡Hola, El Pico! Tengo una consulta.")} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-5" aria-hidden />
            Escríbenos por WhatsApp
          </Boton>
        </div>

        {categorias.length > 0 && (
          <div>
            <TituloColumna>Categorías</TituloColumna>
            <ul className="grid gap-2 sm:grid-cols-2">
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
          <ul className="grid gap-2">
            {conocenos.map((texto) => (
              <li key={texto}>
                <Enlace href="#">{texto}</Enlace>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <TituloColumna>Ayuda</TituloColumna>
          <ul className="grid gap-2">
            {ayuda.map((texto) => (
              <li key={texto}>
                <Enlace href="#">{texto}</Enlace>
              </li>
            ))}
          </ul>
        </div>
      </Contenedor>

      <div className="border-t border-pico-blanco/15">
        <Contenedor className="py-4 text-xs text-pico-blanco/70">
          © {new Date().getFullYear()} Centro Ferretero El Pico. Todos los derechos reservados.
        </Contenedor>
      </div>
    </footer>
  );
}
