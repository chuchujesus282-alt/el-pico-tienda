"use client";

import { useSyncExternalStore } from "react";
import { CalendarCheck, CalendarDays, Clock, PartyPopper, Sun } from "lucide-react";
import type { ReactNode } from "react";
import Badge from "@/components/ui/Badge";
import TarjetaInfo from "@/components/ui/TarjetaInfo";
import { HORARIO, estadoTienda, formatearFranja, proximosFeriados, type TipoDia } from "@/lib/horario";

// El estado depende de la hora: se calcula en el navegador y se actualiza cada 30 s.
// En el servidor no se sabe la hora del cliente, así que se dibuja sin "Abierto/Cerrado".

function suscribir(avisar: () => void) {
  const id = setInterval(avisar, 30_000);
  return () => clearInterval(id);
}
const minutoActual = () => Math.floor(Date.now() / 60_000);
const enServidor = () => null;

const ICONOS: Record<TipoDia, ReactNode> = {
  semana: <CalendarDays className="size-5" aria-hidden />,
  "sabado-feriado": <CalendarCheck className="size-5" aria-hidden />,
  domingo: <Sun className="size-5" aria-hidden />,
};

const NOTAS: Record<TipoDia, string> = {
  semana: "Horario corrido, sin cerrar al mediodía.",
  "sabado-feriado": "También aplica en Carnaval, Semana Santa y fechas patrias.",
  domingo: "Jornada corta para tus compras del fin de semana.",
};

const formatoFeriado = new Intl.DateTimeFormat("es-VE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

function EstadoActual({ ahora }: { ahora: Date | null }) {
  if (!ahora) {
    return <div className="h-[4.5rem] animate-pulse rounded-tarjeta bg-gris-borde/60" aria-hidden />;
  }
  const estado = estadoTienda(ahora);
  return (
    <div
      role="status"
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-tarjeta border px-5 py-4 motion-safe:animate-aparecer ${
        estado.abierta ? "border-pico-azul/20 bg-pico-azul-claro" : "border-pico-rojo/20 bg-pico-rojo/5"
      }`}
    >
      <span className={`flex items-center gap-2.5 text-lg font-bold ${estado.abierta ? "text-pico-azul" : "text-pico-rojo"}`}>
        <span className="relative flex size-3" aria-hidden>
          {estado.abierta && (
            <span className="absolute inline-flex size-full rounded-chip bg-pico-azul opacity-60 motion-safe:animate-ping" />
          )}
          <span className={`relative inline-flex size-3 rounded-chip ${estado.abierta ? "bg-pico-azul" : "bg-pico-rojo"}`} />
        </span>
        {estado.abierta ? "Abierto ahora" : "Cerrado ahora"}
      </span>
      <span className="text-sm text-texto">
        {estado.detalle}
        {estado.feriadoHoy && <span className="text-gris-texto"> · Hoy es feriado: {estado.feriadoHoy}</span>}
      </span>
    </div>
  );
}

export default function HorarioEnVivo() {
  const minuto = useSyncExternalStore(suscribir, minutoActual, enServidor);
  const ahora = minuto === null ? null : new Date(minuto * 60_000);
  const tipoHoy = ahora ? estadoTienda(ahora).tipoHoy : null;
  const feriados = ahora ? proximosFeriados(ahora, 3) : [];

  return (
    <div className="space-y-4 md:space-y-6">
      <EstadoActual ahora={ahora} />

      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        {(Object.keys(HORARIO) as TipoDia[]).map((tipo) => (
          <TarjetaInfo
            key={tipo}
            icono={ICONOS[tipo]}
            titulo={HORARIO[tipo].dias}
            destacada={tipo === tipoHoy}
            extra={tipo === tipoHoy ? <Badge variante="oferta">Hoy</Badge> : undefined}
          >
            <p className="flex items-center gap-2 text-2xl font-bold tracking-tight text-texto">
              <Clock className="size-5 shrink-0 text-pico-rojo" aria-hidden />
              {formatearFranja(HORARIO[tipo].franja)}
            </p>
            <p className="text-[13px] text-gris-texto">{NOTAS[tipo]}</p>
          </TarjetaInfo>
        ))}
      </div>

      <TarjetaInfo icono={<PartyPopper className="size-5" aria-hidden />} titulo="Próximos feriados">
        <p className="text-sm text-gris-texto">
          En feriado abrimos de {formatearFranja(HORARIO["sabado-feriado"].franja)}, igual que los sábados.
        </p>
        {feriados.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-3">
            {feriados.map(({ dia, nombre }) => (
              <li key={`${dia.anio}-${dia.mes}-${dia.dia}`} className="rounded-boton bg-gris-fondo px-3 py-2.5">
                <span className="block text-sm font-semibold text-pico-azul">{nombre}</span>
                <span className="block text-[13px] text-gris-texto first-letter:uppercase">
                  {formatoFeriado.format(new Date(Date.UTC(dia.anio, dia.mes - 1, dia.dia)))}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-16 animate-pulse rounded-boton bg-gris-fondo" aria-hidden />
        )}
      </TarjetaInfo>
    </div>
  );
}
