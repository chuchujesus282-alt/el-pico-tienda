import "server-only";

import { and, eq, gte } from "drizzle-orm";
import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { correosDisponibles } from "@/lib/correo";
import { db } from "@/lib/db";
import { perfil, user } from "@/lib/db/esquema";
import type { NuevaCuenta, ResultadoCuenta } from "@/types/cuenta";

// ÚNICA puerta de entrada a las cuentas de cliente desde el servidor (registro e inicio con correo y contraseña,
// recuperar la contraseña y reenviar el enlace para confirmar el correo).
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
    case "INVALID_TOKEN":
      return "Este enlace ya se usó o venció. Pide uno nuevo.";
    default:
      console.error("[cuenta]", error.body?.code, error.message);
      return "Algo salió mal. Inténtalo de nuevo en unos minutos.";
  }
}

/** Solo rutas de la propia tienda ("/algo"); cualquier otra cosa vuelve al inicio. */
export const rutaSegura = (ruta?: string) => (ruta && ruta.startsWith("/") && !ruta.startsWith("//") ? ruta : "/");

/**
 * A dónde lleva el enlace para confirmar el correo: /verificar-correo, que con la sesión ya abierta sigue a `volverA`
 * y, si el enlace venció o no sirve, explica qué pasó y deja pedir otro.
 */
const rutaConfirmacion = (volverA?: string) => `/verificar-correo?volverA=${encodeURIComponent(rutaSegura(volverA))}`;

/** Datos de la visita sin la cookie de sesión: los pedidos de enlaces responden igual haya sesión abierta o no. */
async function visitaSinSesion(): Promise<Headers> {
  const visita = new Headers(await headers());
  visita.delete("cookie");
  return visita;
}

const sinCorreos = "Por ahora no podemos enviar correos. Mientras tanto, entra con Google.";

export async function haySesion(): Promise<boolean> {
  return Boolean(await auth.api.getSession({ headers: await headers() }));
}

export async function iniciarSesion(correo: string, contrasena: string): Promise<ResultadoCuenta> {
  try {
    // nextCookies (lib/auth.ts) deja puesta la cookie de la sesión en la respuesta de la acción.
    // callbackURL: a dónde lleva el enlace que se reenvía si todavía no confirmó su correo.
    await auth.api.signInEmail({
      body: { email: correo, password: contrasena, callbackURL: rutaConfirmacion() },
      headers: await headers(),
    });
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
      body: { name: fiscales.nombre, email: correo, password: contrasena, callbackURL: rutaConfirmacion(volverA) },
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

/**
 * "¿Olvidaste tu contraseña?": manda un enlace (vale 1 hora) para elegir una nueva. Responde lo mismo exista o no la
 * cuenta, para que no se pueda averiguar qué correos están registrados. También sirve para que quien entró con
 * Google le ponga una contraseña a su cuenta.
 */
export async function pedirCambioContrasena(correo: string): Promise<ResultadoCuenta> {
  if (!correosDisponibles()) return { ok: false, mensaje: sinCorreos };
  try {
    await auth.api.requestPasswordReset({ body: { email: correo, redirectTo: "/nueva-contrasena" }, headers: await visitaSinSesion() });
  } catch (error) {
    return { ok: false, mensaje: mensajeDeError(error, correo) };
  }
  return {
    ok: true,
    aviso: `Si hay una cuenta con ${correo}, te enviamos un enlace para elegir una contraseña nueva. Vale por 1 hora (revisa también la carpeta de spam).`,
  };
}

/** Guarda la contraseña nueva con el `token` del enlace. Cierra todas las sesiones abiertas de esa cuenta. */
export async function cambiarContrasena(token: string, contrasena: string): Promise<ResultadoCuenta> {
  try {
    await auth.api.resetPassword({ body: { token, newPassword: contrasena }, headers: await visitaSinSesion() });
  } catch (error) {
    return { ok: false, mensaje: mensajeDeError(error, "") };
  }
  return { ok: true, aviso: "Listo, ya cambiaste tu contraseña. Inicia sesión con la nueva." };
}

/** Manda otro enlace para confirmar el correo (si la cuenta existe y no lo ha confirmado; si no, responde igual). */
export async function reenviarConfirmacion(correo: string, volverA?: string): Promise<ResultadoCuenta> {
  if (!correosDisponibles()) return { ok: false, mensaje: sinCorreos };
  try {
    await auth.api.sendVerificationEmail({
      body: { email: correo, callbackURL: rutaConfirmacion(volverA) },
      headers: await visitaSinSesion(),
    });
  } catch (error) {
    return { ok: false, mensaje: mensajeDeError(error, correo) };
  }
  return {
    ok: true,
    aviso: `Si ${correo} tiene una cuenta sin confirmar, te enviamos un enlace nuevo. Vale por 24 horas (revisa también la carpeta de spam).`,
  };
}
