import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { account, perfil, session, user } from "@/lib/db/esquema";

/**
 * Antes de unir una cuenta de Google a una cuenta de la tienda con el mismo correo (lib/auth.ts, hook de cuentas):
 * si esa cuenta tiene contraseña pero NUNCA confirmó su correo, pudo crearla otra persona con un correo ajeno. La
 * cuenta pasa entonces a quien tiene el Google: se borran la contraseña, las sesiones abiertas y el perfil que se llenó
 * al registrarse. Si el correo ya estaba confirmado, no se toca nada y se une normal.
 * Devuelve true si quitó el acceso con contraseña.
 */
export async function prepararUnionConGoogle(userId: string): Promise<boolean> {
  const [dueno] = await db.select({ verificado: user.emailVerified }).from(user).where(eq(user.id, userId));
  if (!dueno || dueno.verificado) return false;
  const borradas = await db
    .delete(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "credential")))
    .returning({ id: account.id });
  if (borradas.length === 0) return false;
  await db.delete(session).where(eq(session.userId, userId));
  await db.delete(perfil).where(eq(perfil.userId, userId));
  return true;
}
