import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Inicio de sesión con Google (Auth.js v5). Lee solas AUTH_SECRET, AUTH_GOOGLE_ID y AUTH_GOOGLE_SECRET
// (ver .env.example). La sesión vive en una cookie cifrada: no hay base de datos de cuentas todavía.
// Correo + contraseña, Facebook y Apple siguen en lib/cuenta.ts ("todavía no están activas").
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
});
