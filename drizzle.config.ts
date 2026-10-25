import { defineConfig } from "drizzle-kit";

// Migraciones de la base de cuentas (Neon). `npm run db:generate` escribe el SQL en drizzle/ a partir de
// lib/db/esquema.ts (no necesita conexión); `npm run db:migrate` lo aplica. Para aplicar se usa la conexión
// DIRECTA (DATABASE_URL_UNPOOLED, sin -pooler): el pooler de Neon no se lleva bien con los cambios de tablas.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Sin .env.local (ej. en Vercel) se usan las variables del entorno.
}

export default defineConfig({
  schema: "./lib/db/esquema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "" },
});
