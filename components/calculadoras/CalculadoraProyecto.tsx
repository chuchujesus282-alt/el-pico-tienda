"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";
import ConfirmacionCarrito from "./ConfirmacionCarrito";
import Diagrama from "./Diagrama";
import { CampoMedida, ExtrasRecomendados, SelectorOpciones } from "./Formulario";
import type { ProductosPorCodigo } from "./proyecto";
import { etiquetaDe, useProyecto } from "./useProyecto";
import { obtenerCalculadora } from "@/lib/calculadoras/registro";
import type { Calculadora } from "@/lib/calculadoras/tipos";
import BarraMovilCalculadora from "./BarraMovilCalculadora";
import LecturaResultado from "./LecturaResultado";

export const ID_LECTURA = "lectura-proyecto";

type Props = { slug: string; productos: ProductosPorCodigo };

/**
 * Calculadora de proyecto en forma de tablero: a la izquierda las entradas (01 medidas, 02 opciones, extras y "¿Cómo
 * calculamos esto?") y a la derecha la lectura del resultado (LecturaResultado), que se actualiza mientras escribes y
 * queda fija al bajar en escritorio. En el teléfono la lectura va después del formulario y una barra fija
 * (BarraMovilCalculadora) muestra el total mientras no está a la vista. Estado y cálculo: useProyecto.
 */
export default function CalculadoraProyecto({ slug, productos }: Props) {
  const calculadora = obtenerCalculadora(slug);
  if (!calculadora) return null; // la página ya responde 404 antes
  return <Tablero calculadora={calculadora} productos={productos} />;
}

/** Bloque numerado del panel de entradas: "01" grande a la izquierda (desde 768px) y el contenido al lado. */
function Modulo({ indice, titulo, detalle, children }: { indice: number; titulo: string; detalle?: string; children: ReactNode }) {
  const numero = String(indice).padStart(2, "0");
  const id = `modulo-${indice}`;
  return (
    <section aria-labelledby={id} className="px-4 py-5 md:flex md:gap-5 md:px-6 md:py-7">
      <span className="hidden w-12 shrink-0 md:block" aria-hidden>
        <span className="block text-4xl leading-none font-bold text-pico-azul tabular-nums">{numero}</span>
        <span className="mt-2 block h-1 w-8 -skew-x-12 rounded-sm bg-pico-rojo" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-baseline gap-2.5">
          <span className="text-sm font-bold text-pico-rojo tabular-nums md:hidden" aria-hidden>
            {numero}
          </span>
          <div>
            <h2 id={id} className="text-lg leading-tight font-bold text-pico-azul md:text-xl">
              {titulo}
            </h2>
            {detalle && <p className="mt-0.5 text-[13px] text-gris-texto">{detalle}</p>}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

function Tablero({ calculadora, productos }: { calculadora: Calculadora; productos: ProductosPorCodigo }) {
  const estado = useProyecto(calculadora, productos);
  const { textos, opciones, errores, resultado, extras, cambiarTexto, cambiarOpcion, alternarExtra } = estado;

  // En el teléfono la barra fija se esconde cuando la lectura ya está a la vista (no se repite el total dos veces).
  const lectura = useRef<HTMLElement>(null);
  const [lecturaVisible, setLecturaVisible] = useState(false);
  useEffect(() => {
    const nodo = lectura.current;
    if (!nodo || typeof IntersectionObserver === "undefined") return;
    const observador = new IntersectionObserver(([entrada]) => setLecturaVisible(entrada.isIntersecting), { threshold: 0.15 });
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  let indice = 0;

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_30rem] 2xl:grid-cols-[minmax(0,1fr)_34rem]">
        {/* Entradas: un solo panel blanco con módulos numerados. */}
        <div className="min-w-0 divide-y divide-gris-borde overflow-hidden rounded-banner border border-gris-borde bg-pico-blanco shadow-tarjeta motion-safe:animate-aparecer">
          <Modulo indice={++indice} titulo="Tus medidas" detalle="En metros. Puedes usar coma: 3,5.">
            <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_17rem] 2xl:items-start">
              <div className="grid gap-4 sm:grid-cols-2">
                {calculadora.campos.map((campo) => (
                  <CampoMedida
                    key={campo.id}
                    campo={campo}
                    etiqueta={etiquetaDe(campo, opciones)}
                    valor={textos[campo.id] ?? ""}
                    error={errores[campo.id]}
                    alCambiar={(valor) => cambiarTexto(campo.id, valor)}
                  />
                ))}
              </div>
              <figure className="flex flex-col gap-3 rounded-tarjeta border border-gris-borde bg-gris-fondo/40 p-3 sm:flex-row sm:items-center 2xl:flex-col 2xl:items-stretch print:hidden">
                <Diagrama tipo={calculadora.diagrama} className="w-full sm:w-52 sm:shrink-0 2xl:w-full" />
                <figcaption className="text-[13px] leading-snug text-gris-texto">
                  <strong className="font-semibold text-pico-azul">Cómo medir: </strong>
                  {calculadora.comoMedir}
                </figcaption>
              </figure>
            </div>
          </Modulo>

          {calculadora.grupos.length > 0 && (
            <Modulo indice={++indice} titulo="Tus opciones">
              <div className="space-y-5">
                {calculadora.grupos.map((grupo) => (
                  <SelectorOpciones key={grupo.id} grupo={grupo} valor={opciones[grupo.id]} alCambiar={(valor) => cambiarOpcion(grupo.id, valor)} />
                ))}
              </div>
            </Modulo>
          )}

          {/* Extras en un desplegable: son opcionales y, abiertos, empujaban el resultado muy abajo en el teléfono. */}
          <details className="group/extras print:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 transition-colors hover:bg-gris-fondo/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pico-azul md:px-6 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1">
                <span className="block text-base leading-tight font-bold text-pico-azul">
                  Herramientas y extras
                  {extras.length > 0 && (
                    <span className="ml-2 rounded-chip bg-pico-rojo px-2 py-0.5 align-middle text-xs font-bold text-pico-blanco tabular-nums">
                      {extras.length}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[13px] text-gris-texto">Opcional: marca lo que te falte y se suma a la lista.</span>
              </span>
              <ChevronDown className="size-5 shrink-0 text-pico-azul transition-transform duration-300 group-open/extras:rotate-180" aria-hidden />
            </summary>
            <div className="px-4 pb-5 md:px-6">
              <ExtrasRecomendados herramientas={calculadora.herramientas} productos={productos} elegidas={extras} alAlternar={alternarExtra} />
            </div>
          </details>

          <details className="group print:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 text-base font-bold text-pico-azul transition-colors hover:bg-gris-fondo/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pico-azul md:px-6 [&::-webkit-details-marker]:hidden">
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
                <div className="rounded-tarjeta bg-pico-azul-claro p-3">
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

        {/* Lectura: el resultado vivo. En escritorio queda pegada a la derecha (debajo del header fijo). */}
        <aside
          ref={lectura}
          id={ID_LECTURA}
          aria-label="Resultado de tu proyecto"
          className="flex scroll-mt-4 flex-col md:scroll-mt-28 overflow-hidden rounded-banner bg-pico-blanco shadow-tarjeta-hover motion-safe:animate-aparecer lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8.5rem)] print:static print:max-h-none"
          style={{ animationDelay: "160ms" }}
        >
          <LecturaResultado estado={estado} />
        </aside>
      </div>

      <BarraMovilCalculadora estado={estado} oculta={lecturaVisible} idLectura={ID_LECTURA} />

      <ConfirmacionCarrito datos={estado.confirmacion} alCerrar={estado.cerrarConfirmacion} alVerCarrito={estado.verCarrito} />
    </>
  );
}
