"use client";

import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, MapPinOff } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { LARGO_DESCRIPCION, LARGO_NOMBRE, MAXIMO_DIRECCIONES, validarDireccion, type ErroresDireccion } from "@/lib/direcciones";
import type { Direccion, Ubicacion } from "@/types/cliente";
import { useDirecciones } from "./almacenDirecciones";
import MapaElegirPunto from "./MapaElegirPunto";

/** Nombres frecuentes: un toque y listo (se pueden cambiar). */
const SUGERENCIAS = ["Casa", "Trabajo", "Obra", "Oficina"];

const claseCampo =
  "w-full rounded-boton border bg-pico-blanco px-4 text-base text-texto outline-none transition-shadow placeholder:text-gris-texto focus:ring-4";
const bordes = (error?: string) =>
  error ? "border-pico-rojo focus:border-pico-rojo focus:ring-pico-rojo/15" : "border-gris-borde focus:border-pico-azul focus:ring-pico-azul-claro";

type Props = {
  /** Id de la dirección a editar; sin él, es una nueva. */
  editarId?: string;
  /** Ruta interna a la que se vuelve al guardar (ej. /finalizar-pedido). */
  volver?: string;
};

/** Agregar o editar una dirección: el mapa a un lado (arriba en el teléfono) y nombre + descripción al otro. */
export default function FormularioDireccion({ editarId, volver }: Props) {
  const { direcciones, listo, lleno } = useDirecciones();

  // Antes de leer el navegador no se sabe qué hay guardado: el mapa espera con su fondo.
  if (!listo) return <div className="h-[34rem] animate-pulse rounded-banner bg-pico-blanco shadow-tarjeta motion-reduce:animate-none" />;

  const existente = editarId ? direcciones.find((d) => d.id === editarId) : undefined;
  const salida = volver ?? "/mis-direcciones";

  if (editarId && !existente) {
    return (
      <Aviso titulo="Esa dirección ya no está" texto="Puede que la hayas borrado en otra pestaña." salida={salida} />
    );
  }
  if (!editarId && lleno) {
    return (
      <Aviso
        titulo={`Ya tienes ${MAXIMO_DIRECCIONES} direcciones`}
        texto="Borra una que ya no uses para agregar otra."
        salida="/mis-direcciones"
      />
    );
  }
  return <Formulario key={existente?.id ?? "nueva"} existente={existente} salida={salida} />;
}

function Aviso({ titulo, texto, salida }: { titulo: string; texto: string; salida: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-banner border border-gris-borde bg-pico-blanco px-6 py-14 text-center shadow-tarjeta">
      <MapPinOff className="size-10 text-pico-azul" strokeWidth={1.5} aria-hidden />
      <h2 className="text-xl font-bold text-pico-azul">{titulo}</h2>
      <p className="max-w-sm text-gris-texto">{texto}</p>
      <Boton href={salida} variante="secundario" className="mt-2 h-11">
        Volver
      </Boton>
    </div>
  );
}

function Formulario({ existente, salida }: { existente?: Direccion; salida: string }) {
  const router = useRouter();
  const { guardar } = useDirecciones();
  const [nombre, setNombre] = useState(existente?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(existente?.descripcion ?? "");
  const [punto, setPunto] = useState<Ubicacion | null>(existente ?? null);
  const [errores, setErrores] = useState<ErroresDireccion>({});
  const [guardada, setGuardada] = useState(false);
  const alMover = useCallback((u: Ubicacion) => setPunto(u), []);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = { nombre: nombre.trim(), descripcion: descripcion.trim(), ...(punto ?? { latitud: Number.NaN, longitud: Number.NaN }) };
    const nuevos = validarDireccion(datos);
    setErrores(nuevos);
    const primero = (["nombre", "descripcion"] as const).find((campo) => nuevos[campo]);
    if (primero) {
      document.getElementById(`direccion-${primero}`)?.focus();
      return;
    }
    if (nuevos.ubicacion) return;
    guardar({ ...datos, id: existente?.id });
    // Un instante de "¡Guardada!" con su ✓ antes de seguir (sin animaciones, sigue de una vez).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(salida);
    setGuardada(true);
    setTimeout(() => router.push(salida), 700);
  };

  return (
    <form onSubmit={enviar} noValidate className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-6">
      <MapaElegirPunto
        inicial={existente ?? null}
        alMover={alMover}
        className="h-[52dvh] min-h-80 rounded-banner border border-gris-borde shadow-tarjeta motion-safe:animate-aparecer lg:h-auto lg:min-h-[34rem]"
      />

      {/* El panel y sus partes entran en cascada, un poco después del mapa. */}
      <div className="flex flex-col rounded-banner border border-gris-borde bg-pico-blanco p-5 shadow-tarjeta motion-safe:animate-aparecer [animation-delay:120ms] md:p-7">
        <div className="flex flex-col gap-2 motion-safe:animate-aparecer [animation-delay:220ms]">
          <label htmlFor="direccion-nombre" className="text-[15px] font-semibold text-pico-azul">
            Nombre
          </label>
          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Nombres sugeridos">
            {SUGERENCIAS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setNombre(s)}
                aria-pressed={nombre === s}
                className={`h-10 cursor-pointer rounded-chip border px-1 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:active:scale-95 ${
                  nombre === s
                    ? "border-pico-azul bg-pico-azul text-pico-blanco shadow-boton-hover"
                    : "border-gris-borde bg-pico-blanco text-pico-azul hover:border-pico-azul/40 hover:bg-pico-azul-claro motion-safe:hover:-translate-y-0.5"
                }`}
              >
                {/* Al elegirla, la sugerencia late una vez. */}
                <span key={nombre === s ? "si" : "no"} className={`block ${nombre === s ? "motion-safe:animate-latido" : ""}`}>
                  {s}
                </span>
              </button>
            ))}
          </div>
          <input
            id="direccion-nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={LARGO_NOMBRE.maximo}
            placeholder="O escribe otro, ej. Casa de mamá"
            autoComplete="off"
            aria-invalid={errores.nombre ? true : undefined}
            aria-describedby={errores.nombre ? "direccion-nombre-error" : undefined}
            className={`${claseCampo} ${bordes(errores.nombre)} h-13`}
          />
          {errores.nombre && (
            <p id="direccion-nombre-error" className="text-[13px] text-pico-rojo">
              {errores.nombre}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 motion-safe:animate-aparecer [animation-delay:320ms]">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="direccion-descripcion" className="text-[15px] font-semibold text-pico-azul">
              Descripción corta
            </label>
            <span className={`text-xs tabular-nums ${descripcion.length >= LARGO_DESCRIPCION.maximo ? "text-pico-rojo" : "text-gris-texto"}`} aria-hidden>
              {descripcion.length}/{LARGO_DESCRIPCION.maximo}
            </span>
          </div>
          <textarea
            id="direccion-descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            maxLength={LARGO_DESCRIPCION.maximo}
            rows={3}
            placeholder="Ej. Edif. Los Pinos, piso 4, apto 4-B. Frente a la panadería."
            aria-invalid={errores.descripcion ? true : undefined}
            aria-describedby="direccion-descripcion-nota"
            className={`${claseCampo} ${bordes(errores.descripcion)} resize-none py-3 leading-relaxed`}
          />
          {/* Barra que se llena mientras escribe: azul hasta tener lo mínimo útil, roja al tope. */}
          <span className="-mt-1 h-1 overflow-hidden rounded-chip bg-gris-fondo" aria-hidden>
            <span
              className={`block h-full rounded-chip transition-[width,background-color] duration-300 ease-out ${
                descripcion.length >= LARGO_DESCRIPCION.maximo ? "bg-pico-rojo" : descripcion.trim().length >= LARGO_DESCRIPCION.minimo ? "bg-pico-azul" : "bg-pico-azul/35"
              }`}
              style={{ width: `${(descripcion.length / LARGO_DESCRIPCION.maximo) * 100}%` }}
            />
          </span>
          <p id="direccion-descripcion-nota" className={`text-[13px] ${errores.descripcion ? "text-pico-rojo" : "text-gris-texto"}`}>
            {errores.descripcion ?? "Edificio o casa, piso y una referencia que se vea desde la calle."}
          </p>
        </div>

        {errores.ubicacion && (
          <p role="alert" className="mt-4 rounded-boton motion-safe:animate-aparecer border border-pico-rojo/30 bg-pico-rojo/5 px-3 py-2.5 text-sm text-pico-rojo">
            {errores.ubicacion}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-7 motion-safe:animate-aparecer [animation-delay:420ms]">
          <Boton type="submit" anchoCompleto disabled={guardada} className={`h-13! text-base! ${guardada ? "bg-pico-azul! opacity-100!" : ""}`}>
            {guardada ? (
              <span className="flex items-center gap-2 motion-safe:animate-latido">
                <Check className="size-5" strokeWidth={3} aria-hidden />
                ¡Guardada!
              </span>
            ) : existente ? (
              "Guardar cambios"
            ) : (
              "Guardar dirección"
            )}
          </Boton>
          <Link
            href={salida}
            className="area-tactil self-center text-sm font-semibold text-gris-texto underline-offset-4 hover:text-pico-azul hover:underline"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}
