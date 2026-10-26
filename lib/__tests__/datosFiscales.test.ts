import { describe, expect, it } from "vitest";
import { separarDocumento, validarDatosFiscales } from "@/components/cuenta/datosFiscales";
import type { DatosFiscales } from "@/types/cuenta";

const persona: DatosFiscales = {
  tipoPersona: "natural",
  nombre: "María Pérez",
  documento: "V-12345678",
  telefono: "04121234567",
  contribuyenteEspecial: false,
};

describe("validarDatosFiscales", () => {
  it("acepta datos bien formados de persona y de empresa", () => {
    expect(validarDatosFiscales(persona)).toEqual({});
    expect(validarDatosFiscales({ ...persona, documento: "E-1234567" })).toEqual({});
    expect(validarDatosFiscales({ ...persona, documento: "V-12345678-9" })).toEqual({});
    expect(validarDatosFiscales({ ...persona, documento: "P-AB12345" })).toEqual({});
    expect(
      validarDatosFiscales({ ...persona, tipoPersona: "juridica", nombre: "Construcciones Ávila, C.A.", documento: "J-12345678-9" }),
    ).toEqual({});
  });

  it("rechaza documentos mal formados o que no corresponden al tipo de persona", () => {
    for (const documento of ["", "V-123", "12345678", "V12345678", "X-12345678", "V-1234567890"]) {
      expect(validarDatosFiscales({ ...persona, documento }).numeroDocumento).toBeDefined();
    }
    expect(validarDatosFiscales({ ...persona, documento: "J-12345678-9" }).numeroDocumento).toBeDefined();
    expect(validarDatosFiscales({ ...persona, tipoPersona: "juridica", documento: "V-12345678" }).numeroDocumento).toBeDefined();
  });

  it("rechaza teléfonos sin normalizar y nombres vacíos o raros", () => {
    expect(validarDatosFiscales({ ...persona, telefono: "0412-1234567" }).telefono).toBeDefined();
    expect(validarDatosFiscales({ ...persona, telefono: "" }).telefono).toBeDefined();
    expect(validarDatosFiscales({ ...persona, nombre: " a " }).nombre).toBeDefined();
    expect(validarDatosFiscales({ ...persona, nombre: "x".repeat(121) }).nombre).toBeDefined();
    expect(validarDatosFiscales({ ...persona, tipoPersona: "otra" as never }).nombre).toBeDefined();
  });
});

describe("separarDocumento", () => {
  it("separa el prefijo del número (y deja el dígito verificador)", () => {
    expect(separarDocumento("V-12345678")).toEqual({ prefijo: "V", numero: "12345678" });
    expect(separarDocumento("J-12345678-9")).toEqual({ prefijo: "J", numero: "12345678-9" });
    expect(separarDocumento("Z-1")).toBeNull();
    expect(separarDocumento("V")).toBeNull();
  });
});
