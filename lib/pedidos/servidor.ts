import "server-only";

import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { pedido, pedidoItem, type DireccionPedido } from "@/lib/db/esquema";
import { getIndiceConEstado } from "@/lib/catalogo";
import { permitidosPorTope } from "@/lib/eventos/reglas";
import { preciosAlDia } from "@/lib/saint";
import { getTasaBCV } from "@/lib/tasa";
import type { Producto } from "@/types/catalogo";
import { calcularPedido, type EnvioPedido } from "./reglas";

// Pedidos de la cuenta — lado del servidor: guardar el pedido que se envió por WhatsApp y leer los de la cuenta para
// "Mis pedidos". Solo para clientes con cuenta (sin cuenta solo hay eventos "pedido_enviado", ver lib/eventos/).
// Guardar NUNCA hace esperar al cliente: /api/pedidos responde al instante y guarda después. Responsable: persona A.

/** Tope de pedidos por cuenta y por hora (nadie pide 30 veces en una hora; frena a quien quiera llenar la base). */
const PEDIDOS_POR_HORA = 30;

async function dentroDelLimite(userId: string): Promise<boolean> {
  const clave = `pedidos:cuenta:${userId}`;
  const { rows } = await db.execute<{ conteo: number }>(sql`
    insert into limite_intento (clave, conteo, inicio) values (${clave}, 1, now())
    on conflict (clave) do update set
      conteo = case when limite_intento.inicio < now() - interval '1 hour' then 1 else limite_intento.conteo + 1 end,
      inicio = case when limite_intento.inicio < now() - interval '1 hour' then now() else limite_intento.inicio end
    returning conteo`);
  return permitidosPorTope(Number(rows[0]?.conteo ?? 1), 1, PEDIDOS_POR_HORA) === 1;
}

const porId = new WeakMap<Producto[], Map<string, Producto>>();
function mapaDe(productos: Producto[]): Map<string, Producto> {
  let mapa = porId.get(productos);
  if (!mapa) {
    mapa = new Map(productos.map((p) => [p.id, p]));
    porId.set(productos, mapa);
  }
  return mapa;
}

/**
 * Precio ACTUAL de Saint de cada producto del pedido (&codigos=, sin caché; casi siempre reutiliza la consulta que hizo
 * finalizar pedido segundos antes). El nombre sale de la lista guardada. Lo que no se pudo consultar no va en el mapa:
 * calcularPedido usa el precio del navegador y lo marca `precioVerificado: false`.
 */
async function preciosDelPedido(envio: EnvioPedido): Promise<Map<string, Pick<Producto, "precio" | "nombre">>> {
  const [{ precios }, indice] = await Promise.all([
    preciosAlDia(envio.items.map((i) => i.id)),
    getIndiceConEstado().catch(() => null),
  ]);
  const catalogo = indice ? mapaDe(indice.productos) : null;
  const mapa = new Map<string, Pick<Producto, "precio" | "nombre">>();
  for (const { id, nombre } of envio.items) {
    const alDia = precios.get(id);
    if (alDia) mapa.set(id, { precio: alDia.precio, nombre: catalogo?.get(id)?.nombre ?? nombre });
  }
  return mapa;
}

/**
 * Guarda un pedido de la cuenta con los precios de Saint y la tasa BCV de ESTE instante. Un mismo `id` se guarda una
 * sola vez (doble toque). Devuelve true si lo guardó. Lanza si la base de datos falla (quien llama lo atrapa).
 */
export async function guardarPedido(userId: string, envio: EnvioPedido): Promise<boolean> {
  if (!(await dentroDelLimite(userId))) return false;
  const [precios, tasa] = await Promise.all([preciosDelPedido(envio), getTasaBCV()]);
  const { items, totalUsd, totalBs } = calcularPedido(envio, precios, tasa?.tasa ?? null);

  const filas = items.map((i, posicion) => ({
    posicion,
    producto_id: i.productoId,
    nombre: i.nombre,
    cantidad: i.cantidad,
    precio_usd: i.precioUsd,
    precio_bs: i.precioBs,
    precio_verificado: i.precioVerificado,
  }));
  // Una sola consulta: los productos se guardan SOLO si el pedido es nuevo (un id que ya existe —aunque sea de otra
  // cuenta— no agrega nada).
  const { rows } = await db.execute<{ guardado: number }>(sql`
    with nuevo as (
      insert into pedido (id, user_id, tasa, total_usd, total_bs, retiro, pago, pagos_combinados, direccion)
      values (${envio.id}::uuid, ${userId}, ${tasa?.tasa ?? null}, ${totalUsd}, ${totalBs}, ${envio.retiro}, ${envio.pago},
              array(select jsonb_array_elements_text(${JSON.stringify(envio.combinados)}::jsonb)),
              ${envio.direccion ? JSON.stringify(envio.direccion) : null}::jsonb)
      on conflict (id) do nothing
      returning id
    ), productos as (
      insert into pedido_item (pedido_id, posicion, producto_id, nombre, cantidad, precio_usd, precio_bs, precio_verificado)
      select n.id, i.posicion, i.producto_id, i.nombre, i.cantidad, i.precio_usd, i.precio_bs, i.precio_verificado
      from nuevo n cross join jsonb_to_recordset(${JSON.stringify(filas)}::jsonb) as i(
        posicion integer, producto_id text, nombre text, cantidad integer, precio_usd numeric, precio_bs numeric,
        precio_verificado boolean)
      returning 1
    )
    select count(*)::int as guardado from nuevo`);
  return Number(rows[0]?.guardado ?? 0) === 1;
}

/** ¿La cuenta ya envió algún pedido? (para preguntar la cédula y el teléfono solo en el primero). */
export async function tienePedidos(userId: string): Promise<boolean> {
  const [fila] = await db.select({ id: pedido.id }).from(pedido).where(eq(pedido.userId, userId)).limit(1);
  return Boolean(fila);
}

export type ResumenPedido = {
  id: string;
  fecha: Date;
  totalUsd: number;
  totalBs: number | null;
  productos: number; // líneas distintas
  unidades: number;
};

/** Pedidos de la cuenta, del más reciente al más viejo, de a `porPagina`. */
export async function listarPedidos(
  userId: string,
  pagina = 1,
  porPagina = 20,
): Promise<{ pedidos: ResumenPedido[]; total: number }> {
  const [filas, [{ total }]] = await Promise.all([
    db
      .select({
        id: pedido.id,
        fecha: pedido.createdAt,
        totalUsd: pedido.totalUsd,
        totalBs: pedido.totalBs,
        productos: sql<number>`count(${pedidoItem.posicion})::int`,
        unidades: sql<number>`coalesce(sum(${pedidoItem.cantidad}), 0)::int`,
      })
      .from(pedido)
      .leftJoin(pedidoItem, eq(pedidoItem.pedidoId, pedido.id))
      .where(eq(pedido.userId, userId))
      .groupBy(pedido.id)
      .orderBy(desc(pedido.createdAt))
      .limit(porPagina)
      .offset((Math.max(1, pagina) - 1) * porPagina),
    db.select({ total: count() }).from(pedido).where(eq(pedido.userId, userId)),
  ]);
  return { pedidos: filas, total };
}

export type DetallePedido = {
  id: string;
  fecha: Date;
  tasa: number | null;
  totalUsd: number;
  totalBs: number | null;
  retiro: "pickup" | "delivery" | "flete";
  pago: string;
  pagosCombinados: string[];
  direccion: DireccionPedido | null;
  items: {
    productoId: string;
    nombre: string;
    cantidad: number;
    precioUsd: number;
    precioBs: number | null;
    precioVerificado: boolean;
  }[];
};

/** Un pedido de ESA cuenta (null si no existe o es de otra cuenta). */
export async function leerPedido(userId: string, id: string): Promise<DetallePedido | null> {
  const [cabecera] = await db
    .select()
    .from(pedido)
    .where(and(eq(pedido.id, id), eq(pedido.userId, userId)))
    .limit(1);
  if (!cabecera) return null;
  const items = await db
    .select({
      productoId: pedidoItem.productoId,
      nombre: pedidoItem.nombre,
      cantidad: pedidoItem.cantidad,
      precioUsd: pedidoItem.precioUsd,
      precioBs: pedidoItem.precioBs,
      precioVerificado: pedidoItem.precioVerificado,
    })
    .from(pedidoItem)
    .where(eq(pedidoItem.pedidoId, id))
    .orderBy(pedidoItem.posicion);
  return {
    id: cabecera.id,
    fecha: cabecera.createdAt,
    tasa: cabecera.tasa,
    totalUsd: cabecera.totalUsd,
    totalBs: cabecera.totalBs,
    retiro: cabecera.retiro,
    pago: cabecera.pago,
    pagosCombinados: cabecera.pagosCombinados,
    direccion: cabecera.direccion ?? null,
    items,
  };
}

/** Productos de hoy (del catálogo) para "Volver a pedir": los que ya no existen no vienen. */
export async function productosDeHoy(ids: string[]): Promise<{ productos: Producto[]; completo: boolean }> {
  try {
    const indice = await getIndiceConEstado();
    const mapa = mapaDe(indice.productos);
    return { productos: ids.flatMap((id) => mapa.get(id) ?? []), completo: indice.completo };
  } catch {
    return { productos: [], completo: false };
  }
}
