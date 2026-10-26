"use server";

import { correoValido } from "@/components/cuenta/datosFiscales";
import { reenviarConfirmacion } from "@/lib/cuenta";
import type { ResultadoCuenta } from "@/types/cuenta";

/** `volverA` va primero: la página lo fija con .bind() y el formulario solo pasa el correo. */
export async function accionReenviarConfirmacion(volverA: string | undefined, correo: string): Promise<ResultadoCuenta> {
  if (!correoValido(correo)) return { ok: false, mensaje: "Escribe un correo válido, ej. nombre@correo.com." };
  return reenviarConfirmacion(correo.trim().toLowerCase(), volverA);
}
