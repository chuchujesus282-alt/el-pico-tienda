import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { visitanteCuenta } from "@/lib/db/esquema";
import { getCategorias, getIndiceConEstado } from "@/lib/catalogo";
import { esCategoriaSaint, getCategoriaSaint } from "@/lib/saint";
import type { Producto } from "@/types/catalogo";
import { type Evento, LIMITES, MINUTOS_SIN_REPETIR, permitidosPorTope } from "./reglas";

// Eventos para análisis — lado del servidor: el visitante (cookie), el límite por visitante y por red, guardar,
// vincular a la cuenta y resumir/borrar lo viejo. Lo usan app/api/eventos/route.ts y lib/cuenta.ts.
// Nada de esto hace esperar a una página: /api/eventos responde de inmediato y trabaja después (after()).
// Ver docs/eventos.md. Responsable: persona A.

/* ---------- Visitante anónimo ---------- */

/** Cookie con un código al azar (UUID) que no identifica a la persona. La lee solo el servidor. */
export const COOKIE_VISITANTE = "el-pico-visitante";
const UN_ANO = 60 * 60 * 24 * 365;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const visitanteValido = (valor: string | undefined): string | null =>
  valor && UUID.test(valor) ? valor.toLowerCase() : null;

export const nuevoVisitante = () => randomUUID();

export const opcionesCookieVisitante = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: UN_ANO,
};

/** IP → código irreversible (HMAC con el secreto del sitio). Solo para el límite por red; la IP no se guarda. */
export function resumenRed(ip: string | null): string {
  const secreto = process.env.BETTER_AUTH_SECRET || "el-pico";
  return createHmac("sha256", secreto).update(ip ?? "sin-ip").digest("hex").slice(0, 32);
}

/** Primera IP de x-forwarded-for (la que pone Vercel) o x-real-ip. */
export function ipDe(cabeceras: Headers): string | null {
  return cabeceras.get("x-forwarded-for")?.split(",")[0]?.trim() || cabeceras.get("x-real-ip") || null;
}

/* ---------- Límite por visitante y por red ---------- */

/**
 * Suma `n` eventos a la ventana de una hora del visitante y de su red (tabla limite_intento, claves "eventos:…") y
 * devuelve cuántos de esos n se dejan pasar. Una sola consulta.
 */
async function permitidos(visitante: string, red: string, n: number): Promise<number> {
  const claveVisitante = `eventos:visitante:${visitante}`;
  const claveRed = `eventos:red:${red}`;
  const { rows } = await db.execute<{ clave: string; conteo: number }>(sql`
    insert into limite_intento (clave, conteo, inicio)
    values (${claveVisitante}, ${n}, now()), (${claveRed}, ${n}, now())
    on conflict (clave) do update set
      conteo = case when limite_intento.inicio < now() - interval '1 hour' then excluded.conteo
                    else limite_intento.conteo + excluded.conteo end,
      inicio = case when limite_intento.inicio < now() - interval '1 hour' then now() else limite_intento.inicio end
    returning clave, conteo`);
  let pasan = n;
  for (const fila of rows) {
    const tope = fila.clave === claveVisitante ? LIMITES.visitantePorHora : LIMITES.redPorHora;
    pasan = Math.min(pasan, permitidosPorTope(Number(fila.conteo), n, tope));
  }
  return pasan;
}

/* ---------- Validar contra el catálogo ---------- */

const porId = new WeakMap<Producto[], Set<string>>();
function idsDe(productos: Producto[]): Set<string> {
  let ids = porId.get(productos);
  if (!ids) {
    ids = new Set(productos.map((p) => p.id));
    porId.set(productos, ids);
  }
  return ids;
}

/**
 * Deja solo lo que existe: productos del catálogo (si está completo; si alguna categoría de Saint no cargó, no se
 * descarta lo que no se puede comprobar) y categorías de la tienda. La subcategoría de Saint pasa de nombre a código.
 */
async function conCatalogo(eventos: Evento[]): Promise<Evento[]> {
  const necesitaProductos = eventos.some((e) => "producto" in e);
  const necesitaCategorias = eventos.some((e) => e.tipo === "categoria_vista");
  const [indice, categorias] = await Promise.all([
    necesitaProductos ? getIndiceConEstado().catch(() => null) : null,
    necesitaCategorias ? getCategorias().catch(() => null) : null,
  ]);
  const ids = indice?.completo ? idsDe(indice.productos) : null;
  const slugs = categorias ? new Set(categorias.map((c) => c.slug)) : null;

  const resultado: Evento[] = [];
  for (const e of eventos) {
    if ("producto" in e) {
      if (ids && !ids.has(e.producto)) continue;
      resultado.push(e);
    } else if (e.tipo === "categoria_vista") {
      if (slugs && !slugs.has(e.categoria)) continue;
      let subcategoria = e.subcategoria;
      if (subcategoria && esCategoriaSaint(e.categoria)) {
        const saint = await getCategoriaSaint(e.categoria).catch(() => null);
        // Un nivel del árbol llega con su código de instancia ("1503"); los enlaces viejos, con el nombre del primer nivel.
        const codigo = Number(subcategoria);
        subcategoria =
          saint && Number.isFinite(codigo) && saint.arbol.nodos.has(codigo)
            ? String(codigo)
            : saint?.subcategorias.find((s) => s.nombre === subcategoria)?.codigo;
      }
      resultado.push(subcategoria ? { ...e, subcategoria } : { tipo: e.tipo, categoria: e.categoria });
    } else {
      resultado.push(e);
    }
  }
  return resultado;
}

/* ---------- Guardar ---------- */

/**
 * Guarda los eventos de un visitante (ya limpios con limpiarEnvio). Aplica el límite, comprueba el catálogo y no
 * repite "producto visto"/"categoría vista" de los últimos 30 minutos. Devuelve cuántos guardó.
 */
export async function guardarEventos(visitante: string, ip: string | null, eventos: Evento[]): Promise<number> {
  if (eventos.length === 0) return 0;
  const pasan = await permitidos(visitante, resumenRed(ip), eventos.length);
  if (pasan === 0) return 0;
  const validos = await conCatalogo(eventos.slice(0, pasan));
  if (validos.length === 0) return 0;

  const filas = validos.map((e) => ({
    tipo: e.tipo,
    producto_id: "producto" in e ? e.producto : null,
    categoria: e.tipo === "categoria_vista" ? e.categoria : null,
    subcategoria: e.tipo === "categoria_vista" ? (e.subcategoria ?? null) : null,
    termino: e.tipo === "busqueda" ? e.termino : null,
    resultados: e.tipo === "busqueda" ? e.resultados : null,
    pedido_codigo: e.tipo === "pedido_enviado" ? e.pedido : null,
    // Vistas: no se repiten en 30 minutos. Pedidos: el mismo producto del mismo pedido, nunca.
    sin_repetir: e.tipo === "producto_visto" || e.tipo === "categoria_vista",
    unico_en_pedido: e.tipo === "pedido_enviado",
  }));

  // Una sola consulta para todo el envío. "Sin repetir": no se guarda si el mismo visitante ya tiene ese evento
  // (mismo producto, o misma categoría y subcategoría) en los últimos 30 minutos.
  const { rows } = await db.execute<{ guardados: number }>(sql`
    with nuevos as (
      insert into evento (tipo, visitante, producto_id, categoria, subcategoria, termino, resultados, pedido_codigo)
      select e.tipo::tipo_evento, ${visitante}::uuid, e.producto_id, e.categoria, e.subcategoria, e.termino, e.resultados,
             e.pedido_codigo::uuid
      from jsonb_to_recordset(${JSON.stringify(filas)}::jsonb) as e(
        tipo text, producto_id text, categoria text, subcategoria text, termino text, resultados integer,
        pedido_codigo text, sin_repetir boolean, unico_en_pedido boolean)
      where (not e.sin_repetir or not exists (
        select 1 from evento x
        where x.visitante = ${visitante}::uuid
          and x.tipo = e.tipo::tipo_evento
          and x.producto_id is not distinct from e.producto_id
          and x.categoria is not distinct from e.categoria
          and x.subcategoria is not distinct from e.subcategoria
          and x.created_at > now() - make_interval(mins => ${MINUTOS_SIN_REPETIR})
      ))
      and (not e.unico_en_pedido or not exists (
        select 1 from evento x
        where x.visitante = ${visitante}::uuid
          and x.tipo = 'pedido_enviado'
          and x.pedido_codigo = e.pedido_codigo::uuid
          and x.producto_id = e.producto_id
      ))
      returning 1
    )
    select count(*)::int as guardados from nuevos`);
  return Number(rows[0]?.guardados ?? 0);
}

/* ---------- Vincular a la cuenta ---------- */

/**
 * Anota que el visitante de este navegador es de esta cuenta (así sus eventos de antes y de después quedan unidos).
 * Lo llama lib/cuenta.ts al entrar y en cada visita con sesión. Sin cookie no hace nada (no crea una: crearla aquí
 * haría que Next recargara la página). Nunca lanza.
 */
export async function vincularVisitante(userId: string): Promise<void> {
  try {
    const visitante = visitanteValido((await cookies()).get(COOKIE_VISITANTE)?.value);
    if (!visitante) return;
    await db
      .insert(visitanteCuenta)
      .values({ visitante, userId })
      .onConflictDoUpdate({
        target: visitanteCuenta.visitante,
        set: { userId },
        setWhere: sql`${visitanteCuenta.userId} <> excluded.user_id`,
      });
  } catch (error) {
    console.error("[eventos] No se pudo vincular el visitante a la cuenta:", error);
  }
}

/** Al cerrar sesión: se borra la cookie y el próximo evento empieza con un código nuevo (computadoras compartidas). */
export async function olvidarVisitante(): Promise<void> {
  try {
    (await cookies()).delete(COOKIE_VISITANTE);
  } catch {
    // Nada que hacer.
  }
}

/* ---------- Resumir y borrar lo viejo (sin cron) ---------- */

const CADA_MS = 30 * 60_000;
const TANDA = 5000;
const TANDAS_POR_VEZ = 4;
let proximoMantenimiento = 0;

/**
 * Una tanda: toma hasta 5.000 eventos de antes del mes de hace 12 meses (en hora de Caracas: así cada mes se resume
 * completo), los suma al resumen mensual y los borra, todo en UNA consulta (si dos servidores lo hacen a la vez, cada
 * fila se cuenta una sola vez: la que la borró). Devuelve cuántos borró.
 */
async function resumirTanda(): Promise<number> {
  const { rows } = await db.execute<{ borrados: number }>(sql`
    with viejos as (
      select id from evento
      where created_at < (date_trunc('month', now() at time zone 'America/Caracas') - interval '12 months')
                         at time zone 'America/Caracas'
      order by id
      limit ${TANDA}
      for update skip locked
    ), borrados as (
      delete from evento e using viejos v where e.id = v.id
      returning e.tipo, e.producto_id, e.categoria, e.subcategoria, e.termino, e.resultados, e.created_at
    ), resumen_eventos as (
      insert into resumen_evento_mes (mes, tipo, producto_id, categoria, subcategoria, cantidad)
      select date_trunc('month', created_at at time zone 'America/Caracas')::date, tipo,
             coalesce(producto_id, ''), coalesce(categoria, ''), coalesce(subcategoria, ''), count(*)
      from borrados where tipo <> 'busqueda'
      group by 1, 2, 3, 4, 5
      on conflict (mes, tipo, producto_id, categoria, subcategoria)
        do update set cantidad = resumen_evento_mes.cantidad + excluded.cantidad
    ), resumen_busquedas as (
      insert into resumen_busqueda_mes (mes, termino, cantidad, sin_resultados)
      select date_trunc('month', created_at at time zone 'America/Caracas')::date, termino,
             count(*), count(*) filter (where resultados = 0)
      from borrados where tipo = 'busqueda' and termino is not null
      group by 1, 2
      on conflict (mes, termino) do update set
        cantidad = resumen_busqueda_mes.cantidad + excluded.cantidad,
        sin_resultados = resumen_busqueda_mes.sin_resultados + excluded.sin_resultados
    )
    select count(*)::int as borrados from borrados`);
  return Number(rows[0]?.borrados ?? 0);
}

/**
 * Mantenimiento: resume y borra los eventos de más de 12 meses (unas tandas) y limpia los conteos viejos del límite.
 * Lo dispara /api/eventos como mucho cada 30 minutos por servidor, después de responder. Nunca lanza.
 */
export async function mantenimientoSiToca(): Promise<void> {
  if (Date.now() < proximoMantenimiento) return;
  proximoMantenimiento = Date.now() + CADA_MS;
  try {
    for (let i = 0; i < TANDAS_POR_VEZ; i++) {
      if ((await resumirTanda()) < TANDA) break;
    }
    await db.execute(sql`delete from limite_intento where clave like 'eventos:%' and inicio < now() - interval '1 day'`);
  } catch (error) {
    console.error("[eventos] Falló el mantenimiento (se reintenta más tarde):", error);
  }
}

/** Solo para pruebas: corre una tanda ya, sin esperar los 30 minutos. */
export const resumirTandaParaPruebas = resumirTanda;
