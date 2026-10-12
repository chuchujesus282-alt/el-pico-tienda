"use client";

import { useCallback, useState } from "react";
import { Hand, Minus, Plus } from "lucide-react";
import { Montanas } from "@/components/layout/Logo";
import { TIENDA } from "@/lib/tienda";
import SelectorMapas from "./SelectorMapas";

// Mapa de OpenStreetMap (sin claves ni costos) centrado en la tienda. Nuestro pin va encima, en el centro.
// Al tocar el mapa se abre el selector para ir con Google Maps, Waze o Apple Maps.

/** Cuánto se ve alrededor de la tienda (grados de ancho), de cerca a lejos. */
const NIVELES = [
  { nombre: "calle", ancho: 0.012 },
  { nombre: "sector", ancho: 0.035 },
  { nombre: "zona", ancho: 0.09 },
  { nombre: "ciudad", ancho: 0.24 },
];
const NIVEL_INICIAL = 2;

function urlMapa(ancho: number) {
  const alto = ancho * 0.6;
  const bbox = [
    TIENDA.longitud - ancho / 2,
    TIENDA.latitud - alto / 2,
    TIENDA.longitud + ancho / 2,
    TIENDA.latitud + alto / 2,
  ]
    .map((n) => n.toFixed(5))
    .join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
}

const claseZoom =
  "flex size-10 cursor-pointer items-center justify-center bg-pico-blanco text-pico-azul transition-colors hover:bg-pico-azul hover:text-pico-blanco disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-pico-blanco disabled:hover:text-pico-azul focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pico-azul";

export default function MapaTienda({ className = "" }: { className?: string }) {
  const [nivel, setNivel] = useState(NIVEL_INICIAL);
  const [abierto, setAbierto] = useState(false);
  const cerrar = useCallback(() => setAbierto(false), []);

  return (
    <div
      className={`relative isolate h-[360px] overflow-hidden rounded-banner border border-gris-borde bg-gris-fondo shadow-tarjeta md:h-[460px] ${className}`}
    >
      <iframe
        key={nivel}
        src={urlMapa(NIVELES[nivel].ancho)}
        title={`Mapa: ${TIENDA.nombre}, ${TIENDA.direccion.join(", ")}`}
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-full w-full border-0"
      />

      {/* Todo el mapa es un botón: abre el selector de apps. */}
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="group absolute inset-0 z-10 cursor-pointer focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-pico-azul"
        aria-label="Abrir la ubicación de la tienda en Google Maps, Waze o Apple Maps"
        aria-haspopup="dialog"
      >
        {/* Pin de El Pico en el centro exacto (la punta marca la tienda). */}
        <span className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
          <span className="mb-1.5 rounded-chip bg-pico-azul px-3 py-1 text-xs font-bold whitespace-nowrap text-pico-blanco shadow-tarjeta-hover">
            Centro Ferretero El Pico
          </span>
          <span className="relative flex size-12 items-center justify-center rounded-chip border-[3px] border-pico-blanco bg-pico-rojo shadow-tarjeta-hover transition-transform duration-300 motion-safe:group-hover:-translate-y-1">
            <Montanas className="w-7 fill-pico-blanco" />
          </span>
          <span className="-mt-1 size-3 rotate-45 border-r-[3px] border-b-[3px] border-pico-blanco bg-pico-rojo" aria-hidden />
        </span>
        {/* Onda que late sobre el punto exacto. */}
        <span className="pointer-events-none absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-chip bg-pico-rojo/40 motion-safe:animate-ping" aria-hidden />

        <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-chip bg-pico-blanco/95 px-4 py-2 text-[13px] font-semibold whitespace-nowrap text-pico-azul shadow-tarjeta transition-colors group-hover:bg-pico-azul group-hover:text-pico-blanco">
          <Hand className="size-4" aria-hidden />
          Toca el mapa para abrirlo en tu app
        </span>
      </button>

      {/* Acercar / alejar (encima del botón). */}
      <div className="absolute top-3 right-3 z-20 flex flex-col overflow-hidden rounded-boton border border-gris-borde shadow-tarjeta">
        <button
          type="button"
          onClick={() => setNivel((n) => Math.max(0, n - 1))}
          disabled={nivel === 0}
          className={`${claseZoom} border-b border-gris-borde`}
          aria-label="Acercar el mapa"
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setNivel((n) => Math.min(NIVELES.length - 1, n + 1))}
          disabled={nivel === NIVELES.length - 1}
          className={claseZoom}
          aria-label="Alejar el mapa (ver la ciudad)"
        >
          <Minus className="size-4" />
        </button>
      </div>

      <SelectorMapas abierto={abierto} cerrar={cerrar} />
    </div>
  );
}
