"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Check, ChevronDown, MapPin, MapPinPlus, X } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { useDirecciones } from "./almacenDirecciones";

const sinSuscripcion = () => () => {};

/**
 * "Entregar en" del header, entre la tasa BCV y las calculadoras: misma píldora que la tasa (alto, borde,
 * círculo rojo) para que se vean como pareja. Abre la lista de direcciones guardadas para elegir a dónde
 * va el pedido; en finalizar pedido sale ya marcada (allí se puede cambiar, y esa es la que va a WhatsApp).
 * Con el texto solo en pantallas anchas (2xl), donde sobra ese espacio; antes es solo el círculo, para no
 * apretar el buscador. En el teléfono la lista sube como hoja desde abajo.
 */
export default function SelectorDireccion({ className = "" }: { className?: string }) {
  const { direcciones, elegida, elegir } = useDirecciones();
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  const [abierto, setAbierto] = useState(false);
  // Desde 768px la lista cae bajo la píldora; aquí se guarda dónde.
  const [posicion, setPosicion] = useState<{ top: number; left: number } | null>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const idTitulo = useId();

  const abrir = () => {
    const r = boton.current?.getBoundingClientRect();
    if (r) setPosicion({ top: r.bottom + 10, left: Math.max(16, Math.min(r.left, window.innerWidth - 384 - 16)) });
    setAbierto(true);
  };

  useEffect(() => {
    if (!abierto) return;
    const cerrar = () => setAbierto(false);
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      cerrar();
      boton.current?.focus();
    };
    const escritorio = window.matchMedia("(min-width: 768px)").matches;
    const overflowPrevio = document.body.style.overflow;
    if (!escritorio) document.body.style.overflow = "hidden";
    document.addEventListener("keydown", alPresionar);
    // En escritorio la lista va pegada a la píldora: si la página se mueve, se cierra.
    if (escritorio) window.addEventListener("resize", cerrar);
    if (escritorio) window.addEventListener("scroll", cerrar, { passive: true });
    // Al abrir, el foco va a la dirección elegida (o al primer control).
    (panel.current?.querySelector<HTMLElement>("[aria-checked='true']") ?? panel.current?.querySelector<HTMLElement>("button, a"))?.focus();
    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", alPresionar);
      window.removeEventListener("resize", cerrar);
      window.removeEventListener("scroll", cerrar);
    };
  }, [abierto]);

  const nombre = montado ? elegida?.nombre : undefined;

  return (
    <>
      <button
        ref={boton}
        type="button"
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-label={nombre ? `Entregar en ${nombre}. Cambiar dirección` : "Elegir dirección de entrega"}
        className={`group/dir flex h-12 shrink-0 cursor-pointer items-center gap-2.5 rounded-chip border-2 border-gris-borde bg-pico-blanco p-1.5 shadow-tarjeta transition duration-200 hover:border-pico-azul/25 hover:shadow-tarjeta-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul 2xl:pr-4 ${className}`}
      >
        {/* Placa azul clara con el pin; al pasar el mouse (o abierta) se vuelve azul marino y el pin da un saltito. */}
        <span
          className={`relative flex size-9 shrink-0 items-center justify-center rounded-chip ring-1 transition-colors duration-300 ${
            abierto
              ? "bg-pico-azul text-pico-blanco ring-pico-azul"
              : "bg-gradient-to-b from-pico-azul-claro to-pico-blanco text-pico-azul ring-pico-azul/15 group-hover/dir:bg-pico-azul group-hover/dir:from-pico-azul group-hover/dir:to-pico-azul group-hover/dir:text-pico-blanco"
          }`}
        >
          <MapPin
            className="size-[18px] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/dir:-translate-y-0.5"
            strokeWidth={2.25}
            aria-hidden
          />
          {/* Punto rojo que late: aún no hay dirección elegida. */}
          {montado && !elegida && (
            <span className="absolute -top-0.5 -right-0.5 flex size-3" aria-hidden>
              <span className="absolute inset-0 rounded-chip bg-pico-rojo opacity-60 motion-safe:animate-ping" />
              <span className="relative size-3 rounded-chip bg-pico-rojo ring-2 ring-pico-blanco" />
            </span>
          )}
        </span>
        <span className="hidden min-w-0 flex-col items-start leading-none 2xl:flex" aria-hidden>
          <span className="mb-0.5 text-[10px] font-semibold tracking-[0.14em] text-gris-texto uppercase">Entregar en</span>
          <span key={nombre ?? "-"} className="max-w-40 truncate text-sm font-bold text-pico-azul motion-safe:animate-aparecer">
            {nombre ?? "Elige dirección"}
          </span>
        </span>
        <ChevronDown
          className={`hidden size-4 shrink-0 text-pico-azul transition-transform duration-300 2xl:block ${abierto ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {montado &&
        createPortal(
          <div className={`fixed inset-0 z-50 ${abierto ? "" : "pointer-events-none"}`} inert={!abierto}>
            <div
              className={`absolute inset-0 bg-texto/40 transition-opacity duration-300 md:bg-transparent ${abierto ? "opacity-100" : "opacity-0"}`}
              onClick={() => setAbierto(false)}
              aria-hidden
            />
            <div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby={idTitulo}
              style={posicion ? ({ "--arriba": `${posicion.top}px`, "--izquierda": `${posicion.left}px` } as CSSProperties) : undefined}
              className={`absolute inset-x-0 bottom-0 flex max-h-[80dvh] flex-col rounded-t-banner bg-pico-blanco pb-[env(safe-area-inset-bottom)] shadow-tarjeta-hover transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:inset-x-auto md:top-(--arriba) md:bottom-auto md:left-(--izquierda) md:max-h-[min(32rem,calc(100dvh-var(--arriba)-1rem))] md:w-96 md:rounded-banner md:border md:border-gris-borde md:pb-0 ${
                abierto
                  ? "translate-y-0 opacity-100"
                  : "translate-y-full opacity-0 md:-translate-y-2 motion-reduce:translate-y-0"
              }`}
            >
              <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-chip bg-gris-borde md:hidden" aria-hidden />
              <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
                <div>
                  <h2 id={idTitulo} className="text-lg leading-tight font-bold text-pico-azul">
                    ¿A dónde va tu pedido?
                  </h2>
                  <p className="mt-1 text-[13px] text-gris-texto">Puedes cambiarla al finalizar el pedido.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar"
                  className="-mt-1 -mr-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-chip text-gris-texto transition-colors hover:bg-gris-fondo hover:text-pico-azul focus-visible:outline-2 focus-visible:outline-pico-azul"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              {direcciones.length > 0 ? (
                <ul role="radiogroup" aria-labelledby={idTitulo} className="flex flex-col gap-1 overflow-y-auto overscroll-contain px-3">
                  {direcciones.map((d, i) => {
                    const marcada = elegida?.id === d.id;
                    return (
                      // Al abrir, las direcciones entran en cascada.
                      <li
                        key={d.id}
                        className={abierto ? "motion-safe:animate-aparecer" : ""}
                        style={{ animationDelay: `${80 + i * 60}ms` }}
                      >
                        <button
                          type="button"
                          role="radio"
                          aria-checked={marcada}
                          onClick={() => {
                            elegir(d.id);
                            setAbierto(false);
                          }}
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-tarjeta px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pico-azul ${
                            marcada ? "bg-pico-azul-claro" : "hover:bg-gris-fondo"
                          }`}
                        >
                          <span
                            className={`flex size-10 shrink-0 items-center justify-center rounded-chip transition-colors ${
                              marcada ? "bg-pico-azul text-pico-blanco" : "bg-gris-fondo text-pico-azul"
                            }`}
                          >
                            {marcada ? <Check className="size-5" strokeWidth={2.5} aria-hidden /> : <MapPin className="size-5" aria-hidden />}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-bold text-pico-azul">{d.nombre}</span>
                            <span className="block truncate text-[13px] text-gris-texto">{d.descripcion}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mx-5 rounded-tarjeta bg-gris-fondo px-4 py-5 text-center text-sm text-gris-texto">
                  Aún no tienes direcciones guardadas. Agrega una y aparecerá aquí.
                </p>
              )}

              <div className="mt-3 flex flex-col gap-2 border-t border-gris-borde px-5 pt-4 pb-5">
                <Boton href="/mis-direcciones/nueva" anchoCompleto onClick={() => setAbierto(false)} className="h-11">
                  <MapPinPlus className="size-4.5" aria-hidden />
                  Agregar dirección
                </Boton>
                {direcciones.length > 0 && (
                  <Link
                    href="/mis-direcciones"
                    onClick={() => setAbierto(false)}
                    className="area-tactil self-center text-sm font-semibold text-pico-azul underline-offset-4 hover:underline"
                  >
                    Ver mis direcciones
                  </Link>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
