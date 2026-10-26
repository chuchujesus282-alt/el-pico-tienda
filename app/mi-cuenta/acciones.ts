"use server";

import { guardarDatosCuenta, guardarPerfil, leerDatosCuenta, sincronizarAlEntrar } from "@/lib/cuenta";
import type { DatosCuenta, DatosFiscales, ResultadoCuenta } from "@/types/cuenta";

// Acciones de la cuenta con la sesión abierta. Todo lo que llega del navegador se revisa en lib/cuenta.ts.

/** Datos para la factura (/mi-cuenta). */
export async function accionGuardarPerfil(fiscales: DatosFiscales, aceptaPoliticas: boolean): Promise<ResultadoCuenta> {
  return guardarPerfil(fiscales, aceptaPoliticas === true);
}

/** Al entrar: junta el carrito y los favoritos del navegador con los de la cuenta (components/cuenta/SincronizarCuenta.tsx). */
export async function accionSincronizarAlEntrar(navegador: { carrito: unknown; favoritos: unknown }): Promise<DatosCuenta | null> {
  return sincronizarAlEntrar(navegador ?? { carrito: [], favoritos: [] });
}

/** En las visitas siguientes: el carrito y los favoritos de la cuenta. */
export async function accionLeerDatosCuenta(): Promise<DatosCuenta | null> {
  return leerDatosCuenta();
}

/** Después de cada cambio en el navegador: lo guarda en la cuenta. */
export async function accionGuardarDatosCuenta(datos: { carrito?: unknown; favoritos?: unknown }): Promise<boolean> {
  return guardarDatosCuenta(datos ?? {});
}
