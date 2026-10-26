"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import Boton from "@/components/ui/Boton";
import type { ResultadoCuenta } from "@/types/cuenta";
import { Aviso, Campo } from "./Campos";
import { correoValido } from "./datosFiscales";

/**
 * Pide un enlace por correo: para cambiar la contraseña (/recuperar-contrasena) o para confirmar el correo
 * (/verificar-correo). `accion` es la acción del servidor de esa página.
 */
export default function FormularioPedirEnlace({
  accion,
  textoBoton = "Enviarme el enlace",
}: {
  accion: (correo: string) => Promise<ResultadoCuenta>;
  textoBoton?: string;
}) {
  const [error, setError] = useState<string>();
  const [resultado, setResultado] = useState<ResultadoCuenta | null>(null);
  const [enviando, iniciar] = useTransition();

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const correo = String(new FormData(formulario).get("correo") ?? "").trim();
    setResultado(null);
    if (!correoValido(correo)) return setError("Escribe un correo válido, ej. nombre@correo.com.");
    setError(undefined);
    iniciar(async () => {
      const respuesta = await accion(correo);
      if (respuesta.ok) formulario.reset();
      setResultado(respuesta);
    });
  };

  return (
    // Campos grandes, como en iniciar sesión.
    <form onSubmit={enviar} noValidate className="flex flex-col gap-5 [&_input]:h-14 [&_input]:pl-4 [&_input]:text-base [&_label]:text-[15px]">
      <Campo
        id="correo"
        etiqueta="Correo electrónico"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="nombre@correo.com"
        error={error}
      />

      {resultado && <Aviso tipo={resultado.ok ? "info" : "error"}>{resultado.ok ? resultado.aviso : resultado.mensaje}</Aviso>}

      <Boton type="submit" anchoCompleto disabled={enviando} className="mt-2 h-14! text-lg!">
        {enviando ? "Enviando…" : textoBoton}
      </Boton>
    </form>
  );
}
