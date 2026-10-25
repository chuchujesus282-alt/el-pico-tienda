"use client";

import { createAuthClient } from "better-auth/react";

// Better Auth en el navegador: la sesión (useSession), entrar con Google y cerrar sesión. Habla con /api/auth de la
// misma dirección en la que está la página (sirve igual en localhost, .vercel.app y el dominio).
// Registro y entrada con contraseña NO van por aquí: van por las acciones del servidor (lib/cuenta.ts).
export const authCliente = createAuthClient();
