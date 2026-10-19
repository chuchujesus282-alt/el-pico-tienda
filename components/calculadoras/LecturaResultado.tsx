"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Check, Minus, Plus, Printer, ShoppingCart } from "lucide-react";
import IconoMensaje from "@/components/icons/pico/IconoMensaje";
import ImagenProducto from "@/components/producto/ImagenProducto";
import Precio from "@/components/ui/Precio";
import PrecioAnimado from "@/components/ui/PrecioAnimado";
import { CANTIDAD_MAXIMA, type LineaResumen } from "@/components/calculadoras/proyecto";
import { etiquetaDe, type EstadoProyecto } from "@/components/calculadoras/useProyecto";
import { formatearPrecio, tituloProducto } from "@/lib/formato";

const formatoBs = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const claseFoco = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul";

/** "18,75 m²" → { cifra: "18,75", unidad: "m²" }. Si no empieza con número, todo va como cifra. */
function partir(valor: string) {
  const m = valor.match(/^([\d.,]+)\s*(.*)$/);
  return m ? { cifra: m[1], unidad: m[2] } : { cifra: valor, unidad: "" };
}

/** Una línea de "Lo que te llevas": la cantidad en grande, primero; luego qué es y cuánto cuesta. */
function Linea({ linea, alCambiar }: { linea: LineaResumen; alCambiar: (cantidad: number) => void }) {
  const { producto, info, cantidad, recomendada } = linea;
  const nombre = producto ? tituloProducto(producto) : info.nombre;
  const ajustada = recomendada !== null && cantidad !== recomendada;
  return (
    <li className={`flex gap-3 py-3.5 motion-safe:animate-aparecer ${cantidad === 0 ? "opacity-50" : ""}`}>
      <span
        key={cantidad}
        className="w-14 shrink-0 pt-0.5 text-right text-3xl leading-none font-bold text-pico-azul tabular-nums motion-safe:animate-latido"
        aria-live="polite"
      >
        {cantidad}
      </span>
      <ImagenProducto src={producto?.imagen ?? null} alt="" sizes="48px" className="size-12 shrink-0 rounded-boton border border-gris-borde" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm leading-snug font-semibold text-pico-azul">{nombre}</p>
        <p className="mt-0.5 text-xs text-gris-texto">
          {info.presentacion}
          {producto && <> · {formatearPrecio(producto.precio)} c/u</>}
        </p>
        {ajustada && <p className="mt-0.5 text-xs font-semibold text-pico-rojo">Recomendado: {recomendada}</p>}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 print:hidden">
            <button
              type="button"
              onClick={() => alCambiar(cantidad - 1)}
              disabled={cantidad <= 0}
              className={`flex size-9 cursor-pointer items-center justify-center rounded-boton border border-gris-borde text-pico-azul transition-colors hover:bg-pico-azul-claro disabled:cursor-not-allowed disabled:opacity-30 ${claseFoco}`}
              aria-label={`Quitar una unidad de ${nombre}`}
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => alCambiar(cantidad + 1)}
              disabled={cantidad >= CANTIDAD_MAXIMA}
              className={`flex size-9 cursor-pointer items-center justify-center rounded-boton border border-gris-borde text-pico-azul transition-colors hover:bg-pico-azul-claro disabled:cursor-not-allowed disabled:opacity-30 ${claseFoco}`}
              aria-label={`Agregar una unidad de ${nombre}`}
            >
              <Plus className="size-4" />
            </button>
          </div>
          {producto ? (
            <Precio valor={producto.precio * cantidad} tamano="pequeno" className="text-base! tabular-nums" />
          ) : (
            <span className="rounded-chip bg-pico-azul-claro px-2.5 py-1 text-[11px] font-semibold text-pico-azul">Consultar disponibilidad</span>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * Lectura del tablero: arriba, en azul marino, las cifras del cálculo en grande (o qué medida falta); en medio,
 * "Lo que te llevas" con la cantidad de cada material como protagonista; abajo el total, "Pedir estos materiales"
 * (agrega todo y lleva a /finalizar-pedido, de donde sale el WhatsApp) y "Solo agregar al carrito".
 */
export default function LecturaResultado({ estado }: { estado: EstadoProyecto }) {
  const { calculadora, textos, opciones, errores, resultado, lineas, articulos, totalUsd, paraCarrito, porConsultar, tasa, enlaceCompartir, recienAgregado } =
    estado;
  const router = useRouter();

  /** Agrega todo y va directo a cerrar el pedido (sin el aviso de "agregado", que ahí ya no hace falta). */
  const pedir = () => {
    estado.agregarTodo();
    estado.cerrarConfirmacion();
    router.push("/finalizar-pedido");
  };

  const datos = resultado?.datos ?? [];
  const [principal, ...resto] = datos;

  // Qué falta para calcular: medidas obligatorias vacías o con error (solo para guiar; el cálculo es el del hook).
  const requeridos = calculadora.campos.filter((c) => !c.opcional);
  const listos = requeridos.filter((c) => (textos[c.id] ?? "").trim() !== "" && !errores[c.id]).length;
  const pendientes = calculadora.campos.filter((c) => errores[c.id] || (!c.opcional && (textos[c.id] ?? "").trim() === ""));

  const elegidas = calculadora.grupos.flatMap((g) => {
    const opcion = g.opciones.find((o) => o.valor === opciones[g.id]);
    return opcion ? [{ id: g.id, texto: opcion.etiqueta }] : [];
  });

  return (
    <>
      {/* Cifras del cálculo */}
      <section className="relative shrink-0 bg-pico-azul-oscuro px-5 pt-4 pb-5 text-pico-blanco md:px-6 print:bg-none print:text-texto">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[11px] font-bold tracking-[0.2em] text-pico-blanco/70 uppercase print:text-gris-texto">Tu cálculo</h2>
          <span className="inline-flex items-center gap-1.5 rounded-chip bg-pico-blanco/10 px-2.5 py-1 text-[11px] font-semibold text-pico-blanco/85 print:hidden">
            <span key={totalUsd} className="size-1.5 rounded-chip bg-pico-rojo motion-safe:animate-latido" aria-hidden />
            Se actualiza al escribir
          </span>
        </div>

        {principal ? (
          <>
            <p className="mt-3 text-sm text-pico-blanco/70 print:text-gris-texto">{principal.etiqueta}</p>
            <p key={principal.valor} className="mt-1 leading-none font-bold tabular-nums motion-safe:animate-latido">
              <span className="text-5xl md:text-6xl">{partir(principal.valor).cifra}</span>
              {partir(principal.valor).unidad && <span className="ml-2 text-2xl text-pico-blanco/70 print:text-gris-texto">{partir(principal.valor).unidad}</span>}
            </p>
            {resto.length > 0 && (
              <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-tarjeta bg-pico-blanco/15">
                {resto.map((d) => (
                  <div key={d.etiqueta} className="bg-pico-azul px-3 py-2.5 odd:last:col-span-2 print:bg-none">
                    <dt className="text-xs text-pico-blanco/70 print:text-gris-texto">{d.etiqueta}</dt>
                    <dd key={d.valor} className="mt-0.5 text-lg leading-tight font-bold tabular-nums motion-safe:animate-latido">
                      {d.valor}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </>
        ) : (
          <div className="mt-3">
            <p className="text-3xl leading-tight font-bold md:text-4xl">Faltan medidas</p>
            {requeridos.length > 0 && (
              <>
                <div className="mt-3 h-1.5 overflow-hidden rounded-chip bg-pico-blanco/15" aria-hidden>
                  <div className="h-full rounded-chip bg-pico-rojo transition-[width] duration-300" style={{ width: `${(listos / requeridos.length) * 100}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-pico-blanco/70 tabular-nums">
                  {listos} de {requeridos.length} {requeridos.length === 1 ? "medida lista" : "medidas listas"}
                </p>
              </>
            )}
            {pendientes.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm">
                {pendientes.map((c) => (
                  <li key={c.id} className="flex items-baseline gap-2">
                    <span className="h-2.5 w-1 shrink-0 -skew-x-12 rounded-sm bg-pico-rojo" aria-hidden />
                    {errores[c.id] ? `Revisa: ${etiquetaDe(c, opciones)}` : `Escribe: ${etiquetaDe(c, opciones)}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {elegidas.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Opciones elegidas">
            {elegidas.map((e) => (
              <li key={e.id} className="rounded-chip px-2.5 py-1 text-xs font-semibold ring-1 ring-pico-blanco/25">
                {e.texto}
              </li>
            ))}
          </ul>
        )}
        <span className="absolute inset-x-0 bottom-0 h-1 bg-pico-rojo print:hidden" aria-hidden />
      </section>

      {/* Lo que te llevas */}
      <section aria-labelledby="lista-materiales" className="min-h-0 flex-1 overflow-y-auto px-5 md:px-6 print:overflow-visible">
        <div className="flex items-baseline justify-between gap-3 border-b border-gris-borde pt-4 pb-2.5">
          <h2 id="lista-materiales" className="text-lg font-bold text-pico-azul">
            Lo que te llevas
          </h2>
          <span key={articulos} className="text-sm font-semibold text-gris-texto tabular-nums motion-safe:animate-latido">
            {articulos} {articulos === 1 ? "artículo" : "artículos"}
          </span>
        </div>
        {lineas.length === 0 ? (
          <p className="py-8 text-center text-sm text-gris-texto">Con tus medidas, aquí sale cada material con su cantidad y su precio.</p>
        ) : (
          <ul className="divide-y divide-gris-borde">
            {lineas.map((linea) => (
              <Linea key={linea.material} linea={linea} alCambiar={(cantidad) => estado.cambiarCantidad(linea, cantidad)} />
            ))}
          </ul>
        )}
      </section>

      {/* Total y acciones */}
      <div className="shrink-0 space-y-3 border-t-2 border-pico-azul bg-pico-azul-claro px-5 pt-4 pb-5 md:px-6">
        <div className="flex items-end justify-between gap-3">
          <span className="text-sm font-semibold text-pico-azul">Total referencial</span>
          <span className="text-right">
            <span key={totalUsd} className="block motion-safe:animate-latido">
              <PrecioAnimado valor={totalUsd} tamano="grande" className="text-3xl! tabular-nums md:text-4xl!" />
            </span>
            {tasa && totalUsd > 0 && (
              <span className="block text-xs font-medium text-gris-texto tabular-nums">≈ Bs. {formatoBs.format(totalUsd * tasa.tasa)} a tasa BCV</span>
            )}
          </span>
        </div>
        {porConsultar.length > 0 && (
          <p className="text-xs leading-relaxed text-gris-texto">
            {porConsultar.length === 1 ? "Hay 1 material" : `Hay ${porConsultar.length} materiales`} sin precio en la web: te confirmamos disponibilidad por
            WhatsApp.
          </p>
        )}
        <button
          type="button"
          onClick={pedir}
          disabled={paraCarrito.length === 0}
          className={`group flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-boton bg-pico-rojo text-base font-semibold text-pico-blanco transition duration-200 enabled:hover:bg-pico-rojo-oscuro hover:shadow-boton-hover disabled:cursor-not-allowed disabled:bg-gris-borde disabled:text-gris-texto disabled:shadow-none motion-safe:enabled:active:scale-[0.98] print:hidden ${claseFoco}`}
        >
          Pedir estos materiales
          <ArrowRight className="size-5 transition-transform duration-300 motion-safe:group-enabled:group-hover:translate-x-1" aria-hidden />
        </button>
        <button
          type="button"
          onClick={estado.agregarTodo}
          disabled={paraCarrito.length === 0}
          className={`flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-boton border-2 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:border-gris-borde disabled:text-gris-texto/60 print:hidden ${
            recienAgregado
              ? "border-pico-azul bg-pico-azul text-pico-blanco"
              : "border-pico-azul bg-pico-blanco text-pico-azul enabled:hover:bg-pico-azul enabled:hover:text-pico-blanco"
          } ${claseFoco}`}
        >
          {recienAgregado ? <Check className="size-5 motion-safe:animate-latido" aria-hidden /> : <ShoppingCart className="size-4" aria-hidden />}
          {recienAgregado ? "¡Agregado al carrito!" : "Solo agregar al carrito"}
        </button>
        <div className="grid grid-cols-2 gap-2 print:hidden">
          {enlaceCompartir ? (
            <a
              href={enlaceCompartir}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex h-10 items-center justify-center gap-1.5 rounded-boton border-2 border-pico-azul bg-pico-blanco text-sm font-semibold text-pico-azul transition duration-200 hover:bg-pico-azul hover:text-pico-blanco ${claseFoco}`}
            >
              <IconoMensaje className="size-5" />
              Compartir lista
              <span className="sr-only"> por WhatsApp (se abre en una pestaña nueva)</span>
            </a>
          ) : (
            <span className="flex h-10 cursor-not-allowed items-center justify-center gap-1.5 rounded-boton border-2 border-gris-borde bg-pico-blanco text-sm font-semibold text-gris-texto/60">
              <IconoMensaje className="size-5" />
              Compartir lista
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
        <p className="text-xs leading-relaxed text-gris-texto">Cálculo referencial: las cantidades pueden variar según la obra.</p>
      </div>
    </>
  );
}
