// Tablas de la base de datos de cuentas (Neon / Postgres). NO es el SQL Server de la tienda: ese no se toca.
// Cambiar algo aquí exige una migración nueva: `npm run db:generate` (crea el SQL en drizzle/) y `npm run db:migrate`.
// En TypeScript los campos van en camelCase (así los pide Better Auth); en la base de datos, en snake_case.

import { bigint, boolean, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const creadoEn = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const actualizadoEn = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/* ---------- Tablas de Better Auth (nombres y campos que exige la librería, versión 1.7) ---------- */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: creadoEn(),
  updatedAt: actualizadoEn(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: creadoEn(),
    updatedAt: actualizadoEn(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

/** Una fila por forma de entrar: "credential" (correo + contraseña cifrada con scrypt) o "google". */
export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: creadoEn(),
    updatedAt: actualizadoEn(),
  },
  // Una misma cuenta de Google no puede quedar unida a dos usuarios.
  (t) => [index("account_user_id_idx").on(t.userId), uniqueIndex("account_proveedor_cuenta_uidx").on(t.providerId, t.accountId)],
);

/** Enlaces de un solo uso (recuperar contraseña) y estado de Google mientras el cliente está en su página. */
export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: creadoEn(),
    updatedAt: actualizadoEn(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/** Límite general de Better Auth (por IP y ruta) para las llamadas directas a /api/auth. */
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

/* ---------- Tablas propias de la tienda ---------- */

/** Datos para la factura que se piden al crear la cuenta. Quien entra con Google no tiene perfil hasta llenarlo. */
export const perfil = pgTable("perfil", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  tipoPersona: text("tipo_persona", { enum: ["natural", "juridica"] }).notNull(),
  nombre: text("nombre").notNull(),
  documento: text("documento").notNull(), // "V-12345678", "J-12345678-9"
  telefono: text("telefono").notNull(), // solo dígitos: "04121234567"
  contribuyenteEspecial: boolean("contribuyente_especial").notNull().default(false),
  aceptoPoliticasEn: timestamp("acepto_politicas_en", { withTimezone: true }).notNull(),
  createdAt: creadoEn(),
  updatedAt: actualizadoEn(),
});

/**
 * Intentos para el límite propio (lib/limiteIntentos.ts): una fila por clave, ej. "entrar:correo+ip:…" o
 * "entrar:ip:…". La ventana se reinicia sola cuando pasa su tiempo.
 */
export const limiteIntento = pgTable("limite_intento", {
  clave: text("clave").primaryKey(),
  conteo: integer("conteo").notNull(),
  inicio: timestamp("inicio", { withTimezone: true }).notNull(),
});
