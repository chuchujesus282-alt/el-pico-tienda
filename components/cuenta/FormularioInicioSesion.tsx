"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { accionIniciarSesion } from "@/app/iniciar-sesion/acciones";
import Boton from "@/components/ui/Boton";
import { authCliente } from "@/lib/authCliente";
import BotonesSociales from "./BotonesSociales";
import { Aviso, Campo, CampoContrasena, Separador } from "./Campos";
import { correoValido } from "./datosFiscales";

type Errores = { correo?: string; contrasena?: string };

export default function FormularioInicioSesion() {
  const router = useRouter();
  const [errores, setErrores] = useState<Errores>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  const responder = (resultado: Awaited<ReturnType<typeof accionIniciarSesion>>) => {
    if (resultado.ok) {
      // La cookie ya viene puesta: se avisa al header (useSession) para que muestre la cuenta sin recargar.
      authCliente.$store.notify("$sessionSignal");
      router.replace("/"); // replace: el "atrás" no vuelve al formulario de entrar

    } else setMensaje(resultado.mensaje);
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

  return (
    // Versión grande de los campos (solo aquí; crear cuenta usa el tamaño normal). En pantallas bajas (teléfono con las
    // barras del navegador) todo un poco más compacto, para que la página quepa sin desplazarse.
    <div className="flex flex-col gap-5 [&_input]:h-12 [&_input]:pl-4 [&_input]:text-base [&_label]:text-[15px] [@media(min-height:760px)]:gap-7 [@media(min-height:760px)]:[&_input]:h-14">
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4 [@media(min-height:760px)]:gap-5">
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
        <Link
          href="/recuperar-contrasena"
          className="-mt-2 self-end text-sm font-semibold text-pico-azul underline-offset-4 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>

        {mensaje && <Aviso tipo="info">{mensaje}</Aviso>}

        <Boton type="submit" anchoCompleto disabled={enviando} className="mt-1 h-12! text-lg! [@media(min-height:760px)]:mt-2 [@media(min-height:760px)]:h-14!">
          {enviando ? "Entrando…" : "Iniciar sesión"}
        </Boton>
      </form>

      <Separador texto="o continúa con" />
      {/* Al volver de Google, al inicio como con la contraseña (sin esto volvía aquí y se veía este formulario). */}
      <BotonesSociales disabled={enviando} volverA="/" />
    </div>
  );
}
