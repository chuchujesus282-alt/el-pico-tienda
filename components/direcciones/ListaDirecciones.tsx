"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CircleCheck, MapPinPlus, Pencil, Trash2 } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { MAXIMO_DIRECCIONES } from "@/lib/direcciones";
import type { Direccion } from "@/types/cliente";
import { useDirecciones } from "./almacenDirecciones";
import MiniMapa from "./MiniMapa";

const claseAccion =
  "area-tactil inline-flex cursor-pointer items-center gap-1.5 rounded-chip px-3 py-1.5 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul";

/** Cuánto tarda cada tarjeta en entrar después de la anterior (ms). */
const CASCADA = 90;

/** Las direcciones guardadas, cada una con su mapita, y el botón para agregar otra. */
export default function ListaDirecciones({ bienvenida }: { bienvenida?: string }) {
  const { direcciones, elegida, listo, lleno, elegir, quitar } = useDirecciones();

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {bienvenida && (
        <div className="relative flex items-start gap-4 overflow-hidden rounded-banner border border-gris-borde bg-pico-blanco p-5 shadow-tarjeta motion-safe:animate-aparecer md:items-center md:p-6">
          {/* Filete rojo que recorre el borde de arriba, como el del pie. */}
          <span className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-pico-rojo/15" aria-hidden>
            <span className="block h-full w-1/4 bg-pico-rojo motion-safe:animate-destello" />
          </span>
          <span className="relative flex size-12 shrink-0 items-center justify-center">
            <span className="absolute inset-0 rounded-chip bg-pico-rojo/20 opacity-0 motion-safe:animate-onda" aria-hidden />
            <CircleCheck className="relative size-11 text-pico-rojo motion-safe:animate-latido" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="text-lg font-bold text-pico-azul md:text-xl">¡Listo, {bienvenida}! Tu cuenta ya está creada.</p>
            <p className="mt-1 text-[15px] text-gris-texto">
              Ahora guarda dónde quieres recibir tus pedidos. Puedes tener varias direcciones y elegir una en cada compra.
            </p>
          </div>
        </div>
      )}

      {!listo ? (
        <ul className="grid gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-80 animate-pulse rounded-banner bg-pico-blanco shadow-tarjeta motion-reduce:animate-none" />
          ))}
        </ul>
      ) : direcciones.length === 0 ? (
        <Vacio />
      ) : (
        <section aria-labelledby="titulo-direcciones" className="flex flex-col gap-4 md:gap-5">
          <div className="flex items-center justify-between gap-4 motion-safe:animate-aparecer">
            <h2 id="titulo-direcciones" className="flex items-center gap-2.5 text-xl font-bold text-pico-azul md:text-2xl">
              Tus direcciones
              <span
                key={direcciones.length}
                className="flex h-7 min-w-7 items-center justify-center rounded-chip bg-pico-azul px-2 text-sm font-bold text-pico-blanco tabular-nums motion-safe:animate-latido"
              >
                {direcciones.length}
              </span>
            </h2>
            {lleno ? (
              <p className="text-right text-[13px] text-gris-texto">Llegaste al máximo de {MAXIMO_DIRECCIONES}.</p>
            ) : (
              <Boton href="/mis-direcciones/nueva" className="h-11! shrink-0 px-4!">
                <MapPinPlus className="size-5 transition-transform duration-300 motion-safe:group-hover/boton:-rotate-12 motion-safe:group-hover/boton:scale-110" aria-hidden />
                Agregar<span className="hidden sm:inline"> dirección</span>
              </Boton>
            )}
          </div>
          <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
            {direcciones.map((d, i) => (
              <li key={d.id} className="motion-safe:animate-aparecer" style={{ animationDelay: `${i * CASCADA}ms` }}>
                <Tarjeta
                  direccion={d}
                  elegida={elegida?.id === d.id}
                  retraso={i * CASCADA + 200}
                  alElegir={() => elegir(d.id)}
                  alQuitar={() => quitar(d.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** Sin direcciones: el pin flota sobre una onda que se expande, invitando a marcar la primera. */
function Vacio() {
  return (
    <div className="flex flex-col items-center rounded-banner border-2 border-dashed border-pico-azul/20 bg-pico-blanco px-6 py-14 text-center motion-safe:animate-aparecer md:py-20">
      <span className="relative flex size-24 items-center justify-center">
        <span className="absolute inset-2 rounded-chip bg-pico-azul/10 [animation-duration:2.4s] motion-safe:animate-ping" aria-hidden />
        <span className="relative flex size-20 items-center justify-center rounded-chip bg-gradient-to-b from-pico-azul-claro to-pico-blanco text-pico-azul ring-1 ring-pico-azul/15">
          <MapPinPlus className="size-9 motion-safe:animate-flotar" strokeWidth={1.5} aria-hidden />
        </span>
      </span>
      <h2 className="mt-5 text-2xl font-bold text-pico-azul">Aún no tienes direcciones</h2>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-gris-texto">
        Marca en el mapa dónde recibes tus pedidos (tu casa, la obra, la oficina) y no tendrás que explicarlo cada vez.
      </p>
      <Boton href="/mis-direcciones/nueva" className="mt-7 h-12! px-6! text-base!">
        <MapPinPlus className="size-5 transition-transform duration-300 motion-safe:group-hover/boton:-rotate-12" aria-hidden />
        Agregar mi primera dirección
      </Boton>
    </div>
  );
}

type PropsTarjeta = { direccion: Direccion; elegida: boolean; retraso: number; alElegir: () => void; alQuitar: () => void };

function Tarjeta({ direccion: d, elegida, retraso, alElegir, alQuitar }: PropsTarjeta) {
  const [confirmando, setConfirmando] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  // La tarjeta se encoge y se desvanece antes de borrarse (con "reducir movimiento", se borra de una vez).
  const borrar = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return alQuitar();
    setSaliendo(true);
    setTimeout(alQuitar, 280);
  };

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-banner border-2 bg-pico-blanco transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        elegida ? "border-pico-azul shadow-tarjeta-hover" : "border-transparent shadow-tarjeta hover:shadow-tarjeta-hover"
      } ${saliendo ? "pointer-events-none animate-salir" : "motion-safe:hover:-translate-y-1"}`}
    >
      <div className="relative">
        <MiniMapa ubicacion={d} destacado={elegida} retraso={retraso} className="h-40 w-full" />
        {elegida && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-chip bg-pico-azul px-2.5 py-1 text-xs font-bold text-pico-blanco shadow-tarjeta motion-safe:animate-latido">
            <Check className="size-3.5" strokeWidth={3} aria-hidden />
            Seleccionada
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pt-3 pb-4">
        <h3 className="text-lg leading-tight font-bold text-pico-azul">{d.nombre}</h3>
        <p className="mt-1 mb-4 line-clamp-2 text-sm leading-relaxed text-gris-texto">{d.descripcion}</p>

        <div className="mt-auto flex min-h-11 items-center justify-between gap-2 border-t border-gris-borde pt-3">
          {confirmando ? (
            <div className="flex w-full items-center justify-between gap-2 motion-safe:animate-aparecer">
              <span className="text-sm font-semibold text-pico-azul">¿Borrar esta dirección?</span>
              <span className="flex gap-1.5">
                <button type="button" onClick={() => setConfirmando(false)} className={`${claseAccion} text-gris-texto hover:bg-gris-fondo`}>
                  No
                </button>
                <button type="button" onClick={borrar} className={`${claseAccion} bg-pico-rojo text-pico-blanco hover:bg-pico-rojo-oscuro`}>
                  Sí, borrar
                </button>
              </span>
            </div>
          ) : (
            <>
              {elegida ? (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-pico-azul">
                  <span className="relative flex size-2" aria-hidden>
                    <span className="absolute inset-0 rounded-chip bg-estado-abierto opacity-60 motion-safe:animate-ping" />
                    <span className="relative size-2 rounded-chip bg-estado-abierto" />
                  </span>
                  Tus pedidos llegan aquí
                </span>
              ) : (
                <button
                  type="button"
                  onClick={alElegir}
                  className={`${claseAccion} border border-pico-azul/20 text-pico-azul hover:border-pico-azul hover:bg-pico-azul hover:text-pico-blanco`}
                >
                  Usar esta
                </button>
              )}
              <span className="flex gap-1">
                <Link
                  href={`/mis-direcciones/nueva?editar=${encodeURIComponent(d.id)}`}
                  aria-label={`Editar ${d.nombre}`}
                  className={`${claseAccion} group/editar text-pico-azul hover:bg-pico-azul-claro`}
                >
                  <Pencil className="size-4 transition-transform duration-300 motion-safe:group-hover/editar:-rotate-12" aria-hidden />
                  <span className="sr-only sm:not-sr-only">Editar</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmando(true)}
                  aria-label={`Borrar ${d.nombre}`}
                  className={`${claseAccion} group/borrar text-gris-texto hover:bg-pico-rojo/10 hover:text-pico-rojo`}
                >
                  <Trash2 className="size-4 motion-safe:group-hover/borrar:animate-sacudir" aria-hidden />
                </button>
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
