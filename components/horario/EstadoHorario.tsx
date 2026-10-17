"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { estadoTienda } from "@/lib/horario";

// Igual que HorarioEnVivo: la hora es la del navegador, se revisa cada 30 s; en el servidor no se dibuja.
function suscribir(avisar: () => void) {
  const id = setInterval(avisar, 30_000);
  return () => clearInterval(id);
}
const minutoActual = () => Math.floor(Date.now() / 60_000);
const enServidor = () => null;

/** Estado de la tienda para el pie: punto que late, "Abierto/Cerrado ahora" y la frase de cuándo abre o cierra. */
export default function EstadoHorario() {
  const minuto = useSyncExternalStore(suscribir, minutoActual, enServidor);
  const estado = minuto === null ? null : estadoTienda(new Date(minuto * 60_000));
  if (!estado) return <span className="block h-11" aria-hidden />;

  return (
    <Link
      href="/horario"
      className="group inline-flex items-center gap-3 rounded-xl bg-pico-blanco/8 px-3.5 py-2 ring-1 ring-pico-blanco/12 ring-inset transition-colors hover:bg-pico-blanco/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-blanco motion-safe:animate-aparecer"
    >
      <span className="relative flex size-2.5" aria-hidden>
        {estado.abierta && <span className="absolute inset-0 rounded-chip bg-estado-abierto opacity-60 motion-safe:animate-ping" />}
        <span className={`relative size-2.5 rounded-chip ${estado.abierta ? "bg-estado-abierto" : "bg-pico-rojo"}`} />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-pico-blanco">{estado.abierta ? "Abierto ahora" : "Cerrado ahora"}</span>
        <span className="block text-xs text-pico-blanco/65">{estado.detalle}</span>
      </span>
    </Link>
  );
}
