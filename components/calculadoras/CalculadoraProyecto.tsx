"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, CircleHelp, ShoppingCart, X } from "lucide-react";
import { useCarrito } from "@/components/carrito/ProveedorCarrito";
import { useTasaBCV } from "@/components/layout/TasaBCV";
import Precio from "@/components/ui/Precio";
import type { IdMaterial } from "@/lib/calculadoras/materiales";
import { medidasCompletas, obtenerCalculadora, opcionesIniciales } from "@/lib/calculadoras/registro";
import type { Calculadora, Campo } from "@/lib/calculadoras/tipos";
import { numero } from "@/lib/calculadoras/util";
import ConfirmacionCarrito, { type DatosConfirmacion } from "./ConfirmacionCarrito";
import Diagrama from "./Diagrama";
import { CampoMedida, ExtrasRecomendados, Paso, SelectorOpciones } from "./Formulario";
import {
  armarLineas,
  CANTIDAD_MAXIMA,
  claveAjuste,
  leerNumero,
  textoParaCompartir,
  totales,
  type Ajustes,
  type LineaResumen,
  type ProductosPorCodigo,
} from "./proyecto";
import ResumenProyecto from "./ResumenProyecto";

const MS_AGREGADO = 2000;
const sinSuscripcion = () => () => {};

/** Mensaje de error de una medida, o null si está bien (vacío no es error: solo falta). */
function errorDeCampo(campo: Campo, texto: string): string | null {
  if (texto.trim() === "") return null;
  const n = leerNumero(texto);
  if (Number.isNaN(n)) return "Escribe solo números, por ejemplo 3,5.";
  if (n < 0 || (n === 0 && !campo.opcional)) return "Debe ser mayor que 0.";
  if (campo.entero && !Number.isInteger(n)) return "Debe ser un número entero.";
  if (campo.maximo && n > campo.maximo) return `El máximo es ${numero(campo.maximo)} ${campo.unidad}.`;
  return null;
}

function etiquetaDe(campo: Campo, opciones: Record<string, string>): string {
  return campo.etiquetaSegun?.etiquetas[opciones[campo.etiquetaSegun.grupo]] ?? campo.etiqueta;
}

type Props = {
  slug: string;
  /** Productos del catálogo que usa esta calculadora, por código (los trae la página en el servidor). */
  productos: ProductosPorCodigo;
};

export default function CalculadoraProyecto({ slug, productos }: Props) {
  const calculadora = obtenerCalculadora(slug);
  if (!calculadora) return null; // la página ya responde 404 antes de llegar aquí
  return <Proyecto calculadora={calculadora} productos={productos} />;
}

function Proyecto({ calculadora, productos }: { calculadora: Calculadora; productos: ProductosPorCodigo }) {
  const { agregar, abrir } = useCarrito();
  const { tasa } = useTasaBCV();
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);

  const [textos, setTextos] = useState<Record<string, string>>(() =>
    Object.fromEntries(calculadora.campos.map((c) => [c.id, c.defecto === null ? "" : numero(c.defecto)])),
  );
  const [opciones, setOpciones] = useState(() => opcionesIniciales(calculadora));
  const [extras, setExtras] = useState<IdMaterial[]>([]);
  const [ajustes, setAjustes] = useState<Ajustes>({});
  const [confirmacion, setConfirmacion] = useState<DatosConfirmacion | null>(null);
  const [recienAgregado, setRecienAgregado] = useState(false);
  const [hojaAbierta, setHojaAbierta] = useState(false);

  // Medidas, errores y resultado: todo se recalcula con cada cambio.
  const { medidas, errores, resultado } = useMemo(() => {
    const errores: Record<string, string | null> = {};
    const medidas: Record<string, number> = {};
    for (const campo of calculadora.campos) {
      errores[campo.id] = errorDeCampo(campo, textos[campo.id] ?? "");
      const n = leerNumero(textos[campo.id] ?? "");
      if (!Number.isNaN(n)) medidas[campo.id] = n;
    }
    // En paredes: lo que se descuenta no puede ser toda la pared.
    if (!errores.vanos && medidas.vanos > 0 && medidas.largo > 0 && medidas.alto > 0 && medidas.vanos >= medidas.largo * medidas.alto) {
      errores.vanos = "No puede ser igual o mayor que el área de la pared.";
    }
    const valido = Object.values(errores).every((e) => !e) && medidasCompletas(calculadora, medidas);
    return { medidas, errores, resultado: valido ? calculadora.calcular({ medidas, opciones }) : null };
  }, [calculadora, textos, opciones]);

  const lineas = useMemo(() => {
    const conMateriales = resultado && { ...resultado, materiales: resultado.materiales.filter((m) => m.cantidad > 0) };
    return armarLineas(conMateriales, extras, ajustes, productos);
  }, [resultado, extras, ajustes, productos]);
  const { articulos, totalUsd, paraCarrito, porConsultar } = totales(lineas);

  const enlaceCompartir = resultado
    ? `https://wa.me/?text=${encodeURIComponent(textoParaCompartir(calculadora, { medidas, opciones }, resultado, lineas))}`
    : null;

  const cambiarCantidad = (linea: LineaResumen, cantidad: number) =>
    setAjustes((a) => ({ ...a, [claveAjuste(linea.material, linea.recomendada)]: Math.min(CANTIDAD_MAXIMA, Math.max(0, cantidad)) }));

  const alternarExtra = (id: IdMaterial) => setExtras((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));

  const agregarTodo = () => {
    if (paraCarrito.length === 0) return;
    // Mismo carrito de toda la tienda: una llamada a agregar() por producto.
    for (const linea of paraCarrito) agregar(linea.producto!, linea.cantidad);
    setConfirmacion({
      articulos: paraCarrito.reduce((suma, l) => suma + l.cantidad, 0),
      totalUsd,
      porConsultar: porConsultar.length,
    });
    setRecienAgregado(true);
    setHojaAbierta(false);
  };

  useEffect(() => {
    if (!recienAgregado) return;
    const t = setTimeout(() => setRecienAgregado(false), MS_AGREGADO);
    return () => clearTimeout(t);
  }, [recienAgregado]);

  // Con la hoja del resumen abierta (móvil) la página no se desplaza por detrás.
  useEffect(() => {
    if (!hojaAbierta) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && setHojaAbierta(false);
    document.addEventListener("keydown", alPresionar);
    return () => {
      document.body.style.overflow = previo;
      document.removeEventListener("keydown", alPresionar);
    };
  }, [hojaAbierta]);

  const cerrarConfirmacion = useCallback(() => setConfirmacion(null), []);

  const resumen = (
    <ResumenProyecto
      lineas={lineas}
      datos={resultado?.datos ?? []}
      tasa={tasa}
      sinCalculo={!resultado}
      recienAgregado={recienAgregado}
      enlaceCompartir={enlaceCompartir}
      alCambiarCantidad={cambiarCantidad}
      alAgregarTodo={agregarTodo}
    />
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start lg:pb-0 xl:gap-8">
        <div className="flex min-w-0 flex-col gap-5">
          <Paso numero={1} titulo="Ingresa las medidas" detalle="Usa metros; puedes escribir decimales con coma.">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_17rem] md:items-start">
              <div className="grid gap-4 sm:grid-cols-2">
                {calculadora.campos.map((campo) => (
                  <CampoMedida
                    key={campo.id}
                    campo={campo}
                    etiqueta={etiquetaDe(campo, opciones)}
                    valor={textos[campo.id] ?? ""}
                    error={errores[campo.id]}
                    alCambiar={(valor) => setTextos((t) => ({ ...t, [campo.id]: valor }))}
                  />
                ))}
              </div>
              <figure className="rounded-tarjeta border border-gris-borde bg-gris-fondo p-3 print:hidden">
                <Diagrama tipo={calculadora.diagrama} className="w-full" />
                <figcaption className="mt-2 text-[13px] leading-snug text-gris-texto">
                  <strong className="font-semibold text-pico-azul">Cómo medir: </strong>
                  {calculadora.comoMedir}
                </figcaption>
              </figure>
            </div>
          </Paso>

          <Paso numero={2} titulo="Elige tus opciones">
            <div className="space-y-5">
              {calculadora.grupos.map((grupo) => (
                <SelectorOpciones
                  key={grupo.id}
                  grupo={grupo}
                  valor={opciones[grupo.id]}
                  alCambiar={(valor) => setOpciones((o) => ({ ...o, [grupo.id]: valor }))}
                />
              ))}
            </div>
          </Paso>

          <div className="print:hidden">
            <Paso numero={3} titulo="Herramientas y extras recomendados" detalle="Opcional: marca lo que te haga falta.">
              <ExtrasRecomendados herramientas={calculadora.herramientas} productos={productos} elegidas={extras} alAlternar={alternarExtra} />
            </Paso>
          </div>

          <details className="group rounded-banner border border-gris-borde bg-pico-blanco shadow-tarjeta print:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-banner px-4 py-4 font-titulo text-lg font-bold text-pico-azul transition-colors hover:bg-gris-fondo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul md:px-6 [&::-webkit-details-marker]:hidden">
              <CircleHelp className="size-5 shrink-0 text-pico-rojo" aria-hidden />
              ¿Cómo calculamos esto?
              <ChevronDown className="ml-auto size-5 shrink-0 transition-transform duration-300 group-open:rotate-180" aria-hidden />
            </summary>
            <div className="space-y-3 px-4 pb-5 md:px-6">
              <ol className="space-y-2.5">
                {calculadora.explicacion.map((parrafo, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-texto">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-chip bg-pico-azul-claro text-[11px] font-bold text-pico-azul" aria-hidden>
                      {i + 1}
                    </span>
                    {parrafo}
                  </li>
                ))}
              </ol>
              {resultado && (
                <div className="rounded-tarjeta bg-gris-fondo p-3">
                  <p className="mb-1.5 text-[13px] font-semibold text-pico-azul">Con tus medidas:</p>
                  <ul className="space-y-1 text-[13px] leading-snug text-gris-texto tabular-nums">
                    {resultado.materiales.map((m) => (
                      <li key={m.material}>{m.nota}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        </div>

        {/* Escritorio: resumen fijo a la derecha. */}
        <aside
          aria-label="Resumen de tu proyecto"
          className="hidden max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-banner border border-gris-borde bg-pico-blanco shadow-tarjeta motion-safe:animate-aparecer lg:sticky lg:top-6 lg:flex print:static print:flex print:max-h-none"
          style={{ animationDelay: "240ms" }}
        >
          {resumen}
        </aside>
      </div>

      {/* Móvil: barra fija con el total; se abre como hoja con el resumen completo. En portal para que nada la encierre. */}
      {montado &&
        createPortal(
          <div className="lg:hidden print:hidden">
            {hojaAbierta && (
              <div className="fixed inset-0 z-40">
                <div className="absolute inset-0 bg-pico-azul-oscuro/55 backdrop-blur-[2px]" onClick={() => setHojaAbierta(false)} aria-hidden />
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Resumen de tu proyecto"
                  className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-banner bg-pico-blanco shadow-tarjeta-hover motion-safe:animate-aparecer"
                >
                  <button
                    type="button"
                    onClick={() => setHojaAbierta(false)}
                    className="absolute top-3 right-3 z-10 flex size-9 cursor-pointer items-center justify-center rounded-chip bg-pico-blanco/15 text-pico-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco"
                    aria-label="Cerrar resumen"
                  >
                    <X className="size-5" />
                  </button>
                  <div className="flex min-h-0 flex-1 flex-col [&_h2]:pr-10 [&_h2+span]:hidden">{resumen}</div>
                </div>
              </div>
            )}
            {!hojaAbierta && (
              <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gris-borde bg-pico-blanco px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-tarjeta-hover">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setHojaAbierta(true)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-boton py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
                    aria-expanded={false}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-chip bg-pico-azul-claro text-pico-azul">
                      <ChevronUp className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 leading-tight">
                      <span className="block text-xs font-semibold text-gris-texto">
                        Ver resumen · {articulos} {articulos === 1 ? "artículo" : "artículos"}
                      </span>
                      <Precio valor={totalUsd} className="font-titulo" />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={agregarTodo}
                    disabled={paraCarrito.length === 0}
                    className={`flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-boton px-4 text-sm font-semibold text-pico-blanco transition duration-200 disabled:cursor-not-allowed disabled:bg-gris-borde disabled:text-gris-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul ${
                      recienAgregado ? "bg-pico-azul" : "bg-pico-rojo"
                    }`}
                  >
                    <ShoppingCart className="size-4" aria-hidden />
                    {recienAgregado ? "¡Agregado!" : "Agregar todo"}
                  </button>
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}

      <ConfirmacionCarrito
        datos={confirmacion}
        alCerrar={cerrarConfirmacion}
        alVerCarrito={() => {
          setConfirmacion(null);
          abrir();
        }}
      />
    </>
  );
}
