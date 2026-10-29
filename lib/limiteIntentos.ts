import { createHmac } from "node:crypto";

// Límite de intentos para entrar, registrarse y pedir enlaces por correo. En Venezuela muchos clientes comparten la
// misma IP pública (CGNAT de las operadoras), así que se cuenta por CORREO + IP con un tope bajo y por IP sola con un
// tope mucho más alto: un vecino que se equivoca de contraseña no bloquea a los demás de su operadora.
// Esta parte es pura (se prueba en lib/__tests__/limiteIntentos.test.ts); la que guarda en Neon es lib/limiteIntentosDb.ts.

export type AccionLimitada = "entrar" | "registro" | "enlace";

type Regla = { max: number; ventanaMinutos: number };

/**
 * Topes por acción. "entrar" cuenta solo los intentos FALLIDOS (se cuenta antes de probar la contraseña y, si entra
 * bien, se borra el de correo + IP y se le descuenta uno a la IP);
 * "registro" y "enlace" (recuperar contraseña o reenviar la verificación) cuentan todos.
 */
export const REGLAS: Record<AccionLimitada, { correoIp?: Regla; ip: Regla }> = {
  entrar: { correoIp: { max: 5, ventanaMinutos: 15 }, ip: { max: 60, ventanaMinutos: 15 } },
  registro: { ip: { max: 30, ventanaMinutos: 60 } },
  enlace: { correoIp: { max: 3, ventanaMinutos: 15 }, ip: { max: 40, ventanaMinutos: 15 } },
};

export type ClaveLimite = { clave: string; regla: Regla };

// HMAC con el secreto del sitio (no un sha256 suelto): una IP resumida sin clave se podría adivinar probando todas.
const resumen = (texto: string) =>
  createHmac("sha256", process.env.BETTER_AUTH_SECRET || "el-pico").update(texto).digest("hex").slice(0, 32);

/**
 * Claves a contar para una acción. Van resumidas (HMAC-sha256 con el secreto): la tabla no guarda correos ni IP legibles.
 * Sin IP (ej. en la computadora de desarrollo) se cuenta todo como una sola IP.
 */
export function clavesLimite(accion: AccionLimitada, correo: string | null, ip: string | null): ClaveLimite[] {
  const reglas = REGLAS[accion];
  const laIp = ip ?? "sin-ip";
  const claves: ClaveLimite[] = [{ clave: `${accion}:ip:${resumen(laIp)}`, regla: reglas.ip }];
  if (reglas.correoIp && correo) {
    claves.unshift({ clave: `${accion}:correo-ip:${resumen(`${correo.trim().toLowerCase()}|${laIp}`)}`, regla: reglas.correoIp });
  }
  return claves;
}

/** ¿Esa clave ya llegó a su tope dentro de la ventana? Devuelve los minutos que faltan para poder intentar. */
export function estadoLimite(
  fila: { conteo: number; inicio: Date } | undefined,
  regla: Regla,
  ahora: Date = new Date(),
): { bloqueado: false } | { bloqueado: true; minutos: number } {
  if (!fila) return { bloqueado: false };
  const finVentana = fila.inicio.getTime() + regla.ventanaMinutos * 60_000;
  if (finVentana <= ahora.getTime() || fila.conteo < regla.max) return { bloqueado: false };
  return { bloqueado: true, minutos: Math.max(1, Math.ceil((finVentana - ahora.getTime()) / 60_000)) };
}

export function mensajeLimite(minutos: number): string {
  return `Hiciste demasiados intentos. Espera ${minutos} ${minutos === 1 ? "minuto" : "minutos"} y vuelve a intentarlo.`;
}
