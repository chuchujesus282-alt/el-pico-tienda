// Eventos para análisis — reglas puras (sin base de datos ni navegador): qué tipos hay, qué se acepta, qué es un
// robot y qué búsqueda parece un dato personal. Las usan el navegador (lib/eventos/cliente.ts), para no mandar lo que
// igual se descartaría, y el servidor (lib/eventos/servidor.ts), que NO confía en lo que llega.
// Se prueban en lib/__tests__/eventos.test.ts. Responsable: persona A. Ver docs/eventos.md.

/** Los mismos valores que el enum "tipo_evento" de la base (lib/db/esquema.ts). */
export const TIPOS_EVENTO = [
  "producto_visto",
  "categoria_vista",
  "busqueda",
  "carrito",
  "favorito",
  "pedido_enviado",
] as const;
export type TipoEvento = (typeof TIPOS_EVENTO)[number];

/** Los que el navegador puede mandar (todos). */
const DESDE_NAVEGADOR = new Set<TipoEvento>(TIPOS_EVENTO);

/** Lo que se registra. Cada tipo usa solo sus campos; los demás se descartan. */
export type Evento =
  | { tipo: "producto_visto" | "carrito" | "favorito"; producto: string }
  /** Uno por producto del pedido; `pedido` es un código al azar (UUID) común a todos los productos del mismo pedido. */
  | { tipo: "pedido_enviado"; producto: string; pedido: string }
  | { tipo: "categoria_vista"; categoria: string; subcategoria?: string }
  | { tipo: "busqueda"; termino: string; resultados: number };

/** "Producto visto" y "categoría vista": una vez cada 30 minutos por visitante (y producto o categoría). */
export const MINUTOS_SIN_REPETIR = 30;
export const SIN_REPETIR = new Set<TipoEvento>(["producto_visto", "categoria_vista"]);

/** Límites contra el abuso. La "red" es la IP resumida (nunca se guarda la IP); en Venezuela muchas se comparten. */
export const LIMITES = {
  porEnvio: 20,
  bytesPorEnvio: 8 * 1024,
  visitantePorHora: 300,
  redPorHora: 3000,
} as const;

const CODIGO_PRODUCTO = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,29}$/;
const SLUG = /^[a-z0-9][a-z0-9-]{0,39}$/;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const LARGO_TERMINO = 60;

/**
 * Robots, buscadores, vistas previas de enlaces y herramientas automáticas (sus visitas no se cuentan).
 * WhatsApp/Telegram NO van aquí: sus navegadores internos son de personas (sus vistas previas dicen "bot" o
 * "preview", o ni siquiera corren JavaScript).
 */
const ROBOT =
  /bot\b|bot\/|crawl|spider|slurp|bingpreview|mediapartners|adsbot|google-|googleother|facebookexternalhit|meta-externalagent|preview|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|python|curl|wget|httpclient|axios|node-fetch|undici|go-http|java\/|okhttp|scrapy|phantom|selenium|puppeteer|playwright|chrome-lighthouse|yandex|baidu|duckduck|petal|semrush|ahrefs|mj12|dotbot|bytespider|gptbot|claudebot|ccbot|perplexity/i;

/** ¿El navegador dice ser un robot (o no dice nada)? */
export function esRobot(agente: string | null | undefined): boolean {
  if (!agente || agente.length < 10) return true;
  return ROBOT.test(agente);
}

/**
 * ¿La búsqueda parece un dato personal? Correos, teléfonos venezolanos (0412…, +58…) y cédulas (V-12345678).
 * Esas no se guardan. Los códigos de producto (ACS0082, 00302011) sí pasan.
 */
export function pareceDatoPersonal(termino: string): boolean {
  if (/[^\s@]+@[^\s@]+/.test(termino)) return true;
  const digitos = termino.replace(/[\s().+-]/g, "");
  if (/(^|\D)(58)?0?(2\d{2}|4[12]\d)\d{7}(\D|$)/.test(digitos)) return true;
  if (/(^|[^a-z0-9])[ve]\s*[-.]?\s*\d{1,2}\.?\d{3}\.?\d{3}(\D|$)/i.test(termino)) return true;
  return false;
}

/** "  LLAVE   Combinada " → "llave combinada" (máx. 60 caracteres). null si queda vacío o parece un dato personal. */
export function limpiarTermino(termino: unknown): string | null {
  if (typeof termino !== "string") return null;
  const limpio = termino.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase().slice(0, LARGO_TERMINO).trim();
  if (limpio.length < 2 || pareceDatoPersonal(limpio)) return null;
  return limpio;
}

const texto = (v: unknown, max: number) => (typeof v === "string" && v.trim() !== "" ? v.trim().slice(0, max) : undefined);

/** Un evento crudo (del navegador) → evento limpio, o null si no sirve. */
export function limpiarEvento(crudo: unknown): Evento | null {
  if (!crudo || typeof crudo !== "object") return null;
  const e = crudo as Record<string, unknown>;
  const tipo = e.tipo as TipoEvento;
  if (!DESDE_NAVEGADOR.has(tipo)) return null;

  if (tipo === "busqueda") {
    const termino = limpiarTermino(e.termino);
    const resultados = typeof e.resultados === "number" ? Math.trunc(e.resultados) : NaN;
    if (!termino || !Number.isFinite(resultados) || resultados < 0 || resultados > 100_000) return null;
    return { tipo, termino, resultados };
  }
  if (tipo === "categoria_vista") {
    const categoria = typeof e.categoria === "string" ? e.categoria : "";
    if (!SLUG.test(categoria)) return null;
    const subcategoria = texto(e.subcategoria, 60);
    return subcategoria ? { tipo, categoria, subcategoria } : { tipo, categoria };
  }
  const producto = typeof e.producto === "string" ? e.producto.trim() : "";
  if (!CODIGO_PRODUCTO.test(producto)) return null;
  if (tipo === "pedido_enviado") {
    const pedido = typeof e.pedido === "string" ? e.pedido.toLowerCase() : "";
    return UUID.test(pedido) ? { tipo, producto, pedido } : null;
  }
  return { tipo, producto } as Evento;
}

/** Clave para "no repetir en 30 minutos" (null si el tipo se cuenta siempre). */
export function claveSinRepetir(e: Evento): string | null {
  if (e.tipo === "producto_visto") return `p:${e.producto}`;
  if (e.tipo === "categoria_vista") return `c:${e.categoria}|${e.subcategoria ?? ""}`;
  // Un mismo pedido no cuenta dos veces el mismo producto (doble toque en "Enviar por WhatsApp").
  if (e.tipo === "pedido_enviado") return `o:${e.pedido}|${e.producto}`;
  return null;
}

/**
 * Lo que manda el navegador ({ eventos: [...] }) → eventos limpios, sin repetidos dentro del mismo envío y como
 * máximo LIMITES.porEnvio.
 */
export function limpiarEnvio(cuerpo: unknown): Evento[] {
  const lista = (cuerpo as { eventos?: unknown })?.eventos;
  if (!Array.isArray(lista)) return [];
  const vistos = new Set<string>();
  const limpios: Evento[] = [];
  for (const crudo of lista.slice(0, LIMITES.porEnvio)) {
    const evento = limpiarEvento(crudo);
    if (!evento) continue;
    const clave = claveSinRepetir(evento);
    if (clave) {
      if (vistos.has(clave)) continue;
      vistos.add(clave);
    }
    limpios.push(evento);
  }
  return limpios;
}

/**
 * Cuántos se dejan pasar con un tope por ventana: `conteo` es el total de la ventana YA sumando los `n` de este envío.
 * Ej.: tope 300, conteo 305, n 10 → antes había 295 → pasan 5.
 */
export function permitidosPorTope(conteo: number, n: number, tope: number): number {
  const antes = conteo - n;
  return Math.max(0, Math.min(n, tope - antes));
}
