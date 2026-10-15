import "server-only";

import type { NuevaCuenta, ProveedorSocial, ResultadoCuenta } from "@/types/cuenta";

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

/** Entrar con Google, Facebook o Apple: cuando exista, devolverá la URL del servicio a la que hay que ir. */
export async function iniciarSesionConProveedor(proveedor: ProveedorSocial): Promise<ResultadoCuenta> {
  void proveedor;
  return NO_DISPONIBLE;
}
