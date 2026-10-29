"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { accionGuardarPerfil } from "@/app/mi-cuenta/acciones";
import Boton from "@/components/ui/Boton";
import type { DatosFiscales, PrefijoDocumento, TipoPersona } from "@/types/cuenta";
import CamposFiscales from "./CamposFiscales";
import { Aviso } from "./Campos";
import { PREFIJOS, normalizarDocumento, normalizarTelefono, separarDocumento, validarDatosFiscales, type ErroresCuenta } from "./datosFiscales";

/** Orden en que se revisan los campos: el primero con error recibe el foco. */
const ORDEN: (keyof ErroresCuenta)[] = ["nombre", "numeroDocumento", "telefono", "aceptaPoliticas"];

/**
 * Datos para la factura en /mi-cuenta. `inicial` null: entró con Google y todavía no los llenó; esa primera vez
 * también acepta las políticas de privacidad (como en el registro).
 */
export default function FormularioPerfil({ inicial }: { inicial: DatosFiscales | null }) {
  const router = useRouter();
  const tipoInicial: TipoPersona = inicial?.tipoPersona ?? "natural";
  const [tipo, setTipo] = useState<TipoPersona>(tipoInicial);
  const [prefijo, setPrefijo] = useState<PrefijoDocumento>(
    (inicial && separarDocumento(inicial.documento)?.prefijo) || PREFIJOS[tipoInicial][0].valor,
  );
  const [errores, setErrores] = useState<ErroresCuenta>({});
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);
  const [enviando, iniciar] = useTransition();

  const cambiarTipo = (nuevo: TipoPersona) => {
    setTipo(nuevo);
    setPrefijo(PREFIJOS[nuevo][0].valor);
    setErrores((e) => ({ ...e, nombre: undefined, numeroDocumento: undefined }));
  };

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
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
    if (!inicial && !aceptaPoliticas) nuevos.aceptaPoliticas = "Marca la casilla para continuar.";
    setErrores(nuevos);
    setResultado(null);
    const primero = ORDEN.find((campo) => nuevos[campo]);
    if (primero) {
      document.getElementById(primero)?.focus();
      return;
    }

    iniciar(async () => {
      const respuesta = await accionGuardarPerfil(fiscales, aceptaPoliticas);
      setResultado(respuesta.ok ? { ok: true, texto: respuesta.aviso ?? "Listo." } : { ok: false, texto: respuesta.mensaje });
      if (respuesta.ok) router.refresh();
    });
  };

  return (
    // Campos grandes, como en crear cuenta.
    <form
      onSubmit={enviar}
      noValidate
      className="flex flex-col gap-5 [&_input:not([type=checkbox])]:h-14 [&_input:not([type=checkbox])]:pl-4 [&_input:not([type=checkbox])]:text-base [&_label]:text-[15px]"
    >
      <CamposFiscales tipo={tipo} prefijo={prefijo} onTipo={cambiarTipo} onPrefijo={setPrefijo} errores={errores} inicial={inicial} />

      {!inicial && (
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
              <Link href="/privacidad" target="_blank" className="font-semibold text-pico-azul underline underline-offset-4 hover:text-pico-rojo">
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
      )}

      {resultado && <Aviso tipo={resultado.ok ? "info" : "error"}>{resultado.texto}</Aviso>}

      <Boton type="submit" disabled={enviando} className="h-14! self-start px-8! text-lg! max-sm:w-full">
        {enviando ? (
          <>
            <LoaderCircle className="size-5 animate-spin" aria-hidden />
            Guardando…
          </>
        ) : (
          "Guardar mis datos"
        )}
      </Boton>
    </form>
  );
}
