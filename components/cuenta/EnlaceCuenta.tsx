"use client";

import Link from "next/link";
import FotoCuenta, { usePrimerNombre } from "./FotoCuenta";

/**
 * "Mi cuenta" del header (desde 768px; en el teléfono está en la barra inferior). Con la sesión abierta muestra la
 * foto y "Hola, María" y lleva a `/mi-cuenta`; sin sesión, a `/iniciar-sesion`.
 */
export default function EnlaceCuenta({ className = "" }: { className?: string }) {
  const nombre = usePrimerNombre();
  return (
    <Link
      href={nombre ? "/mi-cuenta" : "/iniciar-sesion"}
      aria-label={nombre ? `Mi cuenta (${nombre})` : undefined}
      className={`group grupo-icono items-center gap-2 rounded-boton p-2.5 text-sm font-semibold text-pico-azul cursor-pointer ring-1 ring-transparent transition duration-200 hover:bg-pico-blanco hover:shadow-tarjeta hover:ring-pico-azul/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pico-azul ${className}`}
    >
      <FotoCuenta className="size-7" />
      <span className="sr-only lg:not-sr-only">{nombre ? `Hola, ${nombre}` : "Mi cuenta"}</span>
    </Link>
  );
}
