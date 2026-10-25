"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { authCliente } from "@/lib/authCliente";
import { Aviso } from "./Campos";

type Props = {
  disabled?: boolean;
  /** Retraso (ms) para que el botón entre animado; sin él, aparece de una vez. */
  cascada?: number;
  /** A dónde vuelve el cliente al entrar con Google. Por defecto, a esta misma página (donde se ve la sesión abierta). */
  volverA?: string;
};

// Mismo trazo que los botones redondos: borde gris de 2px sobre blanco, azul al pasar el mouse.
const claseBorde =
  "border-2 border-gris-borde bg-pico-blanco transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul";

/** Lo que trae `?error=` cuando Google no pudo entrar (Better Auth vuelve a la página con ese código). */
function mensajeDeError(codigo: string): string {
  if (codigo.includes("link")) {
    return "Ese correo ya tiene una cuenta en El Pico y no pudimos unirla con Google. Entra con tu correo y contraseña.";
  }
  if (codigo.includes("signup")) return "Por ahora no se pueden crear cuentas nuevas. Inténtalo más tarde.";
  return "No pudimos entrar con Google. Inténtalo de nuevo.";
}

/**
 * Botón redondo para entrar con Google (Better Auth, lib/auth.ts). Facebook y Apple se quitaron por ahora.
 * Con la sesión abierta, en lugar del botón se ve la foto, el nombre y "Cerrar sesión".
 */
export default function BotonesSociales({ disabled, cascada, volverA }: Props) {
  const { data: sesion, isPending } = authCliente.useSession();
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const usuario = sesion?.user;

  // Si Google no pudo entrar, Better Auth vuelve aquí con ?error=…: se avisa y se limpia la dirección.
  useEffect(() => {
    const url = new URL(window.location.href);
    const codigo = url.searchParams.get("error");
    if (!codigo) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- se lee una sola vez de la dirección al abrir
    setError(mensajeDeError(codigo));
    url.searchParams.delete("error");
    url.searchParams.delete("error_description");
    window.history.replaceState(null, "", url);
  }, []);

  if (usuario) {
    const nombre = usuario.name || usuario.email;
    return (
      <div className={`flex flex-wrap items-center gap-4 rounded-tarjeta p-4 ${claseBorde} motion-safe:animate-aparecer`}>
        {usuario.image ? (
          <Image src={usuario.image} alt="" width={56} height={56} className="size-14 shrink-0 rounded-chip ring-2 ring-pico-azul-claro" />
        ) : (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-chip bg-pico-azul text-xl font-bold text-pico-blanco" aria-hidden>
            {nombre.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gris-texto">Entraste como</p>
          <p className="truncate text-lg font-bold text-pico-azul">{nombre}</p>
          {usuario.name && <p className="truncate text-sm text-gris-texto">{usuario.email}</p>}
        </div>
        <button
          type="button"
          onClick={async () => {
            setOcupado(true);
            await authCliente.signOut();
            setOcupado(false);
          }}
          disabled={ocupado}
          className={`h-11 shrink-0 cursor-pointer rounded-chip px-4 text-sm font-semibold text-pico-azul hover:border-pico-azul hover:shadow-tarjeta-hover disabled:cursor-not-allowed disabled:opacity-50 ${claseBorde}`}
        >
          {ocupado ? "Saliendo…" : "Cerrar sesión"}
        </button>
      </div>
    );
  }

  const entrarConGoogle = async () => {
    setOcupado(true);
    setError(null);
    const aqui = window.location.pathname;
    const { error: fallo } = await authCliente.signIn.social({
      provider: "google",
      callbackURL: volverA ?? aqui,
      errorCallbackURL: aqui,
    });
    // Si salió bien, el navegador ya va camino a Google; si no, se avisa aquí mismo.
    if (fallo) {
      setError(mensajeDeError(fallo.code ?? ""));
      setOcupado(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cascada === undefined ? undefined : "motion-safe:animate-aparecer"}
        style={cascada === undefined ? undefined : { animationDelay: `${cascada}ms` }}
      >
        <button
          type="button"
          onClick={entrarConGoogle}
          // Mientras se revisa si ya hay sesión, quieto: así no se entra dos veces.
          disabled={disabled || ocupado || isPending}
          aria-label="Continuar con Google"
          title="Continuar con Google"
          className="flex size-16 cursor-pointer items-center justify-center rounded-chip border-2 border-gris-borde bg-pico-blanco transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-pico-azul hover:shadow-tarjeta-hover motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Image src="/google.svg" alt="" width={30} height={30} />
        </button>
      </div>
      {error && <Aviso>{error}</Aviso>}
    </div>
  );
}
