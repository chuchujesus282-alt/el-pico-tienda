import "server-only";

import { inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { limiteIntento } from "@/lib/db/esquema";
import { clavesLimite, estadoLimite, type AccionLimitada } from "./limiteIntentos";

// Guarda y consulta los intentos en Neon (tabla limite_intento). Reglas y claves: lib/limiteIntentos.ts.

type Resultado = { bloqueado: false } | { bloqueado: true; minutos: number };

/** El primero bloqueado manda (el de correo + IP va antes que el de IP). */
function peor(estados: Resultado[]): Resultado {
  return estados.find((e) => e.bloqueado) ?? { bloqueado: false };
}

/**
 * Cuenta un intento en cada clave, de forma atómica (un solo INSERT … ON CONFLICT: dos intentos a la vez no se
 * saltan el tope). Si la ventana ya pasó, vuelve a empezar en 1. Devuelve si con este intento quedó bloqueado.
 */
export async function contarIntento(accion: AccionLimitada, correo: string | null, ip: string | null): Promise<Resultado> {
  const claves = clavesLimite(accion, correo, ip);
  const estados = await Promise.all(
    claves.map(async ({ clave, regla }) => {
      const segundos = regla.ventanaMinutos * 60;
      const [fila] = await db
        .insert(limiteIntento)
        .values({ clave, conteo: 1, inicio: sql`now()` })
        .onConflictDoUpdate({
          target: limiteIntento.clave,
          set: {
            conteo: sql`case when ${limiteIntento.inicio} < now() - make_interval(secs => ${segundos}) then 1 else ${limiteIntento.conteo} + 1 end`,
            inicio: sql`case when ${limiteIntento.inicio} < now() - make_interval(secs => ${segundos}) then now() else ${limiteIntento.inicio} end`,
          },
        })
        .returning();
      // conteo - 1: el intento que se acaba de contar sí se deja pasar si no había llegado al tope.
      return estadoLimite({ conteo: fila.conteo - 1, inicio: fila.inicio }, regla);
    }),
  );
  return peor(estados);
}

/**
 * Al entrar bien, ese intento no cuenta como fallido: se borra el conteo de ese correo + IP y se le descuenta uno a
 * la IP (así, con CGNAT, los clientes que entran bien no gastan el tope de los demás).
 */
export async function descontarIntentoExitoso(accion: AccionLimitada, correo: string, ip: string | null): Promise<void> {
  const claves = clavesLimite(accion, correo, ip);
  const deCorreo = claves.filter((c) => c.clave.includes(":correo-ip:")).map((c) => c.clave);
  const deIp = claves.filter((c) => c.clave.includes(":ip:")).map((c) => c.clave);
  if (deCorreo.length > 0) await db.delete(limiteIntento).where(inArray(limiteIntento.clave, deCorreo));
  if (deIp.length > 0) {
    await db
      .update(limiteIntento)
      .set({ conteo: sql`greatest(${limiteIntento.conteo} - 1, 0)` })
      .where(inArray(limiteIntento.clave, deIp));
  }
}
