"use client";

import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

// Campos de los formularios de cuenta: etiqueta arriba, ayuda o error debajo.

const BASE =
  "h-11 w-full rounded-boton border bg-pico-blanco px-3 text-[15px] text-texto outline-none transition-shadow placeholder:text-gris-texto/70 focus:ring-4 disabled:opacity-50";

function bordes(error?: string) {
  return error
    ? "border-pico-rojo focus:border-pico-rojo focus:ring-pico-rojo/15"
    : "border-gris-borde focus:border-pico-azul focus:ring-pico-azul-claro";
}

type Envoltura = {
  id: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  opcional?: boolean;
  className?: string;
};

function Marco({ id, etiqueta, ayuda, error, opcional, className = "", children }: Envoltura & { children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-pico-azul">
        {etiqueta}
        {opcional && <span className="font-normal text-gris-texto"> (opcional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-nota`} className="text-[13px] text-pico-rojo">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={`${id}-nota`} className="text-[13px] text-gris-texto">
            {ayuda}
          </p>
        )
      )}
    </div>
  );
}

function atributosAccesibles(id: string, error?: string, ayuda?: string) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error || ayuda ? `${id}-nota` : undefined,
  };
}

type PropsCampo = Envoltura & Omit<ComponentProps<"input">, "id" | "className">;

export function Campo({ id, etiqueta, ayuda, error, opcional, className, ...input }: PropsCampo) {
  return (
    <Marco id={id} etiqueta={etiqueta} ayuda={ayuda} error={error} opcional={opcional} className={className}>
      <input id={id} name={id} className={`${BASE} ${bordes(error)}`} {...atributosAccesibles(id, error, ayuda)} {...input} />
    </Marco>
  );
}

/** Contraseña con el botón del ojo para verla mientras se escribe. */
export function CampoContrasena({ id, etiqueta, ayuda, error, className, ...input }: PropsCampo) {
  const [visible, setVisible] = useState(false);
  return (
    <Marco id={id} etiqueta={etiqueta} ayuda={ayuda} error={error} className={className}>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          className={`${BASE} ${bordes(error)} pr-11`}
          {...atributosAccesibles(id, error, ayuda)}
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-boton text-gris-texto hover:text-pico-azul focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pico-azul"
        >
          {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
        </button>
      </div>
    </Marco>
  );
}

type PropsSelector = Envoltura &
  Omit<ComponentProps<"select">, "id" | "className"> & { opciones: readonly string[]; textoVacio?: string };

export function Selector({ id, etiqueta, ayuda, error, opcional, className, opciones, textoVacio, ...select }: PropsSelector) {
  return (
    <Marco id={id} etiqueta={etiqueta} ayuda={ayuda} error={error} opcional={opcional} className={className}>
      <select id={id} name={id} className={`${BASE} ${bordes(error)} pr-8`} {...atributosAccesibles(id, error, ayuda)} {...select}>
        {textoVacio && <option value="">{textoVacio}</option>}
        {opciones.map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion}
          </option>
        ))}
      </select>
    </Marco>
  );
}

/** Mensaje en caja: "error" en rojo (algo salió mal) o "info" en azul. */
export function Aviso({ tipo = "error", children }: { tipo?: "error" | "info"; children: ReactNode }) {
  return (
    <p
      role={tipo === "error" ? "alert" : "status"}
      className={`rounded-boton border px-3 py-2.5 text-sm ${
        tipo === "error"
          ? "border-pico-rojo/30 bg-pico-rojo/5 text-pico-rojo"
          : "border-pico-azul/20 bg-pico-azul-claro text-pico-azul"
      }`}
    >
      {children}
    </p>
  );
}

/** Línea divisoria con un texto en el medio ("o con tu correo"). */
export function Separador({ texto }: { texto: string }) {
  return (
    <div className="flex items-center gap-3 text-[13px] text-gris-texto" role="separator">
      <span className="h-px flex-1 bg-gris-borde" aria-hidden />
      {texto}
      <span className="h-px flex-1 bg-gris-borde" aria-hidden />
    </div>
  );
}
