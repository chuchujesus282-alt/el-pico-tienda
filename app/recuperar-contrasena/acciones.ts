"use server";

import { correoValido } from "@/components/cuenta/datosFiscales";
import { pedirCambioContrasena } from "@/lib/cuenta";
import type { ResultadoCuenta } from "@/types/cuenta";

export async function accionPedirCambioContrasena(correo: string): Promise<ResultadoCuenta> {
  if (!correoValido(correo)) return { ok: false, mensaje: "Escribe un correo válido, ej. nombre@correo.com." };
  return pedirCambioContrasena(correo.trim().toLowerCase());
}
