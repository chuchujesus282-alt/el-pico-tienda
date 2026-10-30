import { METODOS_COMBINABLES, METODOS_PAGO, type FormaRetiro, type MetodoPago } from "@/components/finalizar-pedido/pedido";
import { LARGO_DESCRIPCION, LARGO_NOMBRE, ubicacionValida } from "@/lib/direcciones";
import { UUID } from "@/lib/eventos/reglas";
import type { Producto } from "@/types/catalogo";
import type { Direccion } from "@/types/cliente";

// Pedidos de la cuenta — reglas puras (sin base de datos): qué se acepta de lo que manda el navegador al tocar
// "Enviar por WhatsApp" y cómo se calculan los montos con el catálogo y la tasa de ese instante.
// Se prueban en lib/__tests__/pedidos.test.ts. Responsable: persona A.

export const MAXIMO_LINEAS = 200;
export const MAXIMO_CANTIDAD = 9999;
const MAXIMO_PRECIO = 1_000_000;
const CODIGO_PRODUCTO = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,29}$/;

/** Lo que manda el navegador (lo mismo que va en el mensaje de WhatsApp). */
export type EnvioPedido = {
  id: string; // UUID generado en el navegador: un doble toque no duplica el pedido
  // descripcion: la de Saint (Descrip2) que vio el cliente; respaldo si Saint no responde al guardar.
  items: { id: string; nombre: string; descripcion: string | null; cantidad: number; precio: number }[];
  retiro: FormaRetiro;
  direccion: Pick<Direccion, "nombre" | "descripcion" | "latitud" | "longitud"> | null;
  pago: MetodoPago;
  combinados: MetodoPago[];
};

const RETIROS: FormaRetiro[] = ["pickup", "delivery", "flete"];
const PAGOS = new Set<string>(METODOS_PAGO.map((m) => m.valor));
const COMBINABLES = new Set<string>(METODOS_COMBINABLES.map((m) => m.valor));

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");

/** Lo que llega del navegador → pedido limpio, o null si no sirve (no se guarda, pero WhatsApp ya se abrió igual). */
export function limpiarEnvioPedido(crudo: unknown): EnvioPedido | null {
  if (!crudo || typeof crudo !== "object") return null;
  const e = crudo as Record<string, unknown>;

  const id = typeof e.id === "string" ? e.id.toLowerCase() : "";
  if (!UUID.test(id)) return null;

  if (!Array.isArray(e.items)) return null;
  const vistos = new Set<string>();
  const items: EnvioPedido["items"] = [];
  for (const crudoItem of e.items.slice(0, MAXIMO_LINEAS)) {
    const it = (crudoItem ?? {}) as Record<string, unknown>;
    const codigo = typeof it.id === "string" ? it.id.trim() : "";
    const cantidad = typeof it.cantidad === "number" ? Math.floor(it.cantidad) : NaN;
    const precio = typeof it.precio === "number" ? it.precio : NaN;
    if (!CODIGO_PRODUCTO.test(codigo) || vistos.has(codigo)) continue;
    if (!Number.isFinite(cantidad) || cantidad < 1 || cantidad > MAXIMO_CANTIDAD) continue;
    if (!Number.isFinite(precio) || precio < 0 || precio > MAXIMO_PRECIO) continue;
    vistos.add(codigo);
    items.push({ id: codigo, nombre: texto(it.nombre, 200) || codigo, descripcion: texto(it.descripcion, 120) || null, cantidad, precio });
  }
  if (items.length === 0) return null;

  const retiro = e.retiro as FormaRetiro;
  if (!RETIROS.includes(retiro)) return null;

  const pago = e.pago as MetodoPago;
  if (!PAGOS.has(pago)) return null;
  const combinados =
    pago === "combinado" && Array.isArray(e.combinados)
      ? ([...new Set(e.combinados)].filter((m): m is MetodoPago => typeof m === "string" && COMBINABLES.has(m)))
      : [];
  if (pago === "combinado" && combinados.length < 2) return null;

  // La dirección solo con delivery o flete, y solo si es válida (si no, el pedido se guarda sin ella).
  let direccion: EnvioPedido["direccion"] = null;
  const d = e.direccion as Record<string, unknown> | null | undefined;
  if (retiro !== "pickup" && d && typeof d === "object") {
    const candidata = {
      nombre: texto(d.nombre, LARGO_NOMBRE.maximo),
      descripcion: texto(d.descripcion, LARGO_DESCRIPCION.maximo),
      latitud: Number(d.latitud),
      longitud: Number(d.longitud),
    };
    if (candidata.nombre && ubicacionValida(candidata)) direccion = candidata;
  }

  return { id, items, retiro, direccion, pago, combinados };
}

const redondear = (n: number) => Math.round(n * 100) / 100;

export type ItemCalculado = {
  productoId: string;
  nombre: string;
  /** La de Saint (Descrip2), como viene; null si no tiene. */
  descripcion: string | null;
  cantidad: number;
  precioUsd: number;
  precioBs: number | null;
  /** false: Saint no respondió (o el producto no estaba) y se usó el precio que traía el navegador. */
  precioVerificado: boolean;
};

/**
 * Montos del pedido: el precio de cada producto sale de Saint en ese instante (no del navegador); si no se pudo
 * consultar, se usa el del navegador y se marca `precioVerificado: false`. Bs = $ × tasa (sin tasa, Bs queda vacío).
 */
export function calcularPedido(
  envio: EnvioPedido,
  catalogo: Map<string, Pick<Producto, "precio" | "nombre" | "descripcion">> | null,
  tasa: number | null,
): { items: ItemCalculado[]; totalUsd: number; totalBs: number | null } {
  const conTasa = tasa !== null && Number.isFinite(tasa) && tasa > 0 ? tasa : null;
  const items = envio.items.map(({ id, nombre, descripcion, cantidad, precio }) => {
    const producto = catalogo?.get(id);
    const precioUsd = redondear(producto ? producto.precio : precio);
    return {
      productoId: id,
      nombre: producto?.nombre ?? nombre,
      descripcion: producto ? (producto.descripcion ?? null) : descripcion,
      cantidad,
      precioUsd,
      precioBs: conTasa ? redondear(precioUsd * conTasa) : null,
      precioVerificado: Boolean(producto),
    };
  });
  const totalUsd = redondear(items.reduce((suma, i) => suma + i.precioUsd * i.cantidad, 0));
  // Total en Bs = suma de las líneas en Bs (así cuadra al céntimo con lo que se ve en el detalle).
  const totalBs = conTasa ? redondear(items.reduce((suma, i) => suma + (i.precioBs ?? 0) * i.cantidad, 0)) : null;
  return { items, totalUsd, totalBs };
}
