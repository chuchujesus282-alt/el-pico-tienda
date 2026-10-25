"use server";

import { correoValido } from "@/components/cuenta/datosFiscales";
import { iniciarSesion } from "@/lib/cuenta";
import type { ResultadoCuenta } from "@/types/cuenta";

export async function accionIniciarSesion(correo: string, contrasena: string): Promise<ResultadoCuenta> {
  if (!correoValido(correo) || !contrasena) return { ok: false, mensaje: "Revisa tu correo y tu contraseña." };
  return iniciarSesion(correo.trim().toLowerCase(), contrasena);
}
