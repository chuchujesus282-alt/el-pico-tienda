"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapaLeaflet } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Hand, LoaderCircle, LocateFixed, Minus, Plus } from "lucide-react";
import { CENTRO_INICIAL } from "@/lib/direcciones";
import type { Ubicacion } from "@/types/cliente";
import { PinMapa } from "./PinMapa";

// Mapa para marcar una dirección: el pin queda fijo en el centro y el cliente mueve el mapa debajo
// (como en las apps de delivery; con el dedo es más fácil que arrastrar un pin chiquito).
// Leaflet + mosaicos de OpenStreetMap, sin claves ni costos. Se carga solo en el navegador.

type Props = {
  /** Punto guardado (al editar). Sin él, abre en Caracas, más lejos. */
  inicial: Ubicacion | null;
  alMover: (ubicacion: Ubicacion) => void;
  className?: string;
};

const claseControl =
  "flex size-11 cursor-pointer items-center justify-center bg-pico-blanco text-pico-azul transition-colors hover:bg-pico-azul hover:text-pico-blanco focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pico-azul disabled:cursor-wait disabled:opacity-60";

export default function MapaElegirPunto({ inicial, alMover, className = "" }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLeaflet | null>(null);
  // El aviso se lee del ref para no volver a crear el mapa si el padre pasa otra función.
  const aviso = useRef(alMover);
  const [moviendo, setMoviendo] = useState(false);
  // Cuántas veces se soltó el mapa: cada vez sale una onda nueva bajo el pin.
  const [asentado, setAsentado] = useState(0);
  // El aviso de arriba se va en cuanto el cliente mueve el mapa.
  const [movido, setMovido] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    aviso.current = alMover;
  }, [alMover]);

  useEffect(() => {
    let vigente = true;
    import("leaflet").then(({ default: L }) => {
      if (!vigente || !contenedor.current || mapa.current) return;
      const centro = inicial ?? CENTRO_INICIAL;
      const m = L.map(contenedor.current, {
        center: [centro.latitud, centro.longitud],
        zoom: inicial ? 17 : 13,
        minZoom: 6,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: false,
        // Fuera de Venezuela no se entrega: el mapa no deja irse lejos.
        maxBounds: [
          [0, -74],
          [13, -59],
        ],
        maxBoundsViscosity: 0.8,
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(m);
      L.control.attribution({ prefix: false, position: "bottomright" }).addAttribution("© OpenStreetMap").addTo(m);

      const informar = () => {
        const c = m.getCenter();
        aviso.current({ latitud: c.lat, longitud: c.lng });
      };
      m.on("movestart", () => setMoviendo(true));
      m.on("dragstart zoomstart", () => setMovido(true));
      m.on("moveend", () => {
        setMoviendo(false);
        setAsentado((n) => n + 1);
        informar();
      });
      mapa.current = m;
      informar();
    });
    return () => {
      vigente = false;
      mapa.current?.remove();
      mapa.current = null;
    };
    // El mapa se crea una sola vez; `inicial` solo decide dónde abre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const irAMiUbicacion = () => {
    if (!("geolocation" in navigator)) {
      setError("Tu navegador no comparte la ubicación. Mueve el mapa a mano.");
      return;
    }
    setBuscando(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBuscando(false);
        mapa.current?.flyTo([coords.latitude, coords.longitude], 17, { duration: 0.8 });
      },
      () => {
        setBuscando(false);
        setError("No pudimos ver tu ubicación. Revisa el permiso o mueve el mapa a mano.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <div className={`relative isolate overflow-hidden bg-pico-azul-claro ${className}`}>
      <div
        ref={contenedor}
        className="absolute inset-0 z-0 [&_.leaflet-control-attribution]:bg-pico-blanco/80! [&_.leaflet-control-attribution]:text-[10px]! [&_.leaflet-control-attribution]:text-gris-texto!"
        role="application"
        aria-label="Mapa. Muévelo hasta que el pin quede sobre el lugar de entrega."
      />

      {/* Pin fijo en el centro: cae al abrir, se levanta mientras el mapa se mueve y al soltarlo baja
          y deja una onda en el punto exacto. */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-10" aria-hidden>
        {asentado > 0 && (
          <span key={asentado} className="absolute -top-7 -left-7 size-14 rounded-chip bg-pico-rojo/30 opacity-0 motion-safe:animate-onda" />
        )}
        <span
          className={`absolute top-0 left-1/2 h-2 w-4 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-pico-azul-oscuro/35 blur-[1px] transition duration-300 ease-out ${
            moviendo ? "scale-150 opacity-40" : "scale-100 opacity-100"
          }`}
        />
        <span className="absolute top-0 left-0 motion-safe:animate-caer">
          <span
            className={`block transition-transform ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
              moviendo ? "-translate-y-3 duration-200" : "translate-y-0 duration-500"
            }`}
          >
            <PinMapa className="absolute top-0 left-0 h-13 -translate-x-1/2 -translate-y-full" />
          </span>
        </span>
      </div>

      <p
        className={`pointer-events-none absolute inset-x-0 top-3 z-10 mx-auto flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-chip bg-pico-azul/90 px-4 py-2 text-center text-[13px] font-semibold text-pico-blanco shadow-tarjeta-hover transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          movido ? "-translate-y-3 opacity-0" : "translate-y-0 opacity-100 motion-safe:animate-aparecer"
        }`}
      >
        <Hand className="size-4 shrink-0 motion-safe:animate-sacudir [animation-iteration-count:3]" aria-hidden />
        Mueve el mapa hasta tu puerta
      </p>

      {/* Zoom: arriba a la derecha, discreto (en el teléfono se acerca con los dedos). */}
      <div className="absolute top-3 right-3 z-10 hidden flex-col divide-y divide-gris-borde overflow-hidden rounded-boton shadow-tarjeta-hover md:flex">
        <button type="button" onClick={() => mapa.current?.zoomIn()} aria-label="Acercar" className={claseControl}>
          <Plus className="size-5" aria-hidden />
        </button>
        <button type="button" onClick={() => mapa.current?.zoomOut()} aria-label="Alejar" className={claseControl}>
          <Minus className="size-5" aria-hidden />
        </button>
      </div>

      {/* "Usar mi ubicación": el atajo principal, centrado abajo y con su nombre a la vista. */}
      <div className="absolute inset-x-3 bottom-4 z-10 flex flex-col items-center gap-2">
        {error && (
          <p role="alert" className="max-w-sm rounded-boton bg-pico-blanco px-3 py-2 text-center text-[13px] text-pico-rojo shadow-tarjeta-hover motion-safe:animate-aparecer">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={irAMiUbicacion}
          disabled={buscando}
          className="group flex h-11 cursor-pointer items-center gap-2 rounded-chip bg-pico-blanco pr-5 pl-4 text-sm font-semibold text-pico-azul shadow-tarjeta-hover transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-pico-azul hover:text-pico-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul disabled:cursor-wait motion-safe:hover:-translate-y-0.5"
        >
          {buscando ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden />
          ) : (
            <LocateFixed className="size-5 transition-transform duration-500 motion-safe:group-hover:rotate-90" aria-hidden />
          )}
          {buscando ? "Buscando…" : "Usar mi ubicación"}
        </button>
      </div>
    </div>
  );
}
