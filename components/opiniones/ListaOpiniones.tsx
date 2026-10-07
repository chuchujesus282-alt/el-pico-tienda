"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Star, Trash2 } from "lucide-react";
import Estrellas from "@/components/producto-detalle/Estrellas";
import type { Opinion } from "@/types/opiniones";
import { eliminarOpinion } from "./almacenOpiniones";

type Orden = "recientes" | "mejores" | "peores";

const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: "recientes", etiqueta: "Más recientes" },
  { valor: "mejores", etiqueta: "Mejor calificadas" },
  { valor: "peores", etiqueta: "Peor calificadas" },
];

const POR_PAGINA = 6;

const fecha = new Intl.DateTimeFormat("es-VE", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

type Props = {
  /** Debe traer al menos una opinión (sin opiniones, PanelOpiniones no muestra la lista). */
  opiniones: Opinion[];
  /** Ids de las opiniones escritas en este navegador (se pueden eliminar). */
  propias: Set<string>;
  /** Opinión recién publicada: se resalta y se lleva a la vista. */
  resaltada: string | null;
};

export default function ListaOpiniones({ opiniones, propias, resaltada }: Props) {
  const [filtro, setFiltro] = useState<number | null>(null);
  const [orden, setOrden] = useState<Orden>("recientes");
  const [visibles, setVisibles] = useState(POR_PAGINA);
  const refResaltada = useRef<HTMLLIElement>(null);

  // PanelOpiniones vuelve a montar la lista al publicar (key), así la opinión nueva se ve sin filtros puestos.
  useEffect(() => {
    if (!resaltada) return;
    const t = setTimeout(() => refResaltada.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    return () => clearTimeout(t);
  }, [resaltada]);

  const conteo = (n: number) => opiniones.filter((o) => o.calificacion === n).length;

  const lista = opiniones
    .filter((o) => filtro === null || o.calificacion === filtro)
    .sort((a, b) =>
      orden === "mejores"
        ? b.calificacion - a.calificacion || b.fecha.localeCompare(a.fecha)
        : orden === "peores"
          ? a.calificacion - b.calificacion || b.fecha.localeCompare(a.fecha)
          : b.fecha.localeCompare(a.fecha),
    );

  const chip = (activo: boolean) =>
    `inline-flex h-9 shrink-0 items-center gap-1 rounded-chip border px-3 text-sm font-semibold whitespace-nowrap transition-colors ${
      activo
        ? "border-logo-marino bg-logo-marino text-pico-blanco"
        : "border-gris-borde bg-pico-blanco text-logo-marino hover:border-logo-marino hover:bg-logo-marino-claro"
    }`;

  return (
    <section aria-labelledby="titulo-lista">
      <h2 id="titulo-lista" className="sr-only">
        Opiniones de clientes
      </h2>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="sin-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="group" aria-label="Filtrar por estrellas">
          <button type="button" onClick={() => { setFiltro(null); setVisibles(POR_PAGINA); }} className={chip(filtro === null)} aria-pressed={filtro === null}>
            Todas ({opiniones.length})
          </button>
          {[5, 4, 3, 2, 1].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => { setFiltro(n); setVisibles(POR_PAGINA); }}
              disabled={conteo(n) === 0}
              className={`${chip(filtro === n)} shrink-0 disabled:cursor-not-allowed disabled:opacity-40`}
              aria-pressed={filtro === n}
              aria-label={`${n} estrellas (${conteo(n)})`}
            >
              {n}
              <Star className={`size-3.5 ${filtro === n ? "fill-pico-blanco text-pico-blanco" : "fill-estrella text-estrella"}`} aria-hidden />
              <span className="font-normal opacity-80">({conteo(n)})</span>
            </button>
          ))}
        </div>

        <label className="flex shrink-0 items-center gap-2 text-sm">
          <span className="text-gris-texto">Ordenar</span>
          <span className="relative">
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as Orden)}
              className="h-9 cursor-pointer appearance-none rounded-boton border border-gris-borde bg-pico-blanco pr-8 pl-3 font-semibold text-logo-marino focus-visible:outline-2 focus-visible:outline-logo-marino"
            >
              {ORDENES.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-gris-texto" aria-hidden />
          </span>
        </label>
      </div>

      <ul className="flex flex-col gap-3">
        {lista.slice(0, visibles).map((o, i) => {
          const esPropia = propias.has(o.id);
          return (
            <li
              key={o.id}
              ref={o.id === resaltada ? refResaltada : undefined}
              className={`rounded-tarjeta border bg-pico-blanco p-4 transition-shadow motion-safe:animate-aparecer md:p-5 ${
                o.id === resaltada ? "border-logo-marino ring-4 ring-logo-marino-claro" : "border-gris-borde hover:shadow-tarjeta"
              }`}
              style={{ animationDelay: `${Math.min(i, 5) * 40}ms` }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-chip bg-logo-marino-claro font-titulo text-sm font-bold text-logo-marino"
                  aria-hidden
                >
                  {iniciales(o.autor)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <p className="font-semibold text-logo-marino">
                      {o.autor}
                      {esPropia && (
                        <span className="ml-2 rounded-chip bg-logo-marino px-2 py-0.5 align-middle text-[11px] font-semibold text-pico-blanco">
                          Tu opinión
                        </span>
                      )}
                    </p>
                    <time dateTime={o.fecha} className="text-[13px] text-gris-texto">
                      {fecha.format(new Date(o.fecha))}
                    </time>
                  </div>
                  <Estrellas valor={o.calificacion} className="mt-1 size-4" />
                  <p className="mt-2 text-sm leading-relaxed text-texto">{o.comentario}</p>
                  {esPropia && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[12px] text-gris-texto">Guardada en este dispositivo</span>
                      <button
                        type="button"
                        onClick={() => eliminarOpinion(o.id)}
                        className="inline-flex items-center gap-1 rounded-boton px-2 py-1 text-[13px] font-semibold text-gris-texto hover:bg-gris-fondo hover:text-logo-rojo"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {lista.length > visibles && (
        <button
          type="button"
          onClick={() => setVisibles((v) => v + POR_PAGINA)}
          className="mx-auto mt-5 flex h-11 items-center gap-2 rounded-boton border-2 border-logo-marino bg-pico-blanco px-5 text-sm font-semibold text-logo-marino transition duration-200 hover:bg-logo-marino hover:text-pico-blanco motion-safe:hover:-translate-y-0.5"
        >
          Ver más opiniones ({lista.length - visibles})
          <ChevronDown className="size-4" aria-hidden />
        </button>
      )}
    </section>
  );
}
