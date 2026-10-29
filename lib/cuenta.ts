import "server-only";

import { and, asc, eq, gte } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { validarDatosFiscales } from "@/components/cuenta/datosFiscales";
import { auth } from "@/lib/auth";
import { getIndiceConEstado } from "@/lib/catalogo";
import { vincularVisitante } from "@/lib/eventos/servidor";
import { correosDisponibles } from "@/lib/correo";
import { db } from "@/lib/db";
import { carritoItem, direccion, favorito, perfil, user } from "@/lib/db/esquema";
import {
  type DireccionesCuenta,
  limpiarCarrito,
  limpiarDirecciones,
  limpiarFavoritos,
  mezclarCarrito,
  mezclarDirecciones,
  mezclarFavoritos,
  type LineaCarrito,
} from "@/lib/mezclaCuenta";
import { leerPedido, listarPedidos, tienePedidos, type DetallePedido, type ResumenPedido } from "@/lib/pedidos/servidor";
import type { ItemCarrito } from "@/types/carrito";
import type { DatosCuenta, DatosFiscales, NuevaCuenta, PerfilCuenta, ResultadoCuenta } from "@/types/cuenta";

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

async function usuarioActual() {
  return (await auth.api.getSession({ headers: await headers() }))?.user ?? null;
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

/* ---------- Mi cuenta: datos para la factura ---------- */

/** Lo que muestra /mi-cuenta. null sin sesión. */
export async function leerPerfil(): Promise<PerfilCuenta | null> {
  const cliente = await usuarioActual();
  if (!cliente) return null;
  const [fila] = await db.select().from(perfil).where(eq(perfil.userId, cliente.id));
  return {
    correo: cliente.email,
    nombre: cliente.name,
    foto: cliente.image ?? null,
    fiscales: fila
      ? {
          tipoPersona: fila.tipoPersona,
          nombre: fila.nombre,
          documento: fila.documento,
          telefono: fila.telefono,
          contribuyenteEspecial: fila.contribuyenteEspecial,
        }
      : null,
  };
}

/**
 * Guarda los datos para la factura. Quien entró con Google no los tiene todavía: la primera vez debe aceptar las
 * políticas de privacidad (`aceptaPoliticas`), como en el registro.
 */
export async function guardarPerfil(fiscales: DatosFiscales, aceptaPoliticas: boolean): Promise<ResultadoCuenta> {
  const cliente = await usuarioActual();
  if (!cliente) return { ok: false, mensaje: "Tu sesión se cerró. Vuelve a iniciar sesión." };
  if (Object.keys(validarDatosFiscales(fiscales)).length > 0) {
    return { ok: false, mensaje: "Revisa los datos marcados e inténtalo de nuevo." };
  }
  const datos = {
    tipoPersona: fiscales.tipoPersona,
    nombre: fiscales.nombre.trim(),
    documento: fiscales.documento,
    telefono: fiscales.telefono,
    contribuyenteEspecial: fiscales.tipoPersona === "juridica" && fiscales.contribuyenteEspecial === true,
  };
  try {
    const [existente] = await db.select({ userId: perfil.userId }).from(perfil).where(eq(perfil.userId, cliente.id));
    if (existente) {
      await db.update(perfil).set(datos).where(eq(perfil.userId, cliente.id));
    } else {
      if (!aceptaPoliticas) return { ok: false, mensaje: "Marca la casilla de las políticas de privacidad para continuar." };
      await db.insert(perfil).values({ userId: cliente.id, ...datos, aceptoPoliticasEn: new Date() });
    }
  } catch (error) {
    console.error("[cuenta] No se pudo guardar el perfil:", error);
    return { ok: false, mensaje: "No pudimos guardar tus datos. Inténtalo de nuevo en unos minutos." };
  }
  return { ok: true, aviso: "Listo, guardamos tus datos." };
}

/* ---------- Carrito y favoritos en la cuenta ---------- */
// En el navegador siguen en localStorage (components/carrito/, components/favoritos/); con la sesión abierta,
// components/cuenta/SincronizarCuenta.tsx los copia a la cuenta. Al ENTRAR se juntan (lib/mezclaCuenta.ts); después,
// en cada visita manda lo de la cuenta (así lo que quitaste en otro dispositivo no reaparece).

async function leerLineas(
  userId: string,
): Promise<{ carrito: LineaCarrito[]; favoritos: string[]; direcciones: DireccionesCuenta }> {
  const [carrito, favoritos, direcciones] = await Promise.all([
    db
      .select({ id: carritoItem.productoId, cantidad: carritoItem.cantidad })
      .from(carritoItem)
      .where(eq(carritoItem.userId, userId))
      .orderBy(asc(carritoItem.posicion)),
    db.select({ id: favorito.productoId }).from(favorito).where(eq(favorito.userId, userId)).orderBy(asc(favorito.posicion)),
    db
      .select({
        id: direccion.id,
        nombre: direccion.nombre,
        descripcion: direccion.descripcion,
        latitud: direccion.latitud,
        longitud: direccion.longitud,
        elegida: direccion.elegida,
      })
      .from(direccion)
      .where(eq(direccion.userId, userId))
      .orderBy(asc(direccion.posicion)),
  ]);
  const lista = direcciones.map(({ id, nombre, descripcion, latitud, longitud }) => ({ id, nombre, descripcion, latitud, longitud }));
  return {
    carrito,
    favoritos: favoritos.map((f) => f.id),
    direcciones: { lista, elegidaId: direcciones.find((d) => d.elegida)?.id ?? lista[0]?.id ?? null },
  };
}

/** Reemplaza el carrito y/o los favoritos de la cuenta, cada uno en una sola transacción (borrar + insertar). */
async function escribir(
  userId: string,
  { carrito, favoritos, direcciones }: { carrito?: LineaCarrito[]; favoritos?: string[]; direcciones?: DireccionesCuenta },
) {
  const consultas: BatchItem<"pg">[] = [];
  if (carrito) {
    consultas.push(db.delete(carritoItem).where(eq(carritoItem.userId, userId)));
    if (carrito.length > 0) {
      consultas.push(db.insert(carritoItem).values(carrito.map(({ id, cantidad }, posicion) => ({ userId, productoId: id, cantidad, posicion }))));
    }
  }
  if (favoritos) {
    consultas.push(db.delete(favorito).where(eq(favorito.userId, userId)));
    if (favoritos.length > 0) {
      consultas.push(db.insert(favorito).values(favoritos.map((productoId, posicion) => ({ userId, productoId, posicion }))));
    }
  }
  if (direcciones) {
    consultas.push(db.delete(direccion).where(eq(direccion.userId, userId)));
    if (direcciones.lista.length > 0) {
      consultas.push(
        db.insert(direccion).values(
          direcciones.lista.map((d, posicion) => ({ userId, ...d, posicion, elegida: d.id === direcciones.elegidaId })),
        ),
      );
    }
  }
  if (consultas.length > 0) await db.batch(consultas as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
}

/**
 * Pone nombre, precio y foto de hoy (del catálogo) a cada línea. Lo que ya no está en el catálogo se deja fuera.
 * Pero si alguna categoría de Saint no cargó (catálogo incompleto) y falta algún producto, devuelve null: podría
 * estar en esa categoría, y mandarle al navegador un carrito sin él haría que el navegador lo guardara así y se
 * perdiera de la cuenta. Con null, el navegador se queda con lo suyo y vuelve a intentar en la próxima visita.
 */
async function conProductos(lineas: LineaCarrito[]): Promise<ItemCarrito[] | null> {
  if (lineas.length === 0) return [];
  const { productos, completo } = await getIndiceConEstado();
  const porId = new Map(productos.map((p) => [p.id, p]));
  if (!completo && lineas.some(({ id }) => !porId.has(id))) return null;
  return lineas.flatMap(({ id, cantidad }) => {
    const producto = porId.get(id);
    return producto ? [{ producto, cantidad }] : [];
  });
}

/**
 * Quita de los favoritos los códigos que ya no están en el catálogo (si no, el contador del header los cuenta y
 * /favoritos no los muestra). Solo con el catálogo completo: si una categoría de Saint no cargó, se quedan todos.
 */
async function favoritosVigentes(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return ids;
  const { productos, completo } = await getIndiceConEstado();
  if (!completo) return ids;
  const existen = new Set(productos.map((p) => p.id));
  return ids.filter((id) => existen.has(id));
}

/**
 * Al entrar: junta lo del navegador con lo de la cuenta, lo guarda y devuelve el resultado para el navegador.
 * null si no hay sesión o algo falló (el navegador se queda con lo suyo y lo vuelve a intentar en la próxima visita).
 */
export async function sincronizarAlEntrar(navegador: {
  carrito: unknown;
  favoritos: unknown;
  direcciones?: unknown;
}): Promise<DatosCuenta | null> {
  const cliente = await usuarioActual();
  if (!cliente) return null;
  // Los eventos de este navegador (de antes de entrar y de después) quedan unidos a la cuenta. Nunca falla.
  const vinculo = vincularVisitante(cliente.id);
  try {
    const cuenta = await leerLineas(cliente.id);
    const carrito = mezclarCarrito(limpiarCarrito(navegador.carrito), cuenta.carrito);
    const favoritos = await favoritosVigentes(mezclarFavoritos(limpiarFavoritos(navegador.favoritos), cuenta.favoritos));
    // Direcciones: las del navegador se suman sin duplicar (mismo id, o mismo nombre y casi el mismo punto).
    const direcciones = mezclarDirecciones(limpiarDirecciones(navegador.direcciones), cuenta.direcciones);
    await escribir(cliente.id, { carrito, favoritos, direcciones });
    const conDatos = await conProductos(carrito);
    return conDatos ? { carrito: conDatos, favoritos, direcciones } : null;
  } catch (error) {
    console.error("[cuenta] No se pudo sincronizar el carrito y los favoritos:", error);
    return null;
  } finally {
    await vinculo;
  }
}

/** En las visitas siguientes: lo que hay en la cuenta (manda sobre lo del navegador). */
export async function leerDatosCuenta(): Promise<DatosCuenta | null> {
  const cliente = await usuarioActual();
  if (!cliente) return null;
  // También en cada visita: si la cookie del visitante se creó después de entrar, aquí queda vinculada.
  const vinculo = vincularVisitante(cliente.id);
  try {
    const { carrito, favoritos: guardados, direcciones } = await leerLineas(cliente.id);
    const favoritos = await favoritosVigentes(guardados);
    // Si se quitó alguno, la cuenta también queda limpia (si falla, se vuelve a intentar en la próxima visita).
    if (favoritos.length < guardados.length) {
      await escribir(cliente.id, { favoritos }).catch((error) => console.error("[cuenta] No se pudieron limpiar los favoritos:", error));
    }
    const conDatos = await conProductos(carrito);
    return conDatos ? { carrito: conDatos, favoritos, direcciones } : null;
  } catch (error) {
    console.error("[cuenta] No se pudo leer el carrito y los favoritos:", error);
    return null;
  } finally {
    await vinculo;
  }
}

/** Guarda en la cuenta el carrito, los favoritos y/o las direcciones tal como quedaron en el navegador. */
export async function guardarDatosCuenta(datos: { carrito?: unknown; favoritos?: unknown; direcciones?: unknown }): Promise<boolean> {
  const cliente = await usuarioActual();
  if (!cliente) return false;
  try {
    await escribir(cliente.id, {
      carrito: datos.carrito === undefined ? undefined : limpiarCarrito(datos.carrito),
      favoritos: datos.favoritos === undefined ? undefined : limpiarFavoritos(datos.favoritos),
      direcciones: datos.direcciones === undefined ? undefined : limpiarDirecciones(datos.direcciones),
    });
    return true;
  } catch (error) {
    console.error("[cuenta] No se pudo guardar el carrito o los favoritos:", error);
    return false;
  }
}

/**
 * Al tocar "Enviar por WhatsApp": ¿le preguntamos (sin obligarlo) su cédula/RIF y teléfono? Solo si tiene cuenta, no
 * tiene datos para la factura y es su PRIMER pedido. Devuelve también su nombre, para llenar el campo. Nunca lanza.
 */
export async function datosParaPrimerPedido(): Promise<{ pedir: boolean; nombre: string }> {
  try {
    const cliente = await usuarioActual();
    if (!cliente) return { pedir: false, nombre: "" };
    const [conPerfil, conPedidos] = await Promise.all([
      db.select({ id: perfil.userId }).from(perfil).where(eq(perfil.userId, cliente.id)).limit(1),
      tienePedidos(cliente.id),
    ]);
    return { pedir: conPerfil.length === 0 && !conPedidos, nombre: cliente.name ?? "" };
  } catch {
    return { pedir: false, nombre: "" };
  }
}

/* ---------- Mis pedidos (fase 5; lógica en lib/pedidos/) ---------- */

/** Pedidos de la cuenta con sesión, del más reciente al más viejo. null si no hay sesión. */
export async function misPedidos(pagina = 1, porPagina = 20): Promise<{ pedidos: ResumenPedido[]; total: number } | null> {
  const cliente = await usuarioActual();
  if (!cliente) return null;
  return listarPedidos(cliente.id, pagina, porPagina);
}

/** Un pedido de la cuenta con sesión (null si no hay sesión, no existe o es de otra cuenta). */
export async function miPedido(id: string): Promise<DetallePedido | null> {
  const cliente = await usuarioActual();
  if (!cliente || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  return leerPedido(cliente.id, id.toLowerCase());
}
