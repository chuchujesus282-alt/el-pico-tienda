// Tablas de la base de datos de cuentas (Neon / Postgres). NO es el SQL Server de la tienda: ese no se toca.
// Cambiar algo aquí exige una migración nueva: `npm run db:generate` (crea el SQL en drizzle/) y `npm run db:migrate`.
// En TypeScript los campos van en camelCase (así los pide Better Auth); en la base de datos, en snake_case.

import {
  bigint,
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

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
 * Favoritos de la cuenta: solo el código del producto (nombre, precio y foto salen del catálogo al mostrarlos).
 * `posicion` 0 = el más reciente (como los muestra /favoritos). En el navegador viven en localStorage (components/favoritos/).
 */
export const favorito = pgTable(
  "favorito",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productoId: text("producto_id").notNull(),
    posicion: integer("posicion").notNull(),
    createdAt: creadoEn(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productoId] })],
);

/**
 * Carrito de la cuenta: código y cantidad, en el orden en que se agregó (`posicion`). NO guarda precio ni tasa:
 * el precio sale siempre del catálogo y la tasa BCV se fija solo al enviar el pedido.
 */
export const carritoItem = pgTable(
  "carrito_item",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productoId: text("producto_id").notNull(),
    cantidad: integer("cantidad").notNull(),
    posicion: integer("posicion").notNull(),
    updatedAt: actualizadoEn(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productoId] })],
);

/**
 * Intentos para el límite propio (lib/limiteIntentos.ts): una fila por clave, ej. "entrar:correo+ip:…" o
 * "entrar:ip:…". La ventana se reinicia sola cuando pasa su tiempo.
 */
export const limiteIntento = pgTable("limite_intento", {
  clave: text("clave").primaryKey(),
  conteo: integer("conteo").notNull(),
  inicio: timestamp("inicio", { withTimezone: true }).notNull(),
});

/* ---------- Eventos para análisis (lib/eventos/, docs/eventos.md) ---------- */
// Livianos a propósito (Neon gratis: 1 GB): sin IP, sin navegador, sin nombres de producto ni datos personales.
// Las fechas se guardan en UTC (timestamptz); las consultas las pasan a hora de Caracas.

/** Tipos de evento. "pedido_enviado" queda listo para la fase 5 (todavía no se acepta desde el navegador). */
export const tipoEvento = pgEnum("tipo_evento", [
  "producto_visto",
  "categoria_vista",
  "busqueda",
  "carrito",
  "favorito",
  "pedido_enviado",
]);

/**
 * Un evento. `visitante` es el código al azar de la cookie "el-pico-visitante" (no identifica a nadie); la cuenta,
 * si la hay, sale de `visitante_cuenta`. Se guardan 12 meses; antes de borrarlos se resumen por mes.
 */
export const evento = pgTable(
  "evento",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    tipo: tipoEvento("tipo").notNull(),
    visitante: uuid("visitante").notNull(),
    productoId: text("producto_id"), // código (producto_visto, carrito, favorito, pedido_enviado)
    categoria: text("categoria"), // slug de la web (categoria_vista)
    subcategoria: text("subcategoria"), // código de Saint (o el nombre, en las categorías de ejemplo)
    termino: text("termino"), // búsqueda: minúsculas, máx. 60 caracteres
    resultados: integer("resultados"), // búsqueda: cuántos productos encontró (0 = sin resultados)
    createdAt: creadoEn(),
  },
  (t) => [
    // Para "no repetir en 30 minutos" y para vincular a la cuenta.
    index("evento_visitante_fecha_idx").on(t.visitante, t.createdAt),
    // BRIN: casi no ocupa espacio y sirve para buscar por fecha (resúmenes, limpieza, consultas por mes).
    index("evento_fecha_brin_idx").using("brin", t.createdAt),
  ],
);

/** De qué cuenta es cada visitante (se anota al entrar). Una cuenta puede tener varios (teléfono, PC…). */
export const visitanteCuenta = pgTable(
  "visitante_cuenta",
  {
    visitante: uuid("visitante").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: creadoEn(),
  },
  (t) => [index("visitante_cuenta_user_id_idx").on(t.userId)],
);

/**
 * Resumen mensual (para siempre) de los eventos que ya se borraron: cuántos de cada tipo por producto o categoría.
 * `mes` es el primer día del mes en hora de Caracas. Los campos que no aplican van como "" (no NULL) para la clave.
 */
export const resumenEventoMes = pgTable(
  "resumen_evento_mes",
  {
    mes: date("mes").notNull(),
    tipo: tipoEvento("tipo").notNull(),
    productoId: text("producto_id").notNull().default(""),
    categoria: text("categoria").notNull().default(""),
    subcategoria: text("subcategoria").notNull().default(""),
    cantidad: integer("cantidad").notNull(),
  },
  (t) => [primaryKey({ columns: [t.mes, t.tipo, t.productoId, t.categoria, t.subcategoria] })],
);

/** Resumen mensual (para siempre) de las búsquedas ya borradas: cuántas veces y cuántas sin resultados. */
export const resumenBusquedaMes = pgTable(
  "resumen_busqueda_mes",
  {
    mes: date("mes").notNull(),
    termino: text("termino").notNull(),
    cantidad: integer("cantidad").notNull(),
    sinResultados: integer("sin_resultados").notNull(),
  },
  (t) => [primaryKey({ columns: [t.mes, t.termino] })],
);
