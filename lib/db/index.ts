import "server-only";

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as esquema from "./esquema";
import { fetchConReintentos } from "./reintentos";

// Hasta 3 intentos si Neon está dormida y no responde a tiempo (ver lib/db/reintentos.ts).
neonConfig.fetchFunction = fetchConReintentos((url, init) => fetch(url, init));

// Conexión a Neon por HTTP (la recomendada en Vercel: no deja conexiones abiertas entre visitas).
// DATABASE_URL es la cadena "con pooling" (su host dice -pooler). Las migraciones usan DATABASE_URL_UNPOOLED
// (drizzle.config.ts). Sin la variable, el sitio compila y abre igual; lo que toque la base de datos falla con
// un error que lo dice.
const url = process.env.DATABASE_URL;
if (!url) console.warn("[db] Falta DATABASE_URL en .env.local: las cuentas no funcionarán. Ver .env.example.");

export const db = drizzle(neon(url ?? "postgresql://falta-DATABASE_URL@localhost/falta"), { schema: esquema });
export { esquema };
