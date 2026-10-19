"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, CircleCheck, MessageCircle, Ruler } from "lucide-react";
import CalculadoraProyecto from "@/components/calculadoras/CalculadoraProyecto";
import type { ProductosPorCodigo } from "@/components/calculadoras/proyecto";
import { CALCULADORAS, obtenerCalculadora } from "@/lib/calculadoras/registro";
import type { Calculadora } from "@/lib/calculadoras/tipos";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { consejosDe } from "./consejos";

// Propuesta B: la calculadora como protagonista. Arriba se elige el trabajo y justo debajo queda la calculadora real
// funcionando, sin cambiar de página. El trabajo elegido va en la URL (?calc=slug) para poder compartirlo o volver.

const RUTA = "/propuestas/b";
const MENSAJE_OTRO_TRABAJO = "¡Hola, El Pico! Quiero calcular el material para un trabajo que no está en las calculadoras: ";

type Props = {
  /** Trabajo con el que abre la página (viene de ?calc= o "bloques"). */
  inicial: string;
  /** Productos de TODAS las calculadoras, por código: cambiar de trabajo es instantáneo. */
  productos: ProductosPorCodigo;
};

export default function ExploradorCalculadoras({ inicial, productos }: Props) {
  const [slug, setSlug] = useState(inicial);
  const calculadora = obtenerCalculadora(slug) ?? CALCULADORAS[0];

  function elegir(nuevo: string, evento: MouseEvent<HTMLAnchorElement>) {
    // Con JavaScript cambia al instante; sin él, el enlace recarga la página con ?calc= y el servidor la arma igual.
    evento.preventDefault();
    if (nuevo === slug) return;
    setSlug(nuevo);
    window.history.replaceState(null, "", `${RUTA}?calc=${nuevo}`);
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <Selector activo={calculadora.slug} onElegir={elegir} />

      <section aria-labelledby="calc-elegida" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.2em] text-pico-rojo uppercase">Estás calculando</p>
            <h2 id="calc-elegida" className="mt-0.5 text-xl leading-tight font-bold text-pico-azul md:text-2xl">
              {calculadora.titulo}
            </h2>
            <p className="mt-1 text-sm leading-snug text-gris-texto">{calculadora.descripcion}</p>
          </div>
          <Link
            href={`/calculadoras/${calculadora.slug}`}
            className="group inline-flex w-fit shrink-0 items-center gap-1.5 rounded-boton py-1.5 text-sm font-semibold text-pico-azul underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
          >
            Abrir en su propia página
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </Link>
        </div>

        {/* key: al cambiar de trabajo la calculadora arranca limpia (sus medidas y opciones son otras). */}
        <CalculadoraProyecto key={calculadora.slug} slug={calculadora.slug} productos={productos} />
      </section>

      <Consejos calculadora={calculadora} />
    </div>
  );
}

/**
 * "¿Qué vas a hacer?": los 10 trabajos con su foto real. En el teléfono, una fila que se desliza con el pulgar (así la
 * calculadora queda a la vista sin bajar); desde 1024px, una grilla de 5 y en pantallas anchas, los 10 en una fila.
 */
function Selector({ activo, onElegir }: { activo: string; onElegir: (slug: string, e: MouseEvent<HTMLAnchorElement>) => void }) {
  const lista = useRef<HTMLUListElement>(null);

  // Si la página abre con un trabajo del final (ej. ?calc=drywall), la fila del teléfono se desliza hasta él.
  useEffect(() => {
    const ul = lista.current;
    const elegido = ul?.querySelector<HTMLElement>("[aria-current='true']");
    if (!ul || !elegido || ul.scrollWidth <= ul.clientWidth) return;
    ul.scrollLeft = elegido.offsetLeft - (ul.clientWidth - elegido.clientWidth) / 2;
    // Solo al montar: después es el cliente quien desliza la fila.
  }, []);

  return (
    <section aria-labelledby="que-vas-a-hacer">
      <h2 id="que-vas-a-hacer" className="text-base font-bold text-pico-azul md:text-lg">
        ¿Qué vas a hacer?
      </h2>
      <ul
        ref={lista}
        className="sin-scrollbar relative mt-2.5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 max-lg:-mx-[var(--margen-pagina)] max-lg:scroll-px-[var(--margen-pagina)] max-lg:px-[var(--margen-pagina)] lg:grid lg:grid-cols-5 lg:gap-3 lg:overflow-visible lg:pb-0 2xl:grid-cols-10"
      >
        {CALCULADORAS.map((c, i) => (
          <li key={c.slug} className="shrink-0 snap-start lg:shrink">
            <Chip calculadora={c} activo={c.slug === activo} prioritaria={i < 3} onElegir={onElegir} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Chip({
  calculadora,
  activo,
  prioritaria,
  onElegir,
}: {
  calculadora: Calculadora;
  activo: boolean;
  prioritaria: boolean;
  onElegir: (slug: string, e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={`${RUTA}?calc=${calculadora.slug}`}
      scroll={false}
      aria-current={activo ? "true" : undefined}
      onClick={(e) => onElegir(calculadora.slug, e)}
      className={`group flex h-full w-[8.75rem] flex-col overflow-hidden rounded-tarjeta border-2 bg-pico-blanco shadow-tarjeta transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul lg:w-auto ${
        activo ? "border-pico-azul" : "border-pico-blanco hover:border-pico-azul/25 hover:shadow-tarjeta-hover"
      }`}
    >
      <span className="relative block aspect-[16/10] overflow-hidden bg-pico-azul-claro">
        {calculadora.imagen ? (
          <Image
            src={calculadora.imagen}
            alt=""
            fill
            loading={prioritaria ? "eager" : undefined}
            sizes="(min-width: 1536px) 170px, (min-width: 1024px) 20vw, 140px"
            className={`object-cover transition duration-500 ${activo ? "" : "saturate-[0.85] group-hover:saturate-100"} motion-safe:group-hover:scale-105`}
          />
        ) : (
          // Placeholder etiquetado: falta la foto real de este trabajo.
          <span className="absolute inset-0 flex items-center justify-center p-2 text-center text-[11px] font-semibold text-pico-azul">
            Foto: {calculadora.titulo}
          </span>
        )}
        {activo && (
          <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-chip bg-pico-rojo text-pico-blanco ring-2 ring-pico-blanco" aria-hidden>
            <Check className="size-3.5" strokeWidth={3} />
          </span>
        )}
      </span>
      <span
        className={`flex min-h-[3.25rem] flex-1 items-center px-2.5 py-2 text-[13px] leading-tight font-semibold ${
          activo ? "bg-pico-azul text-pico-blanco" : "text-texto"
        }`}
      >
        {calculadora.titulo}
      </span>
    </Link>
  );
}

/** Debajo de la calculadora: cómo medir, qué ya va sumado y ayuda para quien no encuentra su trabajo. */
function Consejos({ calculadora }: { calculadora: Calculadora }) {
  const { medir, incluido } = useMemo(() => consejosDe(calculadora), [calculadora]);

  return (
    <section aria-label="Consejos" className="grid gap-3 md:grid-cols-3 md:gap-4">
      <Tarjeta icono={<Ruler className="size-5" aria-hidden />} titulo="Para medir bien">
        <ul className="space-y-2">
          {medir.map((texto) => (
            <li key={texto} className="flex gap-2 text-sm leading-snug text-texto">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-chip bg-pico-rojo" aria-hidden />
              {texto}
            </li>
          ))}
        </ul>
      </Tarjeta>

      <Tarjeta icono={<CircleCheck className="size-5" aria-hidden />} titulo="Ya va incluido en el cálculo">
        <ul className="space-y-2">
          {incluido.map((texto) => (
            <li key={texto} className="flex gap-2 text-sm leading-snug text-texto">
              <Check className="mt-0.5 size-4 shrink-0 text-pico-azul" aria-hidden />
              {texto}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] leading-snug text-gris-texto">
          <strong className="font-semibold text-pico-azul">Cálculos referenciales.</strong> Las cantidades pueden variar según la obra; consulta con
          tu maestro de obra o con nosotros.
        </p>
      </Tarjeta>

      <div className="flex flex-col rounded-tarjeta bg-pico-azul p-4 text-pico-blanco shadow-tarjeta md:p-5">
        <span className="flex size-10 items-center justify-center rounded-chip bg-pico-blanco/10 ring-1 ring-pico-blanco/15">
          <MessageCircle className="size-5" aria-hidden />
        </span>
        <h3 className="mt-3 text-base leading-tight font-bold">¿No ves tu trabajo?</h3>
        <p className="mt-1.5 flex-1 text-sm leading-snug text-pico-blanco/80">
          Escríbenos qué vas a hacer y las medidas. Te decimos qué material llevar.
        </p>
        <a
          href={enlaceWhatsApp(MENSAJE_OTRO_TRABAJO)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-boton bg-pico-rojo px-4 text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-pico-rojo-oscuro hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco sm:w-fit md:w-full"
        >
          Pregúntanos por WhatsApp
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </div>
    </section>
  );
}

function Tarjeta({ icono, titulo, children }: { icono: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-tarjeta border border-gris-borde bg-pico-blanco p-4 shadow-tarjeta md:p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-chip bg-pico-azul-claro text-pico-azul">{icono}</span>
        <h3 className="text-base leading-tight font-bold text-pico-azul">{titulo}</h3>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
