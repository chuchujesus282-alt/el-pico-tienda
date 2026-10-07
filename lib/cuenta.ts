import "server-only";

import type { NuevaCuenta, ResultadoCuenta } from "@/types/cuenta";

// ÚNICA puerta de entrada a las cuentas de cliente (inicio de sesión y registro).
// Aún no hay servidor de cuentas: las funciones responden que todavía no está disponible.
// Cuando exista, solo cambia este archivo; las pantallas no cambian.

const NO_DISPONIBLE: ResultadoCuenta = {
  ok: false,
  mensaje: "Las cuentas todavía no están activas. Mientras tanto, puedes hacer tu pedido sin cuenta.",
};

export async function iniciarSesion(correo: string, contrasena: string): Promise<ResultadoCuenta> {
  void correo;
  void contrasena;
  return NO_DISPONIBLE;
}

export async function crearCuenta(cuenta: NuevaCuenta): Promise<ResultadoCuenta> {
  void cuenta;
  return NO_DISPONIBLE;
}

/** Inicio de sesión con Google: cuando exista, devolverá la URL de Google a la que hay que ir. */
export async function iniciarSesionConGoogle(): Promise<ResultadoCuenta> {
  return NO_DISPONIBLE;
}
