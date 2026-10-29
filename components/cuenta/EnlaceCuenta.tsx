"use client";

import Link from "next/link";
import FotoCuenta, { usePrimerNombre } from "./FotoCuenta";
import { claseAccionHeader } from "@/components/layout/accionHeader";

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
      className={`${claseAccionHeader()} ${className}`}
    >
      <FotoCuenta className="size-7" />
      <span className="sr-only lg:not-sr-only">{nombre ? `Hola, ${nombre}` : "Mi cuenta"}</span>
    </Link>
  );
}
