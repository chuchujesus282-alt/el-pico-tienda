"use client";

import { type FormEvent, useState } from "react";
import { CircleCheck, Send } from "lucide-react";
import type { Calificacion } from "@/types/opiniones";
import { agregarOpinion } from "./almacenOpiniones";
import SelectorEstrellas from "./SelectorEstrellas";

const MIN_COMENTARIO = 10;
const MAX_COMENTARIO = 500;
const MAX_NOMBRE = 40;

type Errores = Partial<Record<"nombre" | "calificacion" | "comentario", string>>;

type Props = {
  productoId: string;
  /** Se llama con el id de la opinión recién guardada (para resaltarla en la lista). */
  alPublicar: (id: string) => void;
};

const claseCampo =
  "w-full rounded-boton border bg-pico-blanco px-3 py-2.5 text-sm text-texto transition-colors placeholder:text-gris-texto focus-visible:border-logo-marino focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-logo-marino-claro";

/** Formulario para dejar una opinión. Por ahora se guarda en el navegador del cliente (no hay base de datos). */
export default function FormularioOpinion({ productoId, alPublicar }: Props) {
  const [nombre, setNombre] = useState("");
  const [calificacion, setCalificacion] = useState<Calificacion | null>(null);
  const [comentario, setComentario] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [enviada, setEnviada] = useState(false);

  const validar = (): Errores => {
    const e: Errores = {};
    if (nombre.trim().length < 2) e.nombre = "Escribe tu nombre (al menos 2 letras).";
    if (!calificacion) e.calificacion = "Elige de 1 a 5 estrellas.";
    if (comentario.trim().length < MIN_COMENTARIO)
      e.comentario = `Cuéntanos un poco más (mínimo ${MIN_COMENTARIO} caracteres).`;
    return e;
  };

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0 || !calificacion) return;

    const id = `local-${Date.now()}`;
    agregarOpinion({
      id,
      productoId,
      autor: nombre.trim(),
      calificacion,
      comentario: comentario.trim(),
      fecha: new Date().toLocaleDateString("en-CA"), // AAAA-MM-DD en la hora local del cliente
    });
    setNombre("");
    setCalificacion(null);
    setComentario("");
    setEnviada(true);
    alPublicar(id);
  };

  return (
    <section
      id="escribir"
      aria-labelledby="titulo-escribir"
      className="scroll-mt-6 rounded-banner border border-gris-borde bg-pico-blanco p-5 shadow-tarjeta md:p-6"
    >
      <h2 id="titulo-escribir" className="font-titulo text-xl font-bold text-logo-marino">
        Escribe tu opinión
      </h2>
      <p className="mt-1 text-[13px] text-gris-texto">Ayuda a otros clientes a decidir. Sé claro y respetuoso.</p>

      {enviada && (
        <div
          className="mt-4 flex items-start gap-3 rounded-tarjeta bg-logo-marino-claro p-3 text-sm text-logo-marino motion-safe:animate-aparecer"
          role="status"
        >
          <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>
            <span className="font-semibold">¡Gracias por tu opinión!</span> Por ahora queda guardada en este dispositivo;
            cuando conectemos la tienda se publicará para todos.
          </p>
        </div>
      )}

      <form onSubmit={enviar} noValidate className="mt-5 flex flex-col gap-5">
        <div>
          <SelectorEstrellas
            valor={calificacion}
            alCambiar={(v) => {
              setCalificacion(v);
              setErrores((e) => ({ ...e, calificacion: undefined }));
            }}
            error={!!errores.calificacion}
          />
          {errores.calificacion && <p className="mt-1 text-[13px] text-logo-rojo">{errores.calificacion}</p>}
        </div>

        <div>
          <label htmlFor="opinion-nombre" className="mb-1.5 block text-sm font-semibold text-logo-marino">
            Tu nombre <span className="text-logo-rojo">*</span>
          </label>
          <input
            id="opinion-nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value.slice(0, MAX_NOMBRE));
              setErrores((err) => ({ ...err, nombre: undefined }));
            }}
            placeholder="Ej. María G."
            autoComplete="given-name"
            aria-invalid={!!errores.nombre}
            aria-describedby={errores.nombre ? "error-nombre" : undefined}
            className={`${claseCampo} ${errores.nombre ? "border-logo-rojo" : "border-gris-borde"}`}
          />
          {errores.nombre && (
            <p id="error-nombre" className="mt-1 text-[13px] text-logo-rojo">
              {errores.nombre}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="opinion-comentario" className="mb-1.5 block text-sm font-semibold text-logo-marino">
            Tu comentario <span className="text-logo-rojo">*</span>
          </label>
          <textarea
            id="opinion-comentario"
            value={comentario}
            onChange={(e) => {
              setComentario(e.target.value.slice(0, MAX_COMENTARIO));
              setErrores((err) => ({ ...err, comentario: undefined }));
            }}
            rows={4}
            placeholder="¿Qué te pareció? ¿Para qué lo usaste?"
            aria-invalid={!!errores.comentario}
            aria-describedby="ayuda-comentario"
            className={`${claseCampo} resize-y ${errores.comentario ? "border-logo-rojo" : "border-gris-borde"}`}
          />
          <div id="ayuda-comentario" className="mt-1 flex justify-between gap-3 text-[13px]">
            <span className="text-logo-rojo">{errores.comentario}</span>
            <span className="shrink-0 text-gris-texto tabular-nums">
              {comentario.length}/{MAX_COMENTARIO}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="group inline-flex h-12 items-center justify-center gap-2 self-start rounded-boton bg-logo-rojo px-6 text-base font-semibold text-pico-blanco transition duration-200 hover:bg-logo-rojo-oscuro hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-marino motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98]"
        >
          <Send className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" aria-hidden />
          Publicar opinión
        </button>
      </form>
    </section>
  );
}
