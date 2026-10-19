"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight, Check, Ruler, SlidersHorizontal, Wrench } from "lucide-react";
import { CALCULADORAS } from "@/lib/calculadoras/registro";
import type { Calculadora } from "@/lib/calculadoras/tipos";
import { herramientasSugeridas, materialesResumidos } from "./resumen";

// Propuesta C — "panel de herramienta": selector de los 10 trabajos + panel grande del elegido.
// El estado vive aquí (cambia al instante, sin ir al servidor) y se copia a ?calc=slug para poder compartir el enlace.

const dosCifras = (n: number) => String(n).padStart(2, "0");

export default function PanelTrabajos({ inicial }: { inicial: string }) {
  const [slug, setSlug] = useState(inicial);
  const actual = CALCULADORAS.find((c) => c.slug === slug) ?? CALCULADORAS[0];
  const indice = CALCULADORAS.indexOf(actual);

  const filaRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const botonesRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Al entrar con ?calc=techo, en el teléfono la fila se desliza hasta el trabajo elegido (sin mover la página).
  useEffect(() => {
    const fila = filaRef.current;
    const boton = botonesRef.current[CALCULADORAS.findIndex((c) => c.slug === inicial)];
    if (fila && boton && fila.scrollWidth > fila.clientWidth) {
      fila.scrollLeft += boton.getBoundingClientRect().left - fila.getBoundingClientRect().left - 16;
    }
  }, [inicial]);

  function elegir(nuevo: string) {
    if (nuevo === slug) return;
    setSlug(nuevo);
    window.history.replaceState(null, "", `?calc=${nuevo}`);
    // Si el cliente ya bajó leyendo el panel, lo sube al inicio del panel nuevo.
    const panel = panelRef.current;
    if (panel && panel.getBoundingClientRect().top < 0) {
      const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panel.scrollIntoView({ block: "start", behavior: reducir ? "auto" : "smooth" });
    }
  }

  // Flechas del teclado para moverse entre trabajos (patrón de pestañas).
  function alTeclear(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const paso = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!paso) return;
    e.preventDefault();
    const siguiente = (i + paso + CALCULADORAS.length) % CALCULADORAS.length;
    botonesRef.current[siguiente]?.focus();
    elegir(CALCULADORAS[siguiente].slug);
  }

  return (
    <div className="lg:grid lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start lg:gap-6 xl:grid-cols-[22rem_minmax(0,1fr)] xl:gap-8">
      {/* ── Selector. Teléfono/tableta: fila deslizable de tarjetitas con foto. Escritorio: columna numerada. ── */}
      <div id="elige-trabajo" className="max-lg:mx-[calc(var(--margen-pagina)*-1)] max-lg:px-pagina lg:overflow-hidden lg:rounded-tarjeta lg:bg-pico-blanco lg:shadow-tarjeta">
        <p className="mb-2 flex items-baseline justify-between text-xs font-semibold tracking-[0.2em] text-pico-azul uppercase lg:mb-0 lg:border-b lg:border-gris-borde lg:px-5 lg:py-4">
          Elige tu trabajo
          <span className="font-bold tracking-normal text-gris-texto tabular-nums">
            {dosCifras(indice + 1)}/{dosCifras(CALCULADORAS.length)}
          </span>
        </p>
        <ul
          ref={filaRef}
          role="tablist"
          aria-label="Trabajos"
          className="sin-scrollbar flex gap-2 max-lg:mx-[calc(var(--margen-pagina)*-1)] max-lg:snap-x max-lg:snap-mandatory max-lg:scroll-px-[var(--margen-pagina)] max-lg:overflow-x-auto max-lg:px-pagina max-lg:pb-1 lg:flex-col lg:gap-1 lg:p-2"
        >
          {CALCULADORAS.map((c, i) => (
            <li key={c.slug} role="presentation" className="shrink-0 snap-start lg:shrink">
              <BotonTrabajo
                calculadora={c}
                numero={i + 1}
                activo={c.slug === actual.slug}
                refBoton={(el) => {
                  botonesRef.current[i] = el;
                }}
                onClick={() => elegir(c.slug)}
                onKeyDown={(e) => alTeclear(e, i)}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* ── Panel del trabajo elegido ── */}
      <section
        ref={panelRef}
        id="panel-trabajo"
        role="tabpanel"
        aria-labelledby={`tab-${actual.slug}`}
        className="mt-4 scroll-mt-4 overflow-hidden rounded-banner bg-pico-blanco shadow-tarjeta-hover md:scroll-mt-40 lg:mt-0"
      >
        <DetalleTrabajo key={actual.slug} calculadora={actual} numero={indice + 1} prioritaria={actual.slug === inicial} />
      </section>
    </div>
  );
}

type PropsBoton = {
  calculadora: Calculadora;
  numero: number;
  activo: boolean;
  refBoton: (el: HTMLButtonElement | null) => void;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
};

/** Un trabajo del selector: tarjetita con foto en el teléfono; fila con número y miniatura en escritorio. */
function BotonTrabajo({ calculadora, numero, activo, refBoton, onClick, onKeyDown }: PropsBoton) {
  return (
    <button
      ref={refBoton}
      type="button"
      role="tab"
      id={`tab-${calculadora.slug}`}
      aria-selected={activo}
      aria-controls="panel-trabajo"
      tabIndex={activo ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`group relative flex w-28 cursor-pointer flex-col overflow-hidden rounded-tarjeta text-left transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul sm:w-32 lg:w-full lg:flex-row lg:items-center lg:gap-3 lg:rounded-boton lg:p-2 ${
        activo
          ? "bg-pico-azul text-pico-blanco shadow-tarjeta"
          : "bg-pico-blanco text-pico-azul ring-1 ring-gris-borde hover:ring-pico-azul/30 lg:ring-0 lg:hover:bg-pico-azul-claro"
      }`}
    >
      {/* Barra roja: abajo en la tarjetita, a la izquierda en la fila de escritorio. */}
      <span
        className={`absolute z-10 bg-pico-rojo transition-transform duration-300 max-lg:inset-x-0 max-lg:bottom-0 max-lg:h-1 max-lg:origin-left lg:inset-y-2 lg:left-0 lg:w-1 lg:origin-top lg:rounded-r-sm ${
          activo ? "scale-100" : "max-lg:scale-x-0 lg:scale-y-0"
        }`}
        aria-hidden
      />
      <span className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden bg-pico-azul-claro lg:aspect-square lg:w-12 lg:rounded-md">
        {calculadora.imagen ? (
          <Image
            src={calculadora.imagen}
            alt=""
            fill
            sizes="(min-width: 1024px) 48px, 128px"
            className={`object-cover transition duration-300 ${activo ? "" : "lg:grayscale-[35%] lg:group-hover:grayscale-0"}`}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center p-1 text-center text-[10px] text-gris-texto">Foto: {calculadora.titulo}</span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 items-start gap-1.5 px-2 pt-1.5 pb-2.5 lg:items-center lg:p-0">
        <span className={`text-[11px] font-bold tabular-nums lg:w-6 lg:text-sm ${activo ? "text-pico-blanco/60" : "text-pico-rojo"}`}>{dosCifras(numero)}</span>
        <span className="line-clamp-2 text-xs leading-tight font-semibold lg:line-clamp-1 lg:text-sm">{calculadora.titulo}</span>
      </span>
      <ArrowRight
        className={`hidden size-4 shrink-0 transition-transform duration-300 lg:block ${activo ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"}`}
        aria-hidden
      />
    </button>
  );
}

/** Panel grande: foto real, qué te pide, qué te devuelve y el botón para abrir la calculadora. */
function DetalleTrabajo({ calculadora, numero, prioritaria }: { calculadora: Calculadora; numero: number; prioritaria: boolean }) {
  const materiales = materialesResumidos(calculadora.materiales);
  const herramientas = herramientasSugeridas(calculadora);
  const href = `/calculadoras/${calculadora.slug}`;

  return (
    <div className="motion-safe:animate-aparecer">
      {/* Foto con el título encima */}
      <div className="relative isolate aspect-[16/10] max-h-[26rem] w-full overflow-hidden bg-pico-azul sm:aspect-[2/1] xl:aspect-[21/9]">
        {calculadora.imagen ? (
          <Image
            src={calculadora.imagen}
            alt={`Trabajo de ${calculadora.titulo.toLowerCase()}`}
            fill
            priority={prioritaria}
            sizes="(min-width: 1280px) 70vw, (min-width: 1024px) 65vw, 100vw"
            className="-z-10 object-cover"
          />
        ) : (
          <span className="absolute inset-0 -z-10 flex items-center justify-center text-sm text-pico-blanco/70">Foto: {calculadora.titulo}</span>
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-pico-azul-oscuro via-pico-azul-oscuro/55 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 p-5 text-pico-blanco md:p-8">
          <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-pico-blanco/75 uppercase">
            <span className="block h-1 w-8 -skew-x-12 rounded-sm bg-pico-rojo" aria-hidden />
            Trabajo {dosCifras(numero)}
          </span>
          <h2 className="mt-2 text-3xl leading-[1.05] font-bold text-balance md:text-5xl xl:text-6xl">{calculadora.titulo}</h2>
          <p className="mt-2 max-w-xl text-sm text-pico-blanco/85 md:text-base">{calculadora.descripcion}</p>
        </div>
      </div>

      {/* Barra de acción: justo bajo la foto, para que en el teléfono el botón salga sin bajar */}
      <div className="flex flex-col gap-3 bg-pico-azul-oscuro px-5 py-4 text-pico-blanco sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p className="text-sm text-pico-blanco/80">Pon tus medidas y te decimos cuánto llevar.</p>
        <CtaCalcular href={href} titulo={calculadora.titulo} />
      </div>

      {/* Te pide / Te devuelve */}
      <div className="grid md:grid-cols-2">
        <div className="bg-pico-azul-claro p-5 md:p-8">
          <TituloBloque numero="1" texto="Te pide" icono={<Ruler className="size-4" aria-hidden />} />
          <ul className="mt-4 space-y-2">
            {calculadora.campos.map((campo) => (
              <li key={campo.id} className="flex items-center justify-between gap-3 rounded-boton bg-pico-blanco px-3 py-2.5 shadow-tarjeta">
                <span className="text-sm font-semibold text-texto">
                  {campo.etiqueta}
                  {campo.opcional && <span className="ml-1.5 text-xs font-normal text-gris-texto">(opcional)</span>}
                </span>
                <span className="shrink-0 rounded-sm bg-pico-azul px-2 py-0.5 font-mono text-xs font-bold text-pico-blanco">{campo.unidad}</span>
              </li>
            ))}
          </ul>

          {calculadora.grupos.length > 0 && (
            <>
              <p className="mt-6 flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] text-pico-azul uppercase">
                <SlidersHorizontal className="size-3.5" aria-hidden />Y eliges
              </p>
              <dl className="mt-2 space-y-2 text-sm">
                {calculadora.grupos.map((grupo) => (
                  <div key={grupo.id}>
                    <dt className="font-semibold text-texto">{grupo.etiqueta}</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {grupo.opciones.map((o) => (
                        <span key={o.valor} className="rounded-chip border border-pico-azul/15 bg-pico-blanco px-2.5 py-0.5 text-xs text-pico-azul">
                          {o.etiqueta}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>

        <div className="bg-pico-azul p-5 text-pico-blanco md:p-8">
          <TituloBloque numero="2" texto="Te devuelve" oscuro icono={<Check className="size-4" aria-hidden />} />
          <ul className="mt-4 divide-y divide-pico-blanco/10">
            {materiales.map((m) => (
              <li key={m.nombre} className="flex gap-3 py-2.5 first:pt-0">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm bg-pico-rojo" aria-hidden>
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    {m.nombre}
                    {m.medidas.length > 1 && <span className="font-normal text-pico-blanco/70"> · {m.medidas.join(", ")}</span>}
                    {m.medidas.length === 1 && <span className="font-normal text-pico-blanco/70"> de {m.medidas[0]}</span>}
                  </span>
                  <span className="block text-xs text-pico-blanco/60">{m.presentacion}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-pico-blanco/70">Con la cantidad exacta y su precio, listo para agregar al carrito.</p>
        </div>
      </div>

      {/* Cómo medir + herramientas */}
      <div className="grid gap-5 border-t border-gris-borde p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:p-8">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] text-pico-azul uppercase">
            <Ruler className="size-3.5" aria-hidden />Cómo medir
          </p>
          <p className="mt-2 text-sm leading-relaxed text-texto">{calculadora.comoMedir}</p>
        </div>
        {herramientas.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] text-pico-azul uppercase">
              <Wrench className="size-3.5" aria-hidden />También te sugerimos
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {herramientas.map((h) => (
                <li key={h} className="rounded-chip bg-gris-fondo/60 px-2.5 py-1 text-xs text-texto">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Cierre: el botón otra vez (quien leyó todo no tiene que volver a subir) y el aviso */}
      <div className="flex flex-col gap-4 border-t border-gris-borde bg-gris-fondo/30 p-5 md:flex-row md:items-center md:justify-between md:p-8">
        <p className="max-w-xl text-[13px] leading-relaxed text-gris-texto">
          <strong className="font-semibold text-pico-azul">Cálculos referenciales.</strong> Las cantidades pueden variar según la obra; consulta con tu
          maestro de obra o con nosotros.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          {/* En el teléfono el selector quedó arriba: este enlace sube a él sin tener que deslizar todo. */}
          <a
            href="#elige-trabajo"
            className="inline-flex h-12 items-center justify-center rounded-boton px-4 text-sm font-semibold text-pico-azul underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul lg:hidden"
          >
            Ver otro trabajo
          </a>
          <CtaCalcular href={href} titulo={calculadora.titulo} />
        </div>
      </div>
    </div>
  );
}

function TituloBloque({ numero, texto, icono, oscuro = false }: { numero: string; texto: string; icono: ReactNode; oscuro?: boolean }) {
  return (
    <h3 className={`flex items-center gap-2.5 text-xl font-bold md:text-2xl ${oscuro ? "text-pico-blanco" : "text-pico-azul"}`}>
      <span
        className={`flex size-8 items-center justify-center rounded-boton text-sm ${oscuro ? "bg-pico-blanco text-pico-azul" : "bg-pico-azul text-pico-blanco"}`}
        aria-hidden
      >
        {numero}
      </span>
      {texto}
      <span className={`ml-auto ${oscuro ? "text-pico-blanco/50" : "text-pico-azul/40"}`} aria-hidden>
        {icono}
      </span>
    </h3>
  );
}

function CtaCalcular({ href, titulo }: { href: string; titulo: string }) {
  return (
    <Link
      href={href}
      className="group/cta inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-boton bg-pico-rojo px-5 text-base font-semibold text-pico-blanco transition duration-200 hover:bg-pico-rojo-oscuro hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco max-sm:w-full motion-safe:hover:-translate-y-0.5"
    >
      Abrir calculadora
      <span className="sr-only">: {titulo}</span>
      <ArrowRight className="size-5 transition-transform duration-300 group-hover/cta:translate-x-1" aria-hidden />
    </Link>
  );
}
