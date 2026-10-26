"use client";

import { Building2, User } from "lucide-react";
import type { DatosFiscales, PrefijoDocumento, TipoPersona } from "@/types/cuenta";
import { Campo } from "./Campos";
import { PREFIJOS, separarDocumento, type ErroresCuenta } from "./datosFiscales";

// Datos para la factura: persona o empresa, nombre o razón social, cédula/RIF, teléfono y contribuyente especial.
// Los usan /crear-cuenta (FormularioCrearCuenta) y /mi-cuenta (FormularioPerfil). Campos sin control (se leen con
// FormData al enviar): `inicial` llena los que ya estaban guardados. El tipo y el prefijo los lleva el formulario.

const TIPOS: { valor: TipoPersona; titulo: string; detalle: string; Icono: typeof User }[] = [
  { valor: "natural", titulo: "Persona", detalle: "La factura sale a tu nombre, con tu cédula o RIF.", Icono: User },
  { valor: "juridica", titulo: "Empresa", detalle: "La factura sale a nombre de la empresa, con su RIF.", Icono: Building2 },
];

export default function CamposFiscales({
  tipo,
  prefijo,
  onTipo,
  onPrefijo,
  errores,
  inicial,
}: {
  tipo: TipoPersona;
  prefijo: PrefijoDocumento;
  onTipo: (tipo: TipoPersona) => void;
  onPrefijo: (prefijo: PrefijoDocumento) => void;
  errores: ErroresCuenta;
  inicial?: DatosFiscales | null;
}) {
  const empresa = tipo === "juridica";
  const actual = TIPOS.find((t) => t.valor === tipo)!;
  const numeroInicial = inicial ? separarDocumento(inicial.documento)?.numero : undefined;

  return (
    <>
      {/* Persona o empresa: dos mitades de un mismo control, la elegida en blanco. */}
      <fieldset className="motion-safe:animate-aparecer [animation-delay:480ms]">
        <legend className="sr-only">¿Para quién es la cuenta?</legend>
        <div className="relative grid grid-cols-2 gap-1 rounded-tarjeta bg-gris-fondo p-1">
          {/* La píldora blanca se desliza hacia la opción elegida. */}
          <span
            className={`absolute inset-y-1 left-1 w-[calc(50%-0.375rem)] rounded-boton bg-pico-blanco shadow-tarjeta transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              empresa ? "translate-x-[calc(100%+0.25rem)]" : "translate-x-0"
            }`}
            aria-hidden
          />
          {TIPOS.map(({ valor, titulo, Icono }) => {
            const marcado = tipo === valor;
            return (
              <label
                key={valor}
                className={`relative flex h-12 cursor-pointer items-center justify-center gap-2 rounded-boton text-[15px] font-semibold transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pico-azul ${
                  marcado ? "text-pico-azul" : "text-gris-texto hover:text-pico-azul"
                }`}
              >
                <input type="radio" name="tipoPersona" value={valor} checked={marcado} onChange={() => onTipo(valor)} className="sr-only" />
                <Icono
                  key={marcado ? "si" : "no"}
                  className={`size-5 ${marcado ? "motion-safe:animate-latido" : ""}`}
                  strokeWidth={marcado ? 2.25 : 1.75}
                  aria-hidden
                />
                {titulo}
              </label>
            );
          })}
        </div>
        <p key={tipo} className="mt-2 text-center text-[13px] text-gris-texto motion-safe:animate-aparecer">
          {actual.detalle}
        </p>
      </fieldset>

      <Campo
        id="nombre"
        etiqueta={empresa ? "Razón social" : "Nombre y apellido"}
        autoComplete={empresa ? "organization" : "name"}
        placeholder={empresa ? "Ej. Construcciones Ávila, C.A." : "Ej. María Pérez"}
        defaultValue={inicial?.nombre}
        error={errores.nombre}
        className="motion-safe:animate-aparecer [animation-delay:540ms]"
      />

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4 motion-safe:animate-aparecer [animation-delay:600ms]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="numeroDocumento" className="text-sm font-semibold text-pico-azul">
            {empresa ? "RIF" : "Cédula o RIF"}
          </label>
          <div className="flex gap-2">
            <label htmlFor="prefijo" className="sr-only">
              Tipo de documento
            </label>
            <select
              id="prefijo"
              value={prefijo}
              onChange={(e) => onPrefijo(e.target.value as PrefijoDocumento)}
              className="h-14 w-16 shrink-0 cursor-pointer rounded-boton border border-gris-borde bg-pico-blanco px-2 text-base font-semibold text-pico-azul outline-none focus:border-pico-azul focus:ring-4 focus:ring-pico-azul-claro"
            >
              {PREFIJOS[tipo].map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.etiqueta}
                </option>
              ))}
            </select>
            <input
              id="numeroDocumento"
              name="numeroDocumento"
              inputMode={prefijo === "P" ? "text" : "numeric"}
              placeholder={empresa ? "12345678-9" : prefijo === "P" ? "Pasaporte" : "12345678"}
              defaultValue={numeroInicial}
              aria-invalid={errores.numeroDocumento ? true : undefined}
              aria-describedby={errores.numeroDocumento ? "numeroDocumento-nota" : undefined}
              className={`w-full min-w-0 rounded-boton border bg-pico-blanco text-texto outline-none transition-shadow placeholder:text-gris-texto focus:ring-4 ${
                errores.numeroDocumento
                  ? "border-pico-rojo focus:border-pico-rojo focus:ring-pico-rojo/15"
                  : "border-gris-borde focus:border-pico-azul focus:ring-pico-azul-claro"
              }`}
            />
          </div>
          {errores.numeroDocumento && (
            <p id="numeroDocumento-nota" className="text-[13px] text-pico-rojo">
              {errores.numeroDocumento}
            </p>
          )}
        </div>

        <Campo
          id="telefono"
          etiqueta="Teléfono"
          type="tel"
          autoComplete="tel-national"
          inputMode="tel"
          placeholder="0412-1234567"
          defaultValue={inicial?.telefono}
          error={errores.telefono}
        />
      </div>

      {empresa && (
        <label className="flex cursor-pointer items-start gap-3 rounded-tarjeta bg-gris-fondo px-4 py-3 motion-safe:animate-aparecer">
          <input
            type="checkbox"
            name="contribuyenteEspecial"
            value="si"
            defaultChecked={inicial?.contribuyenteEspecial}
            className="mt-1 size-4 shrink-0 cursor-pointer accent-pico-azul"
          />
          <span>
            <span className="block font-semibold text-pico-azul">Somos contribuyente especial</span>
            <span className="block text-[13px] text-gris-texto">Si la empresa es agente de retención de IVA.</span>
          </span>
        </label>
      )}
    </>
  );
}
