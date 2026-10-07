"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { accionIniciarSesion, accionIniciarSesionConGoogle } from "@/app/iniciar-sesion/acciones";
import Boton from "@/components/ui/Boton";
import BotonGoogle from "./BotonGoogle";
import { Aviso, Campo, CampoContrasena, Separador } from "./Campos";
import { correoValido } from "./datosFiscales";

type Errores = { correo?: string; contrasena?: string };

export default function FormularioInicioSesion() {
  const router = useRouter();
  const [errores, setErrores] = useState<Errores>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  const responder = (resultado: Awaited<ReturnType<typeof accionIniciarSesion>>) => {
    if (resultado.ok) router.push("/");
    else setMensaje(resultado.mensaje);
  };

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const correo = String(datos.get("correo") ?? "");
    const contrasena = String(datos.get("contrasena") ?? "");

    const nuevos: Errores = {};
    if (!correoValido(correo)) nuevos.correo = "Escribe un correo válido, ej. nombre@correo.com.";
    if (!contrasena) nuevos.contrasena = "Escribe tu contraseña.";
    setErrores(nuevos);
    setMensaje(null);
    if (Object.keys(nuevos).length > 0) return;

    iniciar(async () => responder(await accionIniciarSesion(correo, contrasena)));
  };

  const conGoogle = () => {
    setMensaje(null);
    iniciar(async () => responder(await accionIniciarSesionConGoogle()));
  };

  return (
    <div className="flex flex-col gap-5">
      <BotonGoogle onClick={conGoogle} disabled={enviando} />
      <Separador texto="o con tu correo" />

      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <Campo
          id="correo"
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nombre@correo.com"
          error={errores.correo}
        />
        <CampoContrasena
          id="contrasena"
          etiqueta="Contraseña"
          autoComplete="current-password"
          error={errores.contrasena}
        />

        {mensaje && <Aviso tipo="info">{mensaje}</Aviso>}

        <Boton type="submit" anchoCompleto disabled={enviando} className="h-11">
          {enviando ? "Entrando…" : "Iniciar sesión"}
        </Boton>
      </form>
    </div>
  );
}
