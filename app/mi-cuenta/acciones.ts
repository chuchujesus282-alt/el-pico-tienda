"use server";

import { datosParaPrimerPedido, guardarDatosCuenta, guardarPerfil, leerDatosCuenta, sincronizarAlEntrar } from "@/lib/cuenta";
import { olvidarVisitante } from "@/lib/eventos/servidor";
import type { DatosCuenta, DatosFiscales, ResultadoCuenta } from "@/types/cuenta";

// Acciones de la cuenta con la sesión abierta. Todo lo que llega del navegador se revisa en lib/cuenta.ts.

/** Datos para la factura (/mi-cuenta). */
export async function accionGuardarPerfil(fiscales: DatosFiscales, aceptaPoliticas: boolean): Promise<ResultadoCuenta> {
  return guardarPerfil(fiscales, aceptaPoliticas === true);
}

/** Al entrar: junta el carrito y los favoritos del navegador con los de la cuenta (components/cuenta/SincronizarCuenta.tsx). */
export async function accionSincronizarAlEntrar(navegador: {
  carrito: unknown;
  favoritos: unknown;
  direcciones?: unknown;
}): Promise<DatosCuenta | null> {
  return sincronizarAlEntrar(navegador ?? { carrito: [], favoritos: [] });
}

/** En las visitas siguientes: el carrito y los favoritos de la cuenta. */
export async function accionLeerDatosCuenta(): Promise<DatosCuenta | null> {
  return leerDatosCuenta();
}

/** Después de cada cambio en el navegador: lo guarda en la cuenta. */
export async function accionGuardarDatosCuenta(datos: { carrito?: unknown; favoritos?: unknown; direcciones?: unknown }): Promise<boolean> {
  return guardarDatosCuenta(datos ?? {});
}

/** Al cerrar sesión: el visitante de este navegador empieza con un código nuevo (lib/eventos/servidor.ts). */
export async function accionOlvidarVisitante(): Promise<void> {
  await olvidarVisitante();
}

/** Finalizar pedido: ¿se le preguntan cédula/RIF y teléfono (opcional) en este primer pedido? */
export async function accionDatosParaPrimerPedido(): Promise<{ pedir: boolean; nombre: string }> {
  return datosParaPrimerPedido();
}
