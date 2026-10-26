"use server";

import { LARGO_MINIMO_CONTRASENA } from "@/components/cuenta/datosFiscales";
import { cambiarContrasena } from "@/lib/cuenta";
import type { ResultadoCuenta } from "@/types/cuenta";

export async function accionCambiarContrasena(token: string, contrasena: string): Promise<ResultadoCuenta> {
  if (!token) return { ok: false, mensaje: "Este enlace ya se usó o venció. Pide uno nuevo." };
  if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
    return { ok: false, mensaje: `Usa al menos ${LARGO_MINIMO_CONTRASENA} caracteres.` };
  }
  return cambiarContrasena(token, contrasena);
}
