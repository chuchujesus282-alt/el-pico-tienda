"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * Sesión del cliente (Auth.js) para toda la tienda: la leen el header ("Mi cuenta"), la barra inferior del teléfono
 * y los botones de `/iniciar-sesion`. Se consulta desde el navegador, así las páginas siguen siendo estáticas.
 */
export default function ProveedorSesion({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
