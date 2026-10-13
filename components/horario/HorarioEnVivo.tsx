"use client";

import { useSyncExternalStore } from "react";
import { HORARIO, estadoTienda, formatearFranja, type TipoDia } from "@/lib/horario";

// El estado depende de la hora: se calcula en el navegador y se actualiza cada 30 s.
// En el servidor no se sabe la hora del cliente, así que se dibuja sin "Abierto/Cerrado".

function suscribir(avisar: () => void) {
  const id = setInterval(avisar, 30_000);
  return () => clearInterval(id);
}
const minutoActual = () => Math.floor(Date.now() / 60_000);
const enServidor = () => null;

/** Una tarjeta: arriba si está abierto ahora; debajo, los tres horarios con el de hoy resaltado. */
export default function HorarioEnVivo() {
  const minuto = useSyncExternalStore(suscribir, minutoActual, enServidor);
  const estado = minuto === null ? null : estadoTienda(new Date(minuto * 60_000));

  return (
    <section className="overflow-hidden rounded-tarjeta border border-gris-borde bg-pico-blanco shadow-tarjeta">
      <div className="flex min-h-14 items-center border-b border-gris-borde px-5 py-3 md:px-6" role="status">
        {estado && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 motion-safe:animate-aparecer">
            <span className={`flex items-center gap-2 text-lg font-bold ${estado.abierta ? "text-estado-abierto" : "text-pico-rojo"}`}>
              <span className={`size-2.5 rounded-chip ${estado.abierta ? "bg-estado-abierto" : "bg-pico-rojo"}`} aria-hidden />
              {estado.abierta ? "Abierto ahora" : "Cerrado ahora"}
            </span>
            <span className="text-sm text-gris-texto">{estado.detalle}</span>
          </p>
        )}
      </div>

      <ul>
        {(Object.keys(HORARIO) as TipoDia[]).map((tipo) => {
          const hoy = tipo === estado?.tipoHoy;
          return (
            <li
              key={tipo}
              className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-gris-borde px-5 py-4 last:border-b-0 md:px-6 ${
                hoy ? "bg-pico-azul-claro" : ""
              }`}
            >
              <span className="flex items-center gap-2 text-base font-semibold text-pico-azul">
                {HORARIO[tipo].dias}
                {hoy && <span className="rounded-chip bg-pico-rojo px-2 py-0.5 text-xs font-semibold text-pico-blanco">Hoy</span>}
              </span>
              <span className="text-base font-bold text-texto">{formatearFranja(HORARIO[tipo].franja)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
