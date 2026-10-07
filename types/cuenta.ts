// Cuenta del cliente y sus datos fiscales (para la factura). Si cambia, avisa al compañero.

export type TipoPersona = "natural" | "juridica";

/** V venezolano, E extranjero, P pasaporte (personas); J jurídico, G gobierno (empresas). */
export type PrefijoDocumento = "V" | "E" | "P" | "J" | "G";

export type DatosFiscales = {
  tipoPersona: TipoPersona;
  nombre: string; // nombre y apellido, o razón social
  documento: string; // normalizado: "V-12345678", "J-12345678-9"
  telefono: string; // solo dígitos: "04121234567"
  contribuyenteEspecial: boolean; // solo empresas: agente de retención de IVA
  direccion: string; // calle, edificio/casa, piso
  zona: string; // urbanización o sector
  ciudad: string;
  estado: string;
  codigoPostal: string | null;
};

export type NuevaCuenta = {
  correo: string;
  contrasena: string;
  fiscales: DatosFiscales;
};

/** Respuesta de las acciones de cuenta: o todo bien, o un mensaje para mostrarle al cliente. */
export type ResultadoCuenta = { ok: true } | { ok: false; mensaje: string };
