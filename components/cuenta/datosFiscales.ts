import type { DatosFiscales, NuevaCuenta, PrefijoDocumento, TipoPersona } from "@/types/cuenta";

// Opciones y validaciones de los formularios de cuenta. Se usan en el navegador (para avisar al
// momento) y en el servidor (para no confiar en lo que llega).

export const ESTADOS_VENEZUELA = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", "Carabobo", "Cojedes",
  "Delta Amacuro", "Distrito Capital", "Falcón", "Guárico", "La Guaira", "Lara", "Mérida",
  "Miranda", "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira", "Trujillo",
  "Yaracuy", "Zulia",
] as const;

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

export type ErroresCuenta = Partial<Record<keyof DatosFiscales | "correo" | "contrasena" | "confirmacion" | "numeroDocumento", string>>;

/** Revisa la cuenta nueva completa. Sin errores, el objeto viene vacío. */
export function validarNuevaCuenta(cuenta: NuevaCuenta, confirmacion?: string): ErroresCuenta {
  const { correo, contrasena, fiscales: f } = cuenta;
  const errores: ErroresCuenta = {};

  if (!correoValido(correo)) errores.correo = "Escribe un correo válido, ej. nombre@correo.com.";
  if (contrasena.length < LARGO_MINIMO_CONTRASENA)
    errores.contrasena = `Usa al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
  if (confirmacion !== undefined && confirmacion !== contrasena) errores.confirmacion = "Las contraseñas no coinciden.";

  if (f.nombre.trim().length < 3)
    errores.nombre = f.tipoPersona === "juridica" ? "Escribe la razón social." : "Escribe tu nombre y apellido.";
  if (!f.documento) errores.numeroDocumento = f.tipoPersona === "juridica"
    ? "El RIF lleva 9 dígitos, ej. 12345678-9."
    : "Revisa el número: la cédula lleva de 6 a 8 dígitos.";
  if (!f.telefono) errores.telefono = "Escribe un teléfono de 11 dígitos, ej. 0412-1234567.";
  if (f.direccion.trim().length < 5) errores.direccion = "Escribe la calle, el edificio o la casa.";
  if (!f.zona.trim()) errores.zona = "Escribe la urbanización o el sector.";
  if (!f.ciudad.trim()) errores.ciudad = "Escribe la ciudad.";
  if (!(ESTADOS_VENEZUELA as readonly string[]).includes(f.estado)) errores.estado = "Elige el estado.";
  if (f.codigoPostal && !/^\d{4}$/.test(f.codigoPostal)) errores.codigoPostal = "El código postal lleva 4 dígitos.";

  return errores;
}
