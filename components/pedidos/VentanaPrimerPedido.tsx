"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ReceiptText, X } from "lucide-react";
import { accionGuardarPerfil } from "@/app/mi-cuenta/acciones";
import CamposFiscales from "@/components/cuenta/CamposFiscales";
import { PREFIJOS, normalizarDocumento, normalizarTelefono, validarDatosFiscales, type ErroresCuenta } from "@/components/cuenta/datosFiscales";
import IconoMensaje from "@/components/icons/pico/IconoMensaje";
import type { DatosFiscales, PrefijoDocumento, TipoPersona } from "@/types/cuenta";

type Props = {
  /** Nombre de la cuenta, para llenar el campo. */
  nombre: string;
  /** Abre WhatsApp y registra el pedido (en este mismo toque). */
  onEnviar: () => void;
  onCerrar: () => void;
};

const ORDEN: (keyof ErroresCuenta)[] = ["nombre", "numeroDocumento", "telefono", "aceptaPoliticas"];

/**
 * Primer pedido de una cuenta sin datos para la factura: le ofrece dejar su cédula/RIF y teléfono, SIN obligarlo
 * ("Enviar sin guardar"). Los dos botones abren WhatsApp en el mismo toque; los datos se guardan en segundo plano.
 * No se vuelve a mostrar (después del primero ya no es el primer pedido); siempre se pueden llenar en Mi cuenta.
 */
export default function VentanaPrimerPedido({ nombre, onEnviar, onCerrar }: Props) {
  const [tipo, setTipo] = useState<TipoPersona>("natural");
  const [prefijo, setPrefijo] = useState<PrefijoDocumento>(PREFIJOS.natural[0].valor);
  const [errores, setErrores] = useState<ErroresCuenta>({});
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", alPresionar);
    caja.current?.querySelector<HTMLInputElement>("#numeroDocumento")?.focus();
    return () => document.removeEventListener("keydown", alPresionar);
  }, [onCerrar]);

  const cambiarTipo = (nuevo: TipoPersona) => {
    setTipo(nuevo);
    setPrefijo(PREFIJOS[nuevo][0].valor);
    setErrores((e) => ({ ...e, nombre: undefined, numeroDocumento: undefined }));
  };

  const guardarYEnviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const texto = (campo: string) => String(datos.get(campo) ?? "").trim();
    const fiscales: DatosFiscales = {
      tipoPersona: tipo,
      nombre: texto("nombre"),
      documento: normalizarDocumento(prefijo, texto("numeroDocumento")) ?? "",
      telefono: normalizarTelefono(texto("telefono")) ?? "",
      contribuyenteEspecial: tipo === "juridica" && datos.get("contribuyenteEspecial") === "si",
    };
    const aceptaPoliticas = datos.get("aceptaPoliticas") === "si";
    const nuevos = validarDatosFiscales(fiscales);
    if (!aceptaPoliticas) nuevos.aceptaPoliticas = "Marca la casilla, o toca “Enviar sin guardar”.";
    setErrores(nuevos);
    const primero = ORDEN.find((campo) => nuevos[campo]);
    if (primero) {
      caja.current?.querySelector<HTMLElement>(`#${primero}`)?.focus();
      return;
    }
    onEnviar(); // WhatsApp primero, en este mismo toque
    void accionGuardarPerfil(fiscales, true).catch(() => {}); // si falla, los puede llenar en Mi cuenta
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center print:hidden">
      <div className="absolute inset-0 bg-pico-azul-oscuro/55 backdrop-blur-[2px] motion-safe:animate-[aparecer_0.2s_ease-out_both]" onClick={onCerrar} aria-hidden />
      <div
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-primer-pedido"
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-banner bg-pico-blanco shadow-tarjeta-hover motion-safe:animate-aparecer"
      >
        <span className="absolute inset-x-0 top-0 h-1 bg-pico-rojo" aria-hidden />
        <button
          type="button"
          onClick={onCerrar}
          className="group absolute top-3 right-3 flex size-9 cursor-pointer items-center justify-center rounded-chip text-gris-texto transition-colors hover:bg-gris-fondo hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
          aria-label="Cerrar sin enviar"
        >
          <X className="size-5 transition-transform duration-300 motion-safe:group-hover:rotate-90" />
        </button>

        <form onSubmit={guardarYEnviar} noValidate className="flex flex-col gap-4 px-5 pt-8 pb-5 sm:px-7">
          <div className="flex items-start gap-3 pr-8">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pico-azul-claro text-pico-azul" aria-hidden>
              <ReceiptText className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <h2 id="titulo-primer-pedido" className="text-xl font-bold text-pico-azul">
                ¿Tu factura a tu nombre?
              </h2>
              <p className="mt-1 text-sm text-gris-texto">
                Es tu primer pedido. Si nos dejas tu cédula o RIF y tu teléfono, los guardamos en tu cuenta para la factura y
                para avisarte de tu pedido. Es opcional.
              </p>
            </div>
          </div>

          <CamposFiscales
            tipo={tipo}
            prefijo={prefijo}
            onTipo={cambiarTipo}
            onPrefijo={setPrefijo}
            errores={errores}
            inicial={{ tipoPersona: "natural", nombre, documento: "", telefono: "", contribuyenteEspecial: false }}
          />

          <div>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                id="aceptaPoliticas"
                type="checkbox"
                name="aceptaPoliticas"
                value="si"
                aria-invalid={errores.aceptaPoliticas ? true : undefined}
                aria-describedby={errores.aceptaPoliticas ? "aceptaPoliticas-nota" : undefined}
                className="mt-1 size-4 shrink-0 cursor-pointer accent-pico-azul"
              />
              <span className="text-sm leading-relaxed text-gris-texto">
                Leí y acepto las{" "}
                <Link href="/politicas-de-privacidad" target="_blank" className="font-semibold text-pico-azul underline underline-offset-4 hover:text-pico-rojo">
                  políticas de privacidad
                </Link>
                .
              </span>
            </label>
            {errores.aceptaPoliticas && (
              <p id="aceptaPoliticas-nota" className="mt-1.5 pl-7 text-[13px] text-pico-rojo">
                {errores.aceptaPoliticas}
              </p>
            )}
          </div>

          <div className="mt-1 grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={onEnviar}
              className="flex h-12 cursor-pointer items-center justify-center rounded-boton border-2 border-pico-azul text-sm font-semibold text-pico-azul transition duration-200 hover:bg-pico-azul hover:text-pico-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul"
            >
              Enviar sin guardar
            </button>
            <button
              type="submit"
              className="group flex h-12 cursor-pointer items-center justify-center gap-2 rounded-boton bg-estado-abierto text-sm font-semibold text-pico-blanco transition duration-200 hover:bg-estado-abierto/90 hover:shadow-boton-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul motion-safe:hover:-translate-y-0.5"
            >
              <IconoMensaje className="size-5" />
              Guardar y enviar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
