"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { accionCambiarContrasena } from "@/app/nueva-contrasena/acciones";
import Boton from "@/components/ui/Boton";
import { Aviso, CampoContrasena } from "./Campos";
import { LARGO_MINIMO_CONTRASENA } from "./datosFiscales";

type Errores = { contrasena?: string; confirmacion?: string };

/** Elegir una contraseña nueva con el `token` del enlace del correo. Al terminar, lleva a iniciar sesión. */
export default function FormularioNuevaContrasena({ token }: { token: string }) {
  const [errores, setErrores] = useState<Errores>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [listo, setListo] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const contrasena = String(datos.get("contrasena") ?? "");
    const confirmacion = String(datos.get("confirmacion") ?? "");

    const nuevos: Errores = {};
    if (contrasena.length < LARGO_MINIMO_CONTRASENA) nuevos.contrasena = `Usa al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
    else if (confirmacion !== contrasena) nuevos.confirmacion = "Las contraseñas no coinciden.";
    setErrores(nuevos);
    setMensaje(null);
    if (Object.keys(nuevos).length > 0) return document.getElementById(nuevos.contrasena ? "contrasena" : "confirmacion")?.focus();

    iniciar(async () => {
      const resultado = await accionCambiarContrasena(token, contrasena);
      if (resultado.ok) setListo(resultado.aviso ?? "");
      else setMensaje(resultado.mensaje);
    });
  };

  if (listo !== null) {
    return (
      <div className="flex flex-col gap-5">
        <Aviso tipo="info">{listo}</Aviso>
        <Boton href="/iniciar-sesion" anchoCompleto className="h-14! text-lg!">
          Iniciar sesión
        </Boton>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-5 [&_input]:h-14 [&_input]:pl-4 [&_input]:text-base [&_label]:text-[15px]">
      <CampoContrasena
        id="contrasena"
        etiqueta="Contraseña nueva"
        autoComplete="new-password"
        ayuda={`Al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`}
        error={errores.contrasena}
      />
      <CampoContrasena id="confirmacion" etiqueta="Repite la contraseña" autoComplete="new-password" error={errores.confirmacion} />

      {mensaje && (
        <Aviso>
          {mensaje}{" "}
          <Link href="/recuperar-contrasena" className="font-semibold underline underline-offset-4">
            Pedir otro enlace
          </Link>
        </Aviso>
      )}

      <Boton type="submit" anchoCompleto disabled={enviando} className="mt-2 h-14! text-lg!">
        {enviando ? "Guardando…" : "Guardar contraseña"}
      </Boton>
    </form>
  );
}
