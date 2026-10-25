"use server";

import { validarNuevaCuenta } from "@/components/cuenta/datosFiscales";
import { crearCuenta } from "@/lib/cuenta";
import type { NuevaCuenta, ResultadoCuenta } from "@/types/cuenta";

/** `volverA`: a dónde lleva el enlace del correo de confirmación (lib/cuenta.ts acepta solo rutas de la tienda). */
export async function accionCrearCuenta(cuenta: NuevaCuenta, volverA?: string): Promise<ResultadoCuenta> {
  // Se vuelve a validar aquí: lo que llega del navegador no es confiable.
  if (Object.keys(validarNuevaCuenta(cuenta)).length > 0) {
    return { ok: false, mensaje: "Revisa los datos marcados e inténtalo de nuevo." };
  }
  return crearCuenta({ ...cuenta, correo: cuenta.correo.trim().toLowerCase() }, volverA);
}
