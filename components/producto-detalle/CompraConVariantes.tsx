"use client";

import { useState } from "react";
import BotonFavorito from "@/components/favoritos/BotonFavorito";
import type { Variante } from "@/lib/agrupaciones";
import AccionesCompra from "./AccionesCompra";
import BloquePrecio from "./BloquePrecio";
import CodigoCompartir from "./CodigoCompartir";

type Props = {
  variantes: Variante[];
  /** Código de la medida que se abre marcada. */
  seleccionInicial: string;
};

/**
 * Página de un producto con medidas (lib/agrupaciones.ts: llave combinada Acesa, dados…): el precio, la barra de
 * medidas (por secciones: milímetros/pulgadas o encastre) justo antes de la cantidad y "Agregar al carrito", y el
 * código de la medida elegida. Al carrito, a favoritos y a "Comprar ahora" va la MEDIDA elegida (su código de Saint),
 * con su nombre ("Llave combinada Acesa 10 mm"). La medida queda en la dirección (?medida=CODIGO): compartir o
 * recargar abre la misma.
 */
export default function CompraConVariantes({ variantes, seleccionInicial }: Props) {
  const [seleccion, setSeleccion] = useState(seleccionInicial);
  const actual = variantes.find((v) => v.id === seleccion) ?? variantes[0];

  const elegir = (id: string) => {
    setSeleccion(id);
    const url = new URL(window.location.href);
    url.searchParams.set("medida", id);
    window.history.replaceState(window.history.state, "", url);
  };

  // Secciones en el orden de las variantes (ya vienen ordenadas); una sola sección no lleva encabezado.
  const secciones: { titulo: string | null; variantes: Variante[] }[] = [];
  for (const v of variantes) {
    const ultima = secciones.at(-1);
    if (ultima && ultima.titulo === v.seccion) ultima.variantes.push(v);
    else secciones.push({ titulo: v.seccion, variantes: [v] });
  }
  const conTitulos = secciones.length > 1;

  return (
    <>
      <BloquePrecio producto={actual.producto} />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-semibold text-logo-marino">
          Medida: <span className="font-titulo text-base font-bold">{actual.etiqueta}</span>
          <span className="ml-2 font-normal text-gris-texto">({variantes.length} disponibles)</span>
        </legend>
        {secciones.map((s) => (
          <div key={s.titulo ?? "todas"} role="radiogroup" aria-label={s.titulo ?? "Medidas"}>
            {conTitulos && s.titulo && (
              <p className="mb-1.5 text-[11px] font-semibold tracking-[0.12em] text-gris-texto uppercase">{s.titulo}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {s.variantes.map((v) => {
                const activa = v.id === actual.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={activa}
                    onClick={() => elegir(v.id)}
                    className={`inline-flex h-11 min-w-14 items-center justify-center rounded-boton border-2 px-3 font-titulo text-sm font-bold tabular-nums transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-marino motion-safe:active:scale-[0.97] ${
                      activa
                        ? "border-logo-marino bg-logo-marino text-pico-blanco shadow-boton-hover"
                        : "border-gris-borde bg-pico-blanco text-logo-marino hover:border-logo-marino hover:bg-logo-marino-claro"
                    }`}
                  >
                    {v.etiqueta}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </fieldset>

      <div className="flex flex-wrap items-center gap-2">
        <CodigoCompartir codigo={actual.id} titulo={actual.producto.titulo ?? actual.producto.nombre} />
        <BotonFavorito productoId={actual.id} titulo={actual.producto.titulo ?? actual.producto.nombre} variante="chip" />
      </div>

      <AccionesCompra producto={actual.producto} />
    </>
  );
}
