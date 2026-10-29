import "server-only";

import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware, getIP } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { LARGO_MINIMO_CONTRASENA } from "@/components/cuenta/datosFiscales";
import { correosDisponibles, enviarCorreo } from "@/lib/correo";
import { db } from "@/lib/db";
import { account, rateLimit, session, user, verification } from "@/lib/db/esquema";
import { mensajeLimite, type AccionLimitada } from "@/lib/limiteIntentos";
import { contarIntento, descontarIntentoExitoso } from "@/lib/limiteIntentosDb";
import { prepararUnionConGoogle } from "@/lib/unionCuentas";

// Cuentas de cliente con Better Auth, guardadas en Neon (lib/db). Las pantallas NO usan esto directo:
// el servidor pasa por lib/cuenta.ts y el navegador por lib/authCliente.ts.

/* ---------- Direcciones en las que funciona (sitio .vercel.app, versiones de prueba y, después, el dominio) ----------
 * Los enlaces de los correos se arman con la dirección desde la que llegó la visita, pero SOLO si está en esta lista
 * (si no, cualquiera podría mandar una visita con otra dirección y hacer que el correo apunte a su sitio). Vercel da
 * las de cada despliegue en VERCEL_URL, VERCEL_BRANCH_URL y VERCEL_PROJECT_PRODUCTION_URL (esta última pasa sola a
 * centroferreteroelpico.com cuando se conecte el dominio). Fuera de Vercel se permite localhost en cualquier puerto. */
const enVercel = Boolean(process.env.VERCEL);
const hostDe = (url?: string) => {
  try {
    return url ? new URL(url).host : undefined;
  } catch {
    return undefined;
  }
};
const HOSTS = [
  process.env.VERCEL_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  hostDe(process.env.BETTER_AUTH_URL),
  "centroferreteroelpico.com",
  "www.centroferreteroelpico.com",
  ...(enVercel ? [] : ["localhost:*", "127.0.0.1:*"]),
].filter((h): h is string => Boolean(h));
const protocolo = enVercel ? "https" : "http";
const URL_RESPALDO =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/** "Hola, María:" con el primer nombre (o solo "Hola:" si la cuenta no tiene nombre). */
const saludo = (nombre?: string | null) => {
  const primero = nombre?.trim().split(/\s+/)[0];
  return primero ? `Hola, ${primero}:` : "Hola:";
};

/* ---------- Límite de intentos (ver lib/limiteIntentos.ts) ---------- */
const LIMITADAS: Record<string, AccionLimitada> = {
  "/sign-in/email": "entrar",
  "/sign-up/email": "registro",
  "/request-password-reset": "enlace",
  "/send-verification-email": "enlace",
};
/**
 * Registro, entrada con contraseña y pedidos de enlaces solo por los formularios de la tienda (lib/cuenta.ts), nunca
 * llamando a /api/auth directo. Los enlaces de los correos (GET /verify-email y /reset-password/:token) sí van directo.
 */
const SOLO_DESDE_EL_SERVIDOR = ["/sign-in/email", "/sign-up/email", "/request-password-reset", "/reset-password", "/send-verification-email"];

export const auth = betterAuth({
  appName: "Centro Ferretero El Pico",
  baseURL: { allowedHosts: HOSTS, fallback: URL_RESPALDO, protocol: protocolo },
  trustedOrigins: HOSTS.map((h) => `${protocolo}://${h}`),
  // Firma con BETTER_AUTH_SECRET (OBLIGATORIA en .env.local y en Vercel; ver .env.example).
  database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification, rateLimit } }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: LARGO_MINIMO_CONTRASENA,
    // Contraseñas cifradas con scrypt (lo de Better Auth por defecto): nunca se guardan ni se pueden leer en texto plano.
    requireEmailVerification: true,
    autoSignIn: false,
    // Sin forma de entregar el enlace (producción sin Resend), no se abren cuentas con contraseña: solo Google.
    disableSignUp: !correosDisponibles(),
    revokeSessionsOnPasswordReset: true,
    // El enlace para cambiar la contraseña llega al correo: si lo usó, el correo es suyo (queda confirmado).
    onPasswordReset: async ({ user: cliente }) => {
      if (!cliente.emailVerified) await db.update(user).set({ emailVerified: true }).where(eq(user.id, cliente.id));
    },
    sendResetPassword: async ({ user: cliente, url }) => {
      await enviarCorreo({
        para: cliente.email,
        asunto: "Cambia tu contraseña de El Pico",
        vistaPrevia: "Usa este enlace para elegir una contraseña nueva. Vale por 1 hora.",
        titulo: "Elige una contraseña nueva",
        parrafos: [
          saludo(cliente.name),
          "Recibimos una solicitud para cambiar la contraseña de tu cuenta en Centro Ferretero El Pico. Toca el botón para elegir una nueva.",
        ],
        boton: { texto: "Cambiar mi contraseña", url },
        nota: "El enlace vale por 1 hora y se puede usar una sola vez.",
        pie: "Si no lo pediste tú, ignora este mensaje: tu contraseña sigue igual y nadie más puede cambiarla sin este enlace.",
      });
    },
    // Si alguien intenta registrarse con un correo que ya tiene cuenta, la pantalla responde igual que siempre
    // (así no se puede averiguar qué correos están registrados) y al dueño le llega este aviso.
    onExistingUserSignUp: async ({ user: cliente }) => {
      await enviarCorreo({
        para: cliente.email,
        asunto: "Ya tienes una cuenta en El Pico",
        vistaPrevia: "Alguien intentó crear una cuenta nueva con este correo.",
        titulo: "Ya tienes una cuenta",
        parrafos: [
          saludo(cliente.name),
          "Alguien intentó crear una cuenta nueva en Centro Ferretero El Pico con este correo, pero ya tienes una.",
          "Si fuiste tú, inicia sesión con tu contraseña o con Google. Si no recuerdas la contraseña, toca «¿Olvidaste tu contraseña?» en la página para iniciar sesión.",
        ],
        boton: { texto: "Iniciar sesión", url: `${URL_RESPALDO}/iniciar-sesion` },
        pie: "Si no fuiste tú, no tienes que hacer nada: tu cuenta sigue igual.",
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    // Si entra con contraseña sin haber verificado, se le manda otro enlace.
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user: cliente, url }) => {
      await enviarCorreo({
        para: cliente.email,
        asunto: "Confirma tu correo en El Pico",
        vistaPrevia: "Un paso más: confirma tu correo para activar tu cuenta.",
        titulo: "Confirma tu correo",
        parrafos: [
          saludo(cliente.name),
          "Gracias por crear tu cuenta en Centro Ferretero El Pico. Para activarla, confirma que este correo es tuyo tocando el botón.",
        ],
        boton: { texto: "Confirmar mi correo", url },
        nota: "El enlace vale por 24 horas.",
        pie: "Si no creaste una cuenta en El Pico, ignora este mensaje: la cuenta no se activará.",
      });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
      prompt: "select_account",
    },
  },

  account: {
    // No usamos los permisos de Google para nada; igual se guardan cifrados.
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      // Google NO va en trustedProviders: solo se une si Google confirma que el correo es de esa persona.
      // Se permite unir aunque la cuenta de la tienda no haya verificado su correo, porque en ese caso el hook de
      // abajo le borra la contraseña antes de unir (ver databaseHooks.account).
      requireLocalEmailVerified: false,
    },
  },

  databaseHooks: {
    account: {
      create: {
        /**
         * Unión de cuentas: si alguien se registró con correo y contraseña SIN verificar el correo, y luego entra con
         * Google (que confirma que el correo es suyo) con ese mismo correo, la cuenta pasa a ser de quien tiene el
         * Google (ver lib/unionCuentas.ts). Si el correo ya estaba verificado, se une normal.
         */
        before: async (nueva) => {
          if (nueva.providerId === "google") await prepararUnionConGoogle(nueva.userId);
        },
      },
    },
  },

  // Límite general de Better Auth para las llamadas directas a /api/auth (por IP, guardado en Neon: en Vercel hay
  // varias copias del servidor y la memoria no se comparte). Las rutas de LIMITADAS usan el límite propio de abajo.
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: Object.fromEntries(Object.keys(LIMITADAS).map((ruta) => [ruta, false])),
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.request && SOLO_DESDE_EL_SERVIDOR.includes(ctx.path)) {
        throw new APIError("NOT_FOUND", { message: "No encontrado." });
      }
      const accion = LIMITADAS[ctx.path];
      if (!accion) return;
      const correo = typeof ctx.body?.email === "string" ? ctx.body.email : null;
      const origen = ctx.request ?? ctx.headers;
      const ip = origen ? getIP(origen, ctx.context.options) : null;
      const estado = await contarIntento(accion, correo, ip);
      if (estado.bloqueado) {
        throw new APIError("TOO_MANY_REQUESTS", { message: mensajeLimite(estado.minutos), code: "DEMASIADOS_INTENTOS" });
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email" || !ctx.context.newSession) return;
      const origen = ctx.request ?? ctx.headers;
      await descontarIntentoExitoso("entrar", ctx.context.newSession.user.email, origen ? getIP(origen, ctx.context.options) : null);
    }),
  },

  advanced: { cookiePrefix: "el-pico" },

  // Siempre al final: deja que las acciones del servidor (lib/cuenta.ts) pongan la cookie de la sesión.
  plugins: [nextCookies()],
});

export type Sesion = typeof auth.$Infer.Session;
