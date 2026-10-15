"use server";

import { correoValido } from "@/components/cuenta/datosFiscales";
import { iniciarSesion, iniciarSesionConProveedor } from "@/lib/cuenta";
import type { ProveedorSocial, ResultadoCuenta } from "@/types/cuenta";

export async function accionIniciarSesion(correo: string, contrasena: string): Promise<ResultadoCuenta> {
  if (!correoValido(correo) || !contrasena) return { ok: false, mensaje: "Revisa tu correo y tu contraseña." };
  return iniciarSesion(correo.trim().toLowerCase(), contrasena);
}

const PROVEEDORES: ProveedorSocial[] = ["google", "facebook", "apple"];

export async function accionIniciarSesionCon(proveedor: ProveedorSocial): Promise<ResultadoCuenta> {
  // Lo que llega del navegador no es confiable: solo se aceptan los tres proveedores conocidos.
  if (!PROVEEDORES.includes(proveedor)) return { ok: false, mensaje: "Esa opción no está disponible." };
  return iniciarSesionConProveedor(proveedor);
}
