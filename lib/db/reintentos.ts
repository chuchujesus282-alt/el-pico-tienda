// Reintentos para la conexión HTTP con Neon (lib/db/index.ts). En el plan gratis, la base se duerme si nadie la usa
// y la primera consulta puede fallar mientras despierta; en vez de mostrarle un error al cliente, se reintenta.
// Solo se reintenta cuando la consulta NO llegó a correr (no se pudo conectar, o el intermediario de Neon respondió
// 502/503): así una escritura nunca se hace dos veces. Un error de la consulta (ej. un dato repetido) no se repite.
// Es pura (recibe el fetch y la espera): se prueba en lib/__tests__/reintentos.test.ts.

/** Errores de red de Node (undici) en los que la conexión ni siquiera se abrió. */
const SIN_CONEXION = new Set(["UND_ERR_CONNECT_TIMEOUT", "ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN", "ENETUNREACH", "EHOSTUNREACH"]);

/** Respuestas del intermediario de Neon cuando no pudo llegar a la base (dormida o despertando). */
const ESTADOS_REINTENTABLES = new Set([502, 503]);

export function sinConexion(error: unknown): boolean {
  const causa = (error as { cause?: { code?: string } } | null)?.cause;
  return Boolean(causa?.code && SIN_CONEXION.has(causa.code));
}

type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

type Opciones = {
  /** Esperas entre intentos, en milisegundos: con [500, 1500] hay hasta 3 intentos. */
  esperas?: number[];
  esperar?: (ms: number) => Promise<void>;
  /** Para avisar en el registro del servidor (sin datos de la consulta). */
  avisar?: (mensaje: string) => void;
};

const dormir = (ms: number) => new Promise<void>((listo) => setTimeout(listo, ms));

export function fetchConReintentos(
  base: Fetch,
  { esperas = [500, 1500], esperar = dormir, avisar = console.warn }: Opciones = {},
): Fetch {
  return async (url, init) => {
    for (let intento = 0; ; intento++) {
      const quedan = intento < esperas.length;
      try {
        const respuesta = await base(url, init);
        if (!quedan || !ESTADOS_REINTENTABLES.has(respuesta.status)) return respuesta;
        avisar(`[db] Neon respondió ${respuesta.status}; reintento ${intento + 1} de ${esperas.length}.`);
      } catch (error) {
        if (!quedan || !sinConexion(error)) throw error;
        avisar(`[db] No se pudo conectar con Neon; reintento ${intento + 1} de ${esperas.length}.`);
      }
      await esperar(esperas[intento]);
    }
  };
}
