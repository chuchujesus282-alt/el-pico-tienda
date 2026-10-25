"use client";

import Image from "next/image";
import IconoUsuario from "@/components/icons/pico/IconoUsuario";
import { authCliente } from "@/lib/authCliente";

const { useSession } = authCliente;

/** Primer nombre del cliente con sesión abierta ("María José Pérez" → "María"), o null sin sesión. */
export function usePrimerNombre(): string | null {
  const { data: sesion } = useSession();
  const usuario = sesion?.user;
  if (!usuario) return null;
  return (usuario.name ?? usuario.email ?? "Tu cuenta").split(/[\s@]/)[0];
}

/**
 * Ícono de la cuenta: con sesión abierta, la foto de Google en un círculo (o la inicial si no tiene foto);
 * sin sesión, el ícono de usuario de siempre. Mide lo que diga `className` (ej. `size-7`).
 */
export default function FotoCuenta({ className = "" }: { className?: string }) {
  const { data: sesion } = useSession();
  const usuario = sesion?.user;
  if (!usuario) return <IconoUsuario className={className} />;

  if (usuario.image) {
    return (
      <Image
        src={usuario.image}
        alt=""
        width={56}
        height={56}
        className={`rounded-chip object-cover ring-2 ring-pico-blanco ${className}`}
      />
    );
  }
  const inicial = (usuario.name ?? usuario.email ?? "?").charAt(0).toUpperCase();
  return (
    <span
      aria-hidden
      className={`flex items-center justify-center rounded-chip bg-pico-azul text-xs font-bold text-pico-blanco ring-2 ring-pico-blanco ${className}`}
    >
      {inicial}
    </span>
  );
}
