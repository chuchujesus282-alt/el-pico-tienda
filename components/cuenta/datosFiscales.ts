import type { DatosFiscales, NuevaCuenta, PrefijoDocumento, TipoPersona } from "@/types/cuenta";

// Opciones y validaciones de los formularios de cuenta. Se usan en el navegador (para avisar al
// momento) y en el servidor (para no confiar en lo que llega).

export const PREFIJOS: Record<TipoPersona, { valor: PrefijoDocumento; etiqueta: string }[]> = {
  natural: [
    { valor: "V", etiqueta: "V" },
    { valor: "E", etiqueta: "E" },
    { valor: "P", etiqueta: "P" },
  ],
  juridica: [
    { valor: "J", etiqueta: "J" },
    { valor: "G", etiqueta: "G" },
  ],
};

export const LARGO_MINIMO_CONTRASENA = 8;

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function correoValido(correo: string): boolean {
  return CORREO.test(correo.trim());
}

/**
 * "12.345.678" + V → "V-12345678". Con J/G el último dígito es el verificador: "J-12345678-9".
 * Devuelve null si el número no tiene la forma esperada.
 */
export function normalizarDocumento(prefijo: PrefijoDocumento, numero: string): string | null {
  if (prefijo === "P") {
    const pasaporte = numero.replace(/[\s.-]/g, "").toUpperCase();
    return /^[A-Z0-9]{5,15}$/.test(pasaporte) ? `P-${pasaporte}` : null;
  }
  const digitos = numero.replace(/\D/g, "");
  if (prefijo === "J" || prefijo === "G") {
    return digitos.length === 9 ? `${prefijo}-${digitos.slice(0, 8)}-${digitos.slice(8)}` : null;
  }
  // Cédula (6 a 8 dígitos) o RIF de persona (cédula + dígito verificador).
  if (digitos.length >= 6 && digitos.length <= 8) return `${prefijo}-${digitos}`;
  if (digitos.length === 9) return `${prefijo}-${digitos.slice(0, 8)}-${digitos.slice(8)}`;
  return null;
}

/** "0412-123.45.67" → "04121234567". Fijos (02xx) o celulares (04xx), 11 dígitos. */
export function normalizarTelefono(telefono: string): string | null {
  const digitos = telefono.replace(/\D/g, "").replace(/^58/, "0");
  return /^0[24]\d{9}$/.test(digitos) ? digitos : null;
}

export type ErroresCuenta = Partial<Record<keyof DatosFiscales | "correo" | "contrasena" | "confirmacion" | "numeroDocumento" | "aceptaPoliticas", string>>;

/** "V-12345678" → { prefijo: "V", numero: "12345678" } (para volver a llenar el formulario con lo guardado). */
export function separarDocumento(documento: string): { prefijo: PrefijoDocumento; numero: string } | null {
  const [prefijo, ...resto] = documento.split("-");
  if (!["V", "E", "P", "J", "G"].includes(prefijo) || resto.length === 0) return null;
  return { prefijo: prefijo as PrefijoDocumento, numero: resto.join("-") };
}

/** ¿El documento ya normalizado es válido para ese tipo de persona? (V/E/P personas; J/G empresas.) */
function documentoValido(tipo: TipoPersona, documento: string): boolean {
  const partes = separarDocumento(documento);
  // PREFIJOS[tipo] no existe si el tipo llegó inventado desde el navegador.
  if (!partes || !PREFIJOS[tipo]?.some((p) => p.valor === partes.prefijo)) return false;
  return normalizarDocumento(partes.prefijo, partes.numero) === documento;
}

/** Revisa los datos para la factura (crear cuenta y Mi cuenta). Sin errores, el objeto viene vacío. */
export function validarDatosFiscales(f: DatosFiscales): ErroresCuenta {
  const errores: ErroresCuenta = {};
  const empresa = f.tipoPersona === "juridica";
  if (f.tipoPersona !== "natural" && !empresa) errores.nombre = "Elige si la cuenta es de una persona o de una empresa.";
  if (typeof f.nombre !== "string" || f.nombre.trim().length < 3 || f.nombre.length > 120)
    errores.nombre = empresa ? "Escribe la razón social." : "Escribe tu nombre y apellido.";
  if (typeof f.documento !== "string" || !documentoValido(f.tipoPersona, f.documento))
    errores.numeroDocumento = empresa ? "El RIF lleva 9 dígitos, ej. 12345678-9." : "Revisa el número: la cédula lleva de 6 a 8 dígitos.";
  if (typeof f.telefono !== "string" || normalizarTelefono(f.telefono) !== f.telefono)
    errores.telefono = "Escribe un teléfono de 11 dígitos, ej. 0412-1234567.";
  return errores;
}

/** Revisa la cuenta nueva completa. Sin errores, el objeto viene vacío. */
export function validarNuevaCuenta(cuenta: NuevaCuenta, confirmacion?: string): ErroresCuenta {
  const { correo, contrasena } = cuenta;
  const errores: ErroresCuenta = {};

  if (!correoValido(correo)) errores.correo = "Escribe un correo válido, ej. nombre@correo.com.";
  if (contrasena.length < LARGO_MINIMO_CONTRASENA)
    errores.contrasena = `Usa al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
  if (confirmacion !== undefined && confirmacion !== contrasena) errores.confirmacion = "Las contraseñas no coinciden.";

  Object.assign(errores, validarDatosFiscales(cuenta.fiscales));
  if (!cuenta.aceptaPoliticas) errores.aceptaPoliticas = "Marca la casilla para continuar.";

  return errores;
}
