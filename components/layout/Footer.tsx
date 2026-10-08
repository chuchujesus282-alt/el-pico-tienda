import Link from "next/link";
import { ChevronRight, MapPin, MessageCircle, Tag, Truck, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Contenedor from "@/components/ui/Contenedor";
import Revelar from "@/components/ui/Revelar";
import { getCategorias } from "@/lib/catalogo";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import type { Categoria } from "@/types/catalogo";
import Logo, { Montanas } from "./Logo";
import VolverArriba from "./VolverArriba";

// Páginas informativas: las que aún no existen quedan con "#" hasta que se construyan.
const conocenos = [
  { texto: "Quiénes somos", href: "#" },
  { texto: "Ubícanos", href: "#" },
  { texto: "Horario", href: "#" },
];
const ayuda = [
  { texto: "Cómo comprar", href: "#" },
  { texto: "Contacto", href: "#" },
  { texto: "Políticas de privacidad", href: "#" },
];

/** Lo que el cliente gana comprando en El Pico (franja superior del footer). */
const ventajas: { icono: LucideIcon; titulo: string; texto: string }[] = [
  { icono: Truck, titulo: "Pick-up, delivery o flete", texto: "Retiras en la tienda o te lo llevamos." },
  { icono: MessageCircle, titulo: "Pedidos por WhatsApp", texto: "Te confirmamos disponibilidad y total." },
  { icono: Wallet, titulo: "Paga como prefieras", texto: "Divisas, pago móvil, Zelle, USDT y más." },
  { icono: Tag, titulo: "Precios en dólares", texto: "Referenciales, visibles en cada producto." },
];

function TituloColumna({ children }: { children: string }) {
  return (
    <h2 className="mb-5 flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-pico-blanco uppercase">
      <span className="h-4 w-1 -skew-x-12 rounded-sm bg-pico-rojo" aria-hidden />
      {children}
    </h2>
  );
}

/** Enlace con flecha roja que avanza y subrayado rojo que crece desde la izquierda. */
function Enlace({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 rounded-sm text-sm text-pico-blanco/75 transition-colors duration-200 hover:text-pico-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco"
    >
      <ChevronRight
        className="size-3.5 text-pico-rojo transition-transform duration-200 motion-safe:group-hover:translate-x-1"
        aria-hidden
      />
      <span className="relative transition-transform duration-200 motion-safe:group-hover:translate-x-0.5">
        {children}
        <span
          className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-pico-rojo transition-transform duration-300 ease-out group-hover:scale-x-100"
          aria-hidden
        />
      </span>
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
    <footer className="relative isolate mt-16 overflow-hidden bg-gradient-to-br from-pico-azul via-pico-azul to-pico-azul-oscuro text-pico-blanco md:mt-24">
      {/* Montañas del logo, grandes y tenues, meciéndose despacio de fondo. */}
      <Montanas className="pointer-events-none absolute -right-20 -bottom-16 -z-10 w-[30rem] fill-pico-blanco/[0.04] motion-safe:animate-deriva md:w-[46rem]" />
      <Montanas className="pointer-events-none absolute top-24 -left-24 -z-10 hidden w-80 -scale-x-100 fill-pico-blanco/[0.025] lg:block" />

      {/* Filete rojo con un brillo que lo recorre. */}
      <div className="relative h-1 overflow-hidden bg-pico-rojo" aria-hidden>
        <span className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-pico-blanco/60 to-transparent motion-safe:animate-destello" />
      </div>

      {/* Ventajas de comprar en El Pico. */}
      <div className="border-b border-pico-blanco/10">
        <Contenedor as="section" className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:py-10">
          <h2 className="sr-only">Por qué comprar en El Pico</h2>
          {ventajas.map(({ icono: Icono, titulo, texto }, i) => (
            <Revelar key={titulo} retraso={i * 90}>
              <div className="group flex items-center gap-4 rounded-tarjeta p-2 transition-colors duration-300 hover:bg-pico-blanco/5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-tarjeta bg-pico-rojo text-pico-blanco shadow-boton-hover transition-transform duration-300 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:-rotate-6">
                  <Icono className="size-6 motion-safe:group-hover:animate-sacudir" strokeWidth={1.75} aria-hidden />
                </span>
                <span>
                  <span className="block font-bold leading-tight text-pico-blanco">{titulo}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-pico-blanco/70">{texto}</span>
                </span>
              </div>
            </Revelar>
          ))}
        </Contenedor>
      </div>

      <Contenedor className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-[1.3fr_2fr_1fr_1fr] lg:gap-12 lg:py-16">
        <Revelar className="col-span-2 space-y-6 md:col-span-1">
          <div className="flex items-center gap-4">
            <Logo tamano="grande" />
            <p className="leading-none">
              <span className="block text-[11px] font-semibold tracking-[0.24em] whitespace-nowrap text-pico-blanco/70 uppercase">
                Centro Ferretero
              </span>
              <span className="block text-4xl font-bold tracking-wide text-pico-blanco uppercase">El Pico</span>
            </p>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-pico-blanco/75">
            Tu ferretería de confianza en Caracas. Todo para construir, reparar y mejorar tu espacio.
          </p>
          <div className="flex flex-col items-start gap-3">
            <Boton href={enlaceWhatsApp("¡Hola, El Pico! Tengo una consulta.")} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-5 motion-safe:group-hover/boton:animate-sacudir" aria-hidden />
              Escríbenos por WhatsApp
            </Boton>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] text-pico-blanco/60 uppercase">
              <MapPin className="size-3.5 text-pico-rojo" aria-hidden />
              Caracas · Venezuela
            </span>
          </div>
        </Revelar>

        {categorias.length > 0 && (
          <Revelar retraso={100} className="col-span-2 md:col-span-1">
            <nav aria-label="Categorías">
              <TituloColumna>Categorías</TituloColumna>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
                {categorias.map((c) => (
                  <li key={c.slug}>
                    <Enlace href={`/categoria/${c.slug}`}>{c.nombre}</Enlace>
                  </li>
                ))}
              </ul>
            </nav>
          </Revelar>
        )}

        <Revelar retraso={200}>
          <nav aria-label="Conócenos">
            <TituloColumna>Conócenos</TituloColumna>
            <ul className="grid gap-3">
              {conocenos.map(({ texto, href }) => (
                <li key={texto}>
                  <Enlace href={href}>{texto}</Enlace>
                </li>
              ))}
            </ul>
          </nav>
        </Revelar>

        <Revelar retraso={300}>
          <nav aria-label="Ayuda">
            <TituloColumna>Ayuda</TituloColumna>
            <ul className="grid gap-3">
              {ayuda.map(({ texto, href }) => (
                <li key={texto}>
                  <Enlace href={href}>{texto}</Enlace>
                </li>
              ))}
            </ul>
          </nav>
        </Revelar>
      </Contenedor>

      <div className="border-t border-pico-blanco/10 bg-pico-azul-oscuro/40">
        <Contenedor className="flex flex-col items-start gap-3 py-5 text-xs text-pico-blanco/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Centro Ferretero El Pico. Todos los derechos reservados.</span>
          <VolverArriba />
        </Contenedor>
      </div>
    </footer>
  );
}
