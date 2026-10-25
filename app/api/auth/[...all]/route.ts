import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Rutas de Better Auth: /api/auth/... (Google y su vuelta en /api/auth/callback/google, confirmar el correo,
// leer la sesión, cerrar sesión). Configuración en lib/auth.ts.
export const { GET, POST } = toNextJsHandler(auth);
