// Cuenta del cliente y sus datos fiscales (para la factura). Si cambia, avisa al compañero.

import type { ItemCarrito } from "./carrito";

export type TipoPersona = "natural" | "juridica";

/** V venezolano, E extranjero, P pasaporte (personas); J jurídico, G gobierno (empresas). */
export type PrefijoDocumento = "V" | "E" | "P" | "J" | "G";

export type DatosFiscales = {
  tipoPersona: TipoPersona;
  nombre: string; // nombre y apellido, o razón social
  documento: string; // normalizado: "V-12345678", "J-12345678-9"
  telefono: string; // solo dígitos: "04121234567"
  contribuyenteEspecial: boolean; // solo empresas: agente de retención de IVA
};
// Las direcciones de entrega no van aquí: el cliente las guarda en el mapa (Mis direcciones, types/cliente.ts).

export type NuevaCuenta = {
  correo: string;
  contrasena: string;
  fiscales: DatosFiscales;
  aceptaPoliticas: boolean; // marcó que leyó las políticas de privacidad
};

/**
 * Respuesta de las acciones de cuenta: o todo bien (con un `aviso` si el cliente tiene que hacer algo más, ej.
 * confirmar su correo), o un mensaje para mostrarle al cliente.
 */
export type ResultadoCuenta = { ok: true; aviso?: string } | { ok: false; mensaje: string };

/** Lo que muestra /mi-cuenta. `fiscales` es null si entró con Google y todavía no los llenó. */
export type PerfilCuenta = {
  correo: string;
  nombre: string;
  foto: string | null;
  fiscales: DatosFiscales | null;
};

/** Carrito (con los datos de hoy del catálogo) y favoritos (códigos, lo más reciente primero) guardados en la cuenta. */
export type DatosCuenta = { carrito: ItemCarrito[]; favoritos: string[] };
