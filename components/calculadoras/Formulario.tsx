"use client";

import type { ReactNode } from "react";
import { Check, Plus } from "lucide-react";
import ImagenProducto from "@/components/producto/ImagenProducto";
import Precio from "@/components/ui/Precio";
import { tituloProducto } from "@/lib/formato";
import { MATERIALES, type IdMaterial } from "@/lib/calculadoras/materiales";
import type { Campo, GrupoOpciones } from "@/lib/calculadoras/tipos";
import type { ProductosPorCodigo } from "./proyecto";

/** Tarjeta blanca de un paso del formulario, con su número en un círculo azul. */
export function Paso({ numero, titulo, detalle, children }: { numero: number; titulo: string; detalle?: string; children: ReactNode }) {
  return (
    <section
      className="rounded-banner border border-gris-borde bg-pico-blanco p-4 shadow-tarjeta motion-safe:animate-aparecer md:p-6"
      style={{ animationDelay: `${numero * 80}ms` }}
      aria-labelledby={`paso-${numero}`}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-chip bg-pico-azul text-sm font-bold text-pico-blanco" aria-hidden>
          {numero}
        </span>
        <div>
          <h2 id={`paso-${numero}`} className="text-xl leading-tight font-bold text-pico-azul">
            {titulo}
          </h2>
          {detalle && <p className="text-[13px] text-gris-texto">{detalle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

type PropsCampo = {
  campo: Campo;
  etiqueta: string;
  valor: string;
  error: string | null;
  alCambiar: (valor: string) => void;
};

/** Medida con su unidad a la derecha. Acepta coma o punto decimal. */
export function CampoMedida({ campo, etiqueta, valor, error, alCambiar }: PropsCampo) {
  const id = `medida-${campo.id}`;
  const descripcion = [campo.ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-1.5 text-sm font-semibold text-pico-azul">
        {etiqueta}
        {campo.opcional && <span className="text-xs font-normal text-gris-texto">(opcional)</span>}
      </label>
      <div
        className={`flex h-12 items-center overflow-hidden rounded-boton border-2 bg-pico-blanco transition duration-200 focus-within:ring-4 ${
          error
            ? "border-pico-rojo focus-within:ring-pico-rojo/15"
            : "border-gris-borde focus-within:border-pico-azul focus-within:ring-pico-azul/15 hover:border-pico-azul/40"
        }`}
      >
        <input
          id={id}
          type="text"
          inputMode={campo.entero ? "numeric" : "decimal"}
          autoComplete="off"
          placeholder={campo.entero ? "0" : "0,00"}
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={descripcion}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-base font-semibold text-texto tabular-nums placeholder:font-normal placeholder:text-gris-texto focus:outline-none"
        />
        <span className="flex h-full min-w-12 items-center justify-center border-l border-gris-borde bg-gris-fondo px-3 text-sm font-semibold text-gris-texto" aria-hidden>
          {campo.unidad}
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] font-medium text-pico-rojo motion-safe:animate-aparecer" role="alert">
          {error}
        </p>
      ) : (
        campo.ayuda && (
          <p id={`${id}-ayuda`} className="mt-1.5 text-[13px] leading-snug text-gris-texto">
            {campo.ayuda}
          </p>
        )
      )}
    </div>
  );
}

type PropsSelector = {
  grupo: GrupoOpciones;
  valor: string;
  alCambiar: (valor: string) => void;
};

/** Opciones en tarjetas; la elegida se marca con el rojo de acento. Son radios: se navegan con el teclado. */
export function SelectorOpciones({ grupo, valor, alCambiar }: PropsSelector) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-pico-azul">{grupo.etiqueta}</legend>
      <div className="grid grid-cols-2 gap-2.5 sm:auto-rows-fr sm:grid-cols-3 sm:gap-3">
        {grupo.opciones.map((opcion) => {
          const elegida = opcion.valor === valor;
          return (
            <label
              key={opcion.valor}
              className={`group relative flex h-full cursor-pointer flex-col justify-center rounded-tarjeta border-2 px-3 py-3 transition duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pico-azul motion-safe:hover:-translate-y-0.5 ${
                elegida
                  ? "border-pico-rojo bg-pico-rojo/[0.04] shadow-tarjeta"
                  : "border-gris-borde bg-pico-blanco hover:border-pico-azul/40 hover:shadow-tarjeta-hover"
              }`}
            >
              <input
                type="radio"
                name={`opcion-${grupo.id}`}
                value={opcion.valor}
                checked={elegida}
                onChange={() => alCambiar(opcion.valor)}
                className="sr-only"
              />
              <span className="block pr-5 text-sm leading-tight font-bold text-pico-azul">{opcion.etiqueta}</span>
              {opcion.detalle && <span className="mt-1 block text-[13px] leading-snug text-gris-texto">{opcion.detalle}</span>}
              {elegida && (
                <span
                  className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-chip bg-pico-rojo text-pico-blanco motion-safe:animate-latido"
                  aria-hidden
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

type PropsExtras = {
  herramientas: IdMaterial[];
  productos: ProductosPorCodigo;
  elegidas: IdMaterial[];
  alAlternar: (id: IdMaterial) => void;
};

/** Herramientas y extras recomendados: cada una con su casilla "Agregar". Solo salen las que hay en el catálogo. */
export function ExtrasRecomendados({ herramientas, productos, elegidas, alAlternar }: PropsExtras) {
  const disponibles = herramientas.flatMap((id) => {
    const codigo = MATERIALES[id].productoId;
    const producto = codigo ? productos[codigo] : undefined;
    return producto ? [{ id, producto }] : [];
  });

  if (disponibles.length === 0) {
    return <p className="rounded-tarjeta bg-gris-fondo px-4 py-6 text-center text-sm text-gris-texto">Por ahora no tenemos extras para recomendarte en este proyecto.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {disponibles.map(({ id, producto }) => {
        const elegida = elegidas.includes(id);
        return (
          <li key={id}>
            <label
              className={`group relative flex h-full cursor-pointer flex-col rounded-tarjeta border-2 p-2.5 transition duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pico-azul motion-safe:hover:-translate-y-0.5 ${
                elegida ? "border-pico-rojo bg-pico-rojo/[0.04] shadow-tarjeta" : "border-gris-borde bg-pico-blanco hover:border-pico-azul/40 hover:shadow-tarjeta-hover"
              }`}
            >
              <input type="checkbox" checked={elegida} onChange={() => alAlternar(id)} className="sr-only" />
              <ImagenProducto src={producto.imagen} alt="" sizes="(min-width: 640px) 180px, 45vw" className="rounded-boton" />
              <span className="mt-2 line-clamp-2 min-h-10 text-sm leading-tight font-medium text-texto">{tituloProducto(producto)}</span>
              <span className="mt-1.5 flex items-center justify-between gap-2">
                <Precio valor={producto.precio} tamano="pequeno" />
                <span
                  className={`inline-flex h-7 items-center gap-1 rounded-chip px-2.5 text-xs font-semibold transition-colors duration-200 ${
                    elegida ? "bg-pico-rojo text-pico-blanco" : "bg-pico-azul-claro text-pico-azul group-hover:bg-pico-azul group-hover:text-pico-blanco"
                  }`}
                >
                  {elegida ? <Check className="size-3.5 motion-safe:animate-latido" strokeWidth={3} aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
                  {elegida ? "Agregado" : "Agregar"}
                </span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
