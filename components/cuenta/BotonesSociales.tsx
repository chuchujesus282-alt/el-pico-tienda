"use client";

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import type { ProveedorSocial } from "@/types/cuenta";

const PROVEEDORES: { id: ProveedorSocial; nombre: string; logo: string }[] = [
  { id: "google", nombre: "Google", logo: "/google.svg" },
  { id: "facebook", nombre: "Facebook", logo: "/facebook.svg" },
  { id: "apple", nombre: "Apple", logo: "/apple.svg" },
];

type Props = {
  onElegir: (proveedor: ProveedorSocial) => void;
  disabled?: boolean;
  /** Retraso (ms) para que los tres entren en cascada; sin él, aparecen de una vez. */
  cascada?: number;
};

// Mismo trazo que los botones redondos: borde gris de 2px sobre blanco, azul al pasar el mouse.
const claseBorde =
  "border-2 border-gris-borde bg-pico-blanco transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul";

/**
 * Fila de botones redondos para entrar con Google, Facebook o Apple (cada logo con sus colores oficiales).
 * Google entra de verdad con Auth.js (auth.ts); Facebook y Apple siguen pasando por `onElegir` (lib/cuenta.ts).
 * Con la sesión de Google abierta, en lugar de la fila se ve la foto, el nombre y "Cerrar sesión".
 * La sesión viene de `ProveedorSesion` (app/layout.tsx).
 */
export default function BotonesSociales({ onElegir, disabled, cascada }: Props) {
  const { data: sesion, status } = useSession();
  const [saliendo, setSaliendo] = useState(false);
  const usuario = sesion?.user;

  if (usuario) {
    const nombre = usuario.name ?? usuario.email ?? "Tu cuenta";
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
          {usuario.name && usuario.email && <p className="truncate text-sm text-gris-texto">{usuario.email}</p>}
        </div>
        <button
          type="button"
          onClick={() => {
            setSaliendo(true);
            void signOut({ redirectTo: window.location.pathname });
          }}
          disabled={saliendo}
          className={`h-11 shrink-0 cursor-pointer rounded-chip px-4 text-sm font-semibold text-pico-azul hover:border-pico-azul hover:shadow-tarjeta-hover disabled:cursor-not-allowed disabled:opacity-50 ${claseBorde}`}
        >
          {saliendo ? "Saliendo…" : "Cerrar sesión"}
        </button>
      </div>
    );
  }

  const elegir = (id: ProveedorSocial) => {
    // Vuelve a esta misma página, donde se ve la sesión abierta.
    if (id === "google") void signIn("google", { redirectTo: window.location.pathname });
    else onElegir(id);
  };

  return (
    <ul className="flex justify-center gap-5">
      {PROVEEDORES.map(({ id, nombre, logo }, i) => (
        <li
          key={id}
          className={cascada === undefined ? undefined : "motion-safe:animate-aparecer"}
          style={cascada === undefined ? undefined : { animationDelay: `${cascada + i * 70}ms` }}
        >
          <button
            type="button"
            onClick={() => elegir(id)}
            // Mientras se revisa si ya hay sesión, quietos: así no se entra dos veces.
            disabled={disabled || status === "loading"}
            aria-label={`Continuar con ${nombre}`}
            title={`Continuar con ${nombre}`}
            className="flex size-16 cursor-pointer items-center justify-center rounded-chip border-2 border-gris-borde bg-pico-blanco transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-pico-azul hover:shadow-tarjeta-hover motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Image src={logo} alt="" width={30} height={30} />
          </button>
        </li>
      ))}
    </ul>
  );
}
