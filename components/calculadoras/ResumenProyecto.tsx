"use client";

import { Check, Info, MessageCircle, Minus, Plus, Printer, Ruler, ShoppingCart } from "lucide-react";
import ImagenProducto from "@/components/producto/ImagenProducto";
import Precio from "@/components/ui/Precio";
import { formatearPrecio, tituloProducto } from "@/lib/formato";
import type { Dato } from "@/lib/calculadoras/tipos";
import type { TasaBCV } from "@/types/tasa";
import { CANTIDAD_MAXIMA, totales, type LineaResumen } from "./proyecto";

const formatoBs = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const claseFoco = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul";

type Props = {
  lineas: LineaResumen[];
  datos: Dato[];
  tasa: TasaBCV | null;
  /** Falta alguna medida: todavía no hay cálculo. */
  sinCalculo: boolean;
  recienAgregado: boolean;
  enlaceCompartir: string | null;
  alCambiarCantidad: (linea: LineaResumen, cantidad: number) => void;
  alAgregarTodo: () => void;
};

function Linea({ linea, alCambiar }: { linea: LineaResumen; alCambiar: (cantidad: number) => void }) {
  const { producto, info, cantidad, recomendada } = linea;
  const nombre = producto ? tituloProducto(producto) : info.nombre;
  return (
    <li className="flex gap-3 py-3.5 motion-safe:animate-aparecer">
      <ImagenProducto src={producto?.imagen ?? null} alt="" sizes="64px" className="size-16 shrink-0 rounded-boton border border-gris-borde" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm leading-snug font-semibold text-texto">{nombre}</p>
        <p className="mt-0.5 text-xs text-gris-texto">
          {info.presentacion}
          {producto && <> · {formatearPrecio(producto.precio)} c/u</>}
        </p>
        {recomendada !== null && (
          <p className="mt-1 text-xs font-semibold text-pico-azul" title={linea.nota}>
            Cantidad recomendada: {recomendada}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center rounded-chip border border-gris-borde bg-pico-blanco print:border-0">
            <button
              type="button"
              onClick={() => alCambiar(cantidad - 1)}
              disabled={cantidad <= 0}
              className={`flex size-8 cursor-pointer items-center justify-center rounded-chip text-pico-azul transition-colors hover:bg-pico-azul-claro disabled:cursor-not-allowed disabled:opacity-30 print:hidden ${claseFoco}`}
              aria-label={`Quitar una unidad de ${nombre}`}
            >
              <Minus className="size-3.5" />
            </button>
            <span key={cantidad} className="min-w-9 px-1 text-center font-titulo text-sm font-bold text-pico-azul tabular-nums motion-safe:animate-latido" aria-live="polite">
              {cantidad}
            </span>
            <button
              type="button"
              onClick={() => alCambiar(cantidad + 1)}
              disabled={cantidad >= CANTIDAD_MAXIMA}
              className={`flex size-8 cursor-pointer items-center justify-center rounded-chip text-pico-azul transition-colors hover:bg-pico-azul-claro disabled:cursor-not-allowed disabled:opacity-30 print:hidden ${claseFoco}`}
              aria-label={`Agregar una unidad de ${nombre}`}
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          {producto ? (
            <Precio valor={producto.precio * cantidad} tamano="pequeno" className="font-titulo" />
          ) : (
            <span className="rounded-chip bg-pico-azul-claro px-2.5 py-1 text-[11px] font-semibold text-pico-azul">Consultar disponibilidad</span>
          )}
        </div>
      </div>
    </li>
  );
}

/** "Resumen de tu proyecto": materiales con su cantidad recomendada, total y acciones. */
export default function ResumenProyecto({ lineas, datos, tasa, sinCalculo, recienAgregado, enlaceCompartir, alCambiarCantidad, alAgregarTodo }: Props) {
  const { articulos, totalUsd, paraCarrito, porConsultar } = totales(lineas);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative flex items-center justify-between gap-3 bg-gradient-to-br from-pico-azul to-pico-azul-oscuro px-5 py-4 text-pico-blanco">
        <h2 className="font-titulo text-xl leading-tight font-bold">Resumen de tu proyecto</h2>
        <span key={articulos} className="shrink-0 rounded-chip bg-pico-blanco/15 px-2.5 py-0.5 text-xs font-semibold motion-safe:animate-latido">
          {articulos} {articulos === 1 ? "artículo" : "artículos"}
        </span>
        <span className="absolute inset-x-0 bottom-0 h-1 bg-pico-rojo" aria-hidden />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 print:overflow-visible">
        {lineas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="flex size-16 items-center justify-center rounded-chip bg-pico-azul-claro motion-safe:animate-flotar">
              <Ruler className="size-7 text-pico-azul" strokeWidth={1.5} aria-hidden />
            </span>
            <p className="font-titulo text-lg font-bold text-pico-azul">Ingresa las medidas</p>
            <p className="max-w-60 text-sm text-gris-texto">Aquí verás los materiales, las cantidades recomendadas y el total.</p>
          </div>
        ) : (
          <>
            {sinCalculo && (
              <p className="mt-4 flex gap-2 rounded-tarjeta bg-pico-azul-claro px-3 py-2.5 text-[13px] leading-snug text-pico-azul">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                Completa las medidas para calcular los materiales.
              </p>
            )}
            {datos.length > 0 && (
              // Lo que se calculó con las medidas del cliente: va destacado, con las cifras grandes y en negrita.
              <div className="mt-4 overflow-hidden rounded-tarjeta border border-pico-azul/15 bg-pico-azul-claro motion-safe:animate-aparecer">
                <p className="flex items-center gap-2 border-b border-pico-azul/10 px-4 py-2 text-[11px] font-bold tracking-[0.18em] text-pico-azul uppercase">
                  <span className="h-3 w-1 -skew-x-12 rounded-sm bg-pico-rojo" aria-hidden />
                  Tu cálculo
                </p>
                <dl className="divide-y divide-pico-azul/10 px-4">
                  {datos.map((d) => (
                    <div key={d.etiqueta} className="flex items-baseline justify-between gap-3 py-2.5">
                      <dt className="text-sm font-semibold text-pico-azul/80">{d.etiqueta}</dt>
                      <dd key={d.valor} className="text-right font-titulo text-lg leading-none font-bold text-pico-azul tabular-nums motion-safe:animate-latido">
                        {d.valor}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            <ul className="divide-y divide-gris-borde">
              {lineas.map((linea) => (
                <Linea key={linea.material} linea={linea} alCambiar={(cantidad) => alCambiarCantidad(linea, cantidad)} />
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="space-y-3 border-t border-gris-borde px-5 pt-4 pb-5">
        <div className="flex items-end justify-between gap-3">
          <span className="text-sm font-semibold text-pico-azul">Total referencial</span>
          <span className="text-right">
            <span key={totalUsd} className="block motion-safe:animate-latido">
              <Precio valor={totalUsd} tamano="grande" className="font-titulo md:text-3xl" />
            </span>
            {tasa && totalUsd > 0 && (
              <span className="block text-xs font-medium text-gris-texto tabular-nums">≈ Bs. {formatoBs.format(totalUsd * tasa.tasa)} a tasa BCV</span>
            )}
          </span>
        </div>
        {porConsultar.length > 0 && (
          <p className="text-xs leading-relaxed text-gris-texto">
            {porConsultar.length === 1 ? "Hay 1 material" : `Hay ${porConsultar.length} materiales`} sin precio en la web: te confirmamos disponibilidad por WhatsApp.
          </p>
        )}
        <button
          type="button"
          onClick={alAgregarTodo}
          disabled={paraCarrito.length === 0}
          className={`group relative flex h-12 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-boton text-base font-semibold text-pico-blanco transition duration-200 hover:shadow-boton-hover disabled:cursor-not-allowed disabled:bg-gris-borde disabled:text-gris-texto disabled:shadow-none motion-safe:enabled:hover:-translate-y-0.5 motion-safe:enabled:active:scale-[0.98] print:hidden ${
            recienAgregado ? "bg-pico-azul" : "bg-pico-rojo enabled:hover:bg-pico-rojo-oscuro"
          } ${claseFoco}`}
        >
          {recienAgregado ? <Check className="size-5 motion-safe:animate-latido" aria-hidden /> : <ShoppingCart className="size-5 motion-safe:group-enabled:group-hover:animate-sacudir" aria-hidden />}
          {recienAgregado ? "¡Agregado al carrito!" : "Agregar todo al carrito"}
        </button>
        <div className="grid grid-cols-2 gap-2 print:hidden">
          {enlaceCompartir ? (
            <a
              href={enlaceCompartir}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex h-10 items-center justify-center gap-1.5 rounded-boton border-2 border-pico-azul bg-pico-blanco text-sm font-semibold text-pico-azul transition duration-200 hover:bg-pico-azul hover:text-pico-blanco ${claseFoco}`}
            >
              <MessageCircle className="size-4 motion-safe:group-hover:animate-sacudir" aria-hidden />
              Compartir
              <span className="sr-only"> por WhatsApp (se abre en una pestaña nueva)</span>
            </a>
          ) : (
            <span className="flex h-10 cursor-not-allowed items-center justify-center gap-1.5 rounded-boton border-2 border-gris-borde text-sm font-semibold text-gris-texto/60">
              <MessageCircle className="size-4" aria-hidden />
              Compartir
            </span>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            disabled={lineas.length === 0}
            className={`flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-boton border-2 border-pico-azul bg-pico-blanco text-sm font-semibold text-pico-azul transition duration-200 enabled:hover:bg-pico-azul enabled:hover:text-pico-blanco disabled:cursor-not-allowed disabled:border-gris-borde disabled:text-gris-texto/60 ${claseFoco}`}
          >
            <Printer className="size-4" aria-hidden />
            Imprimir
          </button>
        </div>
        <p className="text-xs leading-relaxed text-gris-texto">
          Cálculo referencial. Las cantidades pueden variar según la obra; consulta con tu maestro de obra o con nosotros.
        </p>
      </div>
    </div>
  );
}
