// Reparte la respuesta de Saint con VARIAS categorías (&categoria=1171,1200) en una por categoría de la web, por el
// codCategoria de cada producto y subcategoría. Aparte de lib/saint.ts (que es solo de servidor) para poder probarlo.
// Responsable: persona A.

type Crudo = { tasa?: unknown; subcategorias?: unknown; instancias?: unknown; productos?: unknown };
/** Lo mismo que respondía Saint con una sola categoría: lo que recibe convertir() en lib/saint.ts. */
export type ParteSaint = { tasa: unknown; subcategorias: unknown[]; instancias: unknown[]; productos: unknown[] };

const codigoDe = (fila: unknown) => {
  const valor = (fila as { codCategoria?: unknown } | null)?.codCategoria;
  const numero = typeof valor === "number" ? valor : typeof valor === "string" ? Number(valor) : NaN;
  return Number.isFinite(numero) ? numero : undefined;
};

/**
 * slug → su parte de la respuesta, para cada categoría del mapa (aunque Saint no traiga nada de ella: lista vacía).
 * Con una sola categoría en el mapa, todo va a esa aunque falte codCategoria (la API de antes no lo traía). Lo que
 * traiga un codCategoria que no está en el mapa se descarta. Si la respuesta no trae lista de productos, se devuelve
 * tal cual en cada parte: convertir() se encarga de rechazarla con su mensaje.
 */
export function repartirPorCategoria(crudo: unknown, mapa: Record<string, number>): Map<string, ParteSaint> {
  const datos = (crudo ?? {}) as Crudo;
  const slugs = Object.keys(mapa);
  const partes = new Map<string, ParteSaint>(
    slugs.map((slug) => [slug, { tasa: datos.tasa, subcategorias: [], instancias: [], productos: [] }]),
  );
  if (!Array.isArray(datos.productos)) {
    for (const parte of partes.values()) parte.productos = datos.productos as unknown[];
    return partes;
  }

  const slugPorCodigo = new Map(Object.entries(mapa).map(([slug, codigo]) => [codigo, slug]));
  const unica = slugs.length === 1 ? slugs[0] : undefined;
  const destino = (fila: unknown) => {
    const codigo = codigoDe(fila);
    return codigo === undefined ? unica : slugPorCodigo.get(codigo);
  };

  for (const sub of Array.isArray(datos.subcategorias) ? datos.subcategorias : []) {
    const slug = destino(sub);
    if (slug) partes.get(slug)!.subcategorias.push(sub);
  }
  // El árbol completo de subcategorías (todos los niveles), también con su codCategoria.
  for (const instancia of Array.isArray(datos.instancias) ? datos.instancias : []) {
    const slug = destino(instancia);
    if (slug) partes.get(slug)!.instancias.push(instancia);
  }
  for (const producto of datos.productos) {
    const slug = destino(producto);
    if (slug) partes.get(slug)!.productos.push(producto);
  }
  return partes;
}
