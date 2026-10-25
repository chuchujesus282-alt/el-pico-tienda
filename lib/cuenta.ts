import "server-only";

import { and, eq, gte } from "drizzle-orm";
import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { correosDisponibles } from "@/lib/correo";
import { db } from "@/lib/db";
import { perfil, user } from "@/lib/db/esquema";
import type { NuevaCuenta, ResultadoCuenta } from "@/types/cuenta";

// ÚNICA puerta de entrada a las cuentas de cliente desde el servidor (registro e inicio con correo y contraseña).
// Las pantallas no saben de Better Auth: llaman a estas funciones por sus acciones (app/*/acciones.ts).
// Google, la sesión y cerrar sesión van por el navegador (lib/authCliente.ts).

/** Mensajes para el cliente según el código de error de Better Auth (o del límite de intentos de lib/auth.ts). */
function mensajeDeError(error: unknown, correo: string): string {
  if (!isAPIError(error)) {
    console.error("[cuenta]", error);
    return "No pudimos conectar con el servidor de cuentas. Inténtalo de nuevo en unos minutos.";
  }
  switch (error.body?.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "El correo o la contraseña no coinciden.";
    case "EMAIL_NOT_VERIFIED":
      return `Todavía no confirmas tu correo. Te enviamos otro enlace a ${correo}: ábrelo y vuelve a entrar.`;
    case "DEMASIADOS_INTENTOS":
      return error.body.message ?? "Hiciste demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
    case "PASSWORD_TOO_SHORT":
    case "PASSWORD_TOO_LONG":
      return "Revisa tu contraseña: debe tener al menos 8 caracteres.";
    case "EMAIL_PASSWORD_SIGN_UP_DISABLED":
      return "El registro con correo estará disponible muy pronto. Mientras tanto, entra con Google.";
    default:
      console.error("[cuenta]", error.body?.code, error.message);
      return "Algo salió mal. Inténtalo de nuevo en unos minutos.";
  }
}

/** Solo rutas de la propia tienda ("/algo"); cualquier otra cosa vuelve al inicio. */
const rutaSegura = (ruta?: string) => (ruta && ruta.startsWith("/") && !ruta.startsWith("//") ? ruta : "/");

export async function iniciarSesion(correo: string, contrasena: string): Promise<ResultadoCuenta> {
  try {
    // nextCookies (lib/auth.ts) deja puesta la cookie de la sesión en la respuesta de la acción.
    await auth.api.signInEmail({ body: { email: correo, password: contrasena }, headers: await headers() });
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: mensajeDeError(error, correo) };
  }
}

/**
 * Crea la cuenta (con la contraseña cifrada) y su perfil, y manda el correo para confirmarlo. Hasta que lo confirme,
 * no puede entrar con contraseña. `volverA`: a dónde lleva el enlace del correo, ya con la sesión abierta.
 */
export async function crearCuenta(cuenta: NuevaCuenta, volverA?: string): Promise<ResultadoCuenta> {
  if (!correosDisponibles()) {
    return { ok: false, mensaje: "El registro con correo estará disponible muy pronto. Mientras tanto, entra con Google." };
  }
  const { correo, contrasena, fiscales } = cuenta;
  // Un segundo de margen: la fecha de creación la pone este mismo servidor.
  const desde = new Date(Date.now() - 1000);
  try {
    await auth.api.signUpEmail({
      body: { name: fiscales.nombre, email: correo, password: contrasena, callbackURL: rutaSegura(volverA) },
      headers: await headers(),
    });
  } catch (error) {
    return { ok: false, mensaje: mensajeDeError(error, correo) };
  }

  // Si el correo ya tenía cuenta, Better Auth responde igual que si la hubiera creado (para que no se pueda averiguar
  // qué correos están registrados) y no crea nada: el perfil se guarda solo si la cuenta se acaba de crear.
  const [nueva] = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.email, correo), gte(user.createdAt, desde)));
  if (nueva) {
    await db
      .insert(perfil)
      .values({
        userId: nueva.id,
        tipoPersona: fiscales.tipoPersona,
        nombre: fiscales.nombre,
        documento: fiscales.documento,
        telefono: fiscales.telefono,
        contribuyenteEspecial: fiscales.contribuyenteEspecial,
        aceptoPoliticasEn: new Date(),
      })
      .onConflictDoNothing();
  }

  return {
    ok: true,
    aviso: `Te enviamos un enlace a ${correo} para confirmar tu correo. Ábrelo para activar tu cuenta (revisa también la carpeta de spam).`,
  };
}
