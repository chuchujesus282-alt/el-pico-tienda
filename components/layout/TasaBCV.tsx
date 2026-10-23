"use client";

import { useEffect, useState } from "react";
import type { TasaBCV as DatosTasa } from "@/types/tasa";

const CLAVE = "el-pico:tasa-bcv";
const formatoTasa = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatoFecha = new Intl.DateTimeFormat("es-VE", { dateStyle: "long", timeStyle: "short" });

function esTasa(dato: unknown): dato is DatosTasa {
  const d = dato as DatosTasa | null;
  return (
    !!d &&
    typeof d.tasa === "number" &&
    Number.isFinite(d.tasa) &&
    (d.fecha === undefined || typeof d.fecha === "string")
  );
}

function leerGuardada(): DatosTasa | null {
  try {
    const dato: unknown = JSON.parse(window.localStorage.getItem(CLAVE) ?? "null");
    return esTasa(dato) ? dato : null;
  } catch {
    return null;
  }
}

function textoFecha(fecha: string): string {
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? fecha : formatoFecha.format(d);
}

/**
 * Tasa BCV para componentes cliente. Consulta /api/tasa-bcv (que pasa por lib/tasa.ts) y guarda el
 * último valor en el navegador: si la consulta falla, se sigue mostrando ese valor.
 */
export function useTasaBCV(): { tasa: DatosTasa | null; cargando: boolean } {
  const [estado, setEstado] = useState<{ tasa: DatosTasa | null; cargando: boolean }>({ tasa: null, cargando: true });

  useEffect(() => {
    let vigente = true;
    fetch("/api/tasa-bcv")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("sin tasa"))))
      .then((dato: unknown) => {
        if (!esTasa(dato)) throw new Error("respuesta inválida");
        try {
          window.localStorage.setItem(CLAVE, JSON.stringify(dato));
        } catch {
          // Sin almacenamiento (modo privado): se muestra igual, solo no queda guardada.
        }
        if (vigente) setEstado({ tasa: dato, cargando: false });
      })
      .catch(() => {
        if (vigente) setEstado({ tasa: leerGuardada(), cargando: false });
      });
    return () => {
      vigente = false;
    };
  }, []);

  return estado;
}

type PropsPildora = {
  tasa: DatosTasa | null;
  cargando?: boolean;
  className?: string;
};

/**
 * Píldora de la tasa BCV: círculo rojo "Bs" (el mismo rojo del círculo de "Pregúntanos"), grande y en negrita
 * porque es el que dice la moneda, + la cifra sola (sin repetir "Bs.").
 * Crece con la cifra y nunca la corta (`whitespace-nowrap`, sin ancho fijo); dígitos de ancho parejo
 * (`tabular-nums`) para que no salte al actualizarse. La fecha sale al pasar el mouse o enfocar. Mide lo mismo que el buscador (alto, borde y redondeo).
 * La bola va concéntrica con la píldora: 40px dentro de los 44px interiores, con 2px a cada lado (`pl-0.5`).
 */
export function PildoraTasa({ tasa, cargando = false, className = "" }: PropsPildora) {
  if (cargando) {
    // Cargando: la misma píldora, con el círculo apagado y dos líneas que brillan (nunca una caja gris vacía).
    return (
      <span
        className={`relative flex h-12 w-32 shrink-0 items-center gap-2.5 overflow-hidden rounded-chip border-2 border-gris-borde bg-pico-blanco py-1 pr-5 pl-0.5 shadow-tarjeta lg:w-40 ${className}`}
        aria-label="Cargando la tasa BCV"
        role="status"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-chip bg-pico-rojo/25 text-[15px] leading-none font-extrabold tracking-tight text-pico-blanco">Bs</span>
        <span className="flex flex-1 flex-col gap-1.5">
          <span className="hidden h-1.5 w-12 rounded-chip bg-gris-borde lg:block" />
          <span className="h-2.5 w-14 rounded-chip bg-gris-borde" />
        </span>
        <span className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-pico-blanco/80 to-transparent motion-safe:animate-brillo" aria-hidden />
      </span>
    );
  }

  // A la vista, solo el monto: la bola roja ya dice "Bs". El lector de pantalla sí lo oye con la moneda.
  const cifra = tasa ? formatoTasa.format(tasa.tasa) : null;
  const detalle = !tasa
    ? "Tasa no disponible por ahora"
    : tasa.fecha
      ? `Actualizada el ${textoFecha(tasa.fecha)}`
      : "Tasa oficial del BCV";

  return (
    <span
      tabIndex={0}
      className={`group/tasa relative flex h-12 w-auto shrink-0 cursor-default items-center gap-2.5 rounded-chip border-2 border-gris-borde bg-pico-blanco py-1 pr-5 pl-0.5 whitespace-nowrap shadow-tarjeta transition duration-200 hover:border-pico-azul/25 hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul ${className}`}
      aria-label={cifra ? `Tasa BCV: Bs. ${cifra}. ${detalle}` : "Tasa BCV no disponible por ahora"}
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-chip text-[15px] leading-none font-extrabold tracking-tight text-pico-blanco shadow-boton-hover transition-transform duration-300 motion-safe:group-hover/tasa:scale-105 ${
          cifra ? "bg-pico-rojo" : "bg-gris-texto/40"
        }`}
        aria-hidden
      >
        Bs
      </span>
      <span className="flex flex-col leading-none" aria-hidden>
        <span className="mb-0.5 hidden text-[10px] font-semibold tracking-[0.14em] text-gris-texto uppercase lg:block">
          Tasa BCV
        </span>
        {cifra ? (
          <span className="text-sm font-bold text-pico-azul tabular-nums">{cifra}</span>
        ) : (
          <span className="text-xs font-semibold text-gris-texto">No disponible</span>
        )}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full right-0 z-20 mt-2 rounded-boton bg-pico-azul-oscuro px-3 py-1.5 text-xs font-medium text-pico-blanco opacity-0 shadow-tarjeta-hover transition-opacity duration-200 group-hover/tasa:opacity-100 group-focus-visible/tasa:opacity-100"
      >
        Tasa BCV · {detalle}
      </span>
    </span>
  );
}

/** Indicador de la tasa BCV del header. Si no hay tasa, muestra el último valor conocido o un guion. */
export default function TasaBCV({ className = "" }: { className?: string }) {
  const { tasa, cargando } = useTasaBCV();
  return <PildoraTasa tasa={tasa} cargando={cargando} className={className} />;
}
